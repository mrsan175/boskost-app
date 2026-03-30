import { db } from "@/lib/db";
import { rooms, properties } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { currentUser } from "@/lib/serverAuth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const propertyList = await db
    .select({
      id: properties.id,
      name: properties.name,
      address: properties.address,
    })
    .from(properties)
    .where(and(eq(properties.ownerId, user.id), eq(properties.isActive, true)));

  const propertyData = await Promise.all(
    propertyList.map(async (prop) => {
      const roomRows = await db
        .select({ status: rooms.status })
        .from(rooms)
        .where(and(eq(rooms.propertyId, prop.id), eq(rooms.isActive, true)));

      const total = roomRows.length;
      const occupied = roomRows.filter((r) => r.status === "occupied").length;
      const maintenance = roomRows.filter(
        (r) => r.status === "maintenance",
      ).length;
      const occupancyRate =
        total > 0 ? Math.round((occupied / total) * 100) : 0;

      return {
        ...prop,
        total,
        occupancyRate,
        status:
          maintenance > 0
            ? "Perlu Perbaikan"
            : occupied === total && total > 0
              ? "Penuh"
              : "Normal",
        statusColor:
          maintenance > 0
            ? "#f97316"
            : occupied === total && total > 0
              ? "var(--primary)"
              : "#22c55e",
        pulse: occupied === total && total > 0,
      };
    }),
  );

  return NextResponse.json(propertyData);
}
