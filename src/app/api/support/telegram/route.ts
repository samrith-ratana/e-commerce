export const runtime = "nodejs";

import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/requestAuth";
import { readSupportChatsDb, writeSupportChatsDb, type ConversationRecord, type SupportMessage } from "@/lib/db/supportChatsDb";
import { sendTelegramSupportMessage } from "@/lib/telegram/client";
import { buildConversationKey, normalizeClientIp } from "@/lib/support/conversation";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Support request failed";
}

function upsertConversation(params: {
  conversationKey: string;
  userId: string | null;
  userEmail: string;
}) {
  const db = readSupportChatsDb();
  const now = new Date().toISOString();

  let conversation = db.conversations.find((item) => item.key === params.conversationKey);

  if (!conversation) {
    conversation = {
      key: params.conversationKey,
      userId: params.userId,
      userEmail: params.userEmail,
      createdAt: now,
      updatedAt: now,
      messages: [],
    } satisfies ConversationRecord;

    db.conversations.push(conversation);
  } else {
    conversation.userId = params.userId;
    conversation.userEmail = params.userEmail;
    conversation.updatedAt = now;
  }

  return { db, conversation };
}

function parseThreadId(raw: string | undefined) {
  if (!raw) return undefined;
  const value = Number(raw);
  return Number.isFinite(value) ? value : undefined;
}

export async function POST(req: Request) {
  try {
    const { message } = (await req.json()) as { message?: string };

    const text = String(message || "").trim();
    if (!text) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (text.length > 1500) {
      return NextResponse.json({ error: "Message is too long (max 1500 characters)" }, { status: 400 });
    }

    const chatId = String(process.env.TELEGRAM_CHAT_ID || "").trim();
    const threadIdRaw = process.env.TELEGRAM_THREAD_ID;

    if (!chatId) {
      return NextResponse.json(
        { error: "Telegram is not configured. Set TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID." },
        { status: 500 }
      );
    }

    const requester = await getUserFromRequest(req);
    const ip = normalizeClientIp(req);

    const conversationKey = buildConversationKey(requester?.id ?? null, ip);
    const userEmail = requester?.email ?? "guest";

    const { db, conversation } = upsertConversation({
      conversationKey,
      userId: requester?.id ?? null,
      userEmail,
    });

    const now = new Date().toISOString();
    const outgoingMsg: SupportMessage = {
      id: `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      conversationKey,
      role: "user",
      source: "web",
      text,
      createdAt: now,
    };

    conversation.messages.push(outgoingMsg);
    conversation.updatedAt = now;

    const lines = [
      "[OpenMart Support]",
      `CID: ${conversationKey}`,
      `Time: ${now}`,
      requester ? `User: ${requester.email} (${requester.id})` : "User: guest",
      `IP: ${ip}`,
      "",
      text,
    ];

    const threadId = parseThreadId(threadIdRaw);

    const sent = await sendTelegramSupportMessage({
      chatId,
      text: lines.join("\n"),
      threadId,
    });

    outgoingMsg.telegramMessageId = sent.messageId;

    db.telegramMessageIndex[String(sent.messageId)] = conversationKey;
    db.telegramMessageIndex[`${chatId}:${sent.messageId}`] = conversationKey;
    if (threadId !== undefined) {
      db.telegramMessageIndex[`${chatId}:${threadId}:${sent.messageId}`] = conversationKey;
    }

    conversation.updatedAt = new Date().toISOString();

    writeSupportChatsDb(db);

    return NextResponse.json({
      success: true,
      message: "Message sent to support",
      messageId: sent.messageId,
      conversationKey,
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
