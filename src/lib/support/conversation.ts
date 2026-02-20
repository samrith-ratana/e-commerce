export function normalizeClientIp(req: Request) {
  const raw = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "unknown";
  return raw.split(",")[0].trim().replace(/[^a-zA-Z0-9:.-]/g, "");
}

export function buildConversationKey(userId: string | null, ip: string) {
  return userId ? `user:${userId}` : `guest:${ip || "unknown"}`;
}
