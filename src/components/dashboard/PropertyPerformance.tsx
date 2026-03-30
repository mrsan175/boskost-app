"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, Building01Icon } from "@hugeicons/core-free-icons";

export default function PropertyPerformance() {
  const {
    data: propertyData,
    error,
    isLoading,
  } = useSWR("/api/dashboard/property-performance", fetcher);

  if (error)
    return (
      <div className="text-red-500 text-xs">Gagal memuat performa properti</div>
    );

  if (!isLoading && (!propertyData || propertyData.length === 0)) {
    return (
      <Card
        className="rounded-4xl border"
        style={{
          background: "var(--surface-container-low)",
          borderColor: "var(--outline-variant)",
        }}
      >
        <CardHeader>
          <CardTitle style={{ fontFamily: "var(--font-display)" }}>
            Performa Properti
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-center">
            <HugeiconsIcon
              icon={Building01Icon}
              size={40}
              style={{ color: "var(--on-surface-variant)", opacity: 0.3 }}
            />
            <p
              className="text-sm font-bold"
              style={{ color: "var(--on-surface-variant)" }}
            >
              Belum ada properti
            </p>
            <p
              className="text-xs"
              style={{ color: "var(--on-surface-variant)", opacity: 0.7 }}
            >
              Tambahkan properti pertama kamu untuk memantau performanya.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      className={`rounded-4xl border ${isLoading ? "animate-pulse" : ""}`}
      style={{
        background: "var(--surface-container-low)",
        borderColor: "var(--outline-variant)",
      }}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <CardTitle style={{ fontFamily: "var(--font-display)" }}>
          Performa Properti
        </CardTitle>
        <Link
          href="/dashboard/properties"
          className="flex items-center gap-1 text-xs font-bold hover:underline"
          style={{ color: "var(--primary)" }}
        >
          Lihat Semua <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
        </Link>
      </CardHeader>
      <CardContent className="space-y-4">
        {isLoading
          ? [1, 2].map((i) => (
              <div key={i} className="h-24 bg-muted rounded-3xl" />
            ))
          : propertyData.map((p: any) => (
              <Card
                key={p.id}
                className="flex flex-row items-center justify-between p-4 transition-all hover:-translate-y-0.5 hover:shadow-sm cursor-pointer border"
                style={{ borderColor: "var(--outline-variant)" }}
              >
                <div className="flex items-center gap-4">
                  <div
                    className="h-14 w-14 shrink-0 rounded-xl flex items-center justify-center text-2xl"
                    style={{ background: "var(--surface-container-highest)" }}
                  >
                    🏠
                  </div>
                  <div>
                    <p
                      className="font-bold text-sm"
                      style={{ color: "var(--on-surface)" }}
                    >
                      {p.name}
                    </p>
                    <p
                      className="text-xs"
                      style={{ color: "var(--on-surface-variant)" }}
                    >
                      {p.total} Kamar{p.address ? ` • ${p.address}` : ""}
                    </p>
                    <Progress
                      value={p.occupancyRate}
                      className="mt-1.5 h-1 w-28"
                    />
                  </div>
                </div>
                <div className="flex gap-6 text-center">
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase mb-1"
                      style={{ color: "var(--on-surface-variant)" }}
                    >
                      Penghuni
                    </p>
                    <p
                      className="text-sm font-extrabold"
                      style={{ color: "var(--primary)" }}
                    >
                      {p.occupancyRate}%
                    </p>
                  </div>
                  <Separator
                    orientation="vertical"
                    className="h-10 self-center"
                  />
                  <div>
                    <p
                      className="text-[10px] font-bold uppercase mb-1"
                      style={{ color: "var(--on-surface-variant)" }}
                    >
                      Status
                    </p>
                    <div className="flex items-center gap-1">
                      <div
                        className={`h-2 w-2 rounded-full ${p.pulse ? "animate-pulse" : ""}`}
                        style={{ background: p.statusColor }}
                      />
                      <p
                        className="text-xs font-bold"
                        style={{ color: "var(--on-surface)" }}
                      >
                        {p.status}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
      </CardContent>
    </Card>
  );
}
