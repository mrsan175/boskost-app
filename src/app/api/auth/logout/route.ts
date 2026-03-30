import { NextRequest, NextResponse } from "next/server";
import { revokeRefreshTokenByPlain } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const refresh = req.cookies.get("refresh_token")?.value;
    if (refresh) {
      await revokeRefreshTokenByPlain(refresh);
    }

    const res = NextResponse.json({ ok: true });
    // clear cookies
    res.cookies.set({
      name: "access_token",
      value: "",
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    res.cookies.set({
      name: "refresh_token",
      value: "",
      httpOnly: true,
      path: "/",
      maxAge: 0,
    });
    return res;
  } catch (err) {
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
