import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { rooms, properties, users } from "@/lib/db/schema";
import { syncUserTierAndLimits } from "@/lib/actions/auth";
import { LimitManagementModal } from "@/components/dashboard/LimitManagementModal";
import { eq } from "drizzle-orm";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  // Sync user data to database on dashboard load (no webhooks needed)
  await db
    .insert(users)
    .values({
      id: user.id,
      username: user.username,
      email: user.emailAddresses[0]?.emailAddress ?? "",
      name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
      imageUrl: user.imageUrl,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        username: user.username,
        email: user.emailAddresses[0]?.emailAddress ?? "",
        name: `${user.firstName || ""} ${user.lastName || ""}`.trim(),
        imageUrl: user.imageUrl,
        updatedAt: new Date(),
      },
    });

  // Sync property and room limits based on current tier
  const syncResult = await syncUserTierAndLimits();

  // If action is needed, fetch all data for the modal
  let allProperties: any[] = [];
  let allRooms: any[] = [];
  if (syncResult?.actionNeeded) {
    allProperties = await db
      .select()
      .from(properties)
      .where(eq(properties.ownerId, user.id));
    
    allRooms = await db
      .select()
      .from(rooms)
      .innerJoin(properties, eq(rooms.propertyId, properties.id))
      .where(eq(properties.ownerId, user.id))
      .then(rows => rows.map(r => ({ ...r.rooms, propertyName: r.properties.name })));
  }

  return (
    <>
      <LimitManagementModal 
        open={syncResult?.actionNeeded ?? false} 
        properties={allProperties}
        rooms={allRooms}
        tier={syncResult?.tier ?? "FREE"}
      />
      {children}
    </>
  );
}
