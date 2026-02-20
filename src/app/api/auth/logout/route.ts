import { NextResponse } from "next/server";
import { authService } from "@/modules/services/Auth-Service-v1";
import { cookies } from "next/headers";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Logout failed";
}

export async function POST() {
  try {
    const refreshToken = (await cookies()).get("refreshToken")?.value;

    if (refreshToken) {
      await authService.logout(refreshToken);
    }

    (await cookies()).delete("accessToken");
    (await cookies()).delete("refreshToken");

    return NextResponse.json({ message: "Logged out" });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}
