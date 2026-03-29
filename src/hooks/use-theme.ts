"use client";

import { useEffect, useState } from "react";

export type Theme = "light" | "dark";
export const THEME_STORAGE_KEY = "boskost-theme";
export const THEME_CHANGE_EVENT = "boskost-theme-change";

function getStoredTheme(): Theme {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem(THEME_STORAGE_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia?.("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
}

export function useTheme(): Theme {
    const [currentTheme, setCurrentTheme] = useState<Theme>("light");

    useEffect(() => {
        // Sync initial state
        setCurrentTheme(getStoredTheme());

        const handler = () => {
            setCurrentTheme(getStoredTheme());
        };

        window.addEventListener(THEME_CHANGE_EVENT, handler);
        return () => window.removeEventListener(THEME_CHANGE_EVENT, handler);
    }, []);

    return currentTheme;
}

export function setTheme(newTheme: Theme) {
    if (typeof window === "undefined") return;
    localStorage.setItem(THEME_STORAGE_KEY, newTheme);
    document.documentElement.setAttribute("data-theme", newTheme);
    // Compatibility with some CSS selectors that use .dark class
    if (newTheme === "dark") {
        document.documentElement.classList.add("dark");
    } else {
        document.documentElement.classList.remove("dark");
    }
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT));
}
