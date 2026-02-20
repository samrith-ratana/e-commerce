import { NextResponse } from "next/server";
import { getUserFromRequest } from "@/lib/auth/requestAuth";
import { orderService } from "@/modules/services/Order-Service-v1";

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : "Request failed";
}

export async function GET(req: Request) {
  try {
    const requester = await getUserFromRequest(req);
    if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const scope = searchParams.get("scope") || "buyer";

    const orders =
      scope === "seller"
        ? orderService.getOrdersBySeller(requester.id)
        : orderService.getOrdersByBuyer(requester.id);

    return NextResponse.json(orders);
  } catch (error: unknown) {
    return NextResponse.json({ error: getErrorMessage(error) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const requester = await getUserFromRequest(req);
    if (!requester) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const body = await req.json();
    const order = orderService.createOrder(requester.id, {
      postId: body?.postId,
      quantity: body?.quantity,
    });

    return NextResponse.json(order, { status: 201 });
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