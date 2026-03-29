"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  BrickWallIcon,
  CheckmarkCircle01Icon,
  Wrench01Icon,
} from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const statusConfig = {
  available: {
    label: "Tersedia",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.4)",
    icon: CheckmarkCircle01Icon,
  },
  occupied: {
    label: "Terisi",
    color: "var(--primary)",
    bg: "rgba(194,65,12,0.12)",
    border: "rgba(194,65,12,0.4)",
    icon: BrickWallIcon,
  },
  maintenance: {
    label: "Perbaikan",
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
    border: "rgba(249,115,22,0.4)",
    icon: Wrench01Icon,
  },
};

export default function RoomOverview() {
  const { data, error, isLoading } = useSWR("/api/dashboard/room-overview", fetcher);

  if (error) return <div className="text-red-500 text-xs">Gagal memuat status kamar</div>;

  const totalRooms = data?.length || 0;
  const totalOccupied = data?.filter((r: any) => r.status === "occupied").length || 0;
  const totalAvailable = data?.filter((r: any) => r.status === "available").length || 0;
  const totalMaintenance = data?.filter((r: any) => r.status === "maintenance").length || 0;

  // Group by property
  const grouped: Record<string, any> = {};
  if (data) {
    for (const row of data) {
      if (!grouped[row.propertyId]) {
        grouped[row.propertyId] = {
          propertyId: row.propertyId,
          propertyName: row.propertyName,
          rooms: [],
        };
      }
      grouped[row.propertyId].rooms.push(row);
    }
  }
  const groups = Object.values(grouped);

  if (!isLoading && totalRooms === 0) {
    return (
      <Card
        className="rounded-4xl border"
        style={{ borderColor: "var(--outline-variant)" }}
      >
        <CardHeader>
          <CardTitle style={{ fontFamily: "var(--font-display)" }}>Status Kamar</CardTitle>
          <CardDescription>Kelola dan pantau status semua kamar properti kamu</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-16 text-center gap-3">
             <HugeiconsIcon icon={BrickWallIcon} size={48} style={{ color: "var(--on-surface-variant)", opacity: 0.3 }} />
             <p className="text-sm font-bold" style={{ color: "var(--on-surface-variant)" }}>
               Belum ada kamar
             </p>
             <p className="text-xs" style={{ color: "var(--on-surface-variant)", opacity: 0.7 }}>
               Tambahkan properti dan kamar untuk mulai memantau statusnya di sini.
             </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`rounded-4xl border ${isLoading ? "animate-pulse" : ""}`}
      style={{ borderColor: "var(--outline-variant)" }}
    >
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle style={{ fontFamily: "var(--font-display)" }}>Status Kamar</CardTitle>
            <CardDescription>Ringkasan ketersediaan kamar di semua properti kamu</CardDescription>
          </div>
          <Badge
            className="text-xs font-bold px-3 py-1"
            style={{ background: "var(--surface-container)", color: "var(--on-surface)" }}
          >
            {totalRooms} Kamar
          </Badge>
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3">
          {(["occupied", "available", "maintenance"] as const).map((s) => {
            const cfg = statusConfig[s];
            const count = s === "occupied" ? totalOccupied : s === "available" ? totalAvailable : totalMaintenance;
            const pct = totalRooms > 0 ? Math.round((count / totalRooms) * 100) : 0;
            return (
              <div
                key={s}
                className="flex flex-col gap-1.5 rounded-2xl p-3"
                style={{ background: cfg.bg, border: `1px solid ${cfg.border}` }}
              >
                <div className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={cfg.icon} size={14} style={{ color: cfg.color }} />
                  <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: cfg.color }}>
                    {cfg.label}
                  </p>
                </div>
                {!isLoading ? (
                    <p className="text-2xl font-extrabold" style={{ color: cfg.color, fontFamily: "var(--font-display)" }}>
                        {count}
                    </p>
                ) : <div className="h-8 w-12 bg-muted rounded mt-1" />}
                <div className="h-1 w-full rounded-full overflow-hidden" style={{ background: "rgba(0,0,0,0.08)" }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cfg.color }} />
                </div>
                <p className="text-[10px]" style={{ color: cfg.color, opacity: 0.7 }}>{pct}% dari total</p>
              </div>
            );
          })}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isLoading ? (
            <div className="h-48 bg-muted rounded-3xl" />
        ) : (
          groups.map((group) => (
            <div key={group.propertyId}>
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-6 rounded-lg flex items-center justify-center text-xs" style={{ background: "rgba(194,65,12,0.1)" }}>🏠</div>
                  <p className="text-sm font-bold" style={{ color: "var(--on-surface)" }}>{group.propertyName}</p>
                </div>
                <span className="text-[10px] font-bold" style={{ color: "var(--on-surface-variant)" }}>{group.rooms.length} kamar</span>
              </div>
              <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 lg:grid-cols-10 xl:grid-cols-12">
                {group.rooms.map((room: any) => {
                  const cfg = statusConfig[room.status as "available" | "occupied" | "maintenance"];
                  return (
                    <Tooltip key={room.id}>
                      <TooltipTrigger
                        className="aspect-square rounded-xl flex flex-col items-center justify-center border-2 text-center cursor-pointer transition-all hover:scale-110 hover:shadow-md border-none"
                        style={{ background: cfg.bg, outline: `2px solid ${cfg.border}`, outlineOffset: "-2px" }}
                      >
                         <span className="text-[10px] font-extrabold leading-tight" style={{ color: cfg.color }}>{room.roomNumber}</span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <div className="text-center">
                          <p className="font-bold text-xs">Kamar {room.roomNumber}</p>
                          <p className="text-[10px] font-bold mt-0.5" style={{ color: cfg.color }}>{cfg.label}</p>
                        </div>
                      </TooltipContent>
                    </Tooltip>
                  );
                })}
              </div>
            </div>
          ))
        )}
        <div className="flex items-center gap-4 pt-2">
            {(["occupied", "available", "maintenance"] as const).map((s) => (
                <div key={s} className="flex items-center gap-1.5">
                    <div className="h-2.5 w-2.5 rounded-sm" style={{ background: statusConfig[s].color }} />
                    <span className="text-[10px] font-bold" style={{ color: "var(--on-surface-variant)" }}>{statusConfig[s].label}</span>
                </div>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
