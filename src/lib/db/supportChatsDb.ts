import fs from "fs";
import path from "path";

const dbFilePath = path.join(process.cwd(), "src/data/support-chats.json");

export type SupportMessageRole = "user" | "support";

export type SupportMessage = {
  id: string;
  conversationKey: string;
  role: SupportMessageRole;
  source: "web" | "telegram";
  text: string;
  createdAt: string;
  telegramMessageId?: number;
  replyToTelegramMessageId?: number;
};

export type ConversationRecord = {
  key: string;
  userId: string | null;
  userEmail: string;
  createdAt: string;
  updatedAt: string;
  messages: SupportMessage[];
};

type SupportChatsDb = {
  conversations: ConversationRecord[];
  telegramMessageIndex: Record<string, string>;
};

const defaultDb: SupportChatsDb = {
  conversations: [],
  telegramMessageIndex: {},
};

function ensureFile() {
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify(defaultDb, null, 2));
  }
}

export function readSupportChatsDb(): SupportChatsDb {
  ensureFile();
  try {
    const raw = fs.readFileSync(dbFilePath, "utf-8").trim();
    if (!raw) return defaultDb;

    const parsed = JSON.parse(raw) as Partial<SupportChatsDb>;
    return {
      conversations: Array.isArray(parsed.conversations) ? parsed.conversations : [],
      telegramMessageIndex:
        parsed.telegramMessageIndex && typeof parsed.telegramMessageIndex === "object"
          ? parsed.telegramMessageIndex
          : {},
    };
  } catch {
    return defaultDb;
  }
}

export function writeSupportChatsDb(data: SupportChatsDb) {
  ensureFile();

  const normalized: SupportChatsDb = {
    conversations: Array.isArray(data.conversations) ? data.conversations : [],
    telegramMessageIndex:
      data.telegramMessageIndex && typeof data.telegramMessageIndex === "object"
        ? data.telegramMessageIndex
        : {},
  };

  const tempPath = `${dbFilePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(normalized, null, 2));
  fs.renameSync(tempPath, dbFilePath);
}
