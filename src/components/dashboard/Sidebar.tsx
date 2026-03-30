"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  DashboardSquare01Icon,
  Building01Icon,
  Door01Icon,
  UserGroupIcon,
  Invoice01Icon,
  Settings01Icon,
} from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Dashboard", href: "/dashboard", icon: DashboardSquare01Icon },
  { label: "Properti", href: "/dashboard/properties", icon: Building01Icon },
  { label: "Kamar", href: "/dashboard/rooms", icon: Door01Icon },
  { label: "Penyewa", href: "/dashboard/tenants", icon: UserGroupIcon },
  { label: "Pembayaran", href: "/dashboard/payments", icon: Invoice01Icon },
  { label: "Pengaturan", href: "/dashboard/settings", icon: Settings01Icon },
];

export function SidebarContent({ isFree = true }: { isFree?: boolean }) {
  const pathname = usePathname();

  return (
    <div className="flex flex-col h-full py-6 px-3 gap-y-1">
      {/* Logo */}
      <div className="mb-6 px-3">
        <div>
          <Link href="/" className="flex items-center gap-2">
            <p
              className="text-xl font-bold leading-tight"
              style={{
                color: "var(--primary)",
                fontFamily: "var(--font-display)",
              }}
            >
              Boskost
            </p>
          </Link>
          <p
            className="text-[9px] uppercase tracking-widest font-bold leading-tight"
            style={{ color: "var(--on-surface-variant)" }}
          >
            Manajamen Kost Modern
          </p>
        </div>
      </div>

      <Separator
        className="mb-3"
        style={{ background: "var(--outline-variant)" }}
      />

      {/* Nav */}
      <nav className="flex-1 flex flex-col gap-0.5 px-1">
        {navItems.map((item) => {
          const active =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);
          return (
            <Link key={item.href} href={item.href} className="block">
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 rounded-xl px-3 py-2.5 h-auto text-sm transition-all duration-200"
                style={{
                  color: active
                    ? "var(--primary)"
                    : "var(--on-surface-variant)",
                  fontWeight: active ? 700 : 500,
                  background: active ? "rgba(194,65,12,0.10)" : "transparent",
                  borderRight: active
                    ? "3px solid var(--primary)"
                    : "3px solid transparent",
                  fontFamily: "var(--font-body)",
                }}
              >
                <HugeiconsIcon icon={item.icon} size={18} />
                {item.label}
              </Button>
            </Link>
          );
        })}
      </nav>

      <Separator
        className="my-3"
        style={{ background: "var(--outline-variant)" }}
      />

      {/* Upgrade Card */}
      {isFree && (
        <div className="px-3">
          <div
            className="rounded-2xl p-4 space-y-2"
            style={{
              background: "var(--tertiary-container)",
              border: "1px solid var(--outline-variant)",
            }}
          >
            <div className="flex items-center justify-between">
              <p
                className="text-xs font-bold"
                style={{ color: "var(--primary)" }}
              >
                Subscription
              </p>
              <Badge
                variant="outline"
                className="text-[9px] px-1.5 h-4"
                style={{
                  color: "var(--primary)",
                  borderColor: "var(--primary)",
                }}
              >
                FREE
              </Badge>
            </div>
            <p
              className="text-[11px] leading-relaxed"
              style={{ color: "var(--on-surface-variant)" }}
            >
              Upgrade to unlock PRO features.
            </p>
            <Button
              className="w-full rounded-full h-8 text-xs font-bold text-white shadow-lg"
              style={{ background: "var(--gradient-cta)" }}
            >
              Upgrade
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function DashboardSidebar({
  isFree = true,
}: {
  isFree?: boolean;
}) {
  return (
    <aside
      className="hidden lg:flex fixed left-0 top-0 h-screen w-64 z-50 flex-col"
      style={{
        background: "var(--surface-container-low)",
        borderRight: "1px solid var(--outline-variant)",
      }}
    >
      <SidebarContent isFree={isFree} />
    </aside>
  );
}
