"use client";

import { useState, useTransition } from "react";
import { updateRoom } from "@/lib/actions/room";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit01Icon, BedIcon } from "@hugeicons/core-free-icons";
import { mutate as globalMutate } from "swr";

interface EditRoomDialogProps {
  room: {
    id: string;
    roomNumber: string;
    floor: number | null;
    pricePerMonth: string | null;
    notes: string | null;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditRoomDialog({ room, open, onOpenChange }: EditRoomDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [priceValue, setPriceValue] = useState<string>(room.pricePerMonth || "");

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("roomId", room.id);
    
    // Optimistic Update for SWR
    const newData = {
      roomNumber: formData.get("roomNumber") as string,
      floor: parseInt(formData.get("floor") as string) || 1,
      pricePerMonth: formData.get("pricePerMonth") as string,
      notes: formData.get("notes") as string,
    };

    startTransition(async () => {
      try {
        // Optimistic UI
        await globalMutate(
          "/api/dashboard/rooms",
          async (current: any[] | undefined) => {
            if (!current) return [];
            return current.map((r) => (r.id === room.id ? { ...r, ...newData } : r));
          },
          {
            optimisticData: (current: any[] | undefined) => {
              if (!current) return [];
              return current.map((r) => (r.id === room.id ? { ...r, ...newData } : r));
            },
            rollbackOnError: true,
            revalidate: true,
          }
        );

        await updateRoom(formData);
        toast.success(`Kamar ${newData.roomNumber} berhasil diperbarui`);
        onOpenChange(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        toast.error("Gagal memperbarui kamar");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md rounded-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
              style={{ background: "var(--gradient-cta)" }}
            >
              <HugeiconsIcon icon={Edit01Icon} size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
                Edit Kamar {room.roomNumber}
              </DialogTitle>
              <p className="text-[10px] opacity-60 uppercase tracking-widest font-bold">Sesuaikan detail properti kamar ini</p>
            </div>
          </div>
          <DialogDescription>
            Ubah detail kamar seperti nomor, lantai, atau biaya sewa bulanan.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
          <div className="px-6 space-y-4 pb-4 mt-2">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="roomNumber">
                  Nomor Kamar <span className="text-red-500">*</span>
                </Label>
                <Input 
                  id="roomNumber" 
                  name="roomNumber" 
                  defaultValue={room.roomNumber}
                  required 
                  disabled={isPending} 
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="floor">Lantai</Label>
                <Input 
                  id="floor" 
                  name="floor" 
                  type="number" 
                  min="1" 
                  defaultValue={room.floor || 1} 
                  disabled={isPending} 
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="pricePerMonth">Biaya Sewa per Bulan</Label>
              <div className="relative">
                <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-40">Rp</div>
                <Input 
                  id="pricePerMonth" 
                  name="pricePerMonth" 
                  type="number" 
                  min="0" 
                  defaultValue={room.pricePerMonth || ""}
                  placeholder="1.500.000" 
                  disabled={isPending} 
                  onChange={(e) => setPriceValue(e.target.value)}
                  className="pl-8 text-primary font-bold" 
                />
              </div>
              {priceValue && (
                <p className="text-[10px] font-bold text-primary opacity-60 ml-1">
                  Format: Rp {Number(priceValue).toLocaleString("id-ID")}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="notes">Catatan Fasilitas</Label>
              <Textarea 
                id="notes" 
                name="notes" 
                defaultValue={room.notes || ""}
                placeholder="Misal: AC, Kamar Mandi Dalam, Kasur Queen Size..." 
                rows={3} 
                disabled={isPending} 
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 rounded-lg bg-red-50 px-3 py-2 border border-red-100 font-bold">⚠ {error}</p>
            )}
          </div>

          <DialogFooter className="p-6 border-t shrink-0 gap-2" style={{ borderColor: "var(--outline-variant)" }}>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isPending} className="rounded-full px-6">Batal</Button>
            <Button 
              type="submit" 
              disabled={isPending} 
              className="rounded-full font-bold text-white px-8 transition-all hover:scale-[1.02] shadow-md" 
              style={{ background: "var(--gradient-cta)" }}
            >
              {isPending ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
