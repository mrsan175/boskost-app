"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { HugeiconsIcon } from "@hugeicons/react";
import { ChartColumnIcon } from "@hugeicons/core-free-icons";

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(0)}rb`;
  return value.toLocaleString("id-ID");
}

export default function RevenueOverview() {
  const { data, error, isLoading } = useSWR("/api/dashboard/revenue", fetcher);

  const months = data?.months || [];
  const monthlyTotals = data?.monthlyTotals || [];
  const maxRevenue = Math.max(...monthlyTotals, 1);
  const isEmpty = monthlyTotals.every((v: number) => v === 0);

  if (error) return <div className="text-red-500 text-xs text-center border p-4 rounded-3xl">Gagal memuat pendapatan</div>;

  return (
    <Card className={`rounded-4xl border ${isLoading ? "animate-pulse" : ""}`} style={{ borderColor: "var(--outline-variant)" }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle style={{ fontFamily: "var(--font-display)" }}>Ringkasan Pendapatan</CardTitle>
          <CardDescription>Performa portofolio 6 bulan terakhir</CardDescription>
        </div>
        <Select defaultValue="6months">
          <SelectTrigger
            className="w-36 text-xs font-bold rounded-xl border-none"
            style={{ background: "var(--surface-container)" }}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="6months">6 Bulan Terakhir</SelectItem>
            <SelectItem value="year">Tahun Ini</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent>
        {isLoading ? (
             <div className="flex h-56 items-end justify-between gap-4 border-b pt-4 mb-4">
                  {[1,2,3,4,5,6].map(i => <div key={i} className="flex-1 bg-muted rounded-t-xl" style={{ height: '30%' }} />)}
             </div>
        ) : isEmpty ? (
          <div className="flex flex-col items-center justify-center h-56 gap-3 text-center">
            <HugeiconsIcon icon={ChartColumnIcon} size={40} style={{ color: "var(--on-surface-variant)", opacity: 0.3 }} />
            <p className="text-sm font-bold" style={{ color: "var(--on-surface-variant)" }}>
              Belum ada data pendapatan
            </p>
            <p className="text-xs" style={{ color: "var(--on-surface-variant)", opacity: 0.7 }}>
              Grafik akan muncul setelah ada pembayaran yang tercatat.
            </p>
          </div>
        ) : (
          <>
            <div
              className="flex h-56 items-end justify-between gap-4 border-b pt-4"
              style={{ borderColor: "var(--outline-variant)" }}
            >
              {months.map((m: any, i: number) => {
                const val = monthlyTotals[i];
                const heightPct = Math.max((val / maxRevenue) * 100, 4);
                const isLast = i === months.length - 1;
                return (
                  <Tooltip key={m.label}>
                    <TooltipTrigger
                      className="relative flex-1 rounded-t-xl cursor-pointer hover:brightness-110 transition-all border-none"
                      style={{
                        height: `${heightPct}%`,
                        background: isLast
                          ? "var(--gradient-cta)"
                          : `rgba(194,65,12,${0.1 + i * 0.12})`,
                      }}
                    />
                    <TooltipContent>
                      <p className="font-bold">
                        {m.label}: Rp {formatCurrency(val)}
                      </p>
                    </TooltipContent>
                  </Tooltip>
                );
              })}
            </div>
            <div
              className="mt-4 flex justify-between px-1 text-[11px] font-bold uppercase tracking-widest"
              style={{ color: "var(--on-surface-variant)" }}
            >
              {months.map((m: any) => <span key={m.label}>{m.label}</span>)}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
