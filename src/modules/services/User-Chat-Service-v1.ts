import { readDb } from "@/lib/db/jsonDb";
import {
  readUserChatsDb,
  writeUserChatsDb,
  type ChatConversationRecord,
  type ChatMessageRecord,
} from "@/lib/db/userChatsDb";

type InboxItem = {
  conversationId: string;
  partnerId: string;
  partnerEmail: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
};

type ConversationView = {
  conversationId: string | null;
  partnerId: string;
  partnerEmail: string;
  messages: ChatMessageRecord[];
};

export class UserChatService {
  private static instance: UserChatService;

  private constructor() {}

  public static getInstance() {
    if (!UserChatService.instance) {
      UserChatService.instance = new UserChatService();
    }
    return UserChatService.instance;
  }

  private nowIso() {
    return new Date().toISOString();
  }

  private makeId(prefix: string) {
    const random = Math.random().toString(36).slice(2, 10);
    return `${prefix}_${Date.now()}_${random}`;
  }

  private loadUsersMap() {
    const users = readDb().users || [];
    return new Map(users.map((u) => [u.id, u]));
  }

  private normalizePair(a: string, b: string): [string, string] {
    return a < b ? [a, b] : [b, a];
  }

  private findConversation(conversations: ChatConversationRecord[], userA: string, userB: string) {
    const [idA, idB] = this.normalizePair(userA, userB);
    return conversations.find((conversation) => {
      const [left, right] = conversation.participantIds;
      return left === idA && right === idB;
    });
  }

  public listUsers(excludeUserId: string) {
    const users = readDb().users || [];
    return users
      .filter((user) => user.id !== excludeUserId)
      .map((user) => ({ id: user.id, email: user.email }))
      .sort((a, b) => a.email.localeCompare(b.email));
  }

  public getInbox(userId: string): InboxItem[] {
    const db = readUserChatsDb();
    const usersMap = this.loadUsersMap();

    return db.conversations
      .filter((conversation) => conversation.participantIds.includes(userId))
      .map((conversation) => {
        const partnerId = conversation.participantIds.find((id) => id !== userId) || "";
        const partnerEmail = usersMap.get(partnerId)?.email || "Unknown user";

        const messages = db.messages
          .filter((message) => message.conversationId === conversation.id)
          .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

        const last = messages[messages.length - 1];

        const unreadCount = messages.filter(
          (message) => message.receiverId === userId && !message.readAt
        ).length;

        return {
          conversationId: conversation.id,
          partnerId,
          partnerEmail,
          lastMessage: last?.text || "No messages yet",
          lastMessageAt: last?.createdAt || conversation.updatedAt,
          unreadCount,
        };
      })
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  public getConversation(userId: string, partnerId: string): ConversationView {
    const usersMap = this.loadUsersMap();
    const partner = usersMap.get(partnerId);
    if (!partner) throw new Error("Recipient not found");

    const db = readUserChatsDb();
    const conversation = this.findConversation(db.conversations, userId, partnerId);

    if (!conversation) {
      return {
        conversationId: null,
        partnerId,
        partnerEmail: partner.email,
        messages: [],
      };
    }

    let touched = false;
    const now = this.nowIso();

    const messages = db.messages
      .filter((message) => message.conversationId === conversation.id)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
      .map((message) => {
        if (message.receiverId === userId && !message.readAt) {
          touched = true;
          return { ...message, readAt: now };
        }
        return message;
      });

    if (touched) {
      const byId = new Map(messages.map((m) => [m.id, m]));
      const merged = db.messages.map((message) => byId.get(message.id) || message);
      writeUserChatsDb({
        conversations: db.conversations,
        messages: merged,
      });
    }

    return {
      conversationId: conversation.id,
      partnerId,
      partnerEmail: partner.email,
      messages,
    };
  }

  public sendMessage(senderId: string, receiverId: string, text: string) {
    const cleanText = text?.trim();
    if (!cleanText) throw new Error("Message is required");
    if (senderId === receiverId) throw new Error("You cannot message yourself");

    const usersMap = this.loadUsersMap();
    if (!usersMap.get(receiverId)) throw new Error("Recipient not found");

    const db = readUserChatsDb();
    const now = this.nowIso();

    let conversation = this.findConversation(db.conversations, senderId, receiverId);
    if (!conversation) {
      conversation = {
        id: this.makeId("conv"),
        participantIds: this.normalizePair(senderId, receiverId),
        createdAt: now,
        updatedAt: now,
      };
      db.conversations.push(conversation);
    } else {
      conversation.updatedAt = now;
    }

    const newMessage: ChatMessageRecord = {
      id: this.makeId("msg"),
      conversationId: conversation.id,
      senderId,
      receiverId,
      text: cleanText,
      createdAt: now,
    };

    db.messages.push(newMessage);

    writeUserChatsDb({
      conversations: db.conversations,
      messages: db.messages,
    });

    return newMessage;
  }
}

export const userChatService = UserChatService.getInstance();
