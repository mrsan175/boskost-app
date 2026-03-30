import { currentUser } from "@/lib/serverAuth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/db";
import {
  properties,
  rooms,
  roomTenants,
  tenants,
  users,
} from "@/lib/db/schema";
import { eq, and, count } from "drizzle-orm";
import { AddRoomDialog } from "@/components/dashboard/AddRoomDialog";
import { PropertyCardActions } from "@/components/dashboard/PropertyCardActions";
import { RoomCard } from "@/components/dashboard/RoomCard";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  ArrowLeft01Icon,
  Building01Icon,
  Location01Icon,
  BedIcon,
} from "@hugeicons/core-free-icons";

type RoomStatus = "available" | "occupied" | "maintenance";

const statusConfig: Record<
  RoomStatus,
  { label: string; color: string; bg: string }
> = {
  available: {
    label: "Tersedia",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.12)",
  },
  occupied: { label: "Terisi", color: "#C2410C", bg: "rgba(194,65,12,0.10)" },
  maintenance: {
    label: "Perbaikan",
    color: "#f97316",
    bg: "rgba(249,115,22,0.10)",
  },
};

export default async function PropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await currentUser();
  if (!user) redirect("/");

  // Verify property belongs to user
  const [prop] = await db
    .select()
    .from(properties)
    .where(and(eq(properties.id, id), eq(properties.ownerId, user.id)));

  if (!prop) notFound();

  const roomList = await db
    .select()
    .from(rooms)
    .where(eq(rooms.propertyId, id))
    .orderBy(rooms.roomNumber);

  // Fetch active leases for this property's rooms
  const activeLeases = await db
    .select({
      roomId: roomTenants.roomId,
      tenantName: tenants.name,
      startDate: roomTenants.startDate,
      endDate: roomTenants.endDate,
    })
    .from(roomTenants)
    .innerJoin(tenants, eq(roomTenants.tenantId, tenants.id))
    .innerJoin(rooms, eq(roomTenants.roomId, rooms.id))
    .where(and(eq(rooms.propertyId, id), eq(roomTenants.isActive, true)));

  // Map leases by roomId for easy lookup
  const leaseByRoom = Object.fromEntries(
    activeLeases.map((l) => [l.roomId, l]),
  );

  // Subscription check & limits
  const [userData] = await db
    .select({ subscriptionTier: users.subscriptionTier })
    .from(users)
    .where(eq(users.id, user.id));

  const isFree = !userData || userData.subscriptionTier === "FREE";

  // To check "total rooms <= 5", we need count of ALL rooms for this user
  const [totalRoomCount] = await db
    .select({ value: count() })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(eq(properties.ownerId, user.id));

  const roomLimitReached = isFree && totalRoomCount.value >= 5;

  const total = roomList.length;
  const occupied = roomList.filter((r) => r.status === "occupied").length;
  const available = roomList.filter((r) => r.status === "available").length;
  const maintenance = roomList.filter((r) => r.status === "maintenance").length;
  const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;

  // Group by floor
  const floors = Array.from(new Set(roomList.map((r) => r.floor ?? 1))).sort(
    (a, b) => a - b,
  );

  return (
    <div className="space-y-8">
      {/* Back + Header */}
      <div>
        <Link
          href="/dashboard/properties"
          className="inline-flex items-center gap-1.5 text-sm font-bold mb-4 hover:underline"
          style={{ color: "var(--on-surface-variant)" }}
        >
          <HugeiconsIcon icon={ArrowLeft01Icon} size={16} />
          Kembali ke Properti
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className="flex h-16 w-16 items-center justify-center rounded-2xl text-3xl shadow-sm border border-outline-variant"
              style={{ background: "var(--surface-container-low)" }}
            >
              🏠
            </div>
            <div>
              <h2
                className="text-3xl font-extrabold tracking-tight"
                style={{
                  color: "var(--on-surface)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {prop.name}
              </h2>
              {(prop.city || prop.address) && (
                <p
                  className="mt-1 flex items-center gap-1 text-sm"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  <HugeiconsIcon icon={Location01Icon} size={14} />
                  {[prop.city, prop.address].filter(Boolean).join(" • ")}
                </p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <PropertyCardActions
              alwaysVisible
              property={{
                id: prop.id,
                name: prop.name,
                address: prop.address ?? null,
                city: prop.city ?? null,
              }}
            />
            <AddRoomDialog propertyId={id} limitReached={roomLimitReached} />
          </div>
        </div>
      </div>

      {/* Summary Row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Kamar", value: total, color: "var(--on-surface)" },
          { label: "Tersedia", value: available, color: "#22c55e" },
          { label: "Terisi", value: occupied, color: "var(--primary)" },
          { label: "Perbaikan", value: maintenance, color: "#f97316" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-3xl p-4 transition-all border"
            style={{
              background: "var(--surface-container-low)",
              borderColor: "var(--outline-variant)",
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">
              {s.label}
            </p>
            <p
              className="text-2xl font-black"
              style={{ color: s.color, fontFamily: "var(--font-display)" }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Occupancy bar */}
      {total > 0 && (
        <div
          className="p-6 rounded-3xl border"
          style={{
            background: "var(--surface-container-low)",
            borderColor: "var(--outline-variant)",
          }}
        >
          <div className="mb-2 flex items-center justify-between text-xs font-bold">
            <span style={{ color: "var(--on-surface-variant)" }}>
              Tingkat Hunian
            </span>
            <span style={{ color: "var(--primary)" }}>{occupancyRate}%</span>
          </div>
          <div className="flex h-3 w-full overflow-hidden rounded-full gap-0.5 bg-outline-variant/20">
            {occupied > 0 && (
              <div
                style={{
                  width: `${(occupied / total) * 100}%`,
                  background: "#C2410C",
                }}
              />
            )}
            {available > 0 && (
              <div
                style={{
                  width: `${(available / total) * 100}%`,
                  background: "#22c55e",
                }}
              />
            )}
            {maintenance > 0 && (
              <div
                style={{
                  width: `${(maintenance / total) * 100}%`,
                  background: "#f97316",
                }}
              />
            )}
          </div>
          <div className="mt-3 flex flex-wrap gap-x-6 gap-y-2">
            {(["occupied", "available", "maintenance"] as RoomStatus[]).map(
              (s) => (
                <div key={s} className="flex items-center gap-2">
                  <div
                    className="h-2 w-2 rounded-full"
                    style={{ background: statusConfig[s].color }}
                  />
                  <span className="text-[10px] font-bold uppercase tracking-wider opacity-60">
                    {statusConfig[s].label}
                  </span>
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {/* Room Grid by Floor */}
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-surface-container-highest">
            <HugeiconsIcon
              icon={BedIcon}
              size={32}
              style={{ color: "var(--primary)", opacity: 0.4 }}
            />
          </div>
          <p className="text-lg font-bold">Belum ada kamar</p>
          <p className="text-sm opacity-60">
            Klik &quot;Tambah Kamar&quot; untuk mulai mengisi properti ini.
          </p>
        </div>
      ) : (
        <div className="space-y-10">
          {floors.map((floor) => {
            const floorRooms = roomList.filter((r) => (r.floor ?? 1) === floor);
            return (
              <div key={floor} className="space-y-4">
                <div className="flex items-center gap-2">
                  <div
                    className="h-4 w-1 rounded-full"
                    style={{ background: "var(--primary)" }}
                  />
                  <h3
                    className="font-bold text-sm tracking-tight"
                    style={{ fontFamily: "var(--font-display)" }}
                  >
                    Lantai {floor}
                  </h3>
                  <Badge
                    variant="outline"
                    className="text-[9px] font-bold border-outline-variant opacity-60"
                  >
                    {floorRooms.length} KAMAR
                  </Badge>
                </div>

                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
                  {floorRooms.map((room) => {
                    const lease = leaseByRoom[room.id];
                    return (
                      <RoomCard
                        key={room.id}
                        room={{
                          id: room.id,
                          propertyId: room.propertyId,
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
              </div>
            );
          })}
        </div>
      )}
      <div className="h-12" />
    </div>
  );
}
