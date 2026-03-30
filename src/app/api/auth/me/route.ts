import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "@/lib/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: NextRequest) {
  try {
    const token = req.cookies.get("access_token")?.value;
    if (!token) return NextResponse.json({ user: null });

    let payload;
    try {
      payload = verifyAccessToken(token);
    } catch (e) {
      return NextResponse.json({ user: null });
    }

    const userId = (payload as any).sub;
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    if (!user) return NextResponse.json({ user: null });

    const safeUser = {
      id: user.id,
      email: user.email,
      name: user.name,
      username: user.username,
      imageUrl: user.imageUrl,
      subscriptionTier: user.subscriptionTier,
    };

    return NextResponse.json({ user: safeUser });
  } catch (err) {
    return NextResponse.json({ user: null });
  }
}
