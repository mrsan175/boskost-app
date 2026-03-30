"use server";

import { db } from "@/lib/db";
import { users, properties, rooms } from "@/lib/db/schema";
import { currentUser } from "@/lib/serverAuth";
import { eq, and, count, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type SyncResult = {
  tier: "FREE" | "PRO" | "ENTERPRISE";
  actionNeeded: boolean;
  propertyExceeded: boolean;
  roomExceeded: boolean;
};

export async function syncUserTierAndLimits(): Promise<SyncResult | null> {
  const clerkUser = await currentUser();
  if (!clerkUser) return null;

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, clerkUser.id));

  if (!dbUser) return null;

  const tier = dbUser.subscriptionTier;

  // If PRO/ENTERPRISE, ensure everything is active
  if (tier !== "FREE") {
    await db
      .update(properties)
      .set({ isActive: true })
      .where(eq(properties.ownerId, dbUser.id));

    const allUserRooms = await db
      .select({ id: rooms.id })
      .from(rooms)
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .where(eq(properties.ownerId, dbUser.id));

    if (allUserRooms.length > 0) {
      await db
        .update(rooms)
        .set({ isActive: true })
        .where(
          inArray(
            rooms.id,
            allUserRooms.map((r) => r.id),
          ),
        );
    }

    return {
      tier,
      actionNeeded: false,
      propertyExceeded: false,
      roomExceeded: false,
    };
  }

  // FREE tier: Check active counts
  const [activePropCount] = await db
    .select({ value: count() })
    .from(properties)
    .where(
      and(eq(properties.ownerId, dbUser.id), eq(properties.isActive, true)),
    );

  const [activeRoomCount] = await db
    .select({ value: count() })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(
      and(
        eq(properties.ownerId, dbUser.id),
        eq(rooms.isActive, true),
        eq(properties.isActive, true),
      ),
    );

  const propertyExceeded = activePropCount.value > 1;
  const roomExceeded = activeRoomCount.value > 5;
  const actionNeeded = propertyExceeded || roomExceeded;

  return {
    tier,
    actionNeeded,
    propertyExceeded,
    roomExceeded,
  };
}

export async function togglePropertyActivation(
  propertyId: string,
  activate: boolean,
) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, clerkUser.id));
  if (!dbUser) throw new Error("User not found");

  if (activate && dbUser.subscriptionTier === "FREE") {
    // Check if another property is already active
    const [activeCount] = await db
      .select({ value: count() })
      .from(properties)
      .where(
        and(eq(properties.ownerId, dbUser.id), eq(properties.isActive, true)),
      );

    if (activeCount.value >= 1) {
      throw new Error("Kapasitas properti akun FREE sudah penuh (Maksimal 1).");
    }
  }

  await db
    .update(properties)
    .set({ isActive: activate })
    .where(
      and(eq(properties.id, propertyId), eq(properties.ownerId, dbUser.id)),
    );

  revalidatePath("/dashboard");
}

export async function toggleRoomActivation(roomId: string, activate: boolean) {
  const clerkUser = await currentUser();
  if (!clerkUser) throw new Error("Unauthorized");

  const [dbUser] = await db
    .select()
    .from(users)
    .where(eq(users.id, clerkUser.id));
  if (!dbUser) throw new Error("User not found");

  if (activate && dbUser.subscriptionTier === "FREE") {
    // Check total active rooms
    const [activeCount] = await db
      .select({ value: count() })
      .from(rooms)
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .where(
        and(
          eq(properties.ownerId, dbUser.id),
          eq(rooms.isActive, true),
          eq(properties.isActive, true),
        ),
      );

    if (activeCount.value >= 5) {
      throw new Error("Kapasitas kamar akun FREE sudah penuh (Maksimal 5).");
    }
  }

  await db
    .update(rooms)
    .set({ isActive: activate })
    .where(eq(rooms.id, roomId));

  revalidatePath("/dashboard");
}
