import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authService } from "@/modules/services/Auth-Service-v1";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Unauthorized";
}

export async function GET() {
  try {
    const token = (await cookies()).get("accessToken")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await authService.getMeFromAccessToken(token);
    return NextResponse.json(user);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 401 });
  }
}
