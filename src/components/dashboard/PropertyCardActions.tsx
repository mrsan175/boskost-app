"use client";

import { useState } from "react";
import { EditPropertyDialog } from "@/components/dashboard/EditPropertyDialog";
import { Button } from "@/components/ui/button";
import { HugeiconsIcon } from "@hugeicons/react";
import { Edit02Icon } from "@hugeicons/core-free-icons";

interface PropertyCardActionsProps {
  property: {
    id: string;
    name: string;
    address: string | null;
    city: string | null;
  };
  /** If true, button always visible (for detail page). Default: hover-only. */
  alwaysVisible?: boolean;
}

export function PropertyCardActions({ property, alwaysVisible }: PropertyCardActionsProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={[
          "h-8 px-3 rounded-xl gap-1.5 text-xs font-bold transition-opacity",
          alwaysVisible ? "opacity-100" : "opacity-0 group-hover:opacity-100",
        ].join(" ")}
        title="Edit properti"
        style={{ color: "var(--on-surface-variant)", borderColor: "var(--outline-variant)" }}
      >
        <HugeiconsIcon icon={Edit02Icon} size={13} />
        Edit
      </Button>

      <EditPropertyDialog open={open} onOpenChange={setOpen} property={property} />
    </>
  );
}

