"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { HugeiconsIcon } from "@hugeicons/react";
import { Calendar01Icon } from "@hugeicons/core-free-icons";

// ─── Duration Presets ──────────────────────────────────────────────────────────

export type DurationPreset = {
  label: string;
  short: string;
  days?: number;
  months?: number;
  years?: number;
};

export const LEASE_PRESETS: DurationPreset[] = [
  { label: "1 Hari", short: "1H", days: 1 },
  { label: "7 Hari", short: "7H", days: 7 },
  { label: "1 Bulan", short: "1Bl", months: 1 },
  { label: "3 Bulan", short: "3Bl", months: 3 },
  { label: "6 Bulan", short: "6Bl", months: 6 },
  { label: "1 Tahun", short: "1Th", years: 1 },
];

export function addDuration(fromDate: string, preset: DurationPreset): string {
  const d = new Date(fromDate);
  if (preset.days) d.setDate(d.getDate() + preset.days);
  if (preset.months) d.setMonth(d.getMonth() + preset.months);
  if (preset.years) d.setFullYear(d.getFullYear() + preset.years);
  return d.toISOString().split("T")[0];
}

// ─── Component ─────────────────────────────────────────────────────────────────

interface LeaseDurationSelectorProps {
  startDate: string;
  endDate: string;
  onStartChange: (val: string) => void;
  onEndChange: (val: string) => void;
  isPending?: boolean;
  showQuickActions?: boolean;
}

export function LeaseDurationSelector({
  startDate,
  endDate,
  onStartChange,
  onEndChange,
  isPending = false,
  showQuickActions = true,
}: LeaseDurationSelectorProps) {
  
  function handlePresetClick(preset: DurationPreset) {
    onEndChange(addDuration(startDate, preset));
  }

  function handleQuickAdjust(days: number) {
    const baseDateString = endDate || new Date().toISOString().split("T")[0];
    const baseDate = new Date(baseDateString);
    const newDate = new Date(baseDate);
    newDate.setDate(newDate.getDate() + days);
    onEndChange(newDate.toISOString().split("T")[0]);
  }

  const daysRemaining = (() => {
    if (!endDate) return null;
    const diff = new Date(endDate).getTime() - new Date().setHours(0,0,0,0);
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  })();

  return (
    <div className="space-y-4">
      {/* Header with Countdown */}
      <div className="flex items-center justify-between">
        <Label className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground uppercase tracking-wider">
          <HugeiconsIcon icon={Calendar01Icon} size={11} /> Durasi Sewa
        </Label>
        {daysRemaining !== null && (
          <span
            className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
              daysRemaining < 0 
                ? "bg-red-100 text-red-700" 
                : daysRemaining <= 7 
                  ? "bg-orange-100 text-orange-700" 
                  : "bg-green-100 text-green-700"
            }`}
          >
            {daysRemaining < 0 
              ? `Habis ${Math.abs(daysRemaining)} hari lalu` 
              : daysRemaining === 0 
                ? "Berakhir hari ini" 
                : `${daysRemaining} hari lagi`}
          </span>
        )}
      </div>

      {/* Preset Chips */}
      <div className="flex flex-wrap gap-1.5">
        {LEASE_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => handlePresetClick(p)}
            disabled={isPending}
            className="rounded-full px-3 py-1 text-[10px] font-bold border border-outline-variant bg-surface-container hover:scale-105 active:scale-95 transition-all"
          >
            {p.label}
          </button>
        ))}
        {(startDate || endDate) && (
          <button
            type="button"
            onClick={() => { onEndChange(""); }}
            disabled={isPending}
            className="rounded-full px-3 py-1 text-[10px] font-bold border border-outline-variant text-muted-foreground"
          >
            Reset
          </button>
        )}
      </div>

      {/* Date Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="selector-start" className="text-[10px] font-bold">Tanggal Masuk</Label>
          <Input
            id="selector-start"
            type="date"
            value={startDate}
            onChange={(e) => onStartChange(e.target.value)}
            disabled={isPending}
            className="h-9 text-xs"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="selector-end" className="text-[10px] font-bold">Tanggal Berakhir</Label>
          <Input
            id="selector-end"
            type="date"
            value={endDate}
            onChange={(e) => onEndChange(e.target.value)}
            disabled={isPending}
            className="h-9 text-xs"
            min={startDate}
          />
        </div>
      </div>

      {/* Quick Adjustments */}
      {showQuickActions && (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {[
            { label: "+30H",  days: 30,  color: "text-orange-700", bg: "bg-orange-50/50", border: "border-orange-200/50" },
            { label: "+90H",  days: 90,  color: "text-orange-700", bg: "bg-orange-50/50", border: "border-orange-200/50" },
            { label: "-30H",  days: -30, color: "text-red-700",    bg: "bg-red-50/50",    border: "border-red-200/50"    },
          ].map((adj) => (
            <button
              key={adj.label}
              type="button"
              onClick={() => handleQuickAdjust(adj.days)}
              disabled={isPending}
              className={`rounded-full px-2 py-0.5 text-[9px] font-bold border transition-colors hover:scale-105 active:scale-95 ${adj.color} ${adj.bg} ${adj.border}`}
            >
              {adj.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
