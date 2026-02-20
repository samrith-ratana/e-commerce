import { NextResponse } from "next/server";
import { authService } from "@/modules/services/Auth-Service-v1";
import { cookies } from "next/headers";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Disconnect failed";
}

export async function POST(req: Request) {
  try {
    const cookieToken = (await cookies()).get("accessToken")?.value;
    if (!cookieToken) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await authService.getMeFromAccessToken(cookieToken);

    const { sessionId } = await req.json();
    if (!sessionId) throw new Error("Missing sessionId");

    authService.disconnectSession(sessionId);

    return NextResponse.json({ message: "Session disconnected" });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
