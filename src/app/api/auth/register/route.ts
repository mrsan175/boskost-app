import { NextRequest, NextResponse } from "next/server";
import {
  hashPassword,
  signAccessToken,
  createAndStoreRefreshToken,
} from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, name, username } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password required" },
        { status: 400 },
      );
    }

    const [existing] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));
    if (existing) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 409 },
      );
    }

    // if client provided a username, ensure it's unique
    if (username) {
      const [existingByUsername] = await db
        .select()
        .from(users)
        .where(eq(users.username, username));
      if (existingByUsername) {
        return NextResponse.json(
          { error: "Username already in use" },
          { status: 409 },
        );
      }
    }

    const id = randomUUID();
    const passwordHash = await hashPassword(password);

    await db.insert(users).values({ id, email, username, name, passwordHash });

    const accessToken = signAccessToken(id);
    const { token: refreshToken } = await createAndStoreRefreshToken(id);

    const res = NextResponse.json({ id });
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
