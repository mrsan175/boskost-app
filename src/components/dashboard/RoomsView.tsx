"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { RoomCard } from "@/components/dashboard/RoomCard";
import { RoomsFilterBar } from "@/components/dashboard/RoomsFilterBar";
import { AddRoomDialog } from "@/components/dashboard/AddRoomDialog";
import { HugeiconsIcon } from "@hugeicons/react";
import { Door01Icon } from "@hugeicons/core-free-icons";

interface RoomsViewProps {
  initialRooms: any[];
  propertyList: any[];
}

import { useSearchParams } from "next/navigation";

export function RoomsView({ initialRooms, propertyList }: RoomsViewProps) {
  const searchParams = useSearchParams();
  const filterStatus = searchParams.get("status") || "";
  const filterProperty = searchParams.get("propertyId") || "";

  const { data: allRooms = initialRooms } = useSWR(
    "/api/dashboard/rooms",
    fetcher,
    {
      fallbackData: initialRooms,
      revalidateOnFocus: false,
    },
  );

  // Deduplicate by ID just in case data comes in weird from SWR merge/fallback
  const uniqueRooms = Array.from(new Set(allRooms.map((r: any) => r.id))).map(
    (id) => allRooms.find((r: any) => r.id === id),
  );

  const filtered = uniqueRooms.filter((r: any) => {
    const sMatch = !filterStatus || r.status === filterStatus;
    const pMatch = !filterProperty || r.propertyId === filterProperty;
    return sMatch && pMatch;
  });

  const total = allRooms.length;
  const available = allRooms.filter(
    (r: any) => r.status === "available",
  ).length;
  const occupied = allRooms.filter((r: any) => r.status === "occupied").length;
  const maintenance = allRooms.filter(
    (r: any) => r.status === "maintenance",
  ).length;

  const grouped: Record<
    string,
    { propertyId: string; propertyName: string; roomList: any[] }
  > = {};
  for (const r of filtered) {
    if (!grouped[r.propertyId]) {
      grouped[r.propertyId] = {
        propertyId: r.propertyId,
        propertyName: r.propertyName,
        roomList: [],
      };
    }
    grouped[r.propertyId].roomList.push(r);
  }

  // Sort groups: Most rooms first, then most available first
  const groups = Object.values(grouped).sort((a, b) => {
    const totalA = a.roomList.length;
    const totalB = b.roomList.length;
    if (totalB !== totalA) return totalB - totalA;

    const availA = a.roomList.filter((r) => r.status === "available").length;
    const availB = b.roomList.filter((r) => r.status === "available").length;
    return availB - availA;
  });

  return (
    <div style={{ background: "transparent" }}>
      {/* Header */}
      <header className="mb-8 lg:mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2
            className="text-3xl font-extrabold tracking-tight"
            style={{
              color: "var(--on-surface)",
              fontFamily: "var(--font-display)",
            }}
          >
            Semua Kamar
          </h2>
          <p
            className="mt-1 text-sm"
            style={{ color: "var(--on-surface-variant)" }}
          >
            {total} kamar di {propertyList.length} properti
          </p>
        </div>
        <AddRoomDialog propertyId="all" properties={propertyList} />
      </header>

      {/* Stats */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
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

      {/* Filter Bar */}
      <RoomsFilterBar
        properties={propertyList}
        activeStatus={filterStatus}
        activeProperty={filterProperty}
      />

      {/* Room Groups */}
      {groups.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
          <div className="h-16 w-16 items-center justify-center rounded-3xl flex bg-surface-container-highest">
            <HugeiconsIcon icon={Door01Icon} size={32} className="opacity-20" />
          </div>
          <p className="text-lg font-bold opacity-60">
            Tidak ada kamar yang sesuai filter.
          </p>
        </div>
      ) : (
        groups.map((group) => (
          <div key={group.propertyId} className="mb-10 space-y-6">
            <div className="flex items-center gap-2">
              <div
                className="h-5 w-1 rounded-full"
                style={{ background: "var(--primary)" }}
              />
              <h3
                className="text-lg font-extrabold"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {group.propertyName}
              </h3>
              <span className="text-xs opacity-50 font-bold">
                ({group.roomList.length} Kamar)
              </span>
            </div>

            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {group.roomList.map((room) => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          </div>
        ))
      )}

      <div className="h-12" />
    </div>
  );
}
