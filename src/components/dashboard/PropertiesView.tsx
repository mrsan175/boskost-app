"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import Link from "next/link";
import { AddPropertyDialog } from "@/components/dashboard/AddPropertyDialog";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Building01Icon,
  Home01Icon,
  AlertCircleIcon,
  ArrowRight01Icon,
} from "@hugeicons/core-free-icons";

interface PropertiesViewProps {
  initialProperties: any[];
  isFree: boolean;
}

export function PropertiesView({ initialProperties, isFree }: PropertiesViewProps) {
  const { data } = useSWR("/api/dashboard/properties", fetcher, {
    fallbackData: initialProperties,
    revalidateOnFocus: false,
  });

  // Deduplication to prevent double-rendering/flash
  const properties = Array.from(
    new Map([...initialProperties, ...(data || [])].map((item) => [item.id, item])).values()
  ).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const propertyLimitReached = isFree && properties.length >= 1;

  return (
    <div style={{ background: "transparent" }}>
      {/* Header */}
      <header className="mb-8 lg:mb-10 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
        <div>
          <h2
            className="text-2xl sm:text-3xl font-extrabold tracking-tight"
            style={{ color: "var(--on-surface)", fontFamily: "var(--font-display)" }}
          >
            Properti Saya
          </h2>
          <p className="mt-1 text-sm" style={{ color: "var(--on-surface-variant)" }}>
            {properties.length} properti terdaftar {isFree && "(FREE Tier)"}
          </p>
        </div>
        <AddPropertyDialog limitReached={propertyLimitReached} />
      </header>

      {/* Empty state */}
      {properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-3xl"
            style={{ background: "rgba(194,65,12,0.08)" }}
          >
            <HugeiconsIcon icon={Building01Icon} size={40} style={{ color: "var(--primary)", opacity: 0.4 }} />
          </div>
          <p className="text-xl font-bold opacity-60">Belum ada properti</p>
          <p className="text-sm max-w-xs opacity-40">
            Klik tombol &quot;Tambah Properti&quot; di atas untuk mulai mengelola kos kamu.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
          {properties.map((prop: any) => (
            <Link
              key={prop.id}
              href={prop.isActive ? `/dashboard/properties/${prop.id}` : "#"}
              className={prop.isActive ? "block" : "block pointer-events-none cursor-not-allowed"}
            >
              <Card
                className={`group relative overflow-hidden border-2 transition-all h-full rounded-4xl flex flex-col ${!prop.isActive ? "opacity-60 grayscale-[0.5]" : "hover:border-primary/50 hover:shadow-xl hover:scale-105"
                  }`}
                style={{
                  background: "var(--surface-container-low)",
                  borderColor: "var(--outline-variant)",
                }}
              >
                {!prop.isActive && (
                  <div className="absolute inset-0 z-10 bg-white/10 backdrop-blur-[1px] flex items-center justify-center">
                    <Badge variant="destructive" className="gap-1.5 py-1 px-3 shadow-lg rounded-full">
                      <HugeiconsIcon icon={AlertCircleIcon} size={14} />
                      Nonaktif - Akun Free
                    </Badge>
                  </div>
                )}

                <CardHeader className="pb-3">
                  <div className="flex items-center w-full flex-row gap-3 justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="flex h-12 w-12 items-center justify-center rounded-2xl text-xl shrink-0"
                        style={{ background: "rgba(194,65,12,0.08)" }}
                      >
                        🏠
                      </div>
                      <div>
                        <CardTitle className="text-base" style={{ fontFamily: "var(--font-display)" }}>
                          {prop.name}
                        </CardTitle>
                        <CardDescription className="text-[11px] mt-0.5 flex items-center gap-1.5 overflow-hidden">
                          {prop.city && <span className="font-bold opacity-90">{prop.city}</span>}
                          {prop.city && prop.address && <span className="opacity-40 select-none">•</span>}
                          {prop.address ? (
                            <span className="truncate max-w-[140px] opacity-70" title={prop.address}>
                              {prop.address}
                            </span>
                          ) : (
                            !prop.city && <span className="italic opacity-50 text-[10px]">Alamat belum diisi</span>
                          )}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 pt-1 relative z-20">
                      {prop.isActive && (
                        <HugeiconsIcon
                          icon={ArrowRight01Icon}
                          size={18}
                          className="transition-transform group-hover:translate-x-1"
                          style={{ color: "var(--primary)" }}
                        />
                      )}
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4 flex-1">
                  {/* Room count badges */}
                  <div className="flex gap-2 flex-wrap">
                    <Badge variant="outline" className="gap-1 text-[10px]">
                      <HugeiconsIcon icon={Home01Icon} size={10} />
                      {prop.total} Kamar
                    </Badge>
                    {prop.available > 0 && (
                      <Badge className="text-[10px] bg-green-100 text-green-700 border-green-200">
                        {prop.available} Tersedia
                      </Badge>
                    )}
                    {prop.occupied > 0 && (
                      <Badge className="text-[10px]" style={{ background: "rgba(194,65,12,0.1)", color: "var(--primary)" }}>
                        {prop.occupied} Terisi
                      </Badge>
                    )}
                    {prop.maintenance > 0 && (
                      <Badge className="text-[10px] bg-orange-100 text-orange-700">
                        {prop.maintenance} Perbaikan
                      </Badge>
                    )}
                  </div>

                  {/* Occupancy */}
                  <div className="pt-2">
                    <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
                      <span style={{ color: "var(--on-surface-variant)" }}>Tingkat Hunian</span>
                      <span style={{ color: "var(--primary)" }}>{prop.occupancyRate}%</span>
                    </div>
                    <Progress value={prop.occupancyRate} className="h-2" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
      <div className="h-12" />
    </div>
  );
}
