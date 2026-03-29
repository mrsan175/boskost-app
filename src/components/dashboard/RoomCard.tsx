"use client";

import { useState, useTransition } from "react";
import { updateRoomStatus, deleteRoom, vacateRoom } from "@/lib/actions/room";
import { SetOccupancyDialog } from "@/components/dashboard/SetOccupancyDialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  User02Icon,
  Wrench01Icon,
  MoreHorizontalIcon,
  Delete01Icon,
  Calendar01Icon,
  LockPasswordIcon,
} from "@hugeicons/core-free-icons";

type RoomStatus = "available" | "occupied" | "maintenance";

const statusConfig: Record<RoomStatus, { label: string; color: string; bg: string; border: string }> = {
  available: {
    label: "Tersedia",
    color: "#22c55e",
    bg: "rgba(34,197,94,0.15)",
    border: "rgba(34,197,94,0.4)",
  },
  occupied: {
    label: "Terisi",
    color: "#C2410C",
    bg: "rgba(194,65,12,0.12)",
    border: "rgba(194,65,12,0.4)",
  },
  maintenance: {
    label: "Perbaikan",
    color: "#f97316",
    bg: "rgba(249,115,22,0.12)",
    border: "rgba(249,115,22,0.4)",
  },
};

interface RoomCardProps {
  room: {
    id: string;
    roomNumber: string;
    floor: number | null;
    status: RoomStatus;
    pricePerMonth: string | null;
    notes: string | null;
    tenantName?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    isActive: boolean;
  };
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";

export function RoomCard({ room }: RoomCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showOccupancyDialog, setShowOccupancyDialog] = useState(false);
  const [showVacateConfirm, setShowVacateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const cfg = statusConfig[room.status];

  function handleMaintenance() {
    startTransition(async () => {
      await updateRoomStatus(room.id, "maintenance");
    });
  }

  function handleAvailable() {
    startTransition(async () => {
      await updateRoomStatus(room.id, "available");
    });
  }

  function handleVacate() {
    startTransition(async () => {
      await vacateRoom(room.id);
      setShowVacateConfirm(false);
    });
  }

  function handleDelete() {
    startTransition(async () => {
      await deleteRoom(room.id);
      setShowDeleteConfirm(false);
    });
  }

  const isOccupied = room.status === "occupied";

  return (
    <>
      <div
        className={`relative group rounded-2xl p-3 flex flex-col gap-1.5 transition-all ${!room.isActive ? "cursor-not-allowed opacity-50 grayscale-[0.8]" : "hover:scale-105 hover:shadow-lg"
          }`}
        style={{
          background: isPending ? "rgba(0,0,0,0.05)" : cfg.bg,
          outline: `2px solid ${isPending ? "rgba(0,0,0,0.1)" : cfg.border}`,
          outlineOffset: "-1px",
        }}
      >
        {!room.isActive && (
          <div className="absolute inset-0 z-10 flex items-center justify-center">
            <HugeiconsIcon icon={LockPasswordIcon} size={16} style={{ color: cfg.color }} />
          </div>
        )}

        {/* Room number */}
        <div className="text-center">
          <p
            className="text-sm font-extrabold leading-tight"
            style={{ color: cfg.color, fontFamily: "var(--font-display)" }}
          >
            {room.roomNumber}
          </p>
          {room.floor && (
            <p className="text-[9px] font-medium" style={{ color: cfg.color, opacity: 0.7 }}>
              Lt. {room.floor}
            </p>
          )}
        </div>

        {/* Tenant name (if exists) */}
        {room.tenantName && (
          <p
            className="text-[9px] text-center font-bold truncate"
            style={{ color: cfg.color, opacity: 0.9 }}
            title={room.tenantName}
          >
            {room.tenantName}
          </p>
        )}

        {/* End date warning */}
        {isOccupied && room.endDate && (
          <div
            className="flex items-center justify-center gap-0.5 rounded-lg px-1 py-0.5"
            style={{ background: "rgba(194,65,12,0.1)" }}
          >
            <HugeiconsIcon icon={Calendar01Icon} size={8} style={{ color: cfg.color }} />
            <p className="text-[8px] font-bold" style={{ color: cfg.color }}>
              {formatDate(room.endDate)}
            </p>
          </div>
        )}

        {/* Price */}
        {room.pricePerMonth && !isOccupied && (
          <p className="text-[9px] text-center font-bold" style={{ color: cfg.color, opacity: 0.8 }}>
            Rp {(parseFloat(room.pricePerMonth) / 1000).toFixed(0)}rb
          </p>
        )}

        {/* Status badge */}
        <div
          className="rounded-full px-2 py-0.5 text-center text-[9px] font-bold"
          style={{ background: cfg.color, color: "white" }}
        >
          {cfg.label}
        </div>

        {/* Hover dropdown (only if active) */}
        {room.isActive && (
          <div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  className="flex h-6 w-6 items-center justify-center rounded-full shadow-md text-white cursor-pointer"
                  style={{ background: "var(--on-surface)" }}
                  onClick={(e) => e.stopPropagation()}
                >
                  <HugeiconsIcon icon={MoreHorizontalIcon} size={12} />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 rounded-xl">
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Kamar {room.roomNumber}
                </DropdownMenuLabel>

                {!isOccupied && (
                  <DropdownMenuItem
                    onClick={() => setShowOccupancyDialog(true)}
                    disabled={isPending}
                    className="gap-2 rounded-lg cursor-pointer"
                  >
                    <HugeiconsIcon icon={User02Icon} size={14} style={{ color: "#C2410C" }} />
                    <span className="text-xs">Tetapkan Penyewa</span>
                  </DropdownMenuItem>
                )}

                {isOccupied && (
                  <DropdownMenuItem
                    onClick={() => setShowVacateConfirm(true)}
                    disabled={isPending}
                    className="gap-2 rounded-lg cursor-pointer"
                  >
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-green-500" />
                    <span className="text-xs">Kosongkan Kamar</span>
                  </DropdownMenuItem>
                )}

                {isOccupied && (
                  <DropdownMenuItem
                    onClick={() => setShowOccupancyDialog(true)}
                    disabled={isPending}
                    className="gap-2 rounded-lg cursor-pointer"
                  >
                    <HugeiconsIcon icon={Calendar01Icon} size={14} style={{ color: "var(--primary)" }} />
                    <span className="text-xs">Ubah Tanggal Sewa</span>
                  </DropdownMenuItem>
                )}

                {room.status !== "maintenance" && (
                  <DropdownMenuItem
                    onClick={handleMaintenance}
                    disabled={isPending}
                    className="gap-2 rounded-lg cursor-pointer"
                  >
                    <HugeiconsIcon icon={Wrench01Icon} size={14} className="text-orange-500" />
                    <span className="text-xs">Tandai Perbaikan</span>
                  </DropdownMenuItem>
                )}

                {room.status === "maintenance" && (
                  <DropdownMenuItem
                    onClick={handleAvailable}
                    disabled={isPending}
                    className="gap-2 rounded-lg cursor-pointer"
                  >
                    <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} className="text-green-500" />
                    <span className="text-xs">Selesai Perbaikan</span>
                  </DropdownMenuItem>
                )}

                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setShowDeleteConfirm(true)}
                  disabled={isPending}
                  className="gap-2 rounded-lg cursor-pointer text-red-600 focus:text-red-600"
                >
                  <HugeiconsIcon icon={Delete01Icon} size={14} />
                  <span className="text-xs">Hapus Kamar</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>

      <SetOccupancyDialog
        open={showOccupancyDialog}
        onOpenChange={setShowOccupancyDialog}
        roomId={room.id}
        roomNumber={room.roomNumber}
        initialData={
          isOccupied
            ? {
              tenantName: room.tenantName,
              startDate: room.startDate,
              endDate: room.endDate,
            }
            : undefined
        }
      />

      <ConfirmDialog
        open={showVacateConfirm}
        onOpenChange={setShowVacateConfirm}
        onConfirm={handleVacate}
        title="Kosongkan Kamar?"
        description={`Apakah Anda yakin ingin mengosongkan kamar ${room.roomNumber}? Status sewa penyewa akan ditutup secara permanen.`}
        confirmText="Ya, Kosongkan"
      />

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Hapus Kamar?"
        description={`Hapus kamar ${room.roomNumber}? Tindakan ini akan menghapus semua riwayat kamar ini dan tidak dapat dibatalkan.`}
        confirmText="Ya, Hapus"
        variant="destructive"
      />
    </>
  );
}
