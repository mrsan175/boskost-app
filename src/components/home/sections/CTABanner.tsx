import Link from "next/link";
import { Show } from "@clerk/nextjs";
import AuthCTAButton from "@/components/auth-cta-button";

export default function CTABanner() {
  return (
    <section style={{ background: "var(--surface-container-low)" }}>
      <div
        className="mx-auto w-full overflow-hidden px-10 py-16 text-center relative"
        style={{ background: "var(--primary-container)" }}
      >
        {/* Decorative circles */}
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full opacity-20 animate-pulse"
          style={{ background: "radial-gradient(circle, var(--on-primary-container) 0%, transparent 70%)", animationDuration: "4s" }}
        />
        <div
          className="pointer-events-none absolute -bottom-10 -left-10 h-40 w-40 rounded-full opacity-15 animate-pulse"
          style={{ background: "radial-gradient(circle, var(--on-primary-container) 0%, transparent 70%)", animationDuration: "6s", animationDelay: "1s" }}
        />

        <h2
          className="mb-4 text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight"
          style={{ fontFamily: "var(--font-display)", color: "var(--on-primary-container)" }}
        >
          Siap Untuk Memulai<br />Digitalisasi Properti Anda?
        </h2>
        <p className="mx-auto mb-10 max-w-md text-sm leading-relaxed" style={{ color: "var(--on-primary-container)" }}>
          Bergabunglah dengan ribuan pemilik kos yang telah beralih ke manajemen
          cerdas bersama Boskost.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          <Show when="signed-out">
            <AuthCTAButton
              mode="sign-up"
              className="rounded-full px-8 py-3.5 text-sm font-bold shadow-lg transition-transform duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl active:scale-95"
              style={{ background: "var(--on-primary-container)", color: "var(--primary-container)" }}
            >
              Daftar Sekarang
            </AuthCTAButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/dashboard"
              className="rounded-full px-8 py-3.5 text-sm font-bold shadow-lg transition-transform duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl active:scale-95"
              style={{ background: "var(--on-primary-container)", color: "var(--primary-container)" }}
            >
              Buka Dashboard
            </Link>
          </Show>
          <Link
            href="#"
            className="rounded-full px-8 py-3.5 text-sm font-bold transition-all duration-300 hover:-translate-y-1 hover:bg-white/10 active:scale-95"
            style={{
              background: "transparent",
              color: "var(--on-primary-container)",
              border: "1.5px solid var(--on-primary-container)",
            }}
          >
            Konsultasi Gratis
          </Link>
        </div>
      </div>
    </section>
  );
}