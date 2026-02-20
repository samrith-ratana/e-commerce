import { NextResponse } from "next/server";
import { authService } from "@/modules/services/Auth-Service-v1";
import { cookies } from "next/headers";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Debug request failed";
}

export async function GET() {
  try {
    const cookieToken = (await cookies()).get("accessToken")?.value;
    if (!cookieToken) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    await authService.getMeFromAccessToken(cookieToken);

    const users = (await import("@/lib/db/jsonDb")).readDb().users || [];
    const sessions = (await import("@/lib/db/sessionDb")).readSessionsDb().sessions || [];

    return NextResponse.json({ users, sessions });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
