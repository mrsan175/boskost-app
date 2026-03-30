import { NextResponse } from "next/server";
import { currentUser } from "@/lib/serverAuth";
import { db } from "@/lib/db";
import { properties, rooms } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";

export async function GET() {
  try {
    const user = await currentUser();
    if (!user) return new NextResponse("Unauthorized", { status: 401 });

    const propertyList = await db
      .select({
        id: properties.id,
        name: properties.name,
        address: properties.address,
        city: properties.city,
        isActive: properties.isActive,
        createdAt: properties.createdAt,
      })
      .from(properties)
      .where(eq(properties.ownerId, user.id))
      .orderBy(desc(properties.createdAt));

    // Aggregate room data
    const propertyData = await Promise.all(
      propertyList.map(async (prop) => {
        const roomRows = await db
          .select({ status: rooms.status })
          .from(rooms)
          .where(eq(rooms.propertyId, prop.id));

        const total = roomRows.length;
        const occupied = roomRows.filter((r) => r.status === "occupied").length;
        const available = roomRows.filter(
          (r) => r.status === "available",
        ).length;
        const maintenance = roomRows.filter(
          (r) => r.status === "maintenance",
        ).length;
        const occupancyRate =
          total > 0 ? Math.round((occupied / total) * 100) : 0;
        return {
          ...prop,
          total,
          occupied,
          available,
          maintenance,
          occupancyRate,
        };
      }),
    );

    return NextResponse.json(propertyData);
  } catch (error) {
    console.error("[PROPERTIES_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
