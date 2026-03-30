"use client";

import { useState, useTransition, useEffect } from "react";
import { setRoomOccupied } from "@/lib/actions/room";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { HugeiconsIcon } from "@hugeicons/react";
import { User02Icon, Calendar01Icon } from "@hugeicons/core-free-icons";
import { mutate as globalMutate } from "swr";

import {
  LeaseDurationSelector,
  LEASE_PRESETS as PRESETS,
  addDuration,
  type DurationPreset,
} from "@/components/dashboard/LeaseDurationSelector";

function calcDurationLabel(start: string, end: string): string | null {
  if (!start || !end) return null;
  const ms = new Date(end).getTime() - new Date(start).getTime();
  if (ms < 0) return null;
  const days = Math.round(ms / 86_400_000);
  if (days === 0) return "Hari ini";
  if (days < 30) return `${days} hari`;
  const months = Math.round(days / 30.44);
  if (months < 12) return `${months} bulan`;
  const years = (months / 12).toFixed(1).replace(".0", "");
  return `${years} tahun`;
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface SetOccupancyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomId: string;
  roomNumber: string;
  initialData?: {
    tenantName?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  };
}

export function SetOccupancyDialog({
  open,
  onOpenChange,
  roomId,
  roomNumber,
  initialData,
}: SetOccupancyDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const today = new Date().toISOString().split("T")[0];

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  // Use state with initial values
  const [tenantName, setTenantName] = useState("");

  // Populate when opening
  useEffect(() => {
    if (open) {
      if (initialData) {
        setTenantName(initialData.tenantName ?? "");
        setStartDate(initialData.startDate ?? today);
        setEndDate(initialData.endDate ?? "");
      } else {
        setTenantName("");
        setStartDate(today);
        setEndDate("");
      }
      setSelectedPreset(null);
    }
  }, [open, initialData, today]);

  function handlePresetClick(preset: DurationPreset) {
    const newEnd = addDuration(startDate, preset);
    setEndDate(newEnd);
    setSelectedPreset(preset.label);
  }

  function handleStartChange(val: string) {
    setStartDate(val);
    // If a preset is active, recalculate end date based on new start
    if (selectedPreset) {
      const preset = PRESETS.find((p) => p.label === selectedPreset);
      if (preset) setEndDate(addDuration(val, preset));
    }
  }

  function handleEndChange(val: string) {
    setEndDate(val);
    setSelectedPreset(null); // Manual edit clears preset
  }

  function handleReset() {
    setStartDate(today);
    setEndDate("");
    setSelectedPreset(null);
    setError(null);
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("roomId", roomId);
    formData.set("startDate", startDate);
    formData.set("endDate", endDate);
    // Close modal and reset immediately for instant feel
    onOpenChange(false);
    handleReset();

    startTransition(async () => {
      try {
        // Correct SWR Pattern: Pass the promise to mutate
        // This ensures SWR waits for the server action to finish BEFORE revalidating
        await globalMutate(
          "/api/dashboard/rooms",
          setRoomOccupied(formData), // The server action promise
          {
            optimisticData: (current: any[] | undefined) => {
              if (!current) return [];
              return current.map((r) => {
                if (r.id === roomId) {
                  return {
                    ...r,
                    status: "occupied",
                    tenantName: tenantName,
                    startDate: startDate,
                    endDate: endDate || null,
                  };
                }
                return r;
              });
            },
            rollbackOnError: true,
            revalidate: true,
            populateCache: false, // Don't use server action result as the rooms list
          },
        );

        toast.success("Penyewa berhasil ditetapkan ke kamar");
        globalMutate("/api/dashboard/stats");
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Gagal menetapkan penyewa",
        );
      }
    });
  }

  const durationLabel = calcDurationLabel(startDate, endDate);

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        onOpenChange(v);
        if (!v) handleReset();
      }}
    >
      <DialogContent className="sm:max-w-lg rounded-3xl max-h-[90vh] h-[640px] flex flex-col p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2 shrink-0">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl text-white shrink-0"
              style={{ background: "var(--gradient-cta)" }}
            >
              <HugeiconsIcon icon={User02Icon} size={20} />
            </div>
            <div>
              <DialogTitle
                className="text-xl"
                style={{ fontFamily: "var(--font-display)" }}
              >
                {initialData?.tenantName
                  ? "Ubah Data Sewa"
                  : "Tambahkan Penyewa"}
              </DialogTitle>
              <p
                className="text-xs"
                style={{ color: "var(--on-surface-variant)" }}
              >
                Kamar {roomNumber}
              </p>
            </div>
          </div>
          <DialogDescription>
            Isi nama penyewa dan pilih durasi sewa, atau atur tanggal secara
            manual.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col h-full overflow-hidden"
        >
          <div className="flex-1 overflow-y-auto px-6 space-y-5">
            {/* Tenant name */}
            <div className="space-y-1.5">
              <Label htmlFor="tenantName">
                Nama Penyewa <span className="text-red-500">*</span>
              </Label>
              <Input
                id="tenantName"
                name="tenantName"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="Contoh: Budi Santoso"
                required
                disabled={isPending}
                autoFocus
              />
            </div>
            {/* Contact Info */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="tenantPhone">No. WhatsApp</Label>
                <Input
                  id="tenantPhone"
                  name="tenantPhone"
                  placeholder="0812..."
                  disabled={isPending}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="tenantEmail">Email</Label>
                <Input
                  id="tenantEmail"
                  name="tenantEmail"
                  type="email"
                  placeholder="budi@email.com"
                  disabled={isPending}
                />
              </div>
            </div>

            {/* Reusable Duration Selector */}
            <LeaseDurationSelector
              startDate={startDate}
              endDate={endDate}
              onStartChange={handleStartChange}
              onEndChange={handleEndChange}
              isPending={isPending}
              showQuickActions={false}
            />
            <input type="hidden" name="startDate" value={startDate} />
            <input type="hidden" name="endDate" value={endDate} />

            {/* Duration summary */}
            {durationLabel && (
              <div
                className="flex items-center justify-between rounded-2xl px-4 py-3"
                style={{
                  background: "rgba(194,65,12,0.06)",
                  border: "1px solid rgba(194,65,12,0.2)",
                }}
              >
                <div className="flex items-center gap-2">
                  <HugeiconsIcon
                    icon={Calendar01Icon}
                    size={16}
                    style={{ color: "var(--primary)" }}
                  />
                  <div>
                    <p
                      className="text-xs font-bold"
                      style={{ color: "var(--primary)" }}
                    >
                      Durasi Sewa: {durationLabel}
                    </p>
                    <p
                      className="text-[10px]"
                      style={{ color: "var(--on-surface-variant)" }}
                    >
                      {new Date(startDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                      {" → "}
                      {new Date(endDate).toLocaleDateString("id-ID", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                </div>
                {selectedPreset && (
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-extrabold text-white"
                    style={{ background: "var(--gradient-cta)" }}
                  >
                    {selectedPreset}
                  </span>
                )}
              </div>
            )}

            {/* No end date note */}
            {!endDate && (
              <p
                className="text-[10px]"
                style={{ color: "var(--on-surface-variant)" }}
              >
                💡 Tidak memilih tanggal berakhir artinya sewa tanpa batas
                waktu.
              </p>
            )}

            {error && (
              <p className="text-xs text-red-500 rounded-xl bg-red-50 px-3 py-2 border border-red-100">
                ⚠ {error}
              </p>
            )}
          </div>

          <DialogFooter
            className="p-6 border-t shrink-0 gap-2"
            style={{ borderColor: "var(--outline-variant)" }}
          >
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                onOpenChange(false);
                handleReset();
              }}
              disabled={isPending}
              className="rounded-full"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="rounded-full font-bold text-white px-6"
              style={{ background: "var(--gradient-cta)" }}
            >
              {isPending
                ? "Menyimpan..."
                : initialData?.tenantName
                  ? "Simpan Perubahan"
                  : "Tambahkan Penyewa"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
