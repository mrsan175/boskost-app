import { cookies } from "next/headers";
import {
  verifyAccessToken,
  findRefreshTokenByPlain,
  rotateRefreshToken,
  signAccessToken,
} from "./auth";
import { db } from "./db";
import { users } from "./db/schema";
import { eq } from "drizzle-orm";

export async function currentUser() {
  try {
    const cookieStore = await cookies();

    // Try access token first
    const token = cookieStore.get("access_token")?.value;
    if (token) {
      try {
        const payload = verifyAccessToken(token);
        const userId = (payload as any).sub;
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, userId));
        return user ?? null;
      } catch (e) {
        // fallthrough to try refresh token
      }
    }

    // Attempt refresh using refresh_token cookie
    const refresh = cookieStore.get("refresh_token")?.value;
    if (!refresh) return null;

    const tokenRow = await findRefreshTokenByPlain(refresh);
    if (
      !tokenRow ||
      tokenRow.revoked ||
      new Date(tokenRow.expiresAt) < new Date()
    ) {
      return null;
    }

    // Load user
    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, tokenRow.userId));
    if (!user) return null;

    // Rotate refresh token and issue new access token
    const { token: newRefresh } = await rotateRefreshToken(refresh, user.id);
    const accessToken = signAccessToken(user.id);

    // Set cookies on the response for subsequent requests
    try {
      cookieStore.set({
        name: "access_token",
        value: accessToken,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 15,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      cookieStore.set({
        name: "refresh_token",
        value: newRefresh,
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 30,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
    } catch (e) {
      // ignore cookie set errors; still return user
    }

    return user ?? null;
  } catch (err) {
    return null;
  }
}
