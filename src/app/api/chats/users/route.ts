import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/requestAuth";
import { userChatService } from "@/modules/services/User-Chat-Service-v1";

export async function GET(req: Request) {
  const requester = await getUserFromRequest(req);
  if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const users = userChatService.listUsers(requester.id);
  return NextResponse.json({ users });
}
