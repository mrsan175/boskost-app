"use client";
import { createContext, useContext, useState } from "react";

type ModalType = "sign-in" | "sign-up" | null;

interface AuthModalContextValue {
  modal: ModalType;
  openSignIn: () => void;
  openSignUp: () => void;
  close: () => void;
}

const AuthModalContext = createContext<AuthModalContextValue | null>(null);

export function AuthModalProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<ModalType>(null);

  return (
    <AuthModalContext.Provider
      value={{
        modal,
        openSignIn: () => setModal("sign-in"),
        openSignUp: () => setModal("sign-up"),
        close: () => setModal(null),
      }}
    >
      {children}
    </AuthModalContext.Provider>
  );
}

export function useAuthModal() {
  const ctx = useContext(AuthModalContext);
  if (!ctx) throw new Error("useAuthModal must be used inside AuthModalProvider");
  return ctx;
}