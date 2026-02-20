import fs from "fs";
import path from "path";

const dbFilePath = path.join(process.cwd(), "src/data/orders.json");

export type OrderStatus = "created" | "cancelled";

export type OrderRecord = {
  id: string;
  postId: string;
  buyerId: string;
  sellerId: string;
  title: string;
  image: string;
  unitPrice: number;
  quantity: number;
  totalAmount: number;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  cancelledAt?: string;
};

type OrdersDb = {
  orders: OrderRecord[];
};

const defaultOrdersDb: OrdersDb = { orders: [] };

function ensureOrdersFile() {
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify(defaultOrdersDb, null, 2));
  }
}

export function readOrdersDb(): OrdersDb {
  ensureOrdersFile();
  try {
    const raw = fs.readFileSync(dbFilePath, "utf-8").trim();
    if (!raw) return defaultOrdersDb;
    const parsed = JSON.parse(raw) as OrdersDb;
    return {
      orders: Array.isArray(parsed.orders) ? parsed.orders : [],
    };
  } catch {
    return defaultOrdersDb;
  }
}

export function writeOrdersDb(data: OrdersDb) {
  ensureOrdersFile();
  const normalized: OrdersDb = {
    orders: Array.isArray(data.orders) ? data.orders : [],
  };
  const tempPath = `${dbFilePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(normalized, null, 2));
  fs.renameSync(tempPath, dbFilePath);
}