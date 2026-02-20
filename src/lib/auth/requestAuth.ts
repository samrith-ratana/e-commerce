import { cookies } from "next/headers";
import { authService } from "@/modules/services/Auth-Service-v1";

export async function getTokenFromRequest(req: Request): Promise<string | null> {
  const authHeader = req.headers.get("authorization");
  const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7).trim() : null;
  if (bearerToken) return bearerToken;

  return (await cookies()).get("accessToken")?.value || null;
}

export async function getUserFromRequest(req: Request) {
  const token = await getTokenFromRequest(req);
  if (!token) return null;

  try {
    return authService.verifyAccessToken(token);
  } catch {
    return null;
  }
}
