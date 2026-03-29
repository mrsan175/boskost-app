"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Activity01Icon } from "@hugeicons/core-free-icons";

const activityStyle: Record<string, { dotBg: string; dotColor: string; showAction: boolean; actionLabel?: string }> = {
  payment_received:  { dotBg: "rgba(34,197,94,0.15)",  dotColor: "#22c55e", showAction: false },
  tenant_registered: { dotBg: "rgba(59,130,246,0.15)",  dotColor: "#3b82f6", showAction: false },
  maintenance_request: { dotBg: "rgba(249,115,22,0.15)", dotColor: "#f97316", showAction: true, actionLabel: "Tangani" },
  room_vacated:      { dotBg: "rgba(168,85,247,0.15)",  dotColor: "#a855f7", showAction: false },
  property_added:    { dotBg: "rgba(194,65,12,0.12)",   dotColor: "var(--primary)", showAction: false },
  other:             { dotBg: "rgba(100,116,139,0.15)", dotColor: "#94a3b8", showAction: false },
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMin / 60);
  const diffDays = Math.floor(diffHrs / 24);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHrs < 24) return `${diffHrs} jam lalu`;
  if (diffDays === 1) return "Kemarin";
  if (diffDays < 7) return `${diffDays} hari lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export default function ActivityFeed() {
  const { data: logs, error, isLoading } = useSWR("/api/dashboard/activities", fetcher);

  return (
    <Card
      className="rounded-4xl border flex flex-col"
      style={{ background: "var(--surface-container)", borderColor: "var(--outline-variant)" }}
    >
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2" style={{ fontFamily: "var(--font-display)" }}>
          <span style={{ color: "var(--primary)" }}>⏱</span>
          Aktivitas Terbaru
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 px-6">
        {isLoading ? (
          <div className="space-y-6 py-4 animate-pulse">
             {[1,2,3].map(i => (
                <div key={i} className="flex gap-4">
                  <div className="w-5 h-5 rounded-full bg-muted shrink-0" />
                  <div className="space-y-2 flex-1">
                    <div className="h-2 w-16 bg-muted rounded" />
                    <div className="h-4 w-32 bg-muted rounded" />
                  </div>
                </div>
             ))}
          </div>
        ) : error || !logs || logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center">
            <HugeiconsIcon icon={Activity01Icon} size={40} style={{ color: "var(--on-surface-variant)", opacity: 0.3 }} />
            <p className="text-sm font-bold" style={{ color: "var(--on-surface-variant)" }}>
              {error ? "Gagal memuat aktivitas" : "Belum ada aktivitas"}
            </p>
            {!error && (
              <p className="text-xs" style={{ color: "var(--on-surface-variant)", opacity: 0.7 }}>
                Aktivitas akan muncul setelah kamu menambahkan penyewa atau menerima pembayaran.
              </p>
            )}
          </div>
        ) : (
          <div className="relative mt-2 pr-2" style={{ maxHeight: "460px", overflowY: "auto" }}>
            <div className="relative space-y-7 pb-4">
              {/* Timeline line */}
              <div
                className="absolute left-4 top-2 bottom-0 w-0.5"
                style={{ background: "var(--outline-variant)" }}
              />
              {logs.map((item: any) => {
                const style = activityStyle[item.type] ?? activityStyle.other;
                return (
                  <div key={item.id} className="relative pl-12">
                    {/* Dot */}
                    <div
                      className="absolute left-1.5 top-1 flex h-5 w-5 items-center justify-center rounded-full border-4"
                      style={{ background: style.dotBg, borderColor: "var(--surface-container)" }}
                    >
                      <div className="h-1.5 w-1.5 rounded-full" style={{ background: style.dotColor }} />
                    </div>
                    <p
                      className="mb-0.5 text-[10px] font-bold uppercase tracking-wide"
                      style={{ color: "var(--on-surface-variant)" }}
                    >
                      {formatRelativeTime(item.createdAt)}
                    </p>
                    <p className="text-sm font-bold" style={{ color: "var(--on-surface)" }}>
                      {item.title}
                    </p>
                    {item.description && (
                      <p className="mt-0.5 text-xs leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>
                        {item.description}
                      </p>
                    )}
                    {style.showAction && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2 h-6 rounded-full px-3 text-[10px] font-extrabold"
                        style={{ color: "var(--primary)", borderColor: "var(--outline-variant)" }}
                      >
                        {style.actionLabel}
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Separator className="my-4" />
        <Button
          variant="secondary"
          className="w-full rounded-2xl mb-6"
          style={{ background: "var(--surface-container-highest)", color: "var(--on-surface-variant)" }}
        >
          Lihat Semua Aktivitas
        </Button>
      </CardContent>
    </Card>
  );
}
