"use client";

import { useEffect, useState, useTransition } from "react";
import { getPayments, generateMonthlyInvoices } from "@/lib/actions/payment";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Invoice01Icon,
  Calendar01Icon,
  Search01Icon,
  MagicWandIcon,
  Settings04Icon,
  TickDouble02Icon
} from "@hugeicons/core-free-icons";
import { PaymentRowActions } from "@/components/dashboard/PaymentRowActions";
import { toast } from "sonner";
import useSWR, { mutate as globalMutate } from "swr";
import { fetcher } from "@/lib/fetcher";

interface PaymentsViewProps {
  initialPayments: any[];
}

interface Payment {
  id: string;
  amount: string;
  dueDate: string;
  paidAt: string | null;
  status: string;
  tenantName: string;
  tenantPhone: string | null;
  tenantEmail: string | null;
  roomNumber: string;
  propertyName: string;
  roomTenantId: string;
}

export function PaymentsView({ initialPayments }: PaymentsViewProps) {
  const { data: payments = initialPayments, mutate, isLoading: isSwrLoading } = useSWR<Payment[]>(
    "/api/dashboard/payments",
    fetcher,
    {
      fallbackData: initialPayments,
      revalidateOnFocus: false,
    }
  );

  const [isPending, startTransition] = useTransition();

  const handleGenerateInvoices = () => {
    startTransition(async () => {
      try {
        const res = await generateMonthlyInvoices();
        toast.success(`${res.count} tagihan baru berhasil dibuat`);
        await mutate();
        await globalMutate("/api/dashboard/stats"); // Refresh stats card too!
      } catch (err: any) {
        toast.error(err.message || "Gagal membuat tagihan otomatis");
      }
    });
  };

  const stats = {
    total: payments.length,
    pending: payments.filter((p: Payment) => p.status === "pending").length,
    paid: payments.filter((p: Payment) => p.status === "paid").length,
    totalAmount: payments.filter((p: Payment) => p.status === "paid").reduce((acc: number, p: Payment) => acc + Number(p.amount), 0),
  };

  return (
    <div className="space-y-6 sm:space-y-8 pb-10 max-w-full overflow-x-hidden">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-0.5">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: "var(--font-display)" }}>
            Tagihan & Pembayaran
          </h1>
          <p className="text-sm" style={{ color: "var(--on-surface-variant)" }}>
            Kelola pembayaran sewa kamar dan tagihan otomatis penyewa.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={handleGenerateInvoices}
            disabled={isPending}
            className="rounded-2xl gap-2 font-bold transition-all hover:bg-muted"
            style={{ borderColor: "var(--outline-variant)" }}
          >
            <HugeiconsIcon icon={MagicWandIcon} size={18} style={{ color: "var(--primary)" }} />
            Buat Tagihan Bulan Ini
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="mb-8 grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Total Tagihan", value: stats.total.toString(), color: "var(--on-surface)" },
          { label: "Menunggu", value: stats.pending.toString(), color: "#f97316" },
          { label: "Lunas", value: stats.paid.toString(), color: "#22c55e" },
          { label: "Pendapatan", value: `Rp ${stats.totalAmount.toLocaleString("id-ID")}`, color: "var(--primary)" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-3xl p-4 transition-all border"
            style={{ background: "var(--surface-container-low)", borderColor: "var(--outline-variant)" }}
          >
            <p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mb-1">{s.label}</p>
            <p className="text-xl sm:text-2xl font-black truncate" style={{ color: s.color, fontFamily: "var(--font-display)" }} title={s.value}>
              {s.value}
            </p>
          </div>
        ))}
      </div>

      {/* Payments List */}
      <div className="p-0.5 w-full">
        <Card className="rounded-3xl border-none shadow-md overflow-hidden" style={{ background: "var(--surface-container)" }}>
          <CardHeader className="flex flex-row items-center justify-between px-5 py-4 sm:px-6 sm:py-5">
            <div>
              <CardTitle style={{ fontFamily: "var(--font-display)" }}>Semua Tagihan</CardTitle>
              <CardDescription>Daftar lengkap riwayat pembayaran penyewa</CardDescription>
            </div>
            <div className="hidden sm:flex items-center gap-2 rounded-2xl p-1 px-3 border border-outline-variant bg-surface-container-low">
              <HugeiconsIcon icon={Search01Icon} size={14} className="opacity-50" />
              <input placeholder="Cari tagihan..." className="bg-transparent text-xs py-1.5 outline-none border-none w-32 focus:w-48 transition-all" />
            </div>
          </CardHeader>
          <Separator style={{ background: "var(--outline-variant)" }} />
          <CardContent className="p-0">
          {isSwrLoading && payments.length === 0 ? (
            <div className="p-12 space-y-4">
              {[1, 2, 3, 4].map(i => <div key={i} className="h-16 w-full bg-muted rounded-2xl animate-pulse" />)}
            </div>
          ) : payments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
              <div className="h-16 w-16 items-center justify-center rounded-3xl flex bg-surface-container-highest">
                <HugeiconsIcon icon={Invoice01Icon} size={32} className="opacity-20" />
              </div>
              <div>
                <p className="text-lg font-bold">Belum ada tagihan</p>
                <p className="text-sm opacity-60">Gunakan tombol &quot;Buat Tagihan&quot; untuk memulai penagihan otomatis.</p>
              </div>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <div className="divide-y divide-outline-variant/30">
                {payments.map((p: Payment) => (
                  <div key={p.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-5 px-6 transition-all hover:bg-surface-container-highest/50 gap-2 sm:gap-4">
                    <div className="flex items-start sm:items-center gap-4 flex-1 min-w-0">
                      <div className={`h-11 w-11 sm:h-12 sm:w-12 shrink-0 rounded-2xl flex items-center justify-center transition-transform ${p.status === "paid" ? "bg-green-100 text-green-600" : "bg-orange-100 text-orange-600"}`}>
                        <HugeiconsIcon icon={p.status === "paid" ? Invoice01Icon : Settings04Icon} size={20} />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          <p className="font-bold text-sm leading-normal truncate">{p.tenantName}</p>
                          <Badge variant="outline" className="text-[9px] font-bold border-outline-variant/50 whitespace-nowrap">
                            {p.propertyName} • {p.roomNumber}
                          </Badge>
                        </div>
                        <div className="flex flex-col xs:flex-row xs:items-center gap-2 xs:gap-3 text-[10px] opacity-60 font-medium">
                          <span className="flex items-center gap-1">
                            <HugeiconsIcon icon={Calendar01Icon} size={10} />
                            Jatuh Tempo: {new Date(p.dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                          </span>
                          {p.paidAt && (
                            <span className="flex items-center gap-1 text-green-600">
                              <HugeiconsIcon icon={TickDouble02Icon} size={10} />
                              Lunas: {new Date(p.paidAt).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-8 w-full sm:w-auto pt-3 sm:pt-0 border-t sm:border-none border-outline-variant/20">
                      <div className="text-left sm:text-right">
                        <p className="text-sm font-black whitespace-nowrap">Rp {Number(p.amount).toLocaleString("id-ID")}</p>
                        <div className="flex items-center sm:justify-end gap-1.5 mt-0.5">
                          <div className={`h-1.5 w-1.5 rounded-full ${p.status === "paid" ? "bg-green-500" : "bg-orange-500 animate-pulse"}`} />
                          <span className={`text-[9px] font-bold uppercase tracking-wider ${p.status === "paid" ? "text-green-600" : "text-orange-600"}`}>
                            {p.status}
                          </span>
                        </div>
                      </div>

                      <PaymentRowActions
                        paymentId={p.id}
                        status={p.status}
                        amount={p.amount}
                        tenantName={p.tenantName}
                        tenantPhone={p.tenantPhone}
                        roomNumber={p.roomNumber}
                        propertyName={p.propertyName}
                        dueDate={p.dueDate}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
      </div>
    </div>
  );
}
