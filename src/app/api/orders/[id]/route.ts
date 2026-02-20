import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/requestAuth";
import { orderService } from "@/modules/services/Order-Service-v1";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const requester = await getUserFromRequest(req);
    if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const action = body?.action || "cancel";

    if (action !== "cancel") {
      return NextResponse.json({ error: "Unsupported action" }, { status: 400 });
    }

    const order = orderService.cancelOrder(requester.id, id);
    return NextResponse.json(order);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status =
      message === "Forbidden"
        ? 403
        : message.includes("not found")
          ? 404
          : 400;
    return NextResponse.json({ error: message }, { status });
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
    const order = orderService.cancelOrder(requester.id, id);
    return NextResponse.json(order);
  } catch (error: unknown) {
    const message = getErrorMessage(error);
    const status =
      message === "Forbidden"
        ? 403
        : message.includes("not found")
          ? 404
          : 400;
    return NextResponse.json({ error: message }, { status });
  }
}