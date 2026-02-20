import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { authService } from "@/modules/services/Auth-Service-v1";

export type CurrentUser = {
  id: string;
  email: string;
};

export async function getAccessTokenFromCookies(): Promise<string | null> {
  const token = (await cookies()).get("accessToken")?.value;
  return token || null;
}

export async function getCurrentUserFromCookies(): Promise<CurrentUser | null> {
  const token = await getAccessTokenFromCookies();
  if (!token) return null;

  try {
    const user = await authService.getMeFromAccessToken(token);
    return user as CurrentUser;
  } catch {
    return null;
  }
}

export async function requireCurrentUser(redirectTo = "/dashboard"): Promise<CurrentUser> {
  const user = await getCurrentUserFromCookies();
  if (!user) {
    redirect(`/login?redirect=${encodeURIComponent(redirectTo)}`);
  }
  return user;
}
