"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { TenantRowActions } from "@/components/dashboard/TenantRowActions";
import {
  TenantSort,
  TenantPagination,
} from "@/components/dashboard/TenantControls";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  UserGroupIcon,
  Calendar01Icon,
  CheckmarkCircle01Icon,
  AlertCircleIcon,
  WhatsappIcon,
  Mail01Icon,
} from "@hugeicons/core-free-icons";
import { useSearchParams } from "next/navigation";

interface TenantsViewProps {
  initialTenants: any[];
  availableRooms: any[];
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  return new Date(dateStr).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function getDaysRemaining(endDate: string | null | undefined): number | null {
  if (!endDate) return null;
  const ms = new Date(endDate).getTime() - Date.now();
  return Math.ceil(ms / 86_400_000);
}

export function TenantsView({
  initialTenants,
  availableRooms,
}: TenantsViewProps) {
  const searchParams = useSearchParams();
  const sort = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1", 10);

  const { data: tenantsList = initialTenants } = useSWR(
    "/api/dashboard/tenants",
    fetcher,
    {
      fallbackData: initialTenants,
      revalidateOnFocus: false,
    },
  );

  const total = tenantsList.length;
  const active = tenantsList.filter((r: any) => r.isActive).length;
  const noRoom = tenantsList.filter((r: any) => !r.isActive).length;
  const expiringSoon = tenantsList.filter((r: any) => {
    const d = getDaysRemaining(r.endDate);
    return d !== null && d >= 0 && d <= 7;
  }).length;

  let sortedRows = [...tenantsList];
  if (sort === "oldest") sortedRows.reverse();
  else if (sort === "name_asc")
    sortedRows.sort((a, b) =>
      a.tenantName.localeCompare(b.tenantName, "id-ID"),
    );
  else if (sort === "name_desc")
    sortedRows.sort((a, b) =>
      b.tenantName.localeCompare(a.tenantName, "id-ID"),
    );

  const pageSize = 10;
  const totalPages = Math.ceil(total / pageSize) || 1;
  const validPage = Math.max(1, Math.min(page, totalPages));
  const paginatedRows = sortedRows.slice(
    (validPage - 1) * pageSize,
    validPage * pageSize,
  );

  return (
    <div style={{ background: "transparent" }}>
      {/* Header */}
      <header className="mb-8 lg:mb-10">
        <h2
          className="text-3xl font-extrabold tracking-tight"
          style={{
            color: "var(--on-surface)",
            fontFamily: "var(--font-display)",
          }}
        >
          Daftar Penyewa
        </h2>
        <p
          className="mt-1 text-sm"
          style={{ color: "var(--on-surface-variant)" }}
        >
          {total} penyewa terdaftar
        </p>
      </header>

      {/* Summary cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Penyewa", value: total, color: "var(--on-surface)" },
          { label: "Aktif Sewa", value: active, color: "var(--primary)" },
          { label: "Tanpa Kamar", value: noRoom, color: "#94a3b8" },
          { label: "Hampir Habis", value: expiringSoon, color: "#f97316" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-3xl p-4 transition-all border"
            style={{
              background: "var(--surface-container-low)",
              borderColor: "var(--outline-variant)",
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">
              {s.label}
            </p>
            <p
              className="text-2xl font-black"
              style={{ color: s.color, fontFamily: "var(--font-display)" }}
            >
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Empty state */}
      {total === 0 ? (
        <div className="flex flex-col items-center justify-center py-32 gap-4 text-center">
          <div
            className="flex h-20 w-20 items-center justify-center rounded-3xl"
            style={{ background: "var(--surface-container-highest)" }}
          >
            <HugeiconsIcon
              icon={UserGroupIcon}
              size={40}
              style={{ color: "var(--primary)", opacity: 0.4 }}
            />
          </div>
          <p className="text-xl font-bold opacity-60">Belum ada penyewa</p>
        </div>
      ) : (
        <Card
          className="rounded-3xl border-none shadow-md overflow-hidden"
          style={{ background: "var(--surface-container)" }}
        >
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 sm:px-6 sm:py-5 shrink-0">
            <div>
              <CardTitle style={{ fontFamily: "var(--font-display)" }}>
                Semua Penyewa
              </CardTitle>
              <CardDescription>
                Kelola data dan masa sewa penghuni properti Anda.
              </CardDescription>
            </div>
            <TenantSort />
          </CardHeader>
          <Separator style={{ background: "var(--outline-variant)" }} />
          <CardContent className="p-0">
            <div className="divide-y divide-outline-variant/30">
              {paginatedRows.map((row: any) => {
                const daysLeft = getDaysRemaining(row.endDate);
                const isExpiringSoon =
                  daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
                const isActive = !!row.isActive;

                return (
                  <div
                    key={row.id}
                    className="group flex flex-col sm:grid sm:grid-cols-12 sm:items-center justify-between gap-4 px-6 py-5 transition-all hover:bg-surface-container-highest/50"
                  >
                    <div className="flex items-center gap-4 min-w-0 sm:col-span-5">
                      <div
                        className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-lg font-black bg-surface-container-highest"
                        style={{
                          color: isActive
                            ? "var(--primary)"
                            : "var(--on-surface-variant)",
                        }}
                      >
                        {row.tenantName.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-bold text-sm truncate">
                            {row.tenantName}
                          </p>
                          {row.isVerified && (
                            <HugeiconsIcon
                              icon={CheckmarkCircle01Icon}
                              size={14}
                              className="text-green-500 shrink-0"
                            />
                          )}
                        </div>
                        <div className="flex flex-col gap-1 text-[10px] opacity-70 font-medium">
                          {row.phone && (
                            <span className="flex items-center gap-1.5">
                              <HugeiconsIcon
                                icon={WhatsappIcon}
                                size={10}
                                className="text-green-600"
                              />
                              {row.phone}
                            </span>
                          )}
                          {row.email && (
                            <span className="flex items-center gap-1.5">
                              <HugeiconsIcon
                                icon={Mail01Icon}
                                size={10}
                                className="text-blue-500"
                              />
                              {row.email}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 min-w-0 sm:col-span-4 px-4 overflow-hidden">
                      {row.roomNumber ? (
                        <div className="min-w-0">
                          <div className="flex justify-between gap-1">
                            <p className="text-xs font-bold truncate">
                              {row.propertyName}
                            </p>
                            <div className="flex gap-1.5">
                              {isActive && isExpiringSoon && (
                                <Badge className="text-[9px] gap-1 bg-orange-100 text-orange-600 border-none">
                                  <HugeiconsIcon
                                    icon={AlertCircleIcon}
                                    size={10}
                                  />
                                  {daysLeft === 0
                                    ? "Hari ini"
                                    : `${daysLeft} hari lagi`}
                                </Badge>
                              )}
                              {isActive && !isExpiringSoon && (
                                <Badge className="text-[9px] bg-green-100 text-green-600 border-none font-bold">
                                  Aktif
                                </Badge>
                              )}
                              {!isActive && (
                                <Badge
                                  variant="outline"
                                  className="text-[9px] opacity-50"
                                >
                                  Tidak Aktif
                                </Badge>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <p className="text-[10px] opacity-60">
                              Kamar {row.roomNumber}
                              {row.floor ? ` • Lantai ${row.floor}` : ""}
                            </p>
                            {row.startDate && (
                              <span className="flex sm:hidden items-center gap-1 opacity-40 text-[9px] font-medium before:content-['•'] before:mr-1">
                                {formatDate(row.startDate)}
                              </span>
                            )}
                          </div>

                          {row.startDate && (
                            <div className="hidden sm:flex items-center gap-1 opacity-60">
                              <HugeiconsIcon icon={Calendar01Icon} size={10} />
                              <p className="text-[10px] font-medium">
                                {formatDate(row.startDate)} →{" "}
                                {row.endDate ? formatDate(row.endDate) : "∞"}
                              </p>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-xs italic opacity-40">
                          Tidak ada kamar aktif
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 shrink-0 sm:col-span-7 md:col-span-3">
                      <TenantRowActions
                        tenant={{
                          id: row.id,
                          name: row.tenantName,
                          email: row.email ?? null,
                          phone: row.phone ?? null,
                          roomNumber: row.roomNumber ?? null,
                          propertyName: row.propertyName ?? null,
                          startDate: row.startDate ?? null,
                          endDate: row.endDate ?? null,
                        }}
                        availableRooms={availableRooms}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <TenantPagination totalPages={totalPages} currentPage={validPage} />
          </CardContent>
        </Card>
      )}
      <div className="h-12" />
    </div>
  );
}
