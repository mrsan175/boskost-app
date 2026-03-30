import { db } from "@/lib/db";
import { payments, roomTenants, rooms, properties } from "@/lib/db/schema";
import { eq, and, gte, lt } from "drizzle-orm";
import { currentUser } from "@/lib/serverAuth";
import { NextResponse } from "next/server";

const MONTH_NAMES = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "Mei",
  "Jun",
  "Jul",
  "Agu",
  "Sep",
  "Okt",
  "Nov",
  "Des",
];

export async function GET() {
  const user = await currentUser();
  if (!user)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const now = new Date();

  // Last 6 months range
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return {
      label: MONTH_NAMES[d.getMonth()],
      start: new Date(d.getFullYear(), d.getMonth(), 1),
      end: new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59),
    };
  });

  const monthlyTotals = await Promise.all(
    months.map(async ({ start, end }) => {
      const rows = await db
        .select({ amount: payments.amount })
        .from(payments)
        .innerJoin(roomTenants, eq(payments.roomTenantId, roomTenants.id))
        .innerJoin(rooms, eq(roomTenants.roomId, rooms.id))
        .innerJoin(properties, eq(rooms.propertyId, properties.id))
        .where(
          and(
            eq(properties.ownerId, user.id),
            eq(payments.status, "paid"),
            gte(payments.paidAt, start),
            lt(payments.paidAt, end),
          ),
        );
      return rows.reduce((s, r) => s + parseFloat(r.amount || "0"), 0);
    }),
  );

  return NextResponse.json({
    months,
    monthlyTotals,
  });
}
