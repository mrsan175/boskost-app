"use client";

import { useState, useTransition } from "react";
import { updateProperty, deleteProperty } from "@/lib/actions/property";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import { Building01Icon, Delete01Icon, Location01Icon } from "@hugeicons/core-free-icons";

interface EditPropertyDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  property: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
  };
}

export function EditPropertyDialog({ open, onOpenChange, property }: EditPropertyDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function close() {
    onOpenChange(false);
    setError(null);
    setConfirmDelete(false);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("propertyId", property.id);
    startTransition(async () => {
      try {
        await updateProperty(fd);
        close();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      }
    });
  }

  function handleDelete() {
    startTransition(async () => {
      try {
        await deleteProperty(property.id);
        close();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) close(); else onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md rounded-3xl">
        <DialogHeader>
          <div className="flex items-center gap-3 mb-1">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shrink-0"
              style={{ background: "var(--gradient-cta)" }}
            >
              <HugeiconsIcon icon={Building01Icon} size={20} />
            </div>
            <div>
              <DialogTitle className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
                Edit Properti
              </DialogTitle>
              <p className="text-xs" style={{ color: "var(--on-surface-variant)" }}>
                {property.name}
              </p>
            </div>
          </div>
          <DialogDescription>
            Perbarui informasi properti. Perubahan akan langsung berlaku.
          </DialogDescription>
        </DialogHeader>

        {/* ── EDIT FORM ── */}
        {!confirmDelete && (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="prop-name">
                Nama Properti <span className="text-red-500">*</span>
              </Label>
              <Input
                id="prop-name"
                name="name"
                defaultValue={property.name}
                placeholder="Contoh: Kos Putra Bahagia"
                required
                disabled={isPending}
                autoFocus
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="prop-city" className="flex items-center gap-1.5">
                  <HugeiconsIcon icon={Location01Icon} size={12} />
                  Kota
                </Label>
                <Input
                  id="prop-city"
                  name="city"
                  defaultValue={property.city ?? ""}
                  placeholder="Contoh: Jakarta"
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="prop-address">Alamat</Label>
                <Input
                  id="prop-address"
                  name="address"
                  defaultValue={property.address ?? ""}
                  placeholder="Jl. ..."
                  disabled={isPending}
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2 border border-red-100">
                ⚠ {error}
              </p>
            )}

            <Separator />

            <DialogFooter className="flex-row justify-between gap-2">
              {/* Delete trigger */}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setConfirmDelete(true)}
                disabled={isPending}
                className="gap-1.5 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50"
              >
                <HugeiconsIcon icon={Delete01Icon} size={14} />
                Hapus
              </Button>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={close}
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
                  {isPending ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </DialogFooter>
          </form>
        )}

        {/* ── DELETE CONFIRM ── */}
        {confirmDelete && (
          <div className="space-y-4">
            <div
              className="rounded-2xl p-4 space-y-2"
              style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}
            >
              <p className="text-sm font-bold text-red-600">⚠ Konfirmasi Hapus Properti</p>
              <p className="text-xs" style={{ color: "var(--on-surface-variant)" }}>
                Menghapus properti <strong>&quot;{property.name}&quot;</strong> akan menghapus{" "}
                <strong>semua kamar</strong> dan <strong>data sewa</strong> di dalamnya secara permanen.
                Tindakan ini tidak dapat dibatalkan.
              </p>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">⚠ {error}</p>
            )}

            <DialogFooter className="gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setConfirmDelete(false)}
                disabled={isPending}
                className="rounded-full"
              >
                Batal
              </Button>
              <Button
                type="button"
                onClick={handleDelete}
                disabled={isPending}
                className="rounded-full font-bold text-white bg-red-500 hover:bg-red-600"
              >
                {isPending ? "Menghapus..." : "Ya, Hapus Properti"}
              </Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
