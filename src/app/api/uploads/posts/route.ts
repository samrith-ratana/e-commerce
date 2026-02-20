import { NextResponse } from "next/server";
import path from "path";
import { mkdir, writeFile } from "fs/promises";
import { randomUUID } from "crypto";
import { getUserFromRequest } from "@/lib/auth/requestAuth";

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024;
const ALLOWED_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

function sanitizeName(input: string) {
  return input
    .toLowerCase()
    .replace(/\.[^/.]+$/, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 50);
}

function extFromType(file: File) {
  if (file.type === "image/jpeg") return ".jpg";
  if (file.type === "image/png") return ".png";
  if (file.type === "image/webp") return ".webp";
  if (file.type === "image/gif") return ".gif";
  const original = file.name.toLowerCase();
  if (original.endsWith(".png")) return ".png";
  if (original.endsWith(".webp")) return ".webp";
  if (original.endsWith(".gif")) return ".gif";
  return ".jpg";
}

export async function POST(req: Request) {
  try {
    const requester = await getUserFromRequest(req);
    if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const formData = await req.formData();
    const file = formData.get("image");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Image file is required" }, { status: 400 });
    }

    if (!ALLOWED_TYPES.has(file.type)) {
      return NextResponse.json({ error: "Only JPG, PNG, WEBP, GIF are allowed" }, { status: 400 });
    }

    if (file.size <= 0 || file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json({ error: "Image must be between 1 byte and 5MB" }, { status: 400 });
    }

    const uploadDir = path.join(process.cwd(), "public", "uploads", "posts");
    await mkdir(uploadDir, { recursive: true });

    const safeBase = sanitizeName(file.name) || "post-image";
    const timestamp = Date.now();
    const unique = randomUUID().slice(0, 8);
    const extension = extFromType(file);
    const filename = `${safeBase}-${timestamp}-${unique}${extension}`;

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const absolutePath = path.join(uploadDir, filename);
    await writeFile(absolutePath, buffer);

    const publicUrl = `/uploads/posts/${filename}`;

    return NextResponse.json({ url: publicUrl, filename }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Upload failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
