"use client";

import { useState, useTransition } from "react";
import { createRoom, createRoomsBulk } from "@/lib/actions/room";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, BedIcon, GroupIcon } from "@hugeicons/core-free-icons";

interface AddRoomDialogProps {
  propertyId: string;
  limitReached?: boolean;
}

export function AddRoomDialog({ propertyId, limitReached }: AddRoomDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isBulk, setIsBulk] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("propertyId", propertyId);
    
    startTransition(async () => {
      try {
        if (isBulk) {
          await createRoomsBulk(formData);
          toast.success("Banyak kamar berhasil ditambahkan sekaligus");
        } else {
          await createRoom(formData);
          toast.success("Kamar baru berhasil ditambahkan");
        }
        setOpen(false);
        (e.target as HTMLFormElement).reset();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        toast.error("Gagal menambahkan kamar");
      }
    });
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-full gap-2 font-bold text-white shrink-0 shadow-sm"
        style={{ background: "var(--gradient-cta)" }}
      >
        <HugeiconsIcon icon={Add01Icon} size={16} />
        <span className="hidden sm:inline">Tambah Kamar</span>
        <span className="sm:hidden">Tambah</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl max-h-[90vh] h-[640px] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <div className="flex items-center gap-3 mb-1">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ background: "var(--gradient-cta)" }}
              >
                <HugeiconsIcon icon={isBulk ? GroupIcon : BedIcon} size={20} />
              </div>
              <div className="flex-1">
                <DialogTitle className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
                  {isBulk ? "Tambah Banyak Kamar" : "Tambah Kamar Baru"}
                </DialogTitle>
                <p className="text-[10px] opacity-60">Properti ID: {propertyId.split('-')[0]}...</p>
              </div>
            </div>
            <DialogDescription>
              {limitReached 
                ? "Batas total kamar tercapai untuk akun FREE." 
                : isBulk 
                  ? "Tambahkan beberapa nomor kamar secara bersamaan." 
                  : "Isi detail kamar yang ingin ditambahkan ke properti ini."}
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-hidden">
            {limitReached ? (
              <div className="px-6 space-y-6 mt-4 pb-6 h-full flex flex-col justify-center text-center">
                <div 
                  className="rounded-2xl p-6 space-y-4" 
                  style={{ background: "rgba(194,65,12,0.05)", border: "1px dashed var(--primary)" }}
                >
                  <div className="flex justify-center">
                    <div className="h-14 w-14 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                      <HugeiconsIcon icon={BedIcon} size={28} />
                    </div>
                  </div>
                  <h4 className="font-bold text-xl" style={{ color: "var(--primary)" }}>Upgrade ke PRO</h4>
                  <p className="text-sm px-2 leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>
                    Kamu sudah memiliki batas maksimal kamar untuk akun FREE. Upgrade ke PRO untuk menambah kamar tanpa batasan!
                  </p>
                  <Button 
                    className="w-full rounded-full h-11 font-bold text-white shadow-md"
                    style={{ background: "var(--gradient-cta)" }}
                  >
                    🚀 Lihat Paket PRO
                  </Button>
                </div>
                <div className="mt-auto pb-4">
                  <Button variant="outline" onClick={() => setOpen(false)} className="w-full rounded-full h-11">Tutup</Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 space-y-5 pb-4">
                  {/* Mode Toggler */}
                  <div 
                    className="flex items-center justify-between p-3 rounded-2xl"
                    style={{ background: "var(--surface-container-low)", border: "1px solid var(--outline-variant)" }}
                  >
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon icon={GroupIcon} size={18} style={{ color: isBulk ? "var(--primary)" : "var(--on-surface-variant)" }} />
                      <span className="text-xs font-bold" style={{ color: "var(--on-surface)" }}>Mode Tambah Banyak</span>
                    </div>
                    <Switch checked={isBulk} onCheckedChange={setIsBulk} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className={isBulk ? "col-span-2 space-y-1.5" : "space-y-1.5"}>
                      <Label htmlFor={isBulk ? "roomNumbers" : "roomNumber"}>
                        {isBulk ? "Daftar Nomor Kamar" : "Nomor Kamar"} <span className="text-red-500">*</span>
                      </Label>
                      {isBulk ? (
                        <Input 
                          id="roomNumbers" 
                          name="roomNumbers" 
                          placeholder="Pisahkan dengan koma, contoh: 101, 102, 103" 
                          required 
                          disabled={isPending} 
                          className="rounded-xl" 
                        />
                      ) : (
                        <Input 
                          id="roomNumber" 
                          name="roomNumber" 
                          placeholder="Contoh: 101" 
                          required 
                          disabled={isPending} 
                          className="rounded-xl" 
                        />
                      )}
                      {isBulk && <p className="text-[10px] opacity-60">💡 Harga & Catatan akan disamakan ke semua nomor ini.</p>}
                    </div>
                    
                    {!isBulk && (
                      <div className="space-y-1.5">
                        <Label htmlFor="floor">Lantai</Label>
                        <Input id="floor" name="floor" type="number" min="1" defaultValue="1" disabled={isPending} className="rounded-xl" />
                      </div>
                    )}
                  </div>

                  {isBulk && (
                    <div className="space-y-1.5">
                      <Label htmlFor="floor">Lantai (untuk semua kamar di atas)</Label>
                      <Input id="floor" name="floor" type="number" min="1" defaultValue="1" disabled={isPending} className="rounded-xl" />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="pricePerMonth">Harga per Bulan (Rp)</Label>
                    <Input id="pricePerMonth" name="pricePerMonth" type="number" min="0" placeholder="Contoh: 1500000" disabled={isPending} className="rounded-xl" />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="notes">Catatan Fasilitas (Dipakai bersama)</Label>
                    <Textarea id="notes" name="notes" placeholder="Fasilitas yang sama untuk semua kamar ini..." rows={isBulk ? 3 : 4} disabled={isPending} className="rounded-2xl" />
                  </div>

                  {error && (
                    <p className="text-xs text-red-500 rounded-xl bg-red-50 px-3 py-2 border border-red-100">⚠ {error}</p>
                  )}
                </div>

                <DialogFooter className="p-6 border-t shrink-0 gap-2" style={{ borderColor: "var(--outline-variant)" }}>
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isPending} className="rounded-full px-6">Batal</Button>
                  <Button 
                    type="submit" 
                    disabled={isPending} 
                    className="rounded-full font-bold text-white px-8 transition-all hover:scale-[1.02]" 
                    style={{ background: "var(--gradient-cta)" }}
                  >
                    {isPending ? "Menyimpan..." : isBulk ? `Simpan Semua Kamar` : "Simpan Kamar"}
                  </Button>
                </DialogFooter>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
