"use server";

import { db } from "@/lib/db";
import { properties, activityLogs, users } from "@/lib/db/schema";
import { currentUser } from "@/lib/serverAuth";
import { eq, and, count } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function createProperty(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const name = (formData.get("name") as string).trim();
  const address = (formData.get("address") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;
  if (!name) throw new Error("Nama properti wajib diisi");

  // Check subscription limits
  const [userData] = await db
    .select({ subscriptionTier: users.subscriptionTier })
    .from(users)
    .where(eq(users.id, user.id));

  if (!userData || userData.subscriptionTier === "FREE") {
    const [propCount] = await db
      .select({ value: count() })
      .from(properties)
      .where(eq(properties.ownerId, user.id));

    if (propCount.value >= 1) {
      throw new Error(
        "Batas Properti Tercapai: Akun FREE hanya dapat memiliki maksimal 1 properti. Silakan upgrade ke PRO untuk menambah lebih banyak.",
      );
    }
  }

  const id = crypto.randomUUID();

  await db
    .insert(properties)
    .values({ id, ownerId: user.id, name, address, city });

  await db.insert(activityLogs).values({
    id: crypto.randomUUID(),
    ownerId: user.id,
    propertyId: id,
    type: "property_added",
    title: `Properti "${name}" ditambahkan`,
    description: [city, address].filter(Boolean).join(" • ") || null,
  });

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
}

export async function updateProperty(formData: FormData) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const propertyId = formData.get("propertyId") as string;
  const name = (formData.get("name") as string)?.trim();
  const address = (formData.get("address") as string)?.trim() || null;
  const city = (formData.get("city") as string)?.trim() || null;

  if (!name) throw new Error("Nama properti wajib diisi");

  const [existing] = await db
    .select({ id: properties.id })
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.ownerId, user.id)));

  if (!existing) throw new Error("Properti tidak ditemukan");

  await db
    .update(properties)
    .set({ name, address, city, updatedAt: new Date() })
    .where(eq(properties.id, propertyId));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath(`/dashboard/properties/${propertyId}`);
}

export async function deleteProperty(propertyId: string) {
  const user = await currentUser();
  if (!user) throw new Error("Unauthorized");

  const [existing] = await db
    .select({ id: properties.id })
    .from(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.ownerId, user.id)));

  if (!existing) throw new Error("Properti tidak ditemukan");

  await db
    .delete(properties)
    .where(and(eq(properties.id, propertyId), eq(properties.ownerId, user.id)));

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/properties");
  revalidatePath("/dashboard/rooms");
  revalidatePath("/dashboard/tenants");
  redirect("/dashboard/properties");
}
