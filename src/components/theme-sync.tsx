"use client";

import { useEffect } from "react";
import { THEME_STORAGE_KEY } from "@/hooks/use-theme";

/**
 * Re-applies the correct data-theme attribute after React hydration.
 * Needed because React hydration can override the value set by the
 * inline FOUC-prevention script in <head>.
 */
export function ThemeSync() {
    useEffect(() => {
        try {
            const stored = localStorage.getItem(THEME_STORAGE_KEY);
            const theme =
                stored === "light" || stored === "dark"
                    ? stored
                    : window.matchMedia?.("(prefers-color-scheme: light)").matches
                        ? "light"
                        : "dark";
            document.documentElement.setAttribute("data-theme", theme);
        } catch {
            // ignore
        }
    }, []);

    return null;
}
