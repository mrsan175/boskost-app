import { HugeiconsIcon } from "@hugeicons/react";
import { StarIcon } from "@hugeicons/core-free-icons";

export default function Testimonial() {
  return (
    <section
      className="py-24"
      style={{ background: "var(--surface)" }}
    >
      <div className="mx-auto max-w-3xl px-6">
        <div
          className="rounded-3xl p-10 text-center transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl hover:scale-[1.02]"
          style={{
            background: "var(--surface-container-lowest)",
            boxShadow: "var(--shadow-float)",
            borderRadius: "var(--radius-xl)",
          }}
        >
          {/* Stars */}
          <div className="mb-5 flex justify-center gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <HugeiconsIcon key={i} icon={StarIcon} size={18} color="var(--primary)" />
            ))}
          </div>

          {/* Quote */}
          <blockquote
            className="mb-8 text-xl font-medium leading-relaxed"
            style={{ fontFamily: "var(--font-display)", color: "var(--on-surface)" }}
          >
            &ldquo;Sejak menggunakan Boskost, saya tidak perlu lagi pusing menagih uang
            sewa secara manual. Semua otomatis dan laporan keuangan saya sekarang jauh
            lebih rapi. Benar-benar penghemat waktu yang luar biasa!&rdquo;
          </blockquote>

          {/* Author */}
          <div className="flex items-center justify-center gap-4">
            {/* Avatar */}
            <div
              className="h-12 w-12 rounded-full shadow-lg overflow-hidden object-cover"
            >
              <img
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop"
                alt="Bapak Andre Wijaya"
                className="h-full w-full object-cover"
              />
            </div>
            <div className="text-left">
              <p
                className="text-sm font-bold"
                style={{ fontFamily: "var(--font-display)", color: "var(--on-surface)" }}
              >
                Bapak Andre Wijaya
              </p>
              <p className="text-xs" style={{ color: "var(--on-surface-variant)" }}>
                Pemilik 32 Pintu Kamar Kos, Jakarta
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
