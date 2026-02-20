import fs from "fs";
import path from "path";

const dbFilePath = path.join(process.cwd(), "src/data/posts.json");

export type PostRecord = {
  id: string;
  authorId: string;
  title: string;
  content: string;
  category: string;
  price: number;
  originalPrice?: number;
  stock: number;
  images: string[];
  status: "draft" | "published" | "sold_out";
  createdAt: string;
  updatedAt: string;
};

type PostsDb = {
  posts: PostRecord[];
};

const defaultPostsDb: PostsDb = { posts: [] };

function ensurePostsFile() {
  const dir = path.dirname(dbFilePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(dbFilePath)) {
    fs.writeFileSync(dbFilePath, JSON.stringify(defaultPostsDb, null, 2));
  }
}

export function readPostsDb(): PostsDb {
  ensurePostsFile();
  try {
    const raw = fs.readFileSync(dbFilePath, "utf-8").trim();
    if (!raw) return defaultPostsDb;
    const parsed = JSON.parse(raw) as PostsDb;
    return {
      posts: Array.isArray(parsed.posts) ? parsed.posts : [],
    };
  } catch {
    return defaultPostsDb;
  }
}

export function writePostsDb(data: PostsDb) {
  ensurePostsFile();
  const normalized: PostsDb = {
    posts: Array.isArray(data.posts) ? data.posts : [],
  };
  const tempPath = `${dbFilePath}.tmp`;
  fs.writeFileSync(tempPath, JSON.stringify(normalized, null, 2));
  fs.renameSync(tempPath, dbFilePath);
}
