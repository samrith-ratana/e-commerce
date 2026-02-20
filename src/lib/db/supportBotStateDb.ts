import fs from "fs";
import path from "path";

const dbFilePath = path.join(process.cwd(), "src/data/support-bot-state.json");

type SupportBotStateDb = {
  lastUpdateId: number;
  lastSyncedAt: string | null;
};

const defaultDb: SupportBotStateDb = {
  lastUpdateId: 0,
  lastSyncedAt: null,
};

function ensureFile() {
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify(defaultDb, null, 2));
  }
}

export function readSupportBotStateDb(): SupportBotStateDb {
  ensureFile();
  try {
    const raw = fs.readFileSync(dbFilePath, "utf-8").trim();
    if (!raw) return defaultDb;

    const parsed = JSON.parse(raw) as Partial<SupportBotStateDb>;
    return {
      lastUpdateId: Number.isFinite(parsed.lastUpdateId) ? Number(parsed.lastUpdateId) : 0,
      lastSyncedAt: typeof parsed.lastSyncedAt === "string" ? parsed.lastSyncedAt : null,
    };
  } catch {
    return defaultDb;
  }
}

export function writeSupportBotStateDb(data: SupportBotStateDb) {
  ensureFile();

  const normalized: SupportBotStateDb = {
    lastUpdateId: Number.isFinite(data.lastUpdateId) ? Number(data.lastUpdateId) : 0,
    lastSyncedAt: data.lastSyncedAt || null,
  };

  const tempPath = `${dbFilePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(normalized, null, 2));
  fs.renameSync(tempPath, dbFilePath);
}
