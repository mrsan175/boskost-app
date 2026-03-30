import { currentUser } from "@/lib/serverAuth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { properties, rooms, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { PropertiesView } from "@/components/dashboard/PropertiesView";

export default async function PropertiesPage() {
  const user = await currentUser();
  if (!user) redirect("/");

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

  // Aggregate room counts per property (Initial Data)
  const initialProperties = await Promise.all(
    propertyList.map(async (prop) => {
      const roomRows = await db
        .select({ status: rooms.status })
        .from(rooms)
        .where(eq(rooms.propertyId, prop.id));

      const total = roomRows.length;
      const occupied = roomRows.filter((r) => r.status === "occupied").length;
      const available = roomRows.filter((r) => r.status === "available").length;
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

  // Subscription verification
  const [userData] = await db
    .select({ subscriptionTier: users.subscriptionTier })
    .from(users)
    .where(eq(users.id, user.id));

  const isFree = !userData || userData.subscriptionTier === "FREE";

  return (
    <PropertiesView initialProperties={initialProperties} isFree={isFree} />
  );
}
