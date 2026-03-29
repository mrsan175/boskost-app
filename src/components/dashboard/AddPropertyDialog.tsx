"use client";

import { useState, useTransition } from "react";
import { createProperty } from "@/lib/actions/property";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { Add01Icon, Building01Icon } from "@hugeicons/core-free-icons";

export function AddPropertyDialog({ limitReached }: { limitReached?: boolean }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      try {
        await createProperty(formData);
        toast.success("Properti baru berhasil ditambahkan");
        setOpen(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        toast.error("Gagal menambahkan properti");
      }
    });
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="shine-on-hover rounded-full px-6 gap-2 font-bold text-white shadow-lg"
        style={{ background: "var(--gradient-cta)" }}
      >
        <HugeiconsIcon icon={Add01Icon} size={16} />
        Tambah Properti
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-1">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white"
                style={{ background: "var(--gradient-cta)" }}
              >
                <HugeiconsIcon icon={Building01Icon} size={20} />
              </div>
              <DialogTitle className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
                Tambah Properti Baru
              </DialogTitle>
            </div>
            <DialogDescription>
              {limitReached 
                ? "Batas properti tercapai untuk akun FREE." 
                : "Isi informasi properti kos kamu di bawah ini."}
            </DialogDescription>
          </DialogHeader>

          {limitReached ? (
            <div className="space-y-6 mt-4">
              <div 
                className="rounded-2xl p-5 space-y-3 text-center" 
                style={{ background: "rgba(194,65,12,0.05)", border: "1px dashed var(--primary)" }}
              >
                <div className="flex justify-center">
                  <div className="h-12 w-12 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                    <HugeiconsIcon icon={Building01Icon} size={24} />
                  </div>
                </div>
                <h4 className="font-bold text-lg" style={{ color: "var(--primary)" }}>Upgrade ke PRO</h4>
                <p className="text-sm px-2" style={{ color: "var(--on-surface-variant)" }}>
                  Kamu sudah memiliki 1 properti. Upgrade ke akun PRO untuk mengelola properti tanpa batasan!
                </p>
                <Button 
                  className="w-full rounded-full h-11 font-bold text-white shadow-md shadow-orange-200"
                  style={{ background: "var(--gradient-cta)" }}
                >
                  Lihat Paket PRO
                </Button>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setOpen(false)} 
                  className="w-full rounded-full"
                >
                  Tutup
                </Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 mt-2">

            <div className="space-y-1.5">
              <Label htmlFor="name">Nama Properti <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                placeholder="Contoh: Kos Pak Budi"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="address">Alamat</Label>
              <Input
                id="address"
                name="address"
                placeholder="Contoh: Jl. Kenanga No. 12"
                disabled={isPending}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="city">Kota</Label>
              <Input
                id="city"
                name="city"
                placeholder="Contoh: Bandung"
                disabled={isPending}
              />
            </div>

            {error && (
              <p className="text-xs text-red-500 rounded-xl bg-red-50 px-3 py-2">{error}</p>
            )}

            <DialogFooter className="gap-2 mt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isPending}
                className="rounded-full"
              >
                Batal
              </Button>
              <Button
                type="submit"
                disabled={isPending}
                className="rounded-full font-bold text-white"
                style={{ background: "var(--gradient-cta)" }}
              >
                {isPending ? "Menyimpan..." : "Simpan Properti"}
              </Button>
            </DialogFooter>
          </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
