"use client";

import { HugeiconsIcon } from "@hugeicons/react";
import { Moon02Icon, Sun02Icon } from "@hugeicons/core-free-icons";
import { useTheme, setTheme } from "@/hooks/use-theme";
import { Button } from "@/components/ui/button";

export function ThemeSwitcher() {
  const theme = useTheme();

  const toggle = () => setTheme(theme === "dark" ? "light" : "dark");

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggle}
      aria-label={
        theme === "dark" ? "Switch to light theme" : "Switch to dark theme"
      }
      className="gap-1.5 backdrop-blur-sm hover:brightness-110"
      style={{ borderColor: "var(--outline)", color: "var(--on-surface)" }}
    >
      {theme === "dark" ? (
        <HugeiconsIcon icon={Moon02Icon} size={18} className="shrink-0" />
      ) : (
        <HugeiconsIcon icon={Sun02Icon} size={18} className="shrink-0" />
      )}
    </Button>
  );
}
