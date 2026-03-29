import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import { rooms, properties, roomTenants, tenants, users } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import { RoomCard } from "@/components/dashboard/RoomCard";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building01Icon,
  Door01Icon,
  FilterIcon,
} from "@hugeicons/core-free-icons";
import { RoomsFilterBar } from "@/components/dashboard/RoomsFilterBar";
import { AddRoomDialog } from "@/components/dashboard/AddRoomDialog";


type RoomStatus = "available" | "occupied" | "maintenance";

const statusConfig: Record<RoomStatus, { label: string; color: string; bg: string }> = {
  available:   { label: "Tersedia",  color: "#22c55e",          bg: "rgba(34,197,94,0.1)"   },
  occupied:    { label: "Terisi",    color: "#C2410C",          bg: "rgba(194,65,12,0.1)"   },
  maintenance: { label: "Perbaikan", color: "#f97316",          bg: "rgba(249,115,22,0.1)"  },
};

export default async function RoomsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; propertyId?: string }>;
}) {
  const { status: filterStatus, propertyId: filterProperty } = await searchParams;

  const user = await currentUser();
  if (!user) redirect("/");

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  // Subscription check
  const [userData] = await db
    .select({ subscriptionTier: users.subscriptionTier })
    .from(users)
    .where(eq(users.id, user.id));

  const isFree = !userData || userData.subscriptionTier === "FREE";

  // Fetch all properties for filter bar
  const propertyList = await db
    .select({ id: properties.id, name: properties.name })
    .from(properties)
    .where(and(eq(properties.ownerId, user.id), eq(properties.isActive, true)));

  // Fetch all rooms (with optional filters via drizzle conditions)
  const allRooms = await db
    .select({
      id: rooms.id,
      roomNumber: rooms.roomNumber,
      floor: rooms.floor,
      status: rooms.status,
      pricePerMonth: rooms.pricePerMonth,
      notes: rooms.notes,
      propertyId: rooms.propertyId,
      isActive: rooms.isActive,
      propertyName: properties.name,
    })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(and(eq(properties.ownerId, user.id), eq(properties.isActive, true)))
    .orderBy(properties.name, rooms.floor, rooms.roomNumber);

  // Client-side filtering based on searchParams
  const filtered = allRooms.filter((r) => {
    if (filterStatus && r.status !== filterStatus) return false;
    if (filterProperty && r.propertyId !== filterProperty) return false;
    return true;
  });

  // Fetch active leases for occupied rooms
  const leaseRows = await db
    .select({
      roomId: roomTenants.roomId,
      tenantName: tenants.name,
      startDate: roomTenants.startDate,
      endDate: roomTenants.endDate,
    })
    .from(roomTenants)
    .innerJoin(tenants, eq(roomTenants.tenantId, tenants.id))
    .innerJoin(rooms, eq(roomTenants.roomId, rooms.id))
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(and(eq(properties.ownerId, user.id), eq(roomTenants.isActive, true)));

  const leaseByRoom = Object.fromEntries(leaseRows.map((l) => [l.roomId, l]));

  // Stats
  const total       = allRooms.length;
  const available   = allRooms.filter((r) => r.status === "available").length;
  const occupied    = allRooms.filter((r) => r.status === "occupied").length;
  const maintenance = allRooms.filter((r) => r.status === "maintenance").length;

  // Group filtered rooms by property
  const grouped: Record<string, { propertyId: string; propertyName: string; roomList: typeof filtered }> = {};
  for (const r of filtered) {
    if (!grouped[r.propertyId]) {
      grouped[r.propertyId] = { propertyId: r.propertyId, propertyName: r.propertyName, roomList: [] };
    }
    grouped[r.propertyId].roomList.push(r);
  }
  const groups = Object.values(grouped);

  return (
    <div style={{ background: "var(--surface)", fontFamily: "var(--font-body)" }}>
      <DashboardSidebar isFree={isFree} />
      <DashboardTopbar fullName={fullName} tier={userData?.subscriptionTier} />

      <main className="min-h-screen p-4 sm:p-8 lg:ml-64 pt-24 lg:pt-[88px] transition-all duration-300">
        {/* Header */}
        <header className="mb-8 lg:mb-10">
          <h2
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: "var(--on-surface)", fontFamily: "var(--font-display)" }}
          >
            Semua Kamar
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--on-surface-variant)" }}>
            {total} kamar di {propertyList.length} properti
          </p>
        </header>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Kamar",  value: total,       color: "var(--on-surface)" },
            { label: "Tersedia",     value: available,   color: "#22c55e"           },
            { label: "Terisi",       value: occupied,    color: "var(--primary)"    },
            { label: "Perbaikan",    value: maintenance, color: "#f97316"           },
          ].map((s) => (
            <Card key={s.label} className="border text-center" style={{ borderColor: "var(--outline-variant)" }}>
              <CardContent className="pt-4 pb-3">
                <p
                  className="text-3xl font-extrabold"
                  style={{ color: s.color, fontFamily: "var(--font-display)" }}
                >
                  {s.value}
                </p>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: "var(--on-surface-variant)" }}>
                  {s.label}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Filter bar (client component) */}
        <div className="mb-6">
          <RoomsFilterBar
            properties={propertyList}
            activeStatus={filterStatus}
            activeProperty={filterProperty}
          />
        </div>

        {/* Empty state */}
        {total === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-3xl"
              style={{ background: "rgba(194,65,12,0.08)" }}
            >
              <HugeiconsIcon icon={Door01Icon} size={40} style={{ color: "var(--primary)", opacity: 0.4 }} />
            </div>
            <p className="text-xl font-bold" style={{ color: "var(--on-surface)" }}>
              Belum ada kamar
            </p>
            <p className="text-sm max-w-xs" style={{ color: "var(--on-surface-variant)" }}>
              Tambahkan kamar melalui halaman{" "}
              <Link href="/dashboard/properties" className="underline" style={{ color: "var(--primary)" }}>
                Properti
              </Link>.
            </p>
          </div>
        )}

        {/* No filter results */}
        {total > 0 && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center">
            <HugeiconsIcon icon={FilterIcon} size={32} style={{ color: "var(--on-surface-variant)", opacity: 0.4 }} />
            <p className="text-sm font-bold" style={{ color: "var(--on-surface-variant)" }}>
              Tidak ada kamar yang cocok dengan filter ini
            </p>
          </div>
        )}

        {/* Grouped room grids */}
        <div className="space-y-6">
          {groups.map((group) => {
            const gTotal   = group.roomList.length;
            const gOccupied    = group.roomList.filter((r) => r.status === "occupied").length;
            const gAvailable   = group.roomList.filter((r) => r.status === "available").length;
            const gMaintenance = group.roomList.filter((r) => r.status === "maintenance").length;

            return (
              <Card key={group.propertyId} className="border rounded-3xl overflow-hidden" style={{ borderColor: "var(--outline-variant)" }}>
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-10 w-10 items-center justify-center rounded-xl text-xl"
                        style={{ background: "rgba(194,65,12,0.08)" }}
                      >
                        🏠
                      </div>
                      <div>
                        <CardTitle className="text-base" style={{ fontFamily: "var(--font-display)" }}>
                          {group.propertyName}
                        </CardTitle>
                        <CardDescription className="text-xs">
                          {gTotal} kamar
                        </CardDescription>
                      </div>
                    </div>
                    {/* Actions & Mini badges */}
                    <div className="flex items-center gap-3">
                      <div className="hidden sm:flex gap-1.5 flex-wrap justify-end">
                        {gAvailable > 0 && (
                          <Badge className="text-[10px]" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                            {gAvailable} Tersedia
                          </Badge>
                        )}
                        {gOccupied > 0 && (
                          <Badge className="text-[10px]" style={{ background: "rgba(194,65,12,0.1)", color: "var(--primary)" }}>
                            {gOccupied} Terisi
                          </Badge>
                        )}
                      </div>
                      <AddRoomDialog propertyId={group.propertyId} limitReached={isFree && total >= 5} />
                    </div>
                  </div>

                  {/* Occupancy bar */}
                  {gTotal > 0 && (
                    <div className="mt-3 flex h-2 w-full overflow-hidden rounded-full gap-px">
                      {gOccupied > 0 && (
                        <div style={{ width: `${(gOccupied / gTotal) * 100}%`, background: "#C2410C" }} />
                      )}
                      {gAvailable > 0 && (
                        <div style={{ width: `${(gAvailable / gTotal) * 100}%`, background: "#22c55e" }} />
                      )}
                      {gMaintenance > 0 && (
                        <div style={{ width: `${(gMaintenance / gTotal) * 100}%`, background: "#f97316" }} />
                      )}
                    </div>
                  )}
                </CardHeader>

                <Separator style={{ background: "var(--outline-variant)" }} />

                <CardContent className="pt-5">
                  <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                    {group.roomList.map((room) => {
                      const lease = leaseByRoom[room.id];
                      return (
                        <RoomCard
                          key={room.id}
                          room={{
                            id: room.id,
                            roomNumber: room.roomNumber,
                            floor: room.floor,
                            status: room.status as RoomStatus,
                            pricePerMonth: room.pricePerMonth,
                            notes: room.notes,
                            tenantName: lease?.tenantName ?? null,
                            startDate: lease?.startDate ?? null,
                            endDate: lease?.endDate ?? null,
                            isActive: room.isActive,
                          }}
                        />
                      );
                    })}
                  </div>

                  {/* Link to property detail */}
                  <div className="mt-4 flex justify-end">
                    <Link
                      href={`/dashboard/properties/${group.propertyId}`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold hover:underline"
                      style={{ color: "var(--primary)" }}
                    >
                      <HugeiconsIcon icon={Building01Icon} size={13} />
                      Kelola properti ini
                    </Link>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Legend */}
        {total > 0 && (
          <div className="mt-8 flex items-center gap-5">
            {(["available", "occupied", "maintenance"] as RoomStatus[]).map((s) => (
              <div key={s} className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded-sm" style={{ background: statusConfig[s].color }} />
                <span className="text-xs font-bold" style={{ color: "var(--on-surface-variant)" }}>
                  {statusConfig[s].label}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="h-12" />
      </main>
    </div>
  );
}
