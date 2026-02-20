import fs from "fs";
import path from "path";

const dbPath = path.join(process.cwd(), "src/data/users.json");

export type UserRecord = {
  id: string;
  email: string;
  passwordHash: string;
};

export type UsersDb = {
  users: UserRecord[];
};

const defaultUsersDb: UsersDb = { users: [] };

function ensureFile(filePath: string, fallback: unknown) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify(fallback, null, 2));
  }
}

function readJsonFile<T>(filePath: string, fallback: T): T {
  ensureFile(filePath, fallback);
  try {
    const raw = fs.readFileSync(filePath, "utf-8").trim();
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeJsonFile<T>(filePath: string, data: T) {
  ensureFile(filePath, data);
  const tempPath = `${filePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(data, null, 2));
  fs.renameSync(tempPath, filePath);
}

export function readDb(): UsersDb {
  return readJsonFile<UsersDb>(dbPath, defaultUsersDb);
}

export function writeDb(data: UsersDb) {
  const normalized: UsersDb = {
    users: Array.isArray(data.users) ? data.users : [],
  };
  writeJsonFile(dbPath, normalized);
}
