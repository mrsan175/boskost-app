import { NextRequest, NextResponse } from "next/server";
import {
  findRefreshTokenByPlain,
  rotateRefreshToken,
  signAccessToken,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const refresh = req.cookies.get("refresh_token")?.value;
    if (!refresh)
      return NextResponse.json({ error: "No refresh token" }, { status: 401 });

    const tokenRow = await findRefreshTokenByPlain(refresh);
    if (
      !tokenRow ||
      tokenRow.revoked ||
      new Date(tokenRow.expiresAt) < new Date()
    ) {
      return NextResponse.json(
        { error: "Invalid refresh token" },
        { status: 401 },
      );
    }

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.id, tokenRow.userId));
    if (!user)
      return NextResponse.json({ error: "User not found" }, { status: 404 });

    const { token: newRefresh } = await rotateRefreshToken(refresh, user.id);
    const accessToken = signAccessToken(user.id);

    const res = NextResponse.json({ id: user.id });
    res.cookies.set({
      name: "access_token",
      value: accessToken,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 15,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    res.cookies.set({
      name: "refresh_token",
      value: newRefresh,
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
