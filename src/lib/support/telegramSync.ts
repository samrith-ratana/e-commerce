import { readSupportChatsDb, writeSupportChatsDb, type SupportMessage } from "@/lib/db/supportChatsDb";
import { readSupportBotStateDb, writeSupportBotStateDb } from "@/lib/db/supportBotStateDb";
import { getTelegramMessageUpdates } from "@/lib/telegram/client";

type TelegramMessage = {
  message_id?: number;
  date?: number;
  text?: string;
  caption?: string;
  message_thread_id?: number;
  from?: {
    username?: string;
    first_name?: string;
    last_name?: string;
    is_bot?: boolean;
  };
  chat?: {
    id?: number | string;
  };
  sender_chat?: {
    title?: string;
    username?: string;
  };
  reply_to_message?: {
    message_id?: number;
    text?: string;
    caption?: string;
    message_thread_id?: number;
  };
};

type TelegramUpdate = {
  update_id: number;
  message?: TelegramMessage;
  edited_message?: TelegramMessage;
  channel_post?: TelegramMessage;
  edited_channel_post?: TelegramMessage;
};

function extractCid(text: string | undefined): string | null {
  if (!text) return null;
  const match = text.match(/CID:\s*([^\n\r]+)/);
  return match ? match[1].trim() : null;
}

function messageText(msg: TelegramMessage | undefined) {
  if (!msg) return "";
  return String(msg.text || msg.caption || "").trim();
}

function getUpdateMessage(update: TelegramUpdate): TelegramMessage | undefined {
  return update.message || update.edited_message || update.channel_post || update.edited_channel_post;
}

function findOrCreateConversation(db: ReturnType<typeof readSupportChatsDb>, key: string) {
  const now = new Date().toISOString();
  let conversation = db.conversations.find((item) => item.key === key);

  if (!conversation) {
    conversation = {
      key,
      userId: key.startsWith("user:") ? key.replace(/^user:/, "") : null,
      userEmail: "unknown",
      createdAt: now,
      updatedAt: now,
      messages: [],
    };
    db.conversations.push(conversation);
  }

  return conversation;
}

function parseThreadId(raw: string | undefined) {
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

function findConversationKeyByReply(params: {
  chatDb: ReturnType<typeof readSupportChatsDb>;
  chatId?: string;
  threadId?: number;
  replyToId: number;
}) {
  const keys = [
    params.chatId && params.threadId !== undefined ? `${params.chatId}:${params.threadId}:${params.replyToId}` : undefined,
    params.chatId ? `${params.chatId}:${params.replyToId}` : undefined,
    String(params.replyToId),
  ].filter(Boolean) as string[];

  for (const key of keys) {
    const conversationKey = params.chatDb.telegramMessageIndex[key];
    if (conversationKey) return conversationKey;
  }

  return undefined;
}

export async function syncTelegramInbox() {
  const state = readSupportBotStateDb();
  const configuredChatId = String(process.env.TELEGRAM_CHAT_ID || "").trim() || undefined;
  const configuredThreadId = parseThreadId(process.env.TELEGRAM_THREAD_ID);

  const updatesRaw = await getTelegramMessageUpdates({
    offset: state.lastUpdateId + 1,
    limit: 100,
    timeout: 0,
  });

  const updates = (Array.isArray(updatesRaw) ? updatesRaw : []) as TelegramUpdate[];
  if (updates.length === 0) {
    state.lastSyncedAt = new Date().toISOString();
    writeSupportBotStateDb(state);
    return { processed: 0, saved: 0, lastUpdateId: state.lastUpdateId };
  }

  const chatDb = readSupportChatsDb();
  let saved = 0;
  let maxUpdateId = state.lastUpdateId;

  for (const update of updates) {
    if (update.update_id > maxUpdateId) {
      maxUpdateId = update.update_id;
    }

    const msg = getUpdateMessage(update);
    if (!msg?.message_id) continue;
    if (msg.from?.is_bot) continue;

    const text = messageText(msg);
    if (!text) continue;

    const chatId = msg.chat?.id !== undefined ? String(msg.chat.id) : undefined;
    if (configuredChatId && chatId && chatId !== configuredChatId) continue;

    const msgThreadId = msg.message_thread_id;
    if (configuredThreadId !== undefined && msgThreadId !== undefined && msgThreadId !== configuredThreadId) continue;

    const replyToId = msg.reply_to_message?.message_id;
    let conversationKey: string | undefined;

    if (replyToId !== undefined) {
      conversationKey = findConversationKeyByReply({
        chatDb,
        chatId,
        threadId: msgThreadId,
        replyToId,
      });
    }

    if (!conversationKey) {
      conversationKey = extractCid(messageText(msg.reply_to_message) || text) || undefined;
    }

    if (!conversationKey) continue;

    const conversation = findOrCreateConversation(chatDb, conversationKey);

    const exists = conversation.messages.some((item) => item.telegramMessageId === msg.message_id);
    if (exists) continue;

    const senderName =
      msg.from?.username ||
      [msg.from?.first_name, msg.from?.last_name].filter(Boolean).join(" ") ||
      msg.sender_chat?.title ||
      msg.sender_chat?.username ||
      "support";

    const inboundMsg: SupportMessage = {
      id: `tg_${msg.message_id}`,
      conversationKey,
      role: "support",
      source: "telegram",
      text: `[${senderName}] ${text}`,
      createdAt: msg.date ? new Date(msg.date * 1000).toISOString() : new Date().toISOString(),
      telegramMessageId: msg.message_id,
      replyToTelegramMessageId: replyToId,
    };

    conversation.messages.push(inboundMsg);
    conversation.updatedAt = new Date().toISOString();

    chatDb.telegramMessageIndex[String(msg.message_id)] = conversationKey;
    if (chatId) {
      chatDb.telegramMessageIndex[`${chatId}:${msg.message_id}`] = conversationKey;
      if (msgThreadId !== undefined) {
        chatDb.telegramMessageIndex[`${chatId}:${msgThreadId}:${msg.message_id}`] = conversationKey;
      }
    }

    saved += 1;
  }

  writeSupportChatsDb(chatDb);
  writeSupportBotStateDb({
    lastUpdateId: maxUpdateId,
    lastSyncedAt: new Date().toISOString(),
  });

  return { processed: updates.length, saved, lastUpdateId: maxUpdateId };
}
