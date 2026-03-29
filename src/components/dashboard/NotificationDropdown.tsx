"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuTrigger, 
  DropdownMenuLabel, 
  DropdownMenuSeparator 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Notification01Icon, Activity01Icon } from "@hugeicons/core-free-icons";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";

const activityStyle: Record<string, { dotColor: string }> = {
  payment_received:  { dotColor: "#22c55e" },
  tenant_registered: { dotColor: "#3b82f6" },
  maintenance_request: { dotColor: "#f97316" },
  room_vacated:      { dotColor: "#a855f7" },
  property_added:    { dotColor: "var(--primary)" },
  other:             { dotColor: "#94a3b8" },
};

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60_000);
  const diffHrs = Math.floor(diffMin / 60);

  if (diffMin < 1) return "Baru saja";
  if (diffMin < 60) return `${diffMin}m lalu`;
  if (diffHrs < 24) return `${diffHrs}j lalu`;
  return date.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
}

export function NotificationDropdown() {
  const { data: logs, isLoading } = useSWR("/api/dashboard/activities", fetcher);
  const [lastRead, setLastRead] = useState<number>(0);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const stored = localStorage.getItem("boskost_notifications_last_read");
    if (stored) setLastRead(parseInt(stored, 10));
  }, []);

  if (!isMounted) return null;

  const newestTime = logs && logs[0]?.createdAt ? new Date(logs[0].createdAt).getTime() : 0;
  const hasUnread = newestTime > lastRead;

  const handleOpen = (open: boolean) => {
    if (open) {
      const now = Date.now();
      setLastRead(now);
      localStorage.setItem("boskost_notifications_last_read", now.toString());
    }
  };

  return (
    <DropdownMenu onOpenChange={handleOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hidden sm:flex rounded-full h-9 w-9 relative"
          style={{ color: "var(--on-surface-variant)" }}
        >
          <HugeiconsIcon icon={Notification01Icon} size={18} />
          {hasUnread && (
            <span
              className="absolute top-2 right-2 h-1.5 w-1.5 rounded-full animate-pulse"
              style={{ background: "var(--primary)" }}
            />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 rounded-3xl p-0 border-outline-variant overflow-hidden shadow-2xl">
        <DropdownMenuLabel className="p-4 flex items-center justify-between pb-2">
          <span className="text-sm font-bold" style={{ fontFamily: "var(--font-display)" }}>Notifikasi</span>
          {hasUnread && <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-bold">{logs.length} Baru</span>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-outline-variant m-0" />
        
        <ScrollArea className="h-[320px]">
          {isLoading ? (
            <div className="p-8 text-center animate-pulse space-y-3">
               <div className="h-4 w-24 bg-muted rounded mx-auto" />
               <div className="h-3 w-32 bg-muted rounded mx-auto" />
            </div>
          ) : !logs || logs.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 gap-3 text-center">
              <HugeiconsIcon icon={Activity01Icon} size={32} style={{ color: "var(--on-surface-variant)", opacity: 0.3 }} />
              <p className="text-xs font-bold" style={{ color: "var(--on-surface-variant)" }}>Belum ada aktivitas</p>
            </div>
          ) : (
            <div className="divide-y divide-outline-variant/30">
              {logs.map((item: any) => {
                const style = activityStyle[item.type] ?? activityStyle.other;
                return (
                  <div key={item.id} className="p-4 hover:bg-muted/30 transition-colors">
                    <div className="flex gap-3">
                      <div className="mt-1 h-1.5 w-1.5 rounded-full shrink-0" style={{ background: style.dotColor }} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2 mb-0.5">
                           <p className="text-[10px] font-bold uppercase tracking-wide opacity-60">
                             {formatRelativeTime(item.createdAt)}
                           </p>
                        </div>
                        <p className="text-xs font-bold leading-snug truncate" style={{ color: "var(--on-surface)" }}>
                          {item.title}
                        </p>
                        {item.description && (
                          <p className="mt-0.5 text-[10px] leading-relaxed line-clamp-2" style={{ color: "var(--on-surface-variant)" }}>
                            {item.description}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </ScrollArea>
        
        <DropdownMenuSeparator className="bg-outline-variant m-0" />
        <Link href="/dashboard" className="block p-3 text-center text-[11px] font-bold hover:bg-muted transition-colors" style={{ color: "var(--primary)" }}>
          Lihat Semua Aktivitas
        </Link>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
