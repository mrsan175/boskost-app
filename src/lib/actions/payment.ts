"use server";

import { db } from "@/lib/db";
import { payments, rooms, roomTenants, tenants, properties, activityLogs } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getPayments() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  return await db
    .select({
      id: payments.id,
      amount: payments.amount,
      dueDate: payments.dueDate,
      paidAt: payments.paidAt,
      status: payments.status,
      tenantName: tenants.name,
      tenantPhone: tenants.phone,
      tenantEmail: tenants.email,
      roomNumber: rooms.roomNumber,
      propertyName: properties.name,
      roomTenantId: payments.roomTenantId,
    })
    .from(payments)
    .innerJoin(roomTenants, eq(payments.roomTenantId, roomTenants.id))
    .innerJoin(tenants, eq(roomTenants.tenantId, tenants.id))
    .innerJoin(rooms, eq(roomTenants.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(eq(tenants.ownerId, user.id))
    .orderBy(desc(payments.createdAt));
}

export async function markPaymentAsPaid(paymentId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const [payment] = await db
    .select({ 
      id: payments.id, 
      amount: payments.amount,
      roomNumber: rooms.roomNumber,
      propertyName: properties.name,
      propertyId: properties.id
    })
    .from(payments)
    .innerJoin(roomTenants, eq(payments.roomTenantId, roomTenants.id))
    .innerJoin(tenants, eq(roomTenants.tenantId, tenants.id))
    .innerJoin(rooms, eq(roomTenants.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(and(eq(payments.id, paymentId), eq(tenants.ownerId, user.id)));

  if (!payment) throw new Error("Pembayaran tidak ditemukan");

  await db
    .update(payments)
    .set({ 
      status: "paid", 
      paidAt: new Date(),
    })
    .where(eq(payments.id, paymentId));

  // Log activity
  await db.insert(activityLogs).values({
    id: crypto.randomUUID(),
    ownerId: user.id,
    propertyId: payment.propertyId,
    type: "payment_received",
    title: `Pembayaran Diterima`,
    description: `Pembayaran sebesar Rp ${Number(payment.amount).toLocaleString("id-ID")} untuk Kamar ${payment.roomNumber} (${payment.propertyName}) telah diterima.`,
  });

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/payments");
}

export async function deletePayment(paymentId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Verify ownership via joins
  const [payment] = await db
    .select({ id: payments.id })
    .from(payments)
    .innerJoin(roomTenants, eq(payments.roomTenantId, roomTenants.id))
    .innerJoin(tenants, eq(roomTenants.tenantId, tenants.id))
    .where(and(eq(payments.id, paymentId), eq(tenants.ownerId, user.id)));

  if (!payment) throw new Error("Pembayaran tidak ditemukan");

  await db.delete(payments).where(eq(payments.id, paymentId));
  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/payments");
}

/**
 * Automated Billing:
 * For each active tenant, check if they have a payment for the current month.
 * If not, generate a pending payment.
 */
export async function generateMonthlyInvoices() {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  // Get all active leases for this owner
  const activeLeases = await db
    .select({
      leaseId: roomTenants.id,
      roomId: rooms.id,
      price: rooms.pricePerMonth,
      tenantName: tenants.name,
      roomNumber: rooms.roomNumber,
    })
    .from(roomTenants)
    .innerJoin(rooms, eq(roomTenants.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .innerJoin(tenants, eq(roomTenants.tenantId, tenants.id))
    .where(and(
      eq(properties.ownerId, user.id),
      eq(roomTenants.isActive, true)
    ));

  let generatedCount = 0;
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  for (const lease of activeLeases) {
    if (!lease.price) continue;

    // Check if a payment exists for THIS MONTH or if there's a payment with a long duration that covers this month
    const [existing] = await db
      .select({ id: payments.id, notes: payments.notes })
      .from(payments)
      .where(and(
        eq(payments.roomTenantId, lease.leaseId),
        sql`
          (EXTRACT(MONTH FROM ${payments.dueDate}) = ${currentMonth + 1} 
           AND EXTRACT(YEAR FROM ${payments.dueDate}) = ${currentYear})
          OR
          (${payments.notes} LIKE '%sewa%' AND ${payments.notes} LIKE '%bulan%' 
           AND ${payments.createdAt} > NOW() - INTERVAL '3 months')
        `
      ));

    // For simplicity: if the lease has an endDate far in the future, 
    // and we already have a payment from THIS lease, we might want to skip if it was a bulk payment.
    if (!existing) {
      // Create new bill
      const dueDate = new Date(currentYear, currentMonth, 5); // Default due on 5th of the month
      
      await db.insert(payments).values({
        id: crypto.randomUUID(),
        roomTenantId: lease.leaseId,
        amount: lease.price,
        dueDate: dueDate.toISOString().split("T")[0],
        status: "pending",
        notes: `Tagihan otomatis bulan ${now.toLocaleString("id-ID", { month: "long", year: "numeric" })}`,
      });
      generatedCount++;
    }
  }

  revalidatePath("/dashboard", "layout");
  revalidatePath("/dashboard/payments");
  return { success: true, count: generatedCount };
}
