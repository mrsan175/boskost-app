import { db } from "@/lib/db";
import { rooms, properties } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const data = await db
    .select({
      id: rooms.id,
      roomNumber: rooms.roomNumber,
      floor: rooms.floor,
      status: rooms.status,
      propertyId: properties.id,
      propertyName: properties.name,
    })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(and(eq(properties.ownerId, user.id), eq(rooms.isActive, true)))
    .orderBy(rooms.roomNumber);

  return NextResponse.json(data);
}
