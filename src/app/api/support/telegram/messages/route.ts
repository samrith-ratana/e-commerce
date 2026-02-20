import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/requestAuth";
import { readSupportChatsDb } from "@/lib/db/supportChatsDb";
import { buildConversationKey, normalizeClientIp } from "@/lib/support/conversation";
import { syncTelegramInbox } from "@/lib/support/telegramSync";

export async function GET(req: Request) {
  try {
    await syncTelegramInbox().catch(() => null);

    const requester = await getUserFromRequest(req);
    const ip = normalizeClientIp(req);
    const conversationKey = buildConversationKey(requester?.id ?? null, ip);

    const db = readSupportChatsDb();
    const conversation = db.conversations.find((item) => item.key === conversationKey);

    const messages = (conversation?.messages || []).sort(
      (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
    );

    return NextResponse.json({
      conversationKey,
      messages: messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        text: msg.text,
        createdAt: msg.createdAt,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to load messages";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
