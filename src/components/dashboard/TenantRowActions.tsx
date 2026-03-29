"use client";

import { useState } from "react";
import { EditTenantDialog, type AvailableRoom } from "@/components/dashboard/EditTenantDialog";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon, WhatsappIcon, Mail01Icon, ContactIcon } from "@hugeicons/core-free-icons";

interface TenantRowActionsProps {
  tenant: {
    id: string;
    name: string;
    email: string | null;
    phone: string | null;
    roomNumber?: string | null;
    propertyName?: string | null;
    startDate?: string | null;
    endDate?: string | null;
  };
  availableRooms: AvailableRoom[];
}

export function TenantRowActions({ tenant, availableRooms }: TenantRowActionsProps) {
  const [open, setOpen] = useState(false);

  // Helper for WhatsApp
  const handleWA = () => {
    if (!tenant.phone) return;
    const cleanPhone = tenant.phone.replace(/\D/g, "");
    window.open(`https://wa.me/${cleanPhone}`, "_blank");
  };

  // Helper for Email
  const handleEmail = () => {
    if (!tenant.email) return;
    window.location.href = `mailto:${tenant.email}`;
  };

  // Helper for VCF (Save Contact)
  const handleSaveContact = () => {
    const vcard = `BEGIN:VCARD
VERSION:3.0
FN:${tenant.name}
TEL;TYPE=CELL:${tenant.phone || ""}
EMAIL:${tenant.email || ""}
END:VCARD`;
    const blob = new Blob([vcard], { type: "text/vcard" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${tenant.name}.vcf`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex items-center w-full lg:w-auto justify-center gap-1">
      {/* Quick Contact Buttons */}
      <div className="flex items-center gap-1 transition-all duration-200">
        {tenant.phone && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleWA}
            className="h-8 w-8 p-0 rounded-full hover:bg-green-50 hover:text-green-600 transition-colors"
            title="WhatsApp"
          >
            <HugeiconsIcon icon={WhatsappIcon} size={14} />
          </Button>
        )}
        {tenant.email && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleEmail}
            className="h-8 w-8 p-0 rounded-full hover:bg-blue-50 hover:text-blue-600 transition-colors"
            title="Kirim Email"
          >
            <HugeiconsIcon icon={Mail01Icon} size={14} />
          </Button>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={handleSaveContact}
          className="h-8 w-8 p-0 rounded-full hover:bg-orange-50 hover:text-orange-600 transition-colors"
          title="Simpan Kontak (VCF)"
        >
          <HugeiconsIcon icon={ContactIcon} size={14} />
        </Button>
      </div>

      <div className="w-px h-4 bg-muted mx-1 hidden sm:block" />

      {/* Primary Edit Button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setOpen(true)}
        className="h-8 w-8 p-0 rounded-xl transition-all hover:bg-muted"
        title="Edit / Pindah Kamar"
      >
        <HugeiconsIcon icon={Edit02Icon} size={14} style={{ color: "var(--on-surface-variant)" }} />
      </Button>

      <EditTenantDialog
        open={open}
        onOpenChange={setOpen}
        tenant={tenant}
        availableRooms={availableRooms}
      />
    </div>
  );
}
