import { cookies } from "next/headers";
import { authService } from "@/modules/services/Auth-Service-v1";
import { NextResponse } from "next/server";

const cookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Refresh failed";
}

export async function POST() {
  try {
    const refreshToken = (await cookies()).get("refreshToken")?.value;

    if (!refreshToken) {
      return NextResponse.json({ error: "Missing refresh token" }, { status: 401 });
    }

    const tokens = await authService.refreshTokens(refreshToken);

    (await cookies()).set("accessToken", tokens.accessToken, {
      ...cookieOptions,
      maxAge: 60 * 15,
    });

    (await cookies()).set("refreshToken", tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({ message: "Token refreshed", tokens });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 401 });
  }
}
