"use client";

import { useEffect, useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowUp01Icon } from "@hugeicons/core-free-icons";
import { Button } from "@/components/ui/button";

export function ScrollToTop() {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 100);
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => window.removeEventListener("scroll", onScroll);
    }, []);

    if (!visible) return null;

    return (
        <Button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            aria-label="Scroll to top"
            size="icon"
            className="fixed bottom-6 right-6 z-50 rounded-full transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95 border-0 shadow-lg"
            style={{ background: "var(--gradient-cta)", color: "var(--on-primary)" }}
        >
            <HugeiconsIcon icon={ArrowUp01Icon} size={20} />
        </Button>
    );
}
