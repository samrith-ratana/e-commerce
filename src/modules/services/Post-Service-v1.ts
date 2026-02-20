import { readPostsDb, writePostsDb, type PostRecord } from "@/lib/db/postsDb";

export type Post = PostRecord;

type NewPostInput = Omit<Post, "id" | "authorId" | "createdAt" | "updatedAt">;

export class PostService {
  private static instance: PostService;
  private constructor() {}

  public static getInstance(): PostService {
    if (!PostService.instance) PostService.instance = new PostService();
    return PostService.instance;
  }

  private loadPosts(): Post[] {
    const db = readPostsDb();
    return db.posts || [];
  }

  private savePosts(posts: Post[]) {
    writePostsDb({ posts });
  }

  private generatePostId(posts: Post[]): string {
    const maxId = posts.reduce((max, post) => {
      const num = Number(post.id.replace(/^P/, ""));
      return Number.isFinite(num) ? Math.max(max, num) : max;
    }, 0);

    return `P${(maxId + 1).toString().padStart(6, "0")}`;
  }

  private validatePostInput(data: NewPostInput) {
    if (!data.title?.trim()) throw new Error("Title is required");
    if (!data.content?.trim()) throw new Error("Content is required");
    if (!data.category?.trim()) throw new Error("Category is required");
    if (!Array.isArray(data.images)) throw new Error("Images must be an array");
    if (!Number.isFinite(data.price) || data.price < 0) throw new Error("Price must be a valid number");
    if (!Number.isFinite(data.stock) || data.stock < 0) throw new Error("Stock must be a valid number");
  }

  public createPost(authorId: string, data: NewPostInput): Post {
    this.validatePostInput(data);
    const posts = this.loadPosts();

    const normalizedStatus = data.status === "draft" || data.status === "sold_out" ? data.status : "published";

    const newPost: Post = {
      ...data,
      id: this.generatePostId(posts),
      authorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: normalizedStatus,
      images: data.images.filter(Boolean),
    };

    posts.push(newPost);
    this.savePosts(posts);

    return newPost;
  }

  public updatePost(
    userId: string,
    postId: string,
    updates: Partial<Omit<Post, "id" | "authorId" | "createdAt">>
  ): Post {
    const posts = this.loadPosts();
    const post = posts.find((p) => p.id === postId);

    if (!post) throw new Error("Product listing not found");
    if (post.authorId !== userId) throw new Error("Unauthorized: You do not own this listing");

    const merged = {
      ...post,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    if (updates.price !== undefined && (!Number.isFinite(updates.price) || updates.price < 0)) {
      throw new Error("Price must be a valid number");
    }
    if (updates.stock !== undefined && (!Number.isFinite(updates.stock) || updates.stock < 0)) {
      throw new Error("Stock must be a valid number");
    }

    Object.assign(post, merged);
    this.savePosts(posts);

    return post;
  }

  public searchPosts(keyword?: string, category?: string): Post[] {
    let posts = this.loadPosts().filter((p) => p.status === "published");

    if (category && category !== "All") {
      posts = posts.filter((p) => p.category === category);
    }

    if (keyword) {
      const lower = keyword.toLowerCase();
      posts = posts.filter(
        (p) => p.title.toLowerCase().includes(lower) || p.content.toLowerCase().includes(lower)
      );
    }

    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public deletePost(userId: string, postId: string) {
    const posts = this.loadPosts();
    const post = posts.find((p) => p.id === postId);

    if (!post) throw new Error("Product listing not found");
    if (post.authorId !== userId) throw new Error("Unauthorized");

    const filtered = posts.filter((p) => p.id !== postId);
    this.savePosts(filtered);

    return { success: true, message: "Listing removed" };
  }

  public getPostById(postId: string): Post | undefined {
    return this.loadPosts().find((p) => p.id === postId);
  }

  public async getInventory(authorId: string): Promise<Post[]> {
    const posts = this.loadPosts();
    return posts.filter((p) => p.authorId === authorId);
  }

  public async getOrders() {
    return [];
  }

  public async updateAccount() {
    return { success: true };
  }

  public getStorefrontItems(filters: {
    category?: string;
    keyword?: string;
    maxPrice?: number;
  }): Post[] {
    let posts = this.loadPosts().filter((p) => p.status === "published");

    if (filters.category && filters.category !== "All") {
      posts = posts.filter((p) => p.category === filters.category);
    }

    if (filters.keyword) {
      const lower = filters.keyword.toLowerCase();
      posts = posts.filter(
        (p) => p.title.toLowerCase().includes(lower) || p.content.toLowerCase().includes(lower)
      );
    }

    const maxPrice = filters.maxPrice;
    if (maxPrice !== undefined && Number.isFinite(maxPrice)) {
      posts = posts.filter((p) => p.price <= maxPrice);
    }

    return posts.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public getPostsByAuthor(authorId: string): Post[] {
    return this.loadPosts().filter((p) => p.authorId === authorId);
  }

  public getAllPosts(): Post[] {
    return this.loadPosts();
  }
}

export const postService = PostService.getInstance();
