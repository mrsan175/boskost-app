"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Button } from "@/components/ui/button";

interface Props {
  properties: { id: string; name: string }[];
  activeStatus?: string;
  activeProperty?: string;
}

const STATUS_FILTERS = [
  { label: "Semua",     value: "" },
  { label: "Tersedia",  value: "available" },
  { label: "Terisi",    value: "occupied" },
  { label: "Perbaikan", value: "maintenance" },
];

const statusColor: Record<string, string> = {
  available:   "#22c55e",
  occupied:    "#C2410C",
  maintenance: "#f97316",
};

export function RoomsFilterBar({ properties, activeStatus, activeProperty }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) params.set(key, value);
      else params.delete(key);
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Status filter */}
      <div className="flex items-center gap-1.5 rounded-2xl p-1" style={{ background: "var(--surface-container)" }}>
        {STATUS_FILTERS.map((f) => {
          const isActive = (activeStatus ?? "") === f.value;
          return (
            <button
              key={f.value}
              type="button"
              onClick={() => updateParam("status", f.value)}
              className="rounded-xl px-3 py-1 text-xs font-bold transition-all cursor-pointer"
              style={{
                background: isActive
                  ? (f.value ? statusColor[f.value] : "var(--primary)")
                  : "transparent",
                color: isActive ? "white" : "var(--on-surface-variant)",
              }}
            >
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Property filter */}
      {properties.length > 1 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            type="button"
            onClick={() => updateParam("propertyId", "")}
            className="rounded-full px-3 py-1 text-xs font-bold border cursor-pointer transition-all"
            style={{
              background: !activeProperty ? "var(--primary)" : "transparent",
              color: !activeProperty ? "white" : "var(--on-surface-variant)",
              borderColor: !activeProperty ? "transparent" : "var(--outline-variant)",
            }}
          >
            Semua Properti
          </button>
          {properties.map((p) => {
            const isActive = activeProperty === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => updateParam("propertyId", p.id)}
                className="rounded-full px-3 py-1 text-xs font-bold border cursor-pointer transition-all max-w-[160px] truncate"
                style={{
                  background: isActive ? "rgba(194,65,12,0.1)" : "transparent",
                  color: isActive ? "var(--primary)" : "var(--on-surface-variant)",
                  borderColor: isActive ? "rgba(194,65,12,0.3)" : "var(--outline-variant)",
                }}
                title={p.name}
              >
                {p.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Clear filters */}
      {(activeStatus || activeProperty) && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.push(pathname)}
          className="text-xs rounded-full h-7 px-3"
          style={{ color: "var(--on-surface-variant)" }}
        >
          Reset Filter
        </Button>
      )}
    </div>
  );
}
