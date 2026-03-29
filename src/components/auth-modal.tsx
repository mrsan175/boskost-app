"use client";
import { useEffect } from "react";
import { SignIn, SignUp, useAuth } from "@clerk/nextjs";
import { useAuthModal } from "@/contexts/auth-modal-context";
import { useRouter } from "next/navigation";

export default function AuthModal() {
  const { modal, close } = useAuthModal();
  const { isSignedIn } = useAuth();
  const router = useRouter();

  // Auto-close modal & refresh when user signs in
  useEffect(() => {
    if (isSignedIn && modal) {
      close();
      router.push("/dashboard");
      router.refresh();
    }
  }, [isSignedIn, modal, close, router]);

  useEffect(() => {
    if (!modal) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [modal, close]);

  useEffect(() => {
    document.body.style.overflow = modal ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [modal]);

  if (!modal) return null;

  return (
    <div
      className="fixed inset-0 z-999 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.55)", backdropFilter: "blur(6px)" }}
      onClick={close}
    >
      <div
        className="relative animate-fade-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={close}
          className="absolute -right-3 -top-3 z-10 flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold shadow-lg transition hover:scale-110"
          style={{
            background: "var(--surface-container-highest)",
            color: "var(--on-surface)",
            border: "1px solid var(--outline-variant)",
          }}
        >
          ✕
        </button>

        {modal === "sign-in" ? (
          <SignIn
            routing="hash"
            forceRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "shadow-none",
                card: "shadow-none border-0",
              },
            }}
            signUpUrl="#"
          />
        ) : (
          <SignUp
            routing="hash"
            forceRedirectUrl="/dashboard"
            appearance={{
              elements: {
                rootBox: "shadow-none",
                card: "shadow-none border-0",
              },
            }}
            signInUrl="#"
          />
        )}
      </div>
    </div>
  );
}