"use client";

import { useState, useTransition } from "react";
import { mutate as globalMutate } from "swr";
import { markPaymentAsPaid, deletePayment } from "@/lib/actions/payment";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle01Icon,
  Delete02Icon,
  TickDouble02Icon,
  WhatsappIcon
} from "@hugeicons/core-free-icons";
import { ConfirmDialog } from "@/components/dashboard/ConfirmDialog";
import { toast } from "sonner";

interface PaymentRowActionsProps {
  paymentId: string;
  status: string;
  amount: string;
  tenantName: string;
  tenantPhone?: string | null;
  roomNumber?: string;
  propertyName?: string;
  dueDate?: string;
}

export function PaymentRowActions({
  paymentId,
  status,
  amount,
  tenantName,
  tenantPhone,
  roomNumber,
  propertyName,
  dueDate,
}: PaymentRowActionsProps) {
  const [isPending, startTransition] = useTransition();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const handleSendWhatsApp = () => {
    if (!tenantPhone) {
      toast.error("Nomor WhatsApp belum diisi untuk penyewa ini.");
      return;
    }

    // Sanitize phone number: keep only digits
    const cleanPhone = tenantPhone.replace(/\D/g, "");
    const finalPhone = cleanPhone.startsWith("0") ? `62${cleanPhone.slice(1)}` : cleanPhone;

    const formattedAmount = Number(amount).toLocaleString("id-ID");
    const formattedDate = dueDate
      ? new Date(dueDate).toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" })
      : "-";

    const message = `Halo *${tenantName}*,\n\nSemoga harimu menyenangkan! Ini adalah pengingat tagihan sewa bulanan untuk:\n\n*Properti:* ${propertyName || "-"}\n*Kamar:* ${roomNumber || "-"}\n*Total Tagihan:* Rp ${formattedAmount}\n*Jatuh Tempo:* ${formattedDate}\n\nMohon dapat melakukan pembayaran sebelum tanggal jatuh tempo. Jika sudah membayar, abaikan pesan ini.\n\nTerima kasih atas kerjasamanya!\n\n-- *Manajemen ${propertyName || "-"}*`;

    const waUrl = `https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`;
    window.open(waUrl, "_blank");
  };

  const handleMarkAsPaid = () => {
    startTransition(async () => {
      try {
        // Optimistic Update
        await globalMutate(
          "/api/dashboard/payments",
          async (current: any[] | undefined) => {
            if (!current) return [];
            return current.map((p) =>
              p.id === paymentId ? { ...p, status: "paid", paidAt: new Date().toISOString() } : p
            );
          },
          {
            optimisticData: (current: any[] | undefined) => {
              if (!current) return [];
              return current.map((p) =>
                p.id === paymentId ? { ...p, status: "paid", paidAt: new Date().toISOString() } : p
              );
            },
            rollbackOnError: true,
            revalidate: true,
          }
        );

        await markPaymentAsPaid(paymentId);
        toast.success("Pembayaran berhasil ditandai lunas");
        await globalMutate("/api/dashboard/stats");
      } catch (err: any) {
        toast.error(err.message || "Gagal memperbarui pembayaran");
      }
    });
  };

  const handleDelete = () => {
    startTransition(async () => {
      try {
        // Optimistic Update
        await globalMutate(
          "/api/dashboard/payments",
          async (current: any[] | undefined) => {
            if (!current) return [];
            return current.filter((p) => p.id !== paymentId);
          },
          {
            optimisticData: (current: any[] | undefined) => {
              if (!current) return [];
              return current.filter((p) => p.id !== paymentId);
            },
            rollbackOnError: true,
            revalidate: true,
          }
        );

        await deletePayment(paymentId);
        toast.success("Pembayaran berhasil dihapus");
        setShowConfirmDelete(false);
        await globalMutate("/api/dashboard/stats");
      } catch (err: any) {
        toast.error(err.message || "Gagal menghapus pembayaran");
      }
    });
  };

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {status !== "paid" && (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleMarkAsPaid}
          className="h-8 rounded-full border-green-200 bg-green-50 text-green-700 hover:bg-green-100 hover:text-green-800 gap-1.5 px-3"
        >
          <HugeiconsIcon icon={CheckmarkCircle01Icon} size={14} />
          <span className="text-[10px] font-bold">Lunasi</span>
        </Button>
      )}

      {status !== "paid" && tenantPhone && (
        <Button
          variant="outline"
          size="sm"
          disabled={isPending}
          onClick={handleSendWhatsApp}
          className="h-8 rounded-full border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 hover:text-blue-800 gap-1.5 px-3"
          title="Kirim Invoice WA"
        >
          <HugeiconsIcon icon={WhatsappIcon} size={14} />
          <span className="text-[10px] font-bold">Kirim WA</span>
        </Button>
      )}

      {status === "paid" && (
        <div className="flex items-center gap-1 text-green-600 px-3 h-8">
          <HugeiconsIcon icon={TickDouble02Icon} size={14} />
          <span className="text-[10px] font-bold">Lunas</span>
        </div>
      )}

      <Button
        variant="ghost"
        size="sm"
        disabled={isPending}
        onClick={() => setShowConfirmDelete(true)}
        className="h-8 w-8 p-0 rounded-full hover:bg-red-50 hover:text-red-600 transition-colors"
        title="Hapus Tagihan"
      >
        <HugeiconsIcon icon={Delete02Icon} size={14} />
      </Button>

      <ConfirmDialog
        open={showConfirmDelete}
        onOpenChange={setShowConfirmDelete}
        onConfirm={handleDelete}
        title="Hapus Tagihan?"
        description={`Apakah Anda yakin ingin menghapus tagihan ${tenantName} senilai Rp ${Number(amount).toLocaleString("id-ID")}?`}
        confirmText="Ya, Hapus"
        variant="destructive"
      />
    </div>
  );
}
