import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { getUserFromRequest } from "@/lib/auth/requestAuth";
import { postService } from "@/modules/services/Post-Service-v1";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const category = searchParams.get("cat") || "";
    const userId = searchParams.get("userId");
    const maxPriceRaw = searchParams.get("maxPrice");
    const maxPrice = maxPriceRaw ? Number(maxPriceRaw) : undefined;

    if (userId) {
      const requester = await getUserFromRequest(req);
      if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

      if (requester.id !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const posts = await postService.getInventory(userId);
      return NextResponse.json(posts);
    }

    const posts = postService.getStorefrontItems({
      category,
      keyword: query,
      maxPrice,
    });

    return NextResponse.json(posts);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const requester = await getUserFromRequest(req);
    if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const newPost = postService.createPost(requester.id, body);

    revalidatePath("/");
    revalidatePath("/sitemap.xml");
    revalidatePath(`/product/${newPost.id}`);

    return NextResponse.json(newPost, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 400 });
  }
}
