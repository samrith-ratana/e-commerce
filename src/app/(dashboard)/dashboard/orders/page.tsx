import { requireCurrentUser } from "@/lib/auth/currentUser";
import { orderService } from "@/modules/services/Order-Service-v1";
import DashboardOrdersTabs from "@/components/orders/DashboardOrdersTabs";

export default async function OrdersPage() {
  const user = await requireCurrentUser("/dashboard/orders");

  const salesOrders = orderService.getSalesOrdersBySeller(user.id);
  const purchaseOrders = orderService.getOrdersByBuyer(user.id);

  return <DashboardOrdersTabs salesOrders={salesOrders} purchaseOrders={purchaseOrders} />;
}
