import { readDb } from "@/lib/db/jsonDb";
import { readOrdersDb, writeOrdersDb, type OrderRecord } from "@/lib/db/ordersDb";
import { readPostsDb, writePostsDb } from "@/lib/db/postsDb";

export type Order = OrderRecord;

export type SalesOrder = Order & {
  buyerEmail: string;
};

export class OrderService {
  private static instance: OrderService;

  private constructor() {}

  public static getInstance(): OrderService {
    if (!OrderService.instance) OrderService.instance = new OrderService();
    return OrderService.instance;
  }

  private loadOrders(): Order[] {
    const db = readOrdersDb();
    return Array.isArray(db.orders) ? db.orders : [];
  }

  private saveOrders(orders: Order[]) {
    writeOrdersDb({ orders });
  }

  private generateOrderId(orders: Order[]): string {
    const maxId = orders.reduce((max, order) => {
      const match = order.id.match(/(\d+)$/);
      const num = match ? Number(match[1]) : 0;
      return Number.isFinite(num) ? Math.max(max, num) : max;
    }, 0);

    return `ORD-${(maxId + 1).toString().padStart(6, "0")}`;
  }

  public createOrder(buyerId: string, input: { postId: string; quantity?: number }): Order {
    const quantity = Number.isFinite(input.quantity) ? Number(input.quantity) : 1;
    if (!input.postId) throw new Error("postId is required");
    if (!Number.isInteger(quantity) || quantity < 1) throw new Error("quantity must be a positive integer");

    const postsDb = readPostsDb();
    const post = postsDb.posts.find((item) => item.id === input.postId);

    if (!post) throw new Error("Product not found");
    if (post.status !== "published") throw new Error("Product is not available for purchase");
    if (post.stock < quantity) throw new Error("Insufficient stock");
    if (post.authorId === buyerId) throw new Error("You cannot buy your own product");

    const orders = this.loadOrders();
    const now = new Date().toISOString();

    const order: Order = {
      id: this.generateOrderId(orders),
      postId: post.id,
      buyerId,
      sellerId: post.authorId,
      title: post.title,
      image: post.images?.[0] || "",
      unitPrice: post.price,
      quantity,
      totalAmount: post.price * quantity,
      status: "created",
      createdAt: now,
      updatedAt: now,
    };

    post.stock -= quantity;
    post.updatedAt = now;
    if (post.stock <= 0) {
      post.stock = 0;
      post.status = "sold_out";
    }

    writePostsDb(postsDb);
    orders.push(order);
    this.saveOrders(orders);

    return order;
  }

  public getOrdersByBuyer(buyerId: string): Order[] {
    return this.loadOrders()
      .filter((order) => order.buyerId === buyerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getOrdersBySeller(sellerId: string): Order[] {
    return this.loadOrders()
      .filter((order) => order.sellerId === sellerId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getSalesOrdersBySeller(sellerId: string): SalesOrder[] {
    const orders = this.getOrdersBySeller(sellerId);
    const users = readDb().users;

    const usersById = new Map(users.map((user) => [user.id, user.email]));

    return orders.map((order) => ({
      ...order,
      buyerEmail: usersById.get(order.buyerId) || "Unknown customer",
    }));
  }

  public cancelOrder(requesterId: string, orderId: string): Order {
    const orders = this.loadOrders();
    const order = orders.find((item) => item.id === orderId);

    if (!order) throw new Error("Order not found");
    if (order.status === "cancelled") throw new Error("Order already cancelled");

    const canCancel = requesterId === order.buyerId || requesterId === order.sellerId;
    if (!canCancel) throw new Error("Forbidden");

    const postsDb = readPostsDb();
    const post = postsDb.posts.find((item) => item.id === order.postId);
    const now = new Date().toISOString();

    if (post) {
      post.stock += order.quantity;
      post.updatedAt = now;
      if (post.status === "sold_out" && post.stock > 0) {
        post.status = "published";
      }
      writePostsDb(postsDb);
    }

    order.status = "cancelled";
    order.cancelledAt = now;
    order.updatedAt = now;
    this.saveOrders(orders);

    return order;
  }
}

export const orderService = OrderService.getInstance();
