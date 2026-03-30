"use client";

import { useState, useTransition, useEffect } from "react";
import { createRoom, createRoomsBulk } from "@/lib/actions/room";
import { toast } from "sonner";
import { mutate } from "swr";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  properties?: { id: string; name: string }[];
}

export function AddRoomDialog({
  propertyId,
  limitReached,
  properties,
}: AddRoomDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [isBulk, setIsBulk] = useState(false);
  const [priceValue, setPriceValue] = useState<string>("");
  const [selectedPropertyId, setSelectedPropertyId] = useState(
    propertyId === "all" ? "" : propertyId,
  );

  // Sync state if propertyId prop changes
  useEffect(() => {
    if (propertyId !== "all") {
      setSelectedPropertyId(propertyId);
    }
  }, [propertyId]);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    // Use selectedPropertyId if it was "all"
    const finalPropId = propertyId === "all" ? selectedPropertyId : propertyId;
    if (!finalPropId) {
      setError("Silakan pilih properti terlebih dahulu");
      return;
    }
    formData.set("propertyId", finalPropId);

    startTransition(async () => {
      // Prepare optimistic values
      const price = (formData.get("pricePerMonth") as string)?.trim() || null;
      const notesVal = (formData.get("notes") as string)?.trim() || null;

      try {
        if (isBulk) {
          const roomNumbersRaw =
            (formData.get("roomNumbers") as string)?.trim() || "";
          const roomNumbers = roomNumbersRaw.split(/[,\s]+/).filter(Boolean);
          const optimisticRooms = roomNumbers.map((nr) => ({
            id: `temp-${Math.random().toString(36).slice(2)}`,
            roomNumber: nr,
            floor: parseInt((formData.get("floor") as string) || "1") || 1,
            status: "available",
            pricePerMonth: price,
            notes: notesVal,
            propertyId: finalPropId,
            propertyName:
              properties?.find((p) => p.id === finalPropId)?.name || "",
            isActive: true,
          }));

          // Optimistically add new rooms to SWR cache
          mutate(
            "/api/dashboard/rooms",
            (curr: any[] = []) => [...optimisticRooms, ...curr],
            false,
          );

          await createRoomsBulk(formData);

          // Revalidate to fetch authoritative server data
          await mutate("/api/dashboard/rooms");

          toast.success("Banyak kamar berhasil ditambahkan sekaligus");
        } else {
          const roomNumber =
            (formData.get("roomNumber") as string)?.trim() || "";
          const optimisticRoom = {
            id: `temp-${Math.random().toString(36).slice(2)}`,
            roomNumber,
            floor: parseInt((formData.get("floor") as string) || "1") || 1,
            status: "available",
            pricePerMonth: price,
            notes: notesVal,
            propertyId: finalPropId,
            propertyName:
              properties?.find((p) => p.id === finalPropId)?.name || "",
            isActive: true,
          };

          // Optimistically add the room
          mutate(
            "/api/dashboard/rooms",
            (curr: any[] = []) => [optimisticRoom, ...curr],
            false,
          );

          await createRoom(formData);

          // Revalidate to replace optimistic items with real server data
          await mutate("/api/dashboard/rooms");

          toast.success("Kamar baru berhasil ditambahkan");
        }

        setOpen(false);
        setPriceValue("");
        (e.target as HTMLFormElement).reset();
      } catch (err) {
        const message =
          err instanceof Error
            ? err.message
            : err && typeof err === "object" && "message" in err
              ? (err as any).message
              : String(err);

        setError(message || "Terjadi kesalahan");
        toast.error(message || "Gagal menambahkan kamar");

        // Rollback optimistic update by revalidating from server
        try {
          await mutate("/api/dashboard/rooms");
        } catch (e) {
          // ignore
        }
      }
    });
  }

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="rounded-full gap-2 font-bold text-white shrink-0 shadow-sm transition-all hover:scale-[1.02]"
        style={{ background: "var(--gradient-cta)" }}
      >
        <HugeiconsIcon icon={Add01Icon} size={16} />
        <span className="hidden sm:inline">Tambah Kamar</span>
        <span className="sm:hidden">Tambah</span>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md rounded-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <div className="flex items-center gap-3 mb-1">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white shadow-md"
                style={{ background: "var(--gradient-cta)" }}
              >
                <HugeiconsIcon icon={isBulk ? GroupIcon : BedIcon} size={20} />
              </div>
              <div className="flex-1">
                <DialogTitle
                  className="text-xl"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {isBulk ? "Tambah Banyak Kamar" : "Tambah Kamar Baru"}
                </DialogTitle>
                <p className="text-[10px] opacity-60 uppercase tracking-widest font-bold">
                  Input data ruangan properti Anda
                </p>
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

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
            {limitReached ? (
              <div className="flex-1 overflow-y-auto px-6 space-y-6 py-10 flex flex-col justify-center text-center">
                <div
                  className="rounded-3xl p-8 space-y-5"
                  style={{
                    background: "var(--surface-container-low)",
                    border: "1px dashed var(--outline-variant)",
                  }}
                >
                  <div className="flex justify-center">
                    <div
                      className="h-16 w-16 rounded-2xl flex items-center justify-center text-white shadow-lg"
                      style={{ background: "var(--gradient-cta)" }}
                    >
                      <HugeiconsIcon icon={BedIcon} size={32} />
                    </div>
                  </div>
                  <div>
                    <h4
                      className="font-bold text-2xl"
                      style={{
                        color: "var(--on-surface)",
                        fontFamily: "var(--font-display)",
                      }}
                    >
                      Batas Maksimal
                    </h4>
                    <p className="text-sm mt-2 leading-relaxed opacity-60">
                      Anda telah mencapai batas maksimal kamar untuk akun FREE.
                      Upgrade ke PRO untuk menambah kamar tanpa batasan!
                    </p>
                  </div>
                  <Button
                    className="w-full rounded-full h-12 font-bold text-white shadow-xl transition-all hover:scale-[1.02]"
                    style={{ background: "var(--gradient-cta)" }}
                  >
                    🚀 Upgrade ke PRO Sekarang
                  </Button>
                </div>
                <div className="pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setOpen(false)}
                    className="rounded-full h-11 border-outline-variant"
                  >
                    Tutup
                  </Button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="flex-1 flex flex-col min-h-0 overflow-hidden"
              >
                {/* Mode Toggler - Sticky/Fixed at top */}
                <div
                  className="px-6 py-4 border-b shrink-0 bg-surface/50 backdrop-blur-md"
                  style={{ borderColor: "var(--outline-variant)" }}
                >
                  <div
                    className="flex items-center justify-between p-3 px-4 rounded-2xl"
                    style={{
                      background: "var(--surface-container-low)",
                      border: "1px solid var(--outline-variant)",
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <HugeiconsIcon
                        icon={GroupIcon}
                        size={18}
                        style={{
                          color: isBulk
                            ? "var(--primary)"
                            : "var(--on-surface-variant)",
                        }}
                      />
                      <span
                        className="text-xs font-bold"
                        style={{ color: "var(--on-surface)" }}
                      >
                        Mode Tambah Banyak
                      </span>
                    </div>
                    <Switch checked={isBulk} onCheckedChange={setIsBulk} />
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto px-6 space-y-4 py-6 custom-scrollbar">
                  {propertyId === "all" && properties && (
                    <div className="space-y-1.5">
                      <Label htmlFor="propertySelect">
                        Pilih Properti <span className="text-red-500">*</span>
                      </Label>
                      <Select
                        value={selectedPropertyId}
                        onValueChange={setSelectedPropertyId}
                        required
                      >
                        <SelectTrigger className="w-full font-medium">
                          <SelectValue placeholder="-- Pilih Properti --" />
                        </SelectTrigger>
                        <SelectContent className="rounded-lg">
                          {properties.map((p) => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <div
                      className={
                        isBulk ? "col-span-2 space-y-1.5" : "space-y-1.5"
                      }
                    >
                      <Label htmlFor={isBulk ? "roomNumbers" : "roomNumber"}>
                        {isBulk ? "Daftar Nomor Kamar" : "Nomor Kamar"}{" "}
                        <span className="text-red-500">*</span>
                      </Label>
                      {isBulk ? (
                        <Input
                          id="roomNumbers"
                          name="roomNumbers"
                          placeholder="Misal: 101, 102, 103"
                          required
                          disabled={isPending}
                        />
                      ) : (
                        <Input
                          id="roomNumber"
                          name="roomNumber"
                          placeholder="Nomor Kamar"
                          required
                          disabled={isPending}
                        />
                      )}
                      {isBulk && (
                        <p className="text-[10px] font-bold opacity-60 text-primary ml-1">
                          💡 Harga & Catatan akan disamakan ke semua nomor ini.
                        </p>
                      )}
                    </div>

                    {!isBulk && (
                      <div className="space-y-1.5">
                        <Label htmlFor="floor">Lantai</Label>
                        <Input
                          id="floor"
                          name="floor"
                          type="number"
                          min="1"
                          defaultValue="1"
                          disabled={isPending}
                        />
                      </div>
                    )}
                  </div>

                  {isBulk && (
                    <div className="space-y-1.5">
                      <Label htmlFor="floor">
                        Lantai (untuk semua kamar di atas)
                      </Label>
                      <Input
                        id="floor"
                        name="floor"
                        type="number"
                        min="1"
                        defaultValue="1"
                        disabled={isPending}
                      />
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <Label htmlFor="pricePerMonth">Biaya Sewa per Bulan</Label>
                    <div className="relative">
                      <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[10px] font-bold opacity-40">
                        Rp
                      </div>
                      <Input
                        id="pricePerMonth"
                        name="pricePerMonth"
                        type="number"
                        min="0"
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
                    <Label htmlFor="notes">
                      Catatan Fasilitas {isBulk ? "(Dipakai bersama)" : ""}
                    </Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      placeholder="AC, Kamar Mandi Dalam, Kasur Queen Size..."
                      rows={isBulk ? 3 : 4}
                      disabled={isPending}
                    />
                  </div>

                  {error && (
                    <p className="text-xs text-red-500 rounded-lg bg-red-50 px-4 py-3 border border-red-100 font-bold">
                      ⚠ {error}
                    </p>
                  )}
                </div>

                <DialogFooter
                  className="p-6 border-t shrink-0 gap-3 bg-surface"
                  style={{ borderColor: "var(--outline-variant)" }}
                >
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
                    className="rounded-full font-black text-white px-10 transition-all hover:scale-[1.02] shadow-lg"
                    style={{ background: "var(--gradient-cta)" }}
                  >
                    {isPending
                      ? "Menyimpan..."
                      : isBulk
                        ? `Simpan Semua`
                        : "Simpan Kamar"}
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
