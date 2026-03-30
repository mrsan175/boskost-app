import { db } from "@/lib/db";
import { activityLogs } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { currentUser } from "@/lib/serverAuth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const logs = await db
    .select()
    .from(activityLogs)
    .where(eq(activityLogs.ownerId, user.id))
    .orderBy(desc(activityLogs.createdAt))
    .limit(10);

  return NextResponse.json(logs);
}
