import fs from "fs";
import path from "path";

const chatDbPath = path.join(process.cwd(), "src/data/user-chats.json");

export type ChatConversationRecord = {
  id: string;
  participantIds: [string, string];
  createdAt: string;
  updatedAt: string;
};

export type ChatMessageRecord = {
  id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  createdAt: string;
  readAt?: string;
};

export type UserChatsDb = {
  conversations: ChatConversationRecord[];
  messages: ChatMessageRecord[];
};

const defaultChatDb: UserChatsDb = {
  conversations: [],
  messages: [],
};

function ensureChatDbFile() {
  const dir = path.dirname(chatDbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(chatDbPath)) {
    fs.writeFileSync(chatDbPath, JSON.stringify(defaultChatDb, null, 2));
  }
}

export function readUserChatsDb(): UserChatsDb {
  ensureChatDbFile();
  try {
    const raw = fs.readFileSync(chatDbPath, "utf-8").trim();
    if (!raw) return defaultChatDb;

    const parsed = JSON.parse(raw) as Partial<UserChatsDb>;
    return {
      conversations: Array.isArray(parsed.conversations) ? (parsed.conversations as ChatConversationRecord[]) : [],
      messages: Array.isArray(parsed.messages) ? (parsed.messages as ChatMessageRecord[]) : [],
    };
  } catch {
    return defaultChatDb;
  }
}

export function writeUserChatsDb(data: UserChatsDb) {
  ensureChatDbFile();

  const normalized: UserChatsDb = {
    conversations: Array.isArray(data.conversations) ? data.conversations : [],
    messages: Array.isArray(data.messages) ? data.messages : [],
  };

  const tempPath = `${chatDbPath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(normalized, null, 2));
  fs.renameSync(tempPath, chatDbPath);
}
