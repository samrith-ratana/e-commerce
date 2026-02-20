import { NextResponse } from "next/server";
import { postService } from "@/modules/services/Post-Service-v1";
import { getUserFromRequest } from "@/lib/auth/requestAuth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const category = searchParams.get("cat") || "";
  const authorId = searchParams.get("authorId") || "";
  const maxPriceRaw = searchParams.get("maxPrice");
  const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;

  if (authorId) {
    const requester = await getUserFromRequest(request);
    if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    if (requester.id !== authorId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const products = await postService.getPostsByAuthor(authorId);
    return NextResponse.json(products);
  }

  const products = postService.getStorefrontItems({
    category,
    keyword: query,
    maxPrice,
  });

  return NextResponse.json(products);
}
