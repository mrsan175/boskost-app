"use server";

import { db } from "@/lib/db";
import { rooms, properties, activityLogs, tenants, roomTenants, users } from "@/lib/db/schema";
import { currentUser } from "@clerk/nextjs/server";
import { eq, and, count } from "drizzle-orm";
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
  const pricePerMonth = (formData.get("pricePerMonth") as string)?.trim() || null;
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
        "Batas Kamar Tercapai: Akun FREE hanya dapat memiliki maksimal 5 kamar (total). Silakan upgrade ke PRO untuk menambah lebih banyak."
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

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${propertyId}`);
}

export async function createRoomsBulk(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const propertyId = formData.get("propertyId") as string;
  const roomNumbersRaw = (formData.get("roomNumbers") as string)?.trim();
  const floor = parseInt(formData.get("floor") as string) || 1;
  const pricePerMonth = (formData.get("pricePerMonth") as string)?.trim() || null;
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
      throw new Error(
        `Batas Kamar Tercapai: Akun FREE hanya dapat memiliki maksimal 5 kamar. Kamu mencoba menambahkan ${roomNumbers.length} kamar, tapi sisa kuotamu hanya ${5 - totalRoomCount.value}.`
      );
    }
  }

  const [prop] = await db
    .select({ name: properties.name })
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.ownerId, user.id)));
  if (!prop) throw new Error("Properti tidak ditemukan");

  // Insert all rooms
  const valuesToInsert = roomNumbers.map(nr => ({
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

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${propertyId}`);
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

  const row = await verifyRoomOwnership(roomId, user.id);

  // Deactivate any existing active room_tenants for this room
  await db
    .update(roomTenants)
    .set({ isActive: false, updatedAt: new Date() })
    .where(and(eq(roomTenants.roomId, roomId), eq(roomTenants.isActive, true)));

  // Create new tenant record
  const tenantId = crypto.randomUUID();
  await db.insert(tenants).values({
    id: tenantId,
    ownerId: user.id,
    name: tenantName,
    email: tenantEmail,
    phone: tenantPhone,
    isVerified: false,
  });

  // Create room_tenant lease record
  await db.insert(roomTenants).values({
    id: crypto.randomUUID(),
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

  // Log activity
  await db.insert(activityLogs).values({
    id: crypto.randomUUID(),
    ownerId: user.id,
    propertyId: row.propertyId,
    type: "tenant_registered",
    title: `${tenantName} menempati Kamar ${row.roomNumber}`,
    description: `Mulai: ${startDate}${endDate ? ` • Berakhir: ${endDate}` : " • Tanpa batas waktu"}`,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${row.propertyId}`);
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

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${row.propertyId}`);
}

// ─── Update Room Status (maintenance only) ──────────────────────────────────────

export async function updateRoomStatus(
  roomId: string,
  status: "available" | "maintenance"
) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const row = await verifyRoomOwnership(roomId, user.id);

  await db
    .update(rooms)
    .set({ status, updatedAt: new Date() })
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
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${row.propertyId}`);
}

// ─── Delete Room ────────────────────────────────────────────────────────────────

export async function deleteRoom(roomId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const row = await verifyRoomOwnership(roomId, user.id);

  await db.delete(rooms).where(eq(rooms.id, roomId));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${row.propertyId}`);
}
