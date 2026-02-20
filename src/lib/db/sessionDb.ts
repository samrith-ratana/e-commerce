import fs from "fs";
import path from "path";

const sessionPath = path.join(process.cwd(), "src/data/sessions.json");

export type SessionRecord = {
  sessionId: string;
  userId: string;
  refreshToken: string;
  createdAt: string;
  expiresAt: string;
};

type SessionsDb = {
  sessions: SessionRecord[];
};

const defaultSessionsDb: SessionsDb = { sessions: [] };

function ensureSessionFile() {
  const dir = path.dirname(sessionPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(sessionPath)) {
    fs.writeFileSync(sessionPath, JSON.stringify(defaultSessionsDb, null, 2));
  }
}

export function readSessionsDb(): SessionsDb {
  ensureSessionFile();
  try {
    const raw = fs.readFileSync(sessionPath, "utf-8").trim();
    if (!raw) return defaultSessionsDb;
    const parsed = JSON.parse(raw) as SessionsDb;
    return {
      sessions: Array.isArray(parsed.sessions) ? parsed.sessions : [],
    };
  } catch {
    return defaultSessionsDb;
  }
}

export function writeSessionsDb(data: SessionsDb) {
  ensureSessionFile();
  const normalized: SessionsDb = {
    sessions: Array.isArray(data.sessions) ? data.sessions : [],
  };
  const tempPath = `${sessionPath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(normalized, null, 2));
  fs.renameSync(tempPath, sessionPath);
}
