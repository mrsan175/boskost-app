"use server";

import { db } from "@/lib/db";
import { tenants, roomTenants, rooms, properties, activityLogs } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ─── Update Tenant Info ─────────────────────────────────────────────────────────

export async function updateTenant(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const tenantId = formData.get("tenantId") as string;
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim() || null;
  const phone = (formData.get("phone") as string)?.trim() || null;

  const startDate = formData.get("startDate") as string;
  const endDate = (formData.get("endDate") as string) || null;

  if (!name) throw new Error("Nama penyewa wajib diisi");

  // Verify ownership
  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(and(eq(tenants.id, tenantId), eq(tenants.ownerId, user.id)));
  if (!tenant) throw new Error("Penyewa tidak ditemukan");

  await db
    .update(tenants)
    .set({ name, email, phone, updatedAt: new Date() })
    .where(eq(tenants.id, tenantId));

  // Update active lease dates if provided
  if (startDate) {
    await db
      .update(roomTenants)
      .set({ startDate, endDate, updatedAt: new Date() })
      .where(and(eq(roomTenants.tenantId, tenantId), eq(roomTenants.isActive, true)));
  }

  revalidatePath("/dashboard", "layout");
}

// ─── Move Tenant to Another Room ───────────────────────────────────────────────

export async function moveTenantToRoom(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const tenantId = formData.get("tenantId") as string;
  const newRoomId = formData.get("newRoomId") as string;
  const startDate = formData.get("startDate") as string;
  const endDate = (formData.get("endDate") as string) || null;

  if (!newRoomId) throw new Error("Pilih kamar tujuan");
  if (!startDate) throw new Error("Tanggal masuk wajib diisi");

  // Verify tenant ownership
  const [tenant] = await db
    .select({ id: tenants.id, name: tenants.name })
    .from(tenants)
    .where(and(eq(tenants.id, tenantId), eq(tenants.ownerId, user.id)));
  if (!tenant) throw new Error("Penyewa tidak ditemukan");

  // Verify new room belongs to user
  const [newRoom] = await db
    .select({ id: rooms.id, roomNumber: rooms.roomNumber, propertyId: rooms.propertyId })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(and(eq(rooms.id, newRoomId), eq(properties.ownerId, user.id)));
  if (!newRoom) throw new Error("Kamar tidak ditemukan");

  // Close current active lease + set old room available
  const [oldLease] = await db
    .select({ roomId: roomTenants.roomId })
    .from(roomTenants)
    .where(and(eq(roomTenants.tenantId, tenantId), eq(roomTenants.isActive, true)));

  if (oldLease) {
    await db
      .update(roomTenants)
      .set({ isActive: false, endDate: new Date().toISOString().split("T")[0], updatedAt: new Date() })
      .where(and(eq(roomTenants.tenantId, tenantId), eq(roomTenants.isActive, true)));

    // Set old room back to available
    await db
      .update(rooms)
      .set({ status: "available", updatedAt: new Date() })
      .where(eq(rooms.id, oldLease.roomId));
  }

  // Deactivate any other active lease for the new room
  await db
    .update(roomTenants)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(roomTenants.roomId, newRoomId), eq(roomTenants.isActive, true)));

  // Create new lease
  await db.insert(roomTenants).values({
    id: crypto.randomUUID(),
    roomId: newRoomId,
    tenantId,
    startDate,
    endDate,
    isActive: true,
  });

  // Set new room to occupied
  await db
    .update(rooms)
    .set({ status: "occupied", updatedAt: new Date() })
    .where(eq(rooms.id, newRoomId));

  // Log activity
  await db.insert(activityLogs).values({
    id: crypto.randomUUID(),
    ownerId: user.id,
    propertyId: newRoom.propertyId,
    type: "tenant_registered",
    title: `${tenant.name} pindah ke Kamar ${newRoom.roomNumber}`,
    description: `Mulai: ${startDate}${endDate ? ` • Berakhir: ${endDate}` : ""}`,
  });

  revalidatePath("/dashboard", "layout");
}

// ─── Delete Tenant ──────────────────────────────────────────────────────────────

export async function deleteTenant(tenantId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const [tenant] = await db
    .select({ id: tenants.id })
    .from(tenants)
    .where(and(eq(tenants.id, tenantId), eq(tenants.ownerId, user.id)));
  if (!tenant) throw new Error("Penyewa tidak ditemukan");

  // Set rooms linked to this tenant back to available
  const activeLeases = await db
    .select({ roomId: roomTenants.roomId })
    .from(roomTenants)
    .where(and(eq(roomTenants.tenantId, tenantId), eq(roomTenants.isActive, true)));

  for (const lease of activeLeases) {
    await db
      .update(rooms)
      .set({ status: "available", updatedAt: new Date() })
      .where(eq(rooms.id, lease.roomId));
  }

  // Delete tenant (cascades to room_tenants)
  await db.delete(tenants).where(eq(tenants.id, tenantId));

  revalidatePath("/dashboard", "layout");
}
