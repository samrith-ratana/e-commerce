import { NextResponse } from "next/server";
import { postService } from "@/modules/services/Post-Service-v1";
import { getUserFromRequest } from "@/lib/auth/requestAuth";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const post = postService.getPostById(id);
    if (!post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    if (post.status !== "published") {
      const requester = await getUserFromRequest(req);
      const canReadDraft = requester && requester.id === post.authorId;

      if (!canReadDraft) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json(post);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const requester = await getUserFromRequest(req);
    if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json();
    const updatedPost = postService.updatePost(requester.id, id, body);

    return NextResponse.json(updatedPost);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return NextResponse.json(
      { error: message },
      { status: message.includes("Unauthorized") ? 403 : 404 }
    );
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const requester = await getUserFromRequest(req);
    if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const result = postService.deletePost(requester.id, id);
    return NextResponse.json(result);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    return NextResponse.json(
      { error: message },
      { status: message.includes("Unauthorized") ? 403 : 404 }
    );
  }
}
