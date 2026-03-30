"use client";
import { useState } from "react";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { Menu01Icon, Cancel01Icon } from "@hugeicons/core-free-icons";
import { ThemeSwitcher } from "@/components/theme-switcher";
import useAuth from "@/hooks/useAuth";
import { useAuthModal } from "@/contexts/auth-modal-context";

const navLinks = [
  { label: "Fitur", href: "#features" },
  { label: "Harga", href: "#pricing" },
  { label: "FAQ", href: "#faq" },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { openSignIn, openSignUp } = useAuthModal();
  const { user } = useAuth();

  return (
    <header
      className="sticky top-0 z-50 w-full"
      style={{
        background: "var(--glass-bg)",
        backdropFilter: "blur(var(--glass-blur))",
        WebkitBackdropFilter: "blur(var(--glass-blur))",
        borderBottom: "1px solid rgba(206,200,180,0.18)",
      }}
    >
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <span
            className="text-xl font-extrabold tracking-tight"
            style={{
              fontFamily: "var(--font-display)",
              color: "var(--primary)",
            }}
          >
            Boskost
          </span>
        </Link>

        {/* Desktop links */}
        <ul className="hidden items-center gap-8 md:flex">
          {navLinks.map((l) => (
            <li key={l.label}>
              <Link
                href={l.href}
                className="text-sm font-medium transition-colors"
                style={{ color: "var(--on-surface-variant)" }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.color = "var(--primary)")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.color = "var(--on-surface-variant)")
                }
              >
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />

          {/* CTA group — desktop */}
          <div className="hidden items-center gap-3 md:flex">
            {!user ? (
              <>
                <button
                  onClick={openSignIn}
                  className="text-sm font-semibold transition-colors cursor-pointer"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  Masuk
                </button>
                <button
                  onClick={openSignUp}
                  className="rounded-full px-5 py-2 text-sm font-semibold text-white shadow-sm transition-all hover:-translate-y-0.5 cursor-pointer"
                  style={{ background: "var(--gradient-cta)" }}
                >
                  Daftar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="text-sm font-semibold transition-colors"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  Dashboard
                </Link>
                <Link href="/profile" className="ml-2 text-sm">
                  {user.name ?? user.email}
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu toggle */}
          <button
            className="md:hidden"
            onClick={() => setOpen(!open)}
            style={{ color: "var(--on-surface)" }}
          >
            {open ? (
              <HugeiconsIcon icon={Cancel01Icon} size={18} />
            ) : (
              <HugeiconsIcon icon={Menu01Icon} size={18} />
            )}
          </button>
        </div>
      </nav>

      {/* Mobile drawer */}
      {open && (
        <div
          className="border-t px-6 pb-6 pt-4 md:hidden"
          style={{
            background: "var(--surface-container-low)",
            borderColor: "rgba(206,200,180,0.2)",
          }}
        >
          <ul className="flex flex-col gap-4">
            {navLinks.map((l) => (
              <li key={l.label}>
                <Link
                  href={l.href}
                  className="block text-sm font-medium"
                  style={{ color: "var(--on-surface-variant)" }}
                  onClick={() => setOpen(false)}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="mt-5 flex flex-col gap-3">
            {!user ? (
              <>
                <button
                  onClick={() => {
                    openSignIn();
                    setOpen(false);
                  }}
                  className="text-center text-sm font-semibold"
                  style={{ color: "var(--on-surface)" }}
                >
                  Masuk
                </button>
                <button
                  onClick={() => {
                    openSignUp();
                    setOpen(false);
                  }}
                  className="rounded-full px-5 py-2.5 text-center text-sm font-semibold text-white"
                  style={{ background: "var(--gradient-cta)" }}
                >
                  Daftar
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/dashboard"
                  className="text-center text-sm font-semibold"
                  style={{ color: "var(--on-surface)" }}
                  onClick={() => setOpen(false)}
                >
                  Dashboard
                </Link>
                <div className="flex justify-center mt-2">
                  {user.name ?? user.email}
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
