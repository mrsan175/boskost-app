"use server";

import { db } from "@/lib/db";
import {
  rooms,
  properties,
  activityLogs,
  tenants,
  roomTenants,
  users,
  payments,
} from "@/lib/db/schema";
import { currentUser } from "@/lib/serverAuth";
import { eq, and, count, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// ─── Helper: verify room ownership ─────────────────────────────────────────────

async function verifyRoomOwnership(roomId: string, userId: string) {
  const [row] = await db
    .select({ propertyId: rooms.propertyId, roomNumber: rooms.roomNumber })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(and(eq(rooms.id, roomId), eq(properties.ownerId, userId)));
  if (!row) throw new Error("Kamar tidak ditemukan atau bukan milik kamu");
  return row;
}

// ─── Create Room ────────────────────────────────────────────────────────────────

export async function createRoom(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const propertyId = formData.get("propertyId") as string;
  const roomNumber = (formData.get("roomNumber") as string).trim();
  const floor = parseInt(formData.get("floor") as string) || 1;
  const pricePerMonth =
    (formData.get("pricePerMonth") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!roomNumber) throw new Error("Nomor kamar wajib diisi");

  // Check subscription limits
  const [userData] = await db
    .select({ subscriptionTier: users.subscriptionTier })
    .from(users)
    .where(eq(users.id, user.id));

  if (!userData || userData.subscriptionTier === "FREE") {
    // Count all rooms across all properties belonging to this user
    const [totalRoomCount] = await db
      .select({ value: count() })
      .from(rooms)
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .where(eq(properties.ownerId, user.id));

    if (totalRoomCount.value >= 5) {
      throw new Error(
        "Batas Kamar Tercapai: Akun FREE hanya dapat memiliki maksimal 5 kamar (total). Silakan upgrade ke PRO untuk menambah lebih banyak.",
      );
    }
  }

  const [prop] = await db
    .select({ name: properties.name })
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.ownerId, user.id)));
  if (!prop) throw new Error("Properti tidak ditemukan");

  await db.insert(rooms).values({
    id: crypto.randomUUID(),
    propertyId,
    roomNumber,
    floor,
    pricePerMonth,
    notes,
    status: "available",
  });

  revalidatePath("/dashboard", "layout");
}

export async function createRoomsBulk(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const propertyId = formData.get("propertyId") as string;
  const roomNumbersRaw = (formData.get("roomNumbers") as string)?.trim();
  const floor = parseInt(formData.get("floor") as string) || 1;
  const pricePerMonth =
    (formData.get("pricePerMonth") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!roomNumbersRaw) throw new Error("Nomor kamar wajib diisi");

  // Parse room numbers (comma separated or space separated)
  const roomNumbers = roomNumbersRaw.split(/[,\s]+/).filter(Boolean);
  if (roomNumbers.length === 0) throw new Error("Nomor kamar tidak valid");

  // Check subscription limits
  const [userData] = await db
    .select({ subscriptionTier: users.subscriptionTier })
    .from(users)
    .where(eq(users.id, user.id));

  if (!userData || userData.subscriptionTier === "FREE") {
    const [totalRoomCount] = await db
      .select({ value: count() })
      .from(rooms)
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .where(eq(properties.ownerId, user.id));

    if (totalRoomCount.value + roomNumbers.length > 5) {
      throw new Error("Akun FREE hanya dapat memiliki maksimal 5 kamar.");
    }
  }

  const [prop] = await db
    .select({ name: properties.name })
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.ownerId, user.id)));
  if (!prop) throw new Error("Properti tidak ditemukan");

  // Insert all rooms
  const valuesToInsert = roomNumbers.map((nr) => ({
    id: crypto.randomUUID(),
    propertyId,
    roomNumber: nr,
    floor,
    pricePerMonth,
    notes,
    status: "available" as const,
  }));

  // Batch insert
  await db.insert(rooms).values(valuesToInsert);

  revalidatePath("/dashboard", "layout");
}

// ─── Set Room Occupied (with tenant + dates) ────────────────────────────────────

export async function setRoomOccupied(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const roomId = formData.get("roomId") as string;
  const tenantName = (formData.get("tenantName") as string)?.trim();
  const tenantEmail = (formData.get("tenantEmail") as string)?.trim() || null;
  const tenantPhone = (formData.get("tenantPhone") as string)?.trim() || null;
  const startDate = formData.get("startDate") as string;
  const endDate = (formData.get("endDate") as string) || null;

  if (!tenantName) throw new Error("Nama penyewa wajib diisi");
  if (!startDate) throw new Error("Tanggal masuk wajib diisi");

  const roomDetails = await db
    .select({
      propertyId: rooms.propertyId,
      roomNumber: rooms.roomNumber,
      pricePerMonth: rooms.pricePerMonth,
    })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(and(eq(rooms.id, roomId), eq(properties.ownerId, user.id)));

  if (roomDetails.length === 0) throw new Error("Kamar tidak ditemukan");
  const row = roomDetails[0];

  // Deactivate any existing active room_tenants for this room
  await db
    .update(roomTenants)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(roomTenants.roomId, roomId), eq(roomTenants.isActive, true)));

  // Create new tenant record
  // Try to find an existing tenant to avoid duplicates. Match by email first, then phone, then exact name.
  let tenantId = null;
  if (tenantEmail) {
    const [existing] = await db
      .select()
      .from(tenants)
      .where(and(eq(tenants.ownerId, user.id), eq(tenants.email, tenantEmail)));
    if (existing) tenantId = existing.id;
  }

  if (!tenantId && tenantPhone) {
    const [existing] = await db
      .select()
      .from(tenants)
      .where(and(eq(tenants.ownerId, user.id), eq(tenants.phone, tenantPhone)));
    if (existing) tenantId = existing.id;
  }

  // As a last resort, match by exact name (may be ambiguous) to reduce obvious duplicates
  if (!tenantId && tenantName) {
    const [existing] = await db
      .select()
      .from(tenants)
      .where(and(eq(tenants.ownerId, user.id), eq(tenants.name, tenantName)));
    if (existing) tenantId = existing.id;
  }

  if (!tenantId) {
    tenantId = crypto.randomUUID();
    await db.insert(tenants).values({
      id: tenantId,
      ownerId: user.id,
      name: tenantName,
      email: tenantEmail,
      phone: tenantPhone,
      isVerified: false,
    });
  }

  // Create room_tenant lease record
  const leaseId = crypto.randomUUID();
  await db.insert(roomTenants).values({
    id: leaseId,
    roomId,
    tenantId,
    startDate,
    endDate: endDate || null,
    isActive: true,
  });

  // Update room status
  await db
    .update(rooms)
    .set({ status: "occupied", updatedAt: new Date() })
    .where(eq(rooms.id, roomId));

  // Automated Billing: Create initial bill based on duration
  if (row.pricePerMonth) {
    const price = Number(row.pricePerMonth);
    let amount = price;
    let billingNote = `Tagihan bulan pertama (${new Date(startDate).toLocaleString("id-ID", { month: "long" })})`;

    if (endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffDays = Math.ceil(
        Math.abs(end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24),
      );

      if (diffDays >= 28) {
        const months = Math.round(diffDays / 30.44);
        amount = price * Math.max(1, months);
        billingNote = `Tagihan sewa ${months} bulan (${new Date(startDate).toLocaleDateString("id-ID")} - ${new Date(endDate).toLocaleDateString("id-ID")})`;
      } else if (diffDays > 0) {
        amount = Math.round((price / 30) * diffDays);
        billingNote = `Tagihan sewa harian (${diffDays} hari: ${new Date(startDate).toLocaleDateString("id-ID")} - ${new Date(endDate).toLocaleDateString("id-ID")})`;
      }
    }

    await db.insert(payments).values({
      id: crypto.randomUUID(),
      roomTenantId: leaseId,
      amount: amount.toString(),
      dueDate: startDate,
      status: "pending",
      notes: billingNote,
    });
  }

  // Log activity
  await db.insert(activityLogs).values({
    id: crypto.randomUUID(),
    ownerId: user.id,
    propertyId: row.propertyId,
    type: "tenant_registered",
    title: `${tenantName} menempati Kamar ${row.roomNumber}`,
    description: `Mulai: ${startDate}${endDate ? ` • Berakhir: ${endDate}` : " • Tanpa batas waktu"}`,
  });

  revalidatePath("/dashboard", "layout");
}

// ─── Vacate Room ────────────────────────────────────────────────────────────────

export async function vacateRoom(roomId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const row = await verifyRoomOwnership(roomId, user.id);
  const today = new Date().toISOString().split("T")[0];

  // Close active lease
  await db
    .update(roomTenants)
    .set({ isActive: false, endDate: today, updatedAt: new Date() })
    .where(and(eq(roomTenants.roomId, roomId), eq(roomTenants.isActive, true)));

  // Set room available
  await db
    .update(rooms)
    .set({ status: "available", updatedAt: new Date() })
    .where(eq(rooms.id, roomId));

  await db.insert(activityLogs).values({
    id: crypto.randomUUID(),
    ownerId: user.id,
    propertyId: row.propertyId,
    type: "room_vacated",
    title: `Kamar ${row.roomNumber} dikosongkan`,
    description: "Masa sewa selesai, kamar kembali tersedia",
  });

  revalidatePath("/dashboard", "layout");
}

// ─── Update Room Status (maintenance only) ──────────────────────────────────────

export async function updateRoomStatus(
  roomId: string,
  status: "available" | "maintenance",
) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const row = await verifyRoomOwnership(roomId, user.id);

  let targetStatus: "available" | "maintenance" | "occupied" = status;

  // If marking as available (e.g. finishing maintenance),
  // check if there's an active tenant. If so, it should be 'occupied'.
  if (status === "available") {
    const [activeLease] = await db
      .select({ id: roomTenants.id })
      .from(roomTenants)
      .where(
        and(eq(roomTenants.roomId, roomId), eq(roomTenants.isActive, true)),
      );

    if (activeLease) {
      targetStatus = "occupied";
    }
  }

  await db
    .update(rooms)
    .set({ status: targetStatus, updatedAt: new Date() })
    .where(eq(rooms.id, roomId));

  if (status === "maintenance") {
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      ownerId: user.id,
      propertyId: row.propertyId,
      type: "maintenance_request",
      title: `Kamar ${row.roomNumber} masuk perbaikan`,
      description: "Status kamar diubah menjadi Maintenance",
    });
  } else if (status === "available" && targetStatus === "occupied") {
    // Log that maintenance finished but room is still occupied
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      ownerId: user.id,
      propertyId: row.propertyId,
      type: "room_vacated", // Using a general type or could create a new one
      title: `Kamar ${row.roomNumber} selesai perbaikan`,
      description:
        "Perbaikan selesai, kamar kembali berstatus Terisi (ada penghuni)",
    });
  } else if (status === "available") {
    await db.insert(activityLogs).values({
      id: crypto.randomUUID(),
      ownerId: user.id,
      propertyId: row.propertyId,
      type: "room_vacated",
      title: `Kamar ${row.roomNumber} selesai perbaikan`,
      description: "Perbaikan selesai, kamar kini tersedia untuk penyewa baru",
    });
  }

  revalidatePath("/dashboard", "layout");
}

// ─── Delete Room ────────────────────────────────────────────────────────────────

export async function updateRoom(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const roomId = formData.get("roomId") as string;
  const roomNumber = (formData.get("roomNumber") as string)?.trim();
  const floor = parseInt(formData.get("floor") as string) || 1;
  const pricePerMonth =
    (formData.get("pricePerMonth") as string)?.trim() || null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  if (!roomId) throw new Error("ID Kamar tidak ditemukan");
  if (!roomNumber) throw new Error("Nomor kamar wajib diisi");

  await verifyRoomOwnership(roomId, user.id);

  await db
    .update(rooms)
    .set({
      roomNumber,
      floor,
      pricePerMonth,
      notes,
      updatedAt: new Date(),
    })
    .where(eq(rooms.id, roomId));

  revalidatePath("/dashboard", "layout");
}

export async function deleteRoom(roomId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const row = await verifyRoomOwnership(roomId, user.id);

  await db.delete(rooms).where(eq(rooms.id, roomId));

  revalidatePath("/dashboard", "layout");
}

export async function moveTenant(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const oldRoomId = formData.get("oldRoomId") as string;
  const newRoomId = formData.get("newRoomId") as string;

  if (!oldRoomId || !newRoomId) throw new Error("ID Kamar tidak valid");
  if (oldRoomId === newRoomId) throw new Error("Kamar tujuan harus berbeda");

  // Verify ownership of both rooms
  const oldRow = await verifyRoomOwnership(oldRoomId, user.id);
  const newRow = await verifyRoomOwnership(newRoomId, user.id);

  // Check if new room is available
  const [newRoomStatus] = await db
    .select({ status: rooms.status, isActive: rooms.isActive })
    .from(rooms)
    .where(eq(rooms.id, newRoomId));

  if (
    !newRoomStatus ||
    newRoomStatus.status !== "available" ||
    !newRoomStatus.isActive
  ) {
    throw new Error("Kamar tujuan tidak tersedia atau dalam perbaikan");
  }

  // Get active lease from old room
  const [activeLease] = await db
    .select({ id: roomTenants.id, tenantId: roomTenants.tenantId })
    .from(roomTenants)
    .where(
      and(eq(roomTenants.roomId, oldRoomId), eq(roomTenants.isActive, true)),
    );

  if (!activeLease) throw new Error("Tidak ada penghuni aktif di kamar ini");

  // Get tenant name for logging
  const [tenant] = await db
    .select({ name: tenants.name })
    .from(tenants)
    .where(eq(tenants.id, activeLease.tenantId));

  // Perform move
  await db.transaction(async (tx) => {
    // 1. Update lease record
    await tx
      .update(roomTenants)
      .set({ roomId: newRoomId, updatedAt: new Date() })
      .where(eq(roomTenants.id, activeLease.id));

    // 2. Set old room to available
    await tx
      .update(rooms)
      .set({ status: "available", updatedAt: new Date() })
      .where(eq(rooms.id, oldRoomId));

    // 3. Set new room to occupied
    await tx
      .update(rooms)
      .set({ status: "occupied", updatedAt: new Date() })
      .where(eq(rooms.id, newRoomId));

    // 4. Log activity
    await tx.insert(activityLogs).values({
      id: crypto.randomUUID(),
      ownerId: user.id,
      propertyId: oldRow.propertyId,
      type: "other",
      title: "Penghuni Dipindahkan",
      description: `${tenant?.name || "Penghuni"} pindah dari Kamar ${oldRow.roomNumber} ke Kamar ${newRow.roomNumber}`,
    });
  });

  revalidatePath("/dashboard", "layout");
}
