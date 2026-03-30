import { NextRequest, NextResponse } from "next/server";
import {
  verifyPassword,
  signAccessToken,
  createAndStoreRefreshToken,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // Accept either `identifier` (email or username) or `email` for backwards compatibility
    const { identifier, email, password } = body;
    const iden = identifier ?? email;

    if (!iden || !password) {
      return NextResponse.json(
        { error: "Identifier and password required" },
        { status: 400 },
      );
    }

    // Try by email first, then by username
    let user: any = null;
    const [byEmail] = await db
      .select()
      .from(users)
      .where(eq(users.email, iden));
    if (byEmail) {
      user = byEmail;
    } else {
      const [byUsername] = await db
        .select()
        .from(users)
        .where(eq(users.username, iden));
      if (byUsername) user = byUsername;
    }

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok)
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );

    const accessToken = signAccessToken(user.id);
    const { token: refreshToken } = await createAndStoreRefreshToken(user.id);

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
      value: refreshToken,
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
