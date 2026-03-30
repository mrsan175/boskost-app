import { NextResponse } from "next/server";
import { currentUser } from "@/lib/serverAuth";
import { db } from "@/lib/db";
import { rooms, properties, tenants, roomTenants } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const { searchParams } = new URL(req.url);
    const propertyId = searchParams.get("propertyId");

    const allRooms = await db
      .select({
        id: rooms.id,
        roomNumber: rooms.roomNumber,
        floor: rooms.floor,
        status: rooms.status,
        pricePerMonth: rooms.pricePerMonth,
        notes: rooms.notes,
        isActive: rooms.isActive,
        propertyId: rooms.propertyId,
        propertyName: properties.name,
        tenantName: tenants.name,
        startDate: roomTenants.startDate,
        endDate: roomTenants.endDate,
      })
      .from(rooms)
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .leftJoin(
        roomTenants,
        and(eq(rooms.id, roomTenants.roomId), eq(roomTenants.isActive, true)),
      )
      .leftJoin(tenants, eq(roomTenants.tenantId, tenants.id))
      .where(
        and(eq(properties.ownerId, user.id), eq(properties.isActive, true)),
      )
      .orderBy(rooms.roomNumber);

    return NextResponse.json(allRooms);
  } catch (error) {
    console.error("[ROOMS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
