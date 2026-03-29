"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { buttonVariants } from "@/components/ui/button";

interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "default" | "destructive";
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Lanjutkan",
  cancelText = "Batal",
  variant = "default",
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent 
        className="rounded-[2rem] border shadow-2xl"
        style={{ background: "var(--surface-container-lowest)", borderColor: "var(--outline-variant)" }}
      >
        <AlertDialogHeader>
          <AlertDialogTitle className="text-xl font-bold" style={{ fontFamily: "var(--font-display)", color: "var(--on-surface)" }}>
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-sm font-medium" style={{ color: "var(--on-surface-variant)" }}>
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2">
          <AlertDialogCancel className="rounded-full font-bold border-2" style={{ borderColor: "var(--outline-variant)" }}>
            {cancelText}
          </AlertDialogCancel>
          <AlertDialogAction
            className="rounded-full font-bold text-white shadow-lg"
            style={{ 
              background: variant === "destructive" ? "var(--error)" : "var(--gradient-cta)",
            }}
            onClick={(e) => {
              e.stopPropagation();
              onConfirm();
            }}
          >
            {confirmText}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
