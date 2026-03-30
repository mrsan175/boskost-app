import { NextResponse } from "next/server";
import { currentUser } from "@/lib/serverAuth";
import { db } from "@/lib/db";
import { tenants, roomTenants, rooms, properties } from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const rows = await db
      .select({
        id: tenants.id,
        tenantName: tenants.name,
        phone: tenants.phone,
        email: tenants.email,
        isActive: roomTenants.isActive,
        roomId: rooms.id,
        roomNumber: rooms.roomNumber,
        startDate: roomTenants.startDate,
        endDate: roomTenants.endDate,
        floor: rooms.floor,
        propertyId: rooms.propertyId,
        propertyName: properties.name,
      })
      .from(tenants)
      .leftJoin(
        roomTenants,
        and(
          eq(tenants.id, roomTenants.tenantId),
          eq(roomTenants.isActive, true),
        ),
      )
      .leftJoin(rooms, eq(roomTenants.roomId, rooms.id))
      .leftJoin(properties, eq(rooms.propertyId, properties.id))
      .where(eq(tenants.ownerId, user.id))
      .orderBy(desc(tenants.createdAt));

    return NextResponse.json(rows);
  } catch (error) {
    console.error("[TENANTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
