import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { tenants, roomTenants, rooms, properties, users } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import DashboardSidebar from "@/components/dashboard/Sidebar";
import DashboardTopbar from "@/components/dashboard/DashboardTopbar";
import { TenantRowActions } from "@/components/dashboard/TenantRowActions";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  Calendar01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  WhatsappIcon,
  Mail01Icon,
  ContactIcon,
} from "@hugeicons/core-free-icons";

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDaysRemaining(endDate: string | null | undefined): number | null {
  if (!endDate) return null;
  const ms = new Date(endDate).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

export default async function TenantsPage() {
  const user = await currentUser();
  if (!user) redirect("/");

  const fullName = [user.firstName, user.lastName].filter(Boolean).join(" ");

  // Subscription check
  const [userData] = await db
    .select({ subscriptionTier: users.subscriptionTier })
    .from(users)
    .where(eq(users.id, user.id));

  const isFree = !userData || userData.subscriptionTier === "FREE";

  // All tenants with their active lease + room info
  const rows = await db
    .select({
      tenantId: tenants.id,
      tenantName: tenants.name,
      tenantEmail: tenants.email,
      tenantPhone: tenants.phone,
      isVerified: tenants.isVerified,
      isActive: roomTenants.isActive,
      startDate: roomTenants.startDate,
      endDate: roomTenants.endDate,
      roomNumber: rooms.roomNumber,
      roomFloor: rooms.floor,
      propertyName: properties.name,
      propertyId: properties.id,
    })
    .from(tenants)
    .leftJoin(
      roomTenants,
      and(eq(roomTenants.tenantId, tenants.id), eq(roomTenants.isActive, true))
    )
    .leftJoin(rooms, eq(roomTenants.roomId, rooms.id))
    .leftJoin(properties, eq(rooms.propertyId, properties.id))
    .where(eq(tenants.ownerId, user.id))
    .orderBy(desc(tenants.createdAt));

  // Available rooms for the move dialog (status = available)
  const availableRoomRows = await db
    .select({
      roomId: rooms.id,
      roomNumber: rooms.roomNumber,
      floor: rooms.floor,
      propertyId: properties.id,
      propertyName: properties.name,
    })
    .from(rooms)
    .innerJoin(properties, eq(rooms.propertyId, properties.id))
    .where(and(eq(properties.ownerId, user.id), eq(rooms.status, "available")))
    .orderBy(properties.name, rooms.roomNumber);

  const availableRooms = availableRoomRows.map((r) => ({
    roomId: r.roomId,
    roomNumber: r.roomNumber,
    floor: r.floor,
    propertyId: r.propertyId,
    propertyName: r.propertyName,
  }));

  const total = rows.length;
  const active = rows.filter((r) => r.isActive).length;
  const noRoom = rows.filter((r) => !r.isActive).length;
  const expiringSoon = rows.filter((r) => {
    const d = getDaysRemaining(r.endDate);
    return d !== null && d >= 0 && d <= 7;
  }).length;

  return (
    <div style={{ background: "var(--surface)", fontFamily: "var(--font-body)" }}>
      <DashboardSidebar isFree={isFree} />
      <DashboardTopbar fullName={fullName} />

      <main className="min-h-screen p-4 sm:p-8 lg:ml-64 pt-24 lg:pt-[88px] transition-all duration-300">
        {/* Header */}
        <header className="mb-8 lg:mb-10">
          <h2
            className="text-3xl font-extrabold tracking-tight"
            style={{ color: "var(--on-surface)", fontFamily: "var(--font-display)" }}
          >
            Daftar Penyewa
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--on-surface-variant)" }}>
            {total} penyewa terdaftar
          </p>
        </header>

        {/* Summary cards */}
        <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Penyewa", value: total, color: "var(--on-surface)" },
            { label: "Aktif Sewa", value: active, color: "var(--primary)" },
            { label: "Tanpa Kamar", value: noRoom, color: "#94a3b8" },
            { label: "Hampir Habis", value: expiringSoon, color: "#f97316" },
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

        {/* Empty state */}
        {total === 0 && (
          <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
            <div
              className="flex h-20 w-20 items-center justify-center rounded-3xl"
              style={{ background: "rgba(194,65,12,0.08)" }}
            >
              <HugeiconsIcon icon={UserGroupIcon} size={40} style={{ color: "var(--primary)", opacity: 0.4 }} />
            </div>
            <p className="text-xl font-bold" style={{ color: "var(--on-surface)" }}>
              Belum ada penyewa
            </p>
            <p className="text-sm max-w-xs" style={{ color: "var(--on-surface-variant)" }}>
              Penyewa akan otomatis muncul di sini setelah kamu menetapkan penghuni pada kamar melalui halaman properti.
            </p>
          </div>
        )}

        {/* Tenant list */}
        {total > 0 && (
          <Card className="rounded-4xl border" style={{ borderColor: "var(--outline-variant)" }}>
            <CardHeader>
              <CardTitle style={{ fontFamily: "var(--font-display)" }}>Semua Penyewa</CardTitle>
              <CardDescription>Hover pada baris untuk edit atau pindah kamar penyewa</CardDescription>
            </CardHeader>
            <Separator style={{ background: "var(--outline-variant)" }} />
            <CardContent className="p-0">
              <div className="divide-y" style={{ borderColor: "var(--outline-variant)" }}>
                {rows.map((row, i) => {
                  const daysLeft = getDaysRemaining(row.endDate);
                  const isExpiringSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
                  const isActive = !!row.isActive;

                  return (
                    <div
                      key={`${row.tenantId}-${i}`}
                      className="group flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-4 sm:px-6 py-4 transition-colors hover:bg-black/2"
                    >
                      {/* Left: Avatar + name */}
                      <div className="flex items-center gap-4 min-w-0 flex-1">
                        <div
                          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-bold"
                          style={{
                            background: isActive ? "rgba(194,65,12,0.1)" : "var(--surface-container-highest)",
                            color: isActive ? "var(--primary)" : "var(--on-surface-variant)",
                          }}
                        >
                          {row.tenantName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-bold truncate" style={{ color: "var(--on-surface)" }}>
                              {row.tenantName}
                            </p>
                            {row.isVerified && (
                              <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-green-500 shrink-0" />
                            )}
                          </div>
                          <div className="flex flex-col mt-0.5 min-w-0">
                            {row.tenantPhone && (
                              <div className="flex items-center gap-1.5 group/phone min-w-0">
                                <HugeiconsIcon icon={WhatsappIcon} size={10} className="text-green-600 shrink-0" />
                                <a 
                                  href={`https://wa.me/${row.tenantPhone.replace(/\D/g, '')}`} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-[10px] hover:underline truncate"
                                  style={{ color: "var(--on-surface-variant)" }}
                                >
                                  {row.tenantPhone}
                                </a>
                              </div>
                            )}
                            {row.tenantEmail && (
                              <div className="flex items-center gap-1.5 group/email min-w-0 mt-0.5">
                                <HugeiconsIcon icon={Mail01Icon} size={10} className="text-blue-500 shrink-0" />
                                <a 
                                  href={`mailto:${row.tenantEmail}`}
                                  className="text-[10px] hover:underline truncate"
                                  style={{ color: "var(--on-surface-variant)" }}
                                >
                                  {row.tenantEmail}
                                </a>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Middle: Room info (Hidden on mobile) */}
                      <div className="hidden md:flex items-center gap-2 min-w-0 flex-1 px-4">
                        {row.roomNumber ? (
                          <div className="min-w-0">
                            <p className="text-xs font-bold truncate" style={{ color: "var(--on-surface)" }}>
                              {row.propertyName}
                            </p>
                            <p className="text-[10px]" style={{ color: "var(--on-surface-variant)" }}>
                              Kamar {row.roomNumber}{row.roomFloor ? ` • Lantai ${row.roomFloor}` : ""}
                            </p>
                          </div>
                        ) : (
                          <p className="text-xs italic" style={{ color: "var(--on-surface-variant)" }}>
                            Tidak ada kamar aktif
                          </p>
                        )}
                      </div>

                      {/* Right: Dates + badge + edit button */}
                      <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 w-full sm:w-auto mt-2 sm:mt-0 pt-2 sm:pt-0 border-t sm:border-0" style={{ borderColor: 'var(--outline-variant)' }}>
                        <div className="hidden sm:flex flex-col items-end gap-1.5">
                          {row.startDate && (
                            <div className="flex items-center gap-1">
                              <HugeiconsIcon icon={Calendar01Icon} size={11} style={{ color: "var(--on-surface-variant)" }} />
                              <p className="text-[10px]" style={{ color: "var(--on-surface-variant)" }}>
                                {formatDate(row.startDate)} → {row.endDate ? formatDate(row.endDate) : "∞"}
                              </p>
                            </div>
                          )}
                          {isActive && isExpiringSoon && (
                            <Badge className="text-[9px] gap-1" style={{ background: "rgba(249,115,22,0.15)", color: "#f97316" }}>
                              <HugeiconsIcon icon={AlertCircleIcon} size={10} />
                              {daysLeft === 0 ? "Berakhir hari ini" : `${daysLeft} hari lagi`}
                            </Badge>
                          )}
                          {isActive && !isExpiringSoon && row.endDate && (
                            <Badge className="text-[9px]" style={{ background: "rgba(194,65,12,0.1)", color: "var(--primary)" }}>
                              Aktif
                            </Badge>
                          )}
                          {isActive && !row.endDate && (
                            <Badge className="text-[9px]" style={{ background: "rgba(34,197,94,0.1)", color: "#22c55e" }}>
                              Tanpa Batas
                            </Badge>
                          )}
                          {!isActive && (
                            <Badge variant="outline" className="text-[9px]" style={{ color: "var(--on-surface-variant)" }}>
                              Tidak Aktif
                            </Badge>
                          )}
                        </div>

                        {/* Edit button (appears on hover) */}
                        <TenantRowActions
                          tenant={{
                            id: row.tenantId,
                            name: row.tenantName,
                            email: row.tenantEmail ?? null,
                            phone: row.tenantPhone ?? null,
                            roomNumber: row.roomNumber ?? null,
                            propertyName: row.propertyName ?? null,
                            startDate: row.startDate ?? null,
                            endDate: row.endDate ?? null,
                          }}
                          availableRooms={availableRooms}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        <div className="h-12" />
      </main>
    </div>
  );
}
