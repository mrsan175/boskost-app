"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent, CardHeader, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building01Icon,
  UserGroupIcon,
  PercentCircleIcon,
  Money01Icon,
} from "@hugeicons/core-free-icons";

function formatCurrency(value: number) {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}jt`;
  if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}rb`;
  return `Rp ${value.toLocaleString("id-ID")}`;
}

export default function StatCards() {
  const { data, error, isLoading } = useSWR("/api/dashboard/stats", fetcher);

  if (error) return <div className="text-red-500 text-xs">Gagal memuat statistik</div>;

  const stats = data || {
    totalProperties: 0,
    totalTenants: 0,
    verifiedPct: 0,
    occupancyRate: 0,
    totalRevenue: 0,
    revenueGrowth: null,
  };

  const statCards = [
    {
      label: "Total Properti",
      value: stats.totalProperties.toString(),
      badge: stats.totalProperties > 0 ? `${stats.totalProperties} properti` : null,
      icon: Building01Icon,
      valueColor: "var(--primary)",
      progress: null as number | null,
    },
    {
      label: "Total Penyewa",
      value: stats.totalTenants.toString(),
      badge: stats.totalTenants > 0 ? `${stats.verifiedPct}% Terverifikasi` : null,
      icon: UserGroupIcon,
      valueColor: "var(--on-surface)",
      progress: null as number | null,
    },
    {
      label: "Tingkat Hunian",
      value: `${stats.occupancyRate}%`,
      badge: null,
      icon: PercentCircleIcon,
      valueColor: "var(--on-surface)",
      progress: stats.occupancyRate,
    },
    {
      label: "Pendapatan Bulan Ini",
      value: formatCurrency(stats.totalRevenue),
      badge:
        stats.revenueGrowth !== null
          ? stats.revenueGrowth >= 0
            ? `↑ ${stats.revenueGrowth}%`
            : `↓ ${Math.abs(stats.revenueGrowth)}%`
          : null,
      icon: Money01Icon,
      valueColor: "var(--primary)",
      progress: null as number | null,
    },
  ];

  return (
    <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
      {statCards.map((card) => (
        <Card
          key={card.label}
          className={`relative overflow-hidden group transition-all hover:-translate-y-1 hover:shadow-md border ${isLoading ? "animate-pulse" : ""}`}
          style={{ borderColor: "var(--outline-variant)" }}
        >
          <div
            className="absolute -right-4 -top-4 h-24 w-24 rounded-full transition-transform group-hover:scale-110"
            style={{ background: "rgba(194,65,12,0.05)" }}
          />
          <CardHeader className="pb-2">
            <CardDescription
              className="text-xs font-bold uppercase tracking-wider"
              style={{ color: "var(--on-surface-variant)" }}
            >
              {card.label}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!isLoading ? (
              <div className="flex items-baseline gap-2 flex-wrap">
                <span
                  className="text-3xl font-extrabold"
                  style={{ color: card.valueColor, fontFamily: "var(--font-display)" }}
                >
                  {card.value}
                </span>
                {card.badge && (
                  <Badge
                    variant="outline"
                    className="text-[10px] font-bold text-green-600 border-green-200 bg-green-50"
                  >
                    {card.badge}
                  </Badge>
                )}
                {card.progress !== null && (
                  <Progress value={card.progress} className="w-16 h-1.5 mt-1 ml-1" />
                )}
              </div>
            ) : (
              <div className="h-9 w-24 bg-muted rounded-lg" />
            )}
            <HugeiconsIcon
              icon={card.icon}
              size={36}
              className="absolute bottom-5 right-5"
              style={{ color: "var(--primary)", opacity: 0.12 }}
            />
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
