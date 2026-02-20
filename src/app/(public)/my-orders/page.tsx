import BuyerOrdersClient from "@/components/orders/BuyerOrdersClient";
import { requireCurrentUser } from "@/lib/auth/currentUser";
import { orderService } from "@/modules/services/Order-Service-v1";

export default async function MyOrdersPage() {
  const user = await requireCurrentUser("/my-orders");
  const orders = orderService.getOrdersByBuyer(user.id);

  return <BuyerOrdersClient initialOrders={orders} />;
}