"use client";

import { useTransition, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  AlertCircleIcon,
  CheckmarkCircle01Icon,
  LockPasswordIcon,
  Building01Icon,
  Home01Icon,
} from "@hugeicons/core-free-icons";
import { togglePropertyActivation, toggleRoomActivation } from "@/lib/actions/auth";
import { toast } from "sonner";

interface LimitManagementModalProps {
  open: boolean;
  properties: any[];
  rooms: any[];
  tier: string;
}

export function LimitManagementModal({ open, properties, rooms, tier }: LimitManagementModalProps) {
  const [isPending, startTransition] = useTransition();

  const activePropertiesCount = properties.reduce((acc, p) => acc + (p.isActive ? 1 : 0), 0);
  const activeRoomsCount = rooms.reduce((acc, r) => acc + (r.isActive ? 1 : 0), 0);

  const propertyOverBalance = tier === "FREE" && activePropertiesCount > 1;
  const roomOverBalance = tier === "FREE" && activeRoomsCount > 5;

  const handleToggleProperty = (propertyId: string, currentStatus: boolean) => {
    startTransition(async () => {
      try {
        await togglePropertyActivation(propertyId, !currentStatus);
        toast.success(`Properti ${!currentStatus ? "diaktifkan" : "nonaktifkan"}`);
      } catch (err: any) {
        toast.error(err.message || "Gagal mengubah status");
      }
    });
  };

  const handleToggleRoom = (roomId: string, currentStatus: boolean) => {
    startTransition(async () => {
      try {
        await toggleRoomActivation(roomId, !currentStatus);
        toast.success(`Kamar ${!currentStatus ? "diaktifkan" : "nonaktifkan"}`);
      } catch (err: any) {
        toast.error(err.message || "Gagal mengubah status");
      }
    });
  };

  return (
    <Dialog open={open}>
      <DialogContent 
        className="sm:max-w-2xl w-[95vw] h-[90vh] sm:h-auto sm:max-h-[85vh] flex flex-col p-6 sm:p-8 rounded-3xl sm:rounded-4xl border-none shadow-2xl overflow-hidden"
      >
        <DialogHeader className="mb-4 sm:mb-6 shrink-0">
          <div className="flex items-center gap-4 mb-2">
            <div className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-2xl bg-orange-100 text-orange-600 shrink-0">
              <HugeiconsIcon icon={AlertCircleIcon} size={24} />
            </div>
            <div>
              <DialogTitle className="text-xl sm:text-2xl font-extrabold" style={{ fontFamily: "var(--font-display)" }}>
                Atur Batas Akun FREE
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm font-medium">
                Pilih properti dan kamar yang ingin Anda gunakan.
              </DialogDescription>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-3 sm:gap-4 mt-2 sm:mt-4">
            <div className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border ${propertyOverBalance ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
              <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-70">Properti Aktif</p>
                {propertyOverBalance ? <HugeiconsIcon icon={AlertCircleIcon} size={12} className="text-red-500" /> : <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="text-green-500" />}
              </div>
              <p className={`text-xl sm:text-2xl font-black ${propertyOverBalance ? "text-red-700" : "text-green-700"}`}>
                {activePropertiesCount} <span className="text-xs sm:text-sm font-bold opacity-60">/ 1</span>
              </p>
            </div>
            <div className={`p-3 sm:p-4 rounded-2xl sm:rounded-3xl border ${roomOverBalance ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}`}>
              <div className="flex justify-between items-center mb-0.5 sm:mb-1">
                <p className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider opacity-70">Kamar Aktif</p>
                {roomOverBalance ? <HugeiconsIcon icon={AlertCircleIcon} size={12} className="text-red-500" /> : <HugeiconsIcon icon={CheckmarkCircle01Icon} size={12} className="text-green-500" />}
              </div>
              <p className={`text-xl sm:text-2xl font-black ${roomOverBalance ? "text-red-700" : "text-green-700"}`}>
                {activeRoomsCount} <span className="text-xs sm:text-sm font-bold opacity-60">/ 5</span>
              </p>
            </div>
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-2 px-2 py-2 overflow-y-auto min-h-0">
          <div className="space-y-6 sm:space-y-8 pr-4">
            {/* Properties Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Building01Icon} size={16} className="text-primary" />
                <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-60">Pilih Properti (Maks 1)</h3>
              </div>
              <div className="grid grid-cols-1 gap-2">
                {properties.map((p) => (
                  <div
                    key={p.id}
                    className={`flex items-center justify-between p-3 sm:p-4 rounded-2xl border transition-all ${
                      p.isActive ? "bg-primary/5 border-primary shadow-sm" : "bg-surface border-outline opacity-70 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 sm:h-10 sm:w-10 flex items-center justify-center rounded-xl ${p.isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground"}`}>
                        🏠
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-xs sm:text-sm truncate max-w-[120px] sm:max-w-[200px]">{p.name}</p>
                        <p className="text-[9px] sm:text-[10px] opacity-60 truncate">{p.city || "Alamat Kos"}</p>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={p.isActive ? "destructive" : "default"}
                      disabled={isPending || (!p.isActive && activePropertiesCount >= 1)}
                      className="rounded-full h-7 sm:h-8 px-3 sm:px-4 font-bold text-[9px] sm:text-[10px] shrink-0"
                      onClick={() => handleToggleProperty(p.id, p.isActive)}
                    >
                      {p.isActive ? "Nonaktif" : "Aktifkan"}
                    </Button>
                  </div>
                ))}
              </div>
            </div>

            {/* Rooms Section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <HugeiconsIcon icon={Home01Icon} size={16} className="text-primary" />
                <h3 className="text-[10px] sm:text-xs font-bold uppercase tracking-widest opacity-60">Pilih Kamar (Maks 5)</h3>
              </div>
              {properties.filter(p => p.isActive).length === 0 ? (
                <div className="p-6 sm:p-8 text-center rounded-2xl sm:rounded-3xl border-2 border-dashed border-outline opacity-40">
                  <p className="text-[10px] sm:text-xs font-bold italic">Aktifkan minimal satu properti untuk mengelola kamar</p>
                </div>
              ) : (
                <div className="space-y-4 sm:space-y-6">
                  {properties.filter(p => p.isActive).map(prop => {
                    const propRooms = rooms.filter(r => r.propertyId === prop.id);
                    if (propRooms.length === 0) return null;
                    return (
                      <div key={prop.id} className="space-y-2">
                        <p className="text-[9px] sm:text-[10px] font-extrabold text-primary border-l-2 border-primary pl-2 mb-2">{prop.name.toUpperCase()}</p>
                        <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                          {propRooms.map(r => (
                            <div
                              key={r.id}
                              className={`flex items-center justify-between p-2 pl-3 rounded-xl border transition-all ${
                                r.isActive ? "bg-primary/10 border-primary" : "bg-surface border-outline opacity-70"
                              }`}
                            >
                              <div className="flex flex-col min-w-0">
                                <span className="font-bold text-[10px] sm:text-xs truncate">Kmr {r.roomNumber}</span>
                                <span className="text-[8px] opacity-50">Lantai {r.floor || 1}</span>
                              </div>
                              <button
                                disabled={isPending || (!r.isActive && activeRoomsCount >= 5)}
                                onClick={() => handleToggleRoom(r.id, r.isActive)}
                                className={`h-5 w-5 sm:h-6 sm:w-6 rounded-lg flex items-center justify-center transition-all shrink-0 ${
                                  r.isActive ? "bg-primary text-white" : "bg-muted text-muted-foreground hover:bg-muted-foreground hover:text-white"
                                }`}
                              >
                                {r.isActive ? (
                                  <HugeiconsIcon icon={CheckmarkCircle01Icon} size={10} />
                                ) : (
                                  <HugeiconsIcon icon={LockPasswordIcon} size={10} />
                                )}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </ScrollArea>

        <div className="shrink-0 mt-4">
          {!propertyOverBalance && !roomOverBalance && activePropertiesCount > 0 ? (
            <div className="pt-4 border-t animate-in fade-in slide-in-from-bottom-2">
              <Button
                className="w-full h-10 sm:h-12 rounded-full font-bold text-white shadow-xl"
                style={{ background: "var(--gradient-cta)" }}
                onClick={() => window.location.reload()}
              >
                Simpan & Buka Dashboard
              </Button>
            </div>
          ) : (
            <div className="pt-2 text-center">
              <p className="text-[9px] sm:text-[10px] font-bold text-red-500 uppercase tracking-wide">
                 Selesaikan pilihan Anda untuk melanjutkan ke dashboard
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
