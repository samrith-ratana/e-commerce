import { compare, hash } from "bcryptjs";
import { sign, verify, JwtPayload } from "jsonwebtoken";
import { readDb, writeDb } from "@/lib/db/jsonDb";
import { readSessionsDb, writeSessionsDb, type SessionRecord } from "@/lib/db/sessionDb";
import crypto from "crypto";

export type User = {
  id: string;
  email: string;
  passwordHash: string;
};

export type SafeUser = Omit<User, "passwordHash">;
export type Session = SessionRecord;

const SESSION_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const MAX_SESSIONS_PER_USER = 5;

function ensureEnv(name: string) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name}`);
  return value;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
  };
}

export class AuthService {
  private static instance: AuthService;
  private constructor() {}

  public static getInstance(): AuthService {
    if (!AuthService.instance) AuthService.instance = new AuthService();
    return AuthService.instance;
  }

  private safeLoadUsers(): User[] {
    const db = readDb();
    const rawUsers = Array.isArray(db.users) ? db.users : [];

    return rawUsers
      .filter((u): u is { id: string; email: string; passwordHash: string } => {
        return Boolean(u && typeof u.id === "string" && typeof u.email === "string" && typeof u.passwordHash === "string");
      })
      .map((u) => ({
        id: u.id,
        email: normalizeEmail(u.email),
        passwordHash: u.passwordHash,
      }));
  }

  private safeSaveUsers(users: User[]) {
    writeDb({ users });
  }

  private safeLoadSessions(): Session[] {
    const db = readSessionsDb();
    return Array.isArray(db.sessions) ? (db.sessions as Session[]) : [];
  }

  private safeSaveSessions(sessions: Session[]) {
    writeSessionsDb({ sessions });
  }

  private pruneExpiredSessions(sessions: Session[]): Session[] {
    const now = Date.now();
    return sessions.filter((s) => new Date(s.expiresAt).getTime() > now);
  }

  private enforceSessionLimit(sessions: Session[], userId: string): Session[] {
    const userSessions = sessions
      .filter((s) => s.userId === userId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());

    if (userSessions.length <= MAX_SESSIONS_PER_USER) return sessions;

    const toRemove = new Set(userSessions.slice(0, userSessions.length - MAX_SESSIONS_PER_USER).map((s) => s.sessionId));
    return sessions.filter((s) => !toRemove.has(s.sessionId));
  }

  private findUserByEmail(email: string) {
    const users = this.safeLoadUsers();
    const normalized = normalizeEmail(email);
    return users.find((u) => normalizeEmail(u.email) === normalized);
  }

  private findUserById(id: string) {
    const users = this.safeLoadUsers();
    return users.find((u) => u.id === id);
  }

  private createUser(email: string, passwordHash: string) {
    const users = this.safeLoadUsers();
    const newUser: User = {
      id: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Date.now().toString(),
      email: normalizeEmail(email),
      passwordHash,
    };
    users.push(newUser);
    this.safeSaveUsers(users);
    return newUser;
  }

  private loadSessions(): Session[] {
    const active = this.pruneExpiredSessions(this.safeLoadSessions());
    this.safeSaveSessions(active);
    return active;
  }

  private saveSessions(data: Session[]) {
    this.safeSaveSessions(this.pruneExpiredSessions(data));
  }

  private createSession(userId: string, refreshToken: string) {
    let sessions = this.loadSessions();

    const session: Session = {
      sessionId: typeof crypto.randomUUID === "function" ? crypto.randomUUID() : Date.now().toString(),
      userId,
      refreshToken,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
    };

    sessions.push(session);
    sessions = this.enforceSessionLimit(sessions, userId);
    this.saveSessions(sessions);

    return session;
  }

  private deleteSession(sessionId: string) {
    const sessions = this.loadSessions().filter((s) => s.sessionId !== sessionId);
    this.saveSessions(sessions);
  }

  public disconnectSession(sessionId: string) {
    this.deleteSession(sessionId);
    return { message: "Session disconnected" };
  }

  private findSessionByRefreshToken(token: string) {
    return this.loadSessions().find((s) => s.refreshToken === token);
  }

  private generateTokens(userId: string) {
    const accessSecret = ensureEnv("JWT_ACCESS_SECRET");
    const refreshSecret = ensureEnv("JWT_REFRESH_SECRET");

    const accessToken = sign({ id: userId }, accessSecret, {
      expiresIn: "15m",
    });

    const refreshToken = sign({ id: userId }, refreshSecret, {
      expiresIn: "7d",
    });

    return { accessToken, refreshToken };
  }

  private validateCredentialsInput(email: string, password: string) {
    if (!email || !password) throw new Error("Email and password are required");
    if (!isValidEmail(normalizeEmail(email))) throw new Error("Invalid email format");
    if (password.length < 8) throw new Error("Password must be at least 8 characters");
  }

  public async signup(email: string, password: string) {
    this.validateCredentialsInput(email, password);
    const existing = this.findUserByEmail(email);
    if (existing) throw new Error("User already exists");

    const passwordHash = await hash(password, 10);
    const newUser = this.createUser(email, passwordHash);

    const tokens = this.generateTokens(newUser.id);
    this.createSession(newUser.id, tokens.refreshToken);

    return { user: getSafeUser(newUser), tokens };
  }

  public async login(email: string, password: string) {
    this.validateCredentialsInput(email, password);

    const user = this.findUserByEmail(email);
    if (!user) throw new Error("Invalid credentials");

    const valid = await compare(password, user.passwordHash);
    if (!valid) throw new Error("Invalid credentials");

    const tokens = this.generateTokens(user.id);
    this.createSession(user.id, tokens.refreshToken);

    return { user: getSafeUser(user), tokens };
  }

  public async refreshTokens(refreshToken: string) {
    if (!refreshToken) throw new Error("Missing refresh token");

    const session = this.findSessionByRefreshToken(refreshToken);
    if (!session) throw new Error("Session not active");

    let decoded;
    try {
      decoded = this.verifyRefreshToken(refreshToken);
    } catch {
      this.deleteSession(session.sessionId);
      throw new Error("Invalid refresh token");
    }

    if (decoded.id !== session.userId) {
      this.deleteSession(session.sessionId);
      throw new Error("Invalid session owner");
    }

    const user = this.findUserById(session.userId);
    if (!user) {
      this.deleteSession(session.sessionId);
      throw new Error("User not found");
    }

    const tokens = this.generateTokens(user.id);

    const sessions = this.loadSessions().map((s) =>
      s.sessionId === session.sessionId
        ? {
            ...s,
            refreshToken: tokens.refreshToken,
            expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString(),
          }
        : s
    );

    this.saveSessions(sessions);

    return tokens;
  }

  public async logout(refreshToken: string) {
    if (!refreshToken) return { message: "No refresh token provided" };

    const session = this.findSessionByRefreshToken(refreshToken);
    if (session) this.deleteSession(session.sessionId);

    return { message: "Logged out successfully" };
  }

  public verifyAccessToken(token: string) {
    const accessSecret = ensureEnv("JWT_ACCESS_SECRET");
    return verify(token, accessSecret) as JwtPayload & {
      id: string;
    };
  }

  public verifyRefreshToken(token: string) {
    const refreshSecret = ensureEnv("JWT_REFRESH_SECRET");
    return verify(token, refreshSecret) as JwtPayload & {
      id: string;
    };
  }

  public async getMeFromAccessToken(token: string) {
    try {
      const decoded = this.verifyAccessToken(token);
      return this.getMe(decoded.id);
    } catch {
      throw new Error("Invalid or expired token");
    }
  }

  private async getMe(userId: string) {
    const user = this.findUserById(userId);
    if (!user) throw new Error("User not found");
    return getSafeUser(user);
  }
}

export const authService = AuthService.getInstance();

