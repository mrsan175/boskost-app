import { currentUser } from "@/lib/serverAuth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { rooms, properties, users } from "@/lib/db/schema";
import { syncUserTierAndLimits } from "@/lib/actions/auth";
import { LimitManagementModal } from "@/components/dashboard/LimitManagementModal";
import { eq } from "drizzle-orm";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/");
  }

  // Ensure DB user row exists / update timestamps (serverAuth returns DB user shape)
  await db
    .insert(users)
    .values({
      id: user.id,
      username: user.username ?? null,
      email: user.email ?? "",
      name: user.name ?? "",
      imageUrl: user.imageUrl ?? null,
    })
    .onConflictDoUpdate({
      target: users.id,
      set: {
        username: user.username ?? null,
        email: user.email ?? "",
        name: user.name ?? "",
        imageUrl: user.imageUrl ?? null,
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
      .then((rows) =>
        rows.map((r) => ({ ...r.rooms, propertyName: r.properties.name })),
      );
  }

  const [userData] = await db
    .select({ subscriptionTier: users.subscriptionTier })
    .from(users)
    .where(eq(users.id, user.id));

  const isFree = !userData || userData.subscriptionTier === "FREE";
  const fullName = user.name || "Pemilik Kost";

  return (
    <div
      className="min-h-screen bg-surface"
      style={{ fontFamily: "var(--font-body)" }}
    >
      <LimitManagementModal
        open={syncResult?.actionNeeded ?? false}
        properties={allProperties}
        rooms={allRooms}
        tier={syncResult?.tier ?? "FREE"}
      />

      <DashboardSidebar isFree={isFree} />

      <div className="flex-1 flex flex-col min-w-0 transition-all duration-300 lg:ml-64">
        <DashboardTopbar
          fullName={fullName}
          tier={userData?.subscriptionTier}
          isFree={isFree}
        />

        {/* Main Content Area */}
        {/* Ensure enough top padding so fixed DashboardTopbar doesn't overlap content */}
        <main className="flex-1 p-4 sm:p-8 pt-24 lg:pt-24 md:pt-24">
          {children}
        </main>
      </div>
    </div>
  );
}
