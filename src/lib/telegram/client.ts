import { Telegraf } from "telegraf";

let botInstance: Telegraf | null = null;
let pollingModeReady = false;

function getBotToken() {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) {
    throw new Error("Missing TELEGRAM_BOT_TOKEN");
  }
  return token;
}

export function getTelegramBot() {
  if (!botInstance) {
    botInstance = new Telegraf(getBotToken());
  }
  return botInstance;
}

export async function sendTelegramSupportMessage(params: {
  chatId: string;
  text: string;
  threadId?: number;
}) {
  const bot = getTelegramBot();

  const sent = await bot.telegram.sendMessage(params.chatId, params.text, {
    link_preview_options: { is_disabled: true },
    ...(params.threadId !== undefined ? { message_thread_id: params.threadId } : {}),
  });

  return {
    messageId: sent.message_id,
  };
}

export async function getTelegramMessageUpdates(params: {
  offset: number;
  limit?: number;
  timeout?: number;
}) {
  const bot = getTelegramBot();

  if (!pollingModeReady) {
    try {
      await bot.telegram.callApi("deleteWebhook", { drop_pending_updates: false });
    } catch {
      // Ignore here and let getUpdates surface real errors.
    }
    pollingModeReady = true;
  }

  const updates = await bot.telegram.callApi("getUpdates", {
    offset: params.offset,
    limit: params.limit ?? 100,
    timeout: params.timeout ?? 0,
    allowed_updates: ["message", "edited_message", "channel_post", "edited_channel_post"],
  });

  return updates;
}
