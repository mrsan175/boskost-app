import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowRight01Icon, PlayIcon } from "@hugeicons/core-free-icons";
import Link from "next/link";
import { Show } from "@clerk/nextjs";
import AuthCTAButton from "@/components/auth-cta-button";

export default function Hero() {
  return (
    <section
      className="relative overflow-hidden"
      style={{ background: "var(--surface)" }}
    >
      {/* Decorative background blobs with infinite pulse/float animations */}
      <div
        className="pointer-events-none absolute -right-32 -top-32 h-[500px] w-[500px] animate-pulse rounded-full opacity-40 blur-3xl mix-blend-multiply"
        style={{
          background: "radial-gradient(circle, rgba(234,88,12,0.3) 0%, transparent 60%)",
          animationDuration: "8s",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-32 -left-32 h-[600px] w-[600px] animate-pulse rounded-full opacity-30 blur-3xl mix-blend-multiply"
        style={{
          background: "radial-gradient(circle, rgba(217,119,6,0.2) 0%, transparent 60%)",
          animationDuration: "12s",
          animationDelay: "2s",
        }}
      />
      {/* Third decorative element: spinning ring */}
      <div
        className="pointer-events-none absolute left-1/3 top-1/2 h-[300px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-5 animate-spin-slow"
        style={{ borderColor: "var(--primary)", borderWidth: "2px" }}
      />
      <div
        className="pointer-events-none absolute left-1/3 top-1/2 h-[500px] w-[500px] -translate-x-1/2 -translate-y-1/2 rounded-full border opacity-5 animate-spin-slow"
        style={{ borderColor: "var(--secondary-container)", borderWidth: "1px", animationDirection: "reverse", animationDuration: "20s" }}
      />

      <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-12 px-6 py-10 lg:grid-cols-2">
        {/* Left copy */}
        <div className="animate-fade-up">
          {/* Eyebrow chip */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-widest" style={{ background: "var(--tertiary-container)", color: "var(--on-tertiary-container)" }}>
            Kost Management
          </div>

          <h1
            className="mb-6 text-[clamp(2.5rem,5vw,4.5rem)] font-extrabold leading-[1.05] tracking-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--on-surface)" }}
          >
            Solusi Cerdas{" "}
            <br className="hidden md:block" />
            <span
              className="bg-clip-text text-transparent italic pr-2"
              style={{
                backgroundImage: "var(--gradient-cta)",
              }}
            >
              Manajemen Kos
            </span>{" "}
            Anda
          </h1>

          <p
            className="mb-8 max-w-md text-base leading-relaxed delay-100 animate-fade-up"
            style={{ color: "var(--on-surface-variant)" }}
          >
            Kelola kamar, penyewa, dan laporan keuangan dalam satu dashboard yang
            mudah digunakan. Tingkatkan efisiensi properti Anda hari ini.
          </p>

          <div className="flex flex-wrap items-center gap-4 delay-200 animate-fade-up">
            <Show when="signed-out">
              <AuthCTAButton
                mode="sign-up"
                className="shine-on-hover animate-glow-pulse inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-95"
                style={{ background: "var(--gradient-cta)", color: "var(--on-primary)" }}
              >
                Mulai Sekarang
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </AuthCTAButton>
            </Show>
            <Show when="signed-in">
              <Link
                href="/dashboard"
                className="shine-on-hover animate-glow-pulse inline-flex items-center gap-2 rounded-full px-7 py-3.5 text-sm font-bold shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl active:scale-95"
                style={{ background: "var(--gradient-cta)", color: "var(--on-primary)" }}
              >
                Buka Dashboard
                <HugeiconsIcon icon={ArrowRight01Icon} size={16} />
              </Link>
            </Show>
            <Link
              href="#"
              className="inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold transition-all hover:-translate-y-0.5"
              style={{
                background: "var(--surface-container-high)",
                color: "var(--on-surface)",
              }}
            >
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full"
                style={{ background: "var(--primary)", color: "var(--on-primary)" }}
              >
                <HugeiconsIcon icon={PlayIcon} size={10} color="var(--on-primary)" />
              </span>
              Lihat Demo
            </Link>
          </div>
        </div>

        {/* Right – dashboard mockup card */}
        <div className="relative delay-300 animate-fade-up">
          <div
            className="relative mx-auto max-w-md rounded-2xl p-4 shadow-2xl lg:ml-auto lg:max-w-lg animate-float"
            style={{
              background: "var(--surface-container-lowest)",
              boxShadow: "var(--shadow-modal)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            {/* Premium Dashboard Image */}
            <div
              className="group relative mb-4 h-[280px] w-full overflow-hidden rounded-xl lg:h-[320px]"
              style={{
                background: "var(--surface-container-high)",
                borderRadius: "var(--radius-lg)",
                boxShadow: "inset 0 2px 10px rgba(0,0,0,0.1)",
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=2070&auto=format&fit=crop"
                alt="Dashboard Analytics"
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-80" />

              {/* Fake overlay UI to make it look like our app */}
              <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                <div className="rounded-lg p-3 backdrop-blur-md" style={{ background: "rgba(255,255,255,0.15)", border: "1px solid rgba(255,255,255,0.3)" }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-white/80">Net Revenue</p>
                  <p className="text-xl font-extrabold text-white" style={{ fontFamily: "var(--font-display)" }}>Rp 124.5M</p>
                </div>
                <div className="flex gap-2">
                  <div className="h-2 w-2 rounded-full bg-green-400 shadow-[0_0_10px_rgba(74,222,128,0.8)] animate-pulse" />
                  <span className="text-[10px] font-bold text-white shadow-black drop-shadow-md">LIVE</span>
                </div>
              </div>
            </div>

            {/* Floating stat pill — top right */}
            <div
              className="absolute -right-4 -top-6 flex items-center gap-3 rounded-2xl px-4 py-3 shadow-xl transition-transform hover:scale-105"
              style={{
                background: "var(--surface-container-lowest)",
                boxShadow: "var(--shadow-float)",
                animation: "float 6s ease-in-out infinite",
              }}
            >
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-bold shadow-inner"
                style={{ background: "var(--gradient-cta)", color: "var(--on-primary)" }}
              >
                98%
              </div>
              <div>
                <p className="text-xs font-bold" style={{ color: "var(--on-surface)" }}>
                  Okupansi Kamar
                </p>
                <p className="text-xs font-semibold" style={{ color: "var(--primary)" }}>
                  ↑ +5% bulan ini
                </p>
              </div>
            </div>



            {/* Mini stats row */}
            <div className="mt-2 grid grid-cols-3 gap-2">
              {[
                { label: "Kamar Aktif", val: "24" },
                { label: "Penyewa", val: "21" },
                { label: "Pendapatan", val: "Rp 42jt" },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-xl border px-3 py-2.5 text-center transition-all duration-300 hover:-translate-y-1 hover:shadow-md"
                  style={{
                    background: "var(--surface-container-low)",
                    borderColor: "var(--outline-variant)"
                  }}
                >
                  <p
                    className="text-lg font-extrabold"
                    style={{
                      fontFamily: "var(--font-display)",
                      color: "var(--on-surface)",
                    }}
                  >
                    {s.val}
                  </p>
                  <p className="text-[10px] uppercase tracking-wider font-semibold mt-0.5" style={{ color: "var(--on-surface-variant)" }}>
                    {s.label}
                  </p>
                </div>
              ))}

              <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes float {
                  0% { transform: translateY(0px) rotate(0deg); }
                  50% { transform: translateY(-10px) rotate(1deg); }
                  100% { transform: translateY(0px) rotate(0deg); }
                }
              `}} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}