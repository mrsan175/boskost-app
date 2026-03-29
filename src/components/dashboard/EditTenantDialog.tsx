"use client";

import { useState, useTransition, useEffect } from "react";
import { mutate as globalMutate } from "swr";
import { updateTenant, moveTenantToRoom, deleteTenant } from "@/lib/actions/tenant";
import { toast } from "sonner";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  User02Icon, Delete01Icon, ArrowLeftRightIcon
} from "@hugeicons/core-free-icons";
import { LeaseDurationSelector, LEASE_PRESETS, addDuration } from "@/components/dashboard/LeaseDurationSelector";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface AvailableRoom {
  roomId: string;
  roomNumber: string;
  floor: number | null;
  propertyId: string;
  propertyName: string;
}

interface EditTenantDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tenant: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    roomNumber?: string | null;
    propertyName?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  };
  availableRooms: AvailableRoom[];
}

// ─── Component ─────────────────────────────────────────────────────────────────

export function EditTenantDialog({
  open,
  onOpenChange,
  tenant,
  availableRooms,
}: EditTenantDialogProps) {
  const [tab, setTab] = useState<"info" | "move">("info");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Move room state
  const today = new Date().toISOString().split("T")[0];
  const [selectedRoomId, setSelectedRoomId] = useState("");
  const [moveStart, setMoveStart] = useState(today);
  const [moveEnd, setMoveEnd] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Info tab extension state
  const [infoEndDate, setInfoEndDate] = useState(tenant.endDate || "");

  // Sync state when dialog opens or tenant changes
  useEffect(() => {
    if (open) setInfoEndDate(tenant.endDate || "");
  }, [open, tenant.id]);

  function handleMoveStartChange(val: string) {
    setMoveStart(val);
    if (selectedPreset) {
      const p = LEASE_PRESETS.find((x) => x.label === selectedPreset);
      if (p) setMoveEnd(addDuration(val, p));
    }
  }

  function close() {
    onOpenChange(false);
    setTab("info");
    setError(null);
    setSelectedRoomId("");
    setMoveEnd("");
    setSelectedPreset(null);
  }

  // ─── Submit: Update Info ────────────────────────────────────────────────────

  function handleInfoSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("tenantId", tenant.id);
    fd.set("startDate", tenant.startDate || today);
    fd.set("endDate", infoEndDate);

    const updatedName = fd.get("name") as string;
    const updatedEmail = fd.get("email") as string;
    const updatedPhone = fd.get("phone") as string;

    startTransition(async () => {
      try {
        // Optimistic Update
        await globalMutate(
          "/api/dashboard/tenants",
          async () => {
             await updateTenant(fd);
             return undefined; // Revalidate after
          },
          {
            optimisticData: (current: any[] | undefined) => {
              if (!current) return [];
              return current.map((t) =>
                t.id === tenant.id ? { ...t, tenantName: updatedName, email: updatedEmail, phone: updatedPhone } : t
              );
            },
            rollbackOnError: true,
            revalidate: true,
            populateCache: false,
          }
        );
        toast.success("Informasi penyewa berhasil diperbarui");
        close();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        toast.error("Gagal memperbarui informasi penyewa");
      }
    });
  }

  // ─── Submit: Move Room ──────────────────────────────────────────────────────

  function handleMoveSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const fd = new FormData();
    fd.set("tenantId", tenant.id);
    fd.set("newRoomId", selectedRoomId);
    fd.set("startDate", moveStart);
    fd.set("endDate", moveEnd);
    startTransition(async () => {
      try {
        await moveTenantToRoom(fd);
        toast.success("Penyewa berhasil dipindahkan ke kamar baru");
        close();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        toast.error("Gagal memindahkan penyewa");
      }
    });
  }

  // ─── Delete ────────────────────────────────────────────────────────────────
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  async function handleDelete() {
    startTransition(async () => {
      try {
        // Optimistic Update
        await globalMutate(
          "/api/dashboard/tenants",
          async () => {
            await deleteTenant(tenant.id);
            return undefined;
          },
          {
            optimisticData: (current: any[] | undefined) => {
              if (!current) return [];
              return current.filter((t) => t.id !== tenant.id);
            },
            rollbackOnError: true,
            revalidate: true,
            populateCache: false,
          }
        );
        toast.success("Data penyewa berhasil dihapus");
        setShowDeleteConfirm(false);
        await globalMutate("/api/dashboard/stats");
        close();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Terjadi kesalahan");
        toast.error("Gagal menghapus data penyewa");
      }
    });
  }

  // Group available rooms by property for display
  const roomsByProperty = availableRooms.reduce<Record<string, AvailableRoom[]>>((acc, r) => {
    if (!acc[r.propertyId]) acc[r.propertyId] = [];
    acc[r.propertyId].push(r);
    return acc;
  }, {});

  return (
    <>
      <Dialog open={open} onOpenChange={(v) => { if (!v) close(); else onOpenChange(v); }}>
        <DialogContent className="sm:max-w-md rounded-3xl max-h-[90vh] h-[680px] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 shrink-0">
            <div className="flex items-center gap-3 mb-1">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-white shrink-0"
                style={{ background: "var(--gradient-cta)" }}
              >
                <HugeiconsIcon icon={tab === "info" ? User02Icon : ArrowLeftRightIcon} size={20} />
              </div>
              <div>
                <DialogTitle className="text-xl" style={{ fontFamily: "var(--font-display)" }}>
                  {tab === "info" ? "Edit Penyewa" : "Pindah Kamar"}
                </DialogTitle>
                <p className="text-xs" style={{ color: "var(--on-surface-variant)" }}>
                  {tenant.name}
                </p>
              </div>
            </div>
            <DialogDescription>
              {tab === "info"
                ? "Perbarui informasi data penyewa."
                : "Pilih kamar baru untuk penyewa ini."}
            </DialogDescription>
          </DialogHeader>

          {/* Tab selector */}
          <div className="px-6 pb-4 shrink-0">
            <div
              className="flex rounded-2xl p-1 gap-1"
              style={{ background: "var(--surface-container)" }}
            >
              {(["info", "move"] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { setTab(t); setError(null); }}
                  className="flex-1 rounded-xl py-1.5 text-xs font-bold transition-all"
                  style={{
                    background: tab === t ? "var(--primary)" : "transparent",
                    color: tab === t ? "white" : "var(--on-surface-variant)",
                  }}
                >
                  {t === "info" ? "Edit Info" : "Pindah Kamar"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            {tab === "info" && (
              <form onSubmit={handleInfoSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="info-name">Nama <span className="text-red-500">*</span></Label>
                    <Input id="info-name" name="name" defaultValue={tenant.name} required disabled={isPending} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="info-email">Email</Label>
                    <Input id="info-email" name="email" type="email" defaultValue={tenant.email ?? ""} placeholder="email@contoh.com" disabled={isPending} />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="info-phone">No. HP</Label>
                    <Input id="info-phone" name="phone" type="tel" defaultValue={tenant.phone ?? ""} placeholder="08xxxxxxxxxx" disabled={isPending} />
                  </div>
                  {tenant.roomNumber && (
                    <div className="pt-2 border-t" style={{ borderColor: "var(--outline-variant)" }}>
                      <LeaseDurationSelector
                        startDate={tenant.startDate || today}
                        endDate={infoEndDate}
                        onStartChange={() => { }}
                        onEndChange={setInfoEndDate}
                        isPending={isPending}
                        showQuickActions={true}
                      />
                      <div className="flex items-center gap-2 rounded-2xl px-4 py-2 mt-4 text-[10px]" style={{ background: "rgba(194,65,12,0.06)", border: "1px solid rgba(194,65,12,0.15)" }}>
                        <span style={{ color: "var(--on-surface-variant)" }}>
                          Saat ini di <strong style={{ color: "var(--primary)" }}>Kamar {tenant.roomNumber}</strong>{tenant.propertyName ? ` • ${tenant.propertyName}` : ""}
                        </span>
                      </div>
                    </div>
                  )}
                  {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">⚠ {error}</p>}
                </div>
                <div className="p-6 border-t shrink-0 flex items-center justify-between gap-2" style={{ borderColor: "var(--outline-variant)" }}>
                  <Button type="button" variant="ghost" size="sm" onClick={() => setShowDeleteConfirm(true)} disabled={isPending} className="text-red-500 hover:text-red-600 hover:bg-red-50 gap-1.5 rounded-full">
                    <HugeiconsIcon icon={Delete01Icon} size={14} /> Hapus
                  </Button>
                  <div className="flex gap-2">
                    <Button type="button" variant="outline" onClick={close} disabled={isPending} className="rounded-full">Batal</Button>
                    <Button type="submit" disabled={isPending} className="rounded-full font-bold text-white px-6" style={{ background: "var(--gradient-cta)" }}>{isPending ? "Menyimpan..." : "Simpan"}</Button>
                  </div>
                </div>
              </form>
            )}
            {tab === "move" && (
              <form onSubmit={handleMoveSubmit} className="flex flex-col h-full overflow-hidden">
                <div className="flex-1 overflow-y-auto px-6 space-y-4 pb-4">
                  <div className="space-y-1.5">
                    <Label>Kamar Tujuan <span className="text-red-500">*</span></Label>
                    {availableRooms.length === 0 ? (
                      <p className="text-xs italic" style={{ color: "var(--on-surface-variant)" }}>Tidak ada kamar tersedia.</p>
                    ) : (
                      <Select value={selectedRoomId} onValueChange={setSelectedRoomId} required>
                        <SelectTrigger className="rounded-xl"><SelectValue placeholder="Pilih kamar..." /></SelectTrigger>
                        <SelectContent>
                          {Object.entries(roomsByProperty).map(([propId, propRooms]) => (
                            <div key={propId}>
                              <p className="px-2 py-1.5 text-[10px] font-bold uppercase tracking-wider" style={{ color: "var(--on-surface-variant)" }}>{propRooms[0].propertyName}</p>
                              {propRooms.map((r) => (
                                <SelectItem key={r.roomId} value={r.roomId} className="ml-2">Kamar {r.roomNumber}{r.floor ? ` – Lantai ${r.floor}` : ""}</SelectItem>
                              ))}
                            </div>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  </div>
                  <LeaseDurationSelector startDate={moveStart} endDate={moveEnd} onStartChange={handleMoveStartChange} onEndChange={setMoveEnd} isPending={isPending} showQuickActions={false} />
                  {error && <p className="text-xs text-red-500 bg-red-50 rounded-xl px-3 py-2">⚠ {error}</p>}
                </div>
                <div className="p-6 border-t shrink-0 flex justify-end gap-2" style={{ borderColor: "var(--outline-variant)" }}>
                  <Button type="button" variant="outline" onClick={close} disabled={isPending} className="rounded-full">Batal</Button>
                  <Button type="submit" disabled={isPending || !selectedRoomId} className="rounded-full font-bold text-white px-6" style={{ background: "var(--gradient-cta)" }}>{isPending ? "Memindahkan..." : "Pindahkan Kamar"}</Button>
                </div>
              </form>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showDeleteConfirm}
        onOpenChange={setShowDeleteConfirm}
        onConfirm={handleDelete}
        title="Hapus Penyewa?"
        description={`Apakah Anda yakin ingin menghapus data penyewa "${tenant.name}"? Semua data pembayaran dan riwayat penyewa ini akan dihapus secara permanen.`}
        confirmText="Ya, Hapus"
        variant="destructive"
      />
    </>
  );
}
