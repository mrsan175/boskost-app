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
  Edit01Icon,
  Delete01Icon,
  Calendar01Icon,
  LockPasswordIcon,
  Exchange01Icon,
} from "@hugeicons/core-free-icons";
import { toast } from "sonner";
import { EditRoomDialog } from "@/components/dashboard/EditRoomDialog";
import { MoveTenantDialog } from "@/components/dashboard/MoveTenantDialog";

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
    propertyId: string;
  };
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";

import { mutate as globalMutate } from "swr";

export function RoomCard({ room }: RoomCardProps) {
  const [isPending, startTransition] = useTransition();
  const [showOccupancyDialog, setShowOccupancyDialog] = useState(false);
  const [showMoveDialog, setShowMoveDialog] = useState(false);
  const [showVacateConfirm, setShowVacateConfirm] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  const cfg = statusConfig[room.status];

  async function optimisticUpdate(newStatus: RoomStatus, actionPromise: Promise<any>) {
    await globalMutate(
      "/api/dashboard/rooms",
      actionPromise,
      {
        optimisticData: (current: any[] | undefined) => {
          if (!current) return [];
          return current.map((r) => (r.id === room.id ? { ...r, status: newStatus } : r));
        },
        rollbackOnError: true,
        revalidate: true,
        populateCache: false,
      }
    );
    // Also update stats
    globalMutate("/api/dashboard/stats");
  }

  function handleMaintenance() {
    startTransition(async () => {
      try {
        await optimisticUpdate("maintenance", updateRoomStatus(room.id, "maintenance"));
        toast.success(`Kamar ${room.roomNumber} ditandai perbaikan`);
      } catch (err) {
        toast.error("Gagal mengubah status kamar");
      }
    });
  }

  function handleAvailable() {
    startTransition(async () => {
      try {
        await optimisticUpdate("available", updateRoomStatus(room.id, "available"));
        toast.success(`Kamar ${room.roomNumber} tersedia`);
      } catch (err) {
        toast.error("Gagal mengubah status kamar");
      }
    });
  }

  function handleVacate() {
    setShowVacateConfirm(false); // Close immediately
    startTransition(async () => {
      try {
        await globalMutate(
          "/api/dashboard/rooms",
          vacateRoom(room.id),
          {
            optimisticData: (current: any[] | undefined) => {
              if (!current) return [];
              return current.map((r) => (r.id === room.id ? { ...r, status: "available", tenantName: null } : r));
            },
            rollbackOnError: true,
            revalidate: true,
            populateCache: false,
          }
        );
        toast.success(`Kamar ${room.roomNumber} berhasil dikosongkan`);
        globalMutate("/api/dashboard/stats");
      } catch (err) {
        toast.error("Gagal mengosongkan kamar");
      }
    });
  }

  function handleDelete() {
    setShowDeleteConfirm(false); // Close immediately
    startTransition(async () => {
      try {
        await globalMutate(
          "/api/dashboard/rooms",
          deleteRoom(room.id),
          {
            optimisticData: (current: any[] | undefined) => {
              if (!current) return [];
              return current.filter((r) => r.id !== room.id);
            },
            rollbackOnError: true,
            revalidate: true,
            populateCache: false,
          }
        );
        toast.success(`Kamar ${room.roomNumber} dihapus`);
        globalMutate("/api/dashboard/stats");
      } catch (err) {
        toast.error("Gagal menghapus kamar");
      }
    });
  }

  const isOccupied = room.status === "occupied" || !!room.tenantName;

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <div
            className={`relative group rounded-2xl p-3 flex flex-col gap-1.5 transition-all cursor-pointer ${!room.isActive ? "cursor-not-allowed opacity-50 grayscale-[0.8]" : "hover:scale-105 hover:shadow-lg"
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
            {room.pricePerMonth && !room.tenantName && (
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
          </div>
        </DropdownMenuTrigger>

        {room.isActive && (
          <DropdownMenuContent align="center" className="w-48 rounded-2xl shadow-xl border-none p-1.5" style={{ background: "var(--surface-container-high)" }}>
            <DropdownMenuLabel className="text-[10px] font-black uppercase tracking-widest opacity-40 px-3 py-2">
              Kamar {room.roomNumber}
            </DropdownMenuLabel>

            {!isOccupied && (
              <DropdownMenuItem
                onClick={() => setShowOccupancyDialog(true)}
                disabled={isPending}
                className="gap-3 rounded-xl cursor-pointer py-2.5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                  <HugeiconsIcon icon={User02Icon} size={14} />
                </div>
                <span className="text-xs font-bold">Tambahkan Penyewa</span>
              </DropdownMenuItem>
            )}

            {isOccupied && (
              <DropdownMenuItem
                onClick={() => setShowVacateConfirm(true)}
                disabled={isPending}
                className="gap-3 rounded-xl cursor-pointer py-2.5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-green-600">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
                </div>
                <span className="text-xs font-bold">Kosongkan Kamar</span>
              </DropdownMenuItem>
            )}

            {isOccupied && (
              <DropdownMenuItem
                onClick={() => setShowOccupancyDialog(true)}
                disabled={isPending}
                className="gap-3 rounded-xl cursor-pointer py-2.5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                  <HugeiconsIcon icon={Calendar01Icon} size={14} />
                </div>
                <span className="text-xs font-bold">Ubah Tanggal Sewa</span>
              </DropdownMenuItem>
            )}

            {isOccupied && (
              <DropdownMenuItem
                onClick={() => setShowMoveDialog(true)}
                disabled={isPending}
                className="gap-3 rounded-xl cursor-pointer py-2.5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-600">
                  <HugeiconsIcon icon={Exchange01Icon} size={14} />
                </div>
                <span className="text-xs font-bold">Pindahkan Penghuni</span>
              </DropdownMenuItem>
            )}

            {room.status !== "maintenance" && (
              <DropdownMenuItem
                onClick={handleMaintenance}
                disabled={isPending}
                className="gap-3 rounded-xl cursor-pointer py-2.5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-50 text-orange-500">
                  <HugeiconsIcon icon={Wrench01Icon} size={14} />
                </div>
                <span className="text-xs font-bold">Tandai Perbaikan</span>
              </DropdownMenuItem>
            )}

            {room.status === "maintenance" && (
              <DropdownMenuItem
                onClick={handleAvailable}
                disabled={isPending}
                className="gap-3 rounded-xl cursor-pointer py-2.5"
              >
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-50 text-green-500">
                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
                </div>
                <span className="text-xs font-bold">Selesai Perbaikan</span>
              </DropdownMenuItem>
            )}

            <DropdownMenuItem
              onClick={() => setShowEditDialog(true)}
              disabled={isPending}
              className="gap-3 rounded-xl cursor-pointer py-2.5"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-50 text-blue-600">
                <HugeiconsIcon icon={Edit01Icon} size={14} />
              </div>
              <span className="text-xs font-bold">Edit Detail Kamar</span>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-outline-variant/30 my-1" />
            <DropdownMenuItem
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isPending}
              className="gap-3 rounded-xl cursor-pointer py-2.5 text-red-600 focus:text-red-700 focus:bg-red-50"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-red-50">
                <HugeiconsIcon icon={Delete01Icon} size={14} />
              </div>
              <span className="text-xs font-bold">Hapus Kamar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        )}
      </DropdownMenu>

      <EditRoomDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        room={room}
      />

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

      <MoveTenantDialog
        open={showMoveDialog}
        onOpenChange={setShowMoveDialog}
        roomId={room.id}
        roomNumber={room.roomNumber}
        propertyId={room.propertyId}
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
