"use client";

import { useState, useTransition, useEffect } from "react";
import { moveTenant } from "@/lib/actions/room";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { Exchange01Icon, BedIcon } from "@hugeicons/core-free-icons";
import useSWR, { mutate as globalMutate } from "swr";
import { fetcher } from "@/lib/fetcher";

interface MoveTenantDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string; // The current room where tenant is
  roomNumber: string;
  propertyId: string;
}

export function MoveTenantDialog({
  open,
  onOpenChange,
  roomId,
  roomNumber,
  propertyId,
}: MoveTenantDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [selectedNewRoomId, setSelectedNewRoomId] = useState<string>("");

  // Fetch all rooms and filter available ones for this property on the fly
  const { data: allRooms = [] } = useSWR("/api/dashboard/rooms", fetcher);
  
  const availableRooms = allRooms.filter((r: any) => 
    r.propertyId === propertyId && 
    r.status === "available" && 
    r.id !== roomId &&
    r.isActive
  );

  useEffect(() => {
    if (!open) {
      setSelectedNewRoomId("");
      setError(null);
    }
  }, [open]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selectedNewRoomId) {
      setError("Silakan pilih kamar tujuan");
      return;
    }

    setError(null);
    const formData = new FormData();
    formData.set("oldRoomId", roomId);
    formData.set("newRoomId", selectedNewRoomId);

    // Get current tenant info from the old room for optimistic update
    const oldRoom = allRooms.find((r: any) => r.id === roomId);
    const tenantName = oldRoom?.tenantName || "Penghuni";

    // Close modal and reset immediately for instant feel
    onOpenChange(false);

    startTransition(async () => {
      try {
        // Correct SWR Pattern: Pass the promise to mutate
        // This ensures SWR waits for the server action to finish BEFORE revalidating
        await globalMutate(
          "/api/dashboard/rooms",
          moveTenant(formData), // The server action promise
          {
            optimisticData: (current: any[] | undefined) => {
              if (!current) return [];
              return current.map((r) => {
                if (r.id === roomId) {
                  return { ...r, status: "available", tenantName: null };
                }
                if (r.id === selectedNewRoomId) {
                  return { ...r, status: "occupied", tenantName: tenantName };
                }
                return r;
              });
            },
            rollbackOnError: true,
            revalidate: true,
            populateCache: false, // Don't use moveTenant result as the rooms list
          }
        );

        toast.success(`Penghuni Kamar ${roomNumber} berhasil dipindahkan`);
        globalMutate("/api/dashboard/stats");
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Gagal memindahkan penghuni");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
              style={{ background: "var(--gradient-cta)" }}
            >
              <HugeiconsIcon icon={Exchange01Icon} size={20} />
            </div>
            <div className="flex-1">
              <DialogTitle className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
                Pindahkan Penghuni
              </DialogTitle>
              <p className="text-[10px] opacity-60 uppercase tracking-widest font-bold">Relokasi penghuni ke kamar lain</p>
            </div>
          </div>
          <DialogDescription>
            Pindahkan penghuni dari Kamar <strong>{roomNumber}</strong> ke kamar yang tersedia di properti ini.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 space-y-5 py-6 custom-scrollbar">
            <div className="space-y-3">
              <div 
                className="flex items-center gap-4 p-4 rounded-2xl"
                style={{ background: "var(--surface-container-low)", border: "1px solid var(--outline-variant)" }}
              >
                <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                  <HugeiconsIcon icon={BedIcon} size={20} />
                </div>
                <div>
                  <p className="text-xs font-bold opacity-50">DARI KAMAR</p>
                  <p className="text-lg font-black text-orange-700">{roomNumber}</p>
                </div>
                <div className="flex-1 flex justify-center opacity-30">
                  <HugeiconsIcon icon={Exchange01Icon} size={24} />
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold opacity-50">KE KAMAR</p>
                  <p className="text-lg font-black text-primary">?</p>
                </div>
              </div>

              <div className="space-y-1.5 pt-2">
                <Label htmlFor="newRoomSelect">Pilih Kamar Tujuan <span className="text-red-500">*</span></Label>
                <Select value={selectedNewRoomId} onValueChange={setSelectedNewRoomId} required>
                  <SelectTrigger className="w-full font-medium">
                    <SelectValue placeholder="-- Ketuk untuk memilih --" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-none shadow-2xl">
                    {availableRooms.length === 0 ? (
                      <div className="p-4 text-center">
                        <p className="text-xs font-bold opacity-50">Tidak ada kamar tersedia di properti ini.</p>
                      </div>
                    ) : (
                      availableRooms.map((r: any) => (
                        <SelectItem key={r.id} value={r.id} className="rounded-lg my-0.5">
                          Kamar {r.roomNumber} (Lt. {r.floor || 1})
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
                {availableRooms.length === 0 && (
                  <p className="text-[10px] text-orange-600 font-bold mt-1">
                    ⚠ Semua kamar di properti ini sedang terisi atau dalam perbaikan.
                  </p>
                )}
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 rounded-lg bg-red-50 px-4 py-3 border border-red-100 font-bold">⚠ {error}</p>
            )}
          </div>

          <DialogFooter className="p-6 border-t shrink-0 gap-3 bg-surface" style={{ borderColor: "var(--outline-variant)" }}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="rounded-full">Batal</Button>
            <Button 
              type="submit" 
              disabled={isPending || !selectedNewRoomId} 
              className="rounded-full font-black text-white px-10 transition-all hover:scale-[1.02] shadow-lg" 
              style={{ background: "var(--gradient-cta)" }}
            >
              {isPending ? "Memindahkan..." : "Pindahkan Sekarang"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
