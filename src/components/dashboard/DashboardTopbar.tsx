"use client";
import { useState, useEffect } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  Notification01Icon,
  Search01Icon,
  Menu01Icon,
  Cancel01Icon,
  ArrowExpandIcon,
  ArrowShrinkIcon,
} from "@hugeicons/core-free-icons";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { UserButton } from "@clerk/nextjs";
import { NotificationDropdown } from "@/components/dashboard/NotificationDropdown";
import { Button } from "@/components/ui/button";
import { SidebarContent } from "@/components/dashboard/Sidebar";

interface DashboardTopbarProps {
  fullName: string;
  tier?: string;
  isFree?: boolean;
}

const tierLabels: Record<string, string> = {
  FREE: "Pengelola Kost",
  PRO: "Bos Kost",
  ENTERPRISE: "Juragan Kost",
};

export default function DashboardTopbar({
  fullName,
  tier = "FREE",
  isFree = true,
}: DashboardTopbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err) => {
        console.error(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Prevent hydration mismatch
  if (!isMounted) {
    return (
      <header
        className="fixed top-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 py-3 w-full lg:left-64 lg:w-auto"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(var(--glass-blur))",
          WebkitBackdropFilter: "blur(var(--glass-blur))",
          borderBottom: "1px solid var(--outline-variant)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        <div className="flex-1" />
        <div className="flex items-center gap-4">
          <div className="h-8 w-8 rounded-full bg-muted animate-pulse" />
        </div>
      </header>
    );
  }

  return (
    <>
      <header
        className="fixed top-0 right-0 z-40 flex items-center justify-between px-4 sm:px-8 py-3 w-full lg:left-64 lg:w-auto"
        style={{
          background: "var(--glass-bg)",
          backdropFilter: "blur(var(--glass-blur))",
          WebkitBackdropFilter: "blur(var(--glass-blur))",
          borderBottom: "1px solid var(--outline-variant)",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
        }}
      >
        {/* Left: Mobile Menu Toggle + Name (Mobile only) */}
        <div className="flex items-center gap-2 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMobileMenuOpen(true)}
            className="rounded-full h-9 w-9"
            style={{ color: "var(--on-surface)" }}
          >
            <HugeiconsIcon icon={Menu01Icon} size={20} />
          </Button>
          <div className="flex flex-col">
            <p
              className="text-xs font-bold leading-tight truncate max-w-[100px]"
              style={{
                color: "var(--primary)",
                fontFamily: "var(--font-display)",
              }}
            >
              Boskost
            </p>
          </div>
        </div>

        {/* Center: Search (Hidden on small mobile if needed, or compact) */}
        <div className="hidden sm:flex flex-1 items-center gap-6 px-4">
          <div className="relative w-full max-w-md">
            <HugeiconsIcon
              icon={Search01Icon}
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: "var(--on-surface-variant)" }}
            />
            <input
              className="w-full rounded-full py-2 pl-10 pr-4 text-xs outline-none transition-all"
              placeholder="Cari..."
              style={{
                background: "var(--surface-container-high)",
                color: "var(--on-surface)",
                caretColor: "var(--primary)",
                border: "1px solid transparent",
              }}
            />
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden sm:block">
            <ThemeSwitcher />
          </div>

          <NotificationDropdown />

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleFullscreen}
            className="hidden sm:flex rounded-full h-9 w-9"
            style={{ color: "var(--on-surface-variant)" }}
            title={isFullscreen ? "Keluar Fullscreen" : "Layar Penuh"}
          >
            <HugeiconsIcon
              icon={isFullscreen ? ArrowShrinkIcon : ArrowExpandIcon}
              size={18}
            />
          </Button>

          {/* User info */}
          <div className="flex items-center gap-2.5 ml-2">
            <div className="text-right hidden md:block">
              <p
                className="text-sm font-bold leading-tight"
                style={{
                  color: "var(--on-surface)",
                  fontFamily: "var(--font-display)",
                }}
              >
                {fullName}
              </p>
              <p
                className="text-[9px] font-bold uppercase"
                style={{ color: "var(--primary)" }}
              >
                {tierLabels[tier] || tier}
              </p>
            </div>
            <UserButton
              appearance={{
                elements: {
                  avatarBox:
                    "h-8 w-8 ring-2 ring-orange-200 dark:ring-orange-900",
                },
              }}
            />
          </div>
        </div>
      </header>

      {/* Mobile Drawer Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-60 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="absolute left-0 top-0 h-screen w-72 shadow-2xl transition-transform animate-in slide-in-from-left duration-300"
            style={{ background: "var(--surface)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-end p-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(false)}
                className="rounded-full"
              >
                <HugeiconsIcon icon={Cancel01Icon} size={20} />
              </Button>
            </div>
            <SidebarContent isFree={isFree} />
          </div>
        </div>
      )}
    </>
  );
}
