import { HugeiconsIcon } from "@hugeicons/react";
import { CheckmarkCircle01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

const plans = [
  {
    name: "Starter",
    price: "Rp 99k",
    period: "/bulan",
    desc: "Untuk pemilik kos yang baru memulai digitalisasi.",
    features: [
      "Hingga 10 Kamar",
      "Manajemen Penyewa Dasar",
      "Tagihan Manual Digital",
    ],
    cta: "Pilih Starter",
    accent: false,
    popular: false,
  },
  {
    name: "Professional",
    price: "Rp 249k",
    period: "/bulan",
    desc: "Paket terlengkap untuk pemilik kos yang serius.",
    features: [
      "Kamar Tak Terbatas",
      "Tagihan WhatsApp/Otomatis",
      "Laporan Keuangan Real-time",
      "Akses Multi-perangkat",
      "Prioritas Support 24/7",
    ],
    cta: "Mulai Pro Sekarang",
    accent: true,
    popular: true,
  },
  {
    name: "Enterprise",
    price: "Hubungi Kami",
    period: "",
    desc: "Solusi khusus untuk portofolio properti besar.",
    features: [
      "Custom API Integration",
      "Dedicated Account Manager",
      "White-label Solution",
      "SLA Support 24/7",
    ],
    cta: "Hubungi Sales",
    accent: false,
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section
      className="py-24"
      style={{ background: "var(--surface)" }}
      id="pricing"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-14 text-center">
          <h2
            className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--on-surface)" }}
          >
            Pilih Paket{" "}
            <em className="not-italic" style={{ color: "var(--primary)" }}>
              Terbaik
            </em>{" "}
            Anda
          </h2>
          <p
            className="mx-auto mt-3 max-w-md text-sm leading-relaxed"
            style={{ color: "var(--on-surface-variant)" }}
          >
            Investasi cerdas untuk efisiensi jangka panjang properti Anda. Pilih paket
            yang sesuai dengan kebutuhan saat ini.
          </p>
        </div>

        <div className="grid grid-cols-1 items-start gap-6 md:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className="relative rounded-2xl p-7 transition-all hover:-translate-y-1"
              style={{
                background: plan.accent ? "var(--primary-container)" : "var(--surface-container-lowest)",
                boxShadow: plan.accent ? "var(--shadow-modal)" : "var(--shadow-ambient)",
                borderRadius: "var(--radius-xl)",
                transform: plan.accent ? "scale(1.04)" : undefined,
              }}
            >
              {/* Popular badge */}
              {plan.popular && (
                <div
                  className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full px-4 py-1 text-[11px] font-bold uppercase tracking-wider"
                  style={{ background: "var(--tertiary-container)", color: "var(--on-tertiary-container)" }}
                >Paling Populer</div>
              )}

              <p
                className="mb-1 text-sm font-semibold"
                style={{
                  fontFamily: "var(--font-display)",
                  color: plan.accent ? "var(--on-primary-container)" : "var(--on-surface-variant)",
                }}
              >
                {plan.name}
              </p>

              <div className="mb-1 flex items-baseline gap-1">
                <span
                  className="text-[clamp(1.75rem,3vw,2.25rem)] font-extrabold"
                  style={{
                    fontFamily: "var(--font-display)",
                    color: plan.accent ? "var(--on-primary-container)" : "var(--on-surface)",
                  }}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className="text-sm"
                    style={{ color: plan.accent ? "var(--on-primary-container)" : "var(--on-surface-variant)" }}
                  >
                    {plan.period}
                  </span>
                )}
              </div>

              <p
                className="mb-6 text-xs leading-relaxed"
                style={{ color: plan.accent ? "var(--on-primary-container)" : "var(--on-surface-variant)" }}
              >
                {plan.desc}
              </p>

              <ul className="mb-8 flex flex-col gap-3">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2.5">
                    <HugeiconsIcon
                      icon={CheckmarkCircle01Icon}
                      size={15}
                      className="mt-0.5 shrink-0"
                      color={plan.accent ? "var(--on-primary-container)" : "var(--primary)"}
                    />
                    <span
                      className="text-xs leading-relaxed"
                      style={{ color: plan.accent ? "var(--on-primary-container)" : "var(--on-surface-variant)" }}
                    >
                      {f}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="#"
                className="block w-full rounded-full py-3 text-center text-sm font-bold transition-all hover:-translate-y-0.5"
                style={
                  plan.accent
                    ? { background: "var(--tertiary-container)", color: "var(--on-tertiary-container)" }
                    : {
                      background: "transparent",
                      color: "var(--on-surface)",
                      border: "1.5px solid var(--outline-variant)",
                    }
                }
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
