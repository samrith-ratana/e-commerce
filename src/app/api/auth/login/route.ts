import { NextRequest, NextResponse } from "next/server";
import { authService } from "@/modules/services/Auth-Service-v1";
import { cookies } from "next/headers";

const cookieOptions = {
  httpOnly: true,
  path: "/",
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
};

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Login failed";
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const result = await authService.login(email, password);

    (await cookies()).set("accessToken", result.tokens.accessToken, {
      ...cookieOptions,
      maxAge: 60 * 15,
    });

    (await cookies()).set("refreshToken", result.tokens.refreshToken, {
      ...cookieOptions,
      maxAge: 60 * 60 * 24 * 7,
    });

    return NextResponse.json({
      user: result.user,
      message: "Login successful",
    });
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return NextResponse.json({ error: message, message }, { status: 401 });
  }
}
