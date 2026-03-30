import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes, createHash, randomUUID } from "crypto";
import { db } from "./db";
import { refreshTokens } from "./db/schema";
import { eq } from "drizzle-orm";

const JWT_SECRET = process.env.JWT_SECRET || "rahasia-ilahi";
const ACCESS_TOKEN_EXPIRES_IN = "15m";
const REFRESH_TOKEN_DAYS = 30;

export async function hashPassword(password: string) {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hash: string) {
  return bcrypt.compare(password, hash);
}

export function signAccessToken(userId: string) {
  return jwt.sign({ sub: userId }, JWT_SECRET, {
    expiresIn: ACCESS_TOKEN_EXPIRES_IN,
  });
}

export function verifyAccessToken(token: string) {
  return jwt.verify(token, JWT_SECRET) as {
    sub: string;
    iat: number;
    exp: number;
  };
}

export async function createAndStoreRefreshToken(userId: string) {
  const token = randomBytes(64).toString("hex");
  const tokenHash = createHash("sha256").update(token).digest("hex");
  const id = randomUUID();
  const expiresAt = new Date(
    Date.now() + REFRESH_TOKEN_DAYS * 24 * 60 * 60 * 1000,
  );

  await db.insert(refreshTokens).values({ id, userId, tokenHash, expiresAt });

  return { token, id, expiresAt };
}

export async function rotateRefreshToken(oldToken: string, userId: string) {
  const oldHash = createHash("sha256").update(oldToken).digest("hex");

  await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.tokenHash, oldHash));

  return createAndStoreRefreshToken(userId);
}

export async function findRefreshTokenByPlain(plain: string) {
  const tokenHash = createHash("sha256").update(plain).digest("hex");
  const [row] = await db
    .select()
    .from(refreshTokens)
    .where(eq(refreshTokens.tokenHash, tokenHash));
  return row ?? null;
}

export async function revokeRefreshTokenByPlain(plain: string) {
  const tokenHash = createHash("sha256").update(plain).digest("hex");
  await db
    .update(refreshTokens)
    .set({ revoked: true })
    .where(eq(refreshTokens.tokenHash, tokenHash));
}
