import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/requestAuth";
import { userChatService } from "@/modules/services/User-Chat-Service-v1";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

export async function GET(req: Request) {
  try {
    const requester = await getUserFromRequest(req);
    if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const withUserId = searchParams.get("with");

    if (withUserId) {
      const conversation = userChatService.getConversation(requester.id, withUserId);
      return NextResponse.json(conversation);
    }

    const inbox = userChatService.getInbox(requester.id);
    return NextResponse.json({ inbox });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status = message === "Recipient not found" ? 404 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function POST(req: Request) {
  try {
    const requester = await getUserFromRequest(req);
    if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const message = userChatService.sendMessage(requester.id, body?.toUserId, body?.text);
    return NextResponse.json(message, { status: 201 });
  } catch (error: unknown) {
    const message = getErrorMessage(error);

    const status =
      message === "Recipient not found"
        ? 404
        : message === "You cannot message yourself"
          ? 400
          : 400;

    return NextResponse.json({ error: message }, { status });
  }
}
