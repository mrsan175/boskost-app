"use client";
import { useAuthModal } from "@/contexts/auth-modal-context";

interface AuthCTAButtonProps {
  mode: "sign-in" | "sign-up";
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}

export default function AuthCTAButton({ mode, className, style, children }: AuthCTAButtonProps) {
  const { openSignIn, openSignUp } = useAuthModal();

  return (
    <button
      onClick={mode === "sign-in" ? openSignIn : openSignUp}
      className={className}
      style={style}
    >
      {children}
    </button>
  );
}
