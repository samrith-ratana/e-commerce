import { NextResponse } from "next/server";
import { syncTelegramInbox } from "@/lib/support/telegramSync";

function isAuthorized(req: Request) {
  const syncSecret = process.env.TELEGRAM_SYNC_SECRET;
  if (!syncSecret) return true;

  const headerSecret = req.headers.get("x-sync-secret");
  const auth = req.headers.get("authorization");
  const bearer = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;

  return headerSecret === syncSecret || bearer === syncSecret;
}

export async function POST(req: Request) {
  try {
    if (!isAuthorized(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await syncTelegramInbox();
    return NextResponse.json({ ok: true, ...result });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Sync failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
