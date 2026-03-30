import { db } from "@/lib/db";
import {
  rooms,
  properties,
  tenants,
  payments,
  roomTenants,
  users,
} from "@/lib/db/schema";
import { eq, count, and, gte, lt } from "drizzle-orm";
import { currentUser } from "@/lib/serverAuth";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);

  // Stats logic (from previous StatCards.tsx)
  const [{ totalProperties }] = await db
    .select({ totalProperties: count() })
    .from(properties)
    .where(and(eq(properties.ownerId, user.id), eq(properties.isActive, true)));

  const [{ totalTenants }] = await db
    .select({ totalTenants: count() })
    .from(tenants)
    .where(eq(tenants.ownerId, user.id));

  const [{ verifiedTenants }] = await db
    .select({ verifiedTenants: count() })
    .from(tenants)
    .where(and(eq(tenants.ownerId, user.id), eq(tenants.isVerified, true)));

  const allRooms = await db
    .select({ status: rooms.status })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(and(eq(properties.ownerId, user.id), eq(rooms.isActive, true)));

  const totalRooms = allRooms.length;
  const occupiedRooms = allRooms.filter((r) => r.status === "occupied").length;
  const occupancyRate =
    totalRooms > 0 ? Math.round((occupiedRooms / totalRooms) * 100) : 0;

  const revenueRows = await db
    .select({ amount: payments.amount })
    .from(payments)
    .innerJoin(roomTenants, eq(payments.roomTenantId, roomTenants.id))
    .innerJoin(rooms, eq(roomTenants.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(
      and(
        eq(properties.ownerId, user.id),
        eq(payments.status, "paid"),
        gte(payments.paidAt, startOfMonth),
        eq(rooms.isActive, true),
      ),
    );

  const totalRevenue = revenueRows.reduce(
    (sum, r) => sum + parseFloat(r.amount || "0"),
    0,
  );

  const lastMonthRows = await db
    .select({ amount: payments.amount })
    .from(payments)
    .innerJoin(roomTenants, eq(payments.roomTenantId, roomTenants.id))
    .innerJoin(rooms, eq(roomTenants.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(
      and(
        eq(properties.ownerId, user.id),
        eq(payments.status, "paid"),
        gte(payments.paidAt, startOfLastMonth),
        lt(payments.paidAt, startOfMonth),
        eq(rooms.isActive, true),
      ),
    );
  const lastMonthRevenue = lastMonthRows.reduce(
    (s, r) => s + parseFloat(r.amount || "0"),
    0,
  );
  const revenueGrowth =
    lastMonthRevenue > 0
      ? Math.round(((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
      : null;

  const verifiedPct =
    totalTenants > 0 ? Math.round((verifiedTenants / totalTenants) * 100) : 0;

  return NextResponse.json({
    totalProperties,
    totalTenants,
    verifiedPct,
    occupancyRate,
    totalRevenue,
    revenueGrowth,
  });
}
