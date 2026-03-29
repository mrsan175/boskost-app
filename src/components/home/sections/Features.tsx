import { HugeiconsIcon } from "@hugeicons/react";
import { BedDoubleIcon, UserGroupIcon, CreditCardIcon, BarChartIcon, ArrowRight01Icon } from "@hugeicons/core-free-icons";
import Link from "next/link";

const features = [
  {
    icon: BedDoubleIcon,
    title: "Room Management",
    desc: "Visualisasikan status setiap kamar secara real-time. Kelola fasilitas, tagihan, dan harga dalam tampilan yang rapi.",
    tags: ["Kamar", "Maintenance Log"],
    accent: false,
  },
  {
    icon: UserGroupIcon,
    title: "Tenant Records",
    desc: "Data penyewa terintegrasi dan lengkap dengan riwayat kontrak dan dokumen identitas.",
    tags: [],
    cta: "Kelola Data",
    accent: true,
  },
  {
    icon: CreditCardIcon,
    title: "Automated Billing",
    desc: "Sistem penagihan otomatis via WhatsApp & Email. Dapatkan tagihan tepat pada keterlambatan pembayaran.",
    tags: ["Tagihan Otomatis", "Pengingat Pembayaran"],
    accent: false,
    accentAlt: true,
  },
  {
    icon: BarChartIcon,
    title: "Financial Reports",
    desc: "Laporan keuangan bulanan, dan pernyataan operasional yang detail dan dapat diunggah kapan saja.",
    tags: ["Export Excel/PDF", "Grafik Arus Bulanan"],
    accent: false,
    hasChart: true,
  },
];

const MiniChart = () => {
  // 1. Palet BARU: Hanya menggunakan warna-warna gelap/kaya dari palet kamu
  // agar kontrasnya tinggi di atas latar belakang putih kartu.
  const richPaletteColors = [
    "var(--primary)",           /* 0: Terracotta */
    "var(--secondary)",         /* 1: Cokelat Hangat */
    "var(--primary-container)", /* 2: Terracotta Gelap */
    "var(--tertiary)",          /* 3: Hijau (Aksen) */
  ];

  // 2. Data BARU: Hanya ada 5 batang (candles)
  const chartData = [60, 80, 70, 110, 50];

  // 3. Pola warna fixed untuk 5 batang agar terlihat bervariasi
  const colorPattern = [0, 1, 3, 2, 0];

  return (
    // Lebar disesuaikan ke w-1/3 agar 5 batang tidak terlihat terlalu mulur
    <div className="w-1/3 flex items-end gap-1.5 h-auto min-h-[60px]">
      {chartData.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-sm transition-all hover:opacity-80 hover:-translate-y-0.5"
          style={{
            height: `${h}%`,
            // Menggunakan palet warna gelap/kaya
            background: richPaletteColors[colorPattern[i]],
          }}
        />
      ))}
    </div>
  );
};

export default function Features() {
  return (
    <section
      id="features"
      className="py-24"
      style={{ background: "var(--surface-container-low)" }}
    >
      <div className="mx-auto max-w-7xl px-6">
        {/* Header row */}
        <div className="mb-14 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2
              className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-tight"
              style={{ fontFamily: "var(--font-display)", color: "var(--on-surface)" }}
            >
              Fitur Utama Untuk{" "}
              <em className="not-italic" style={{ color: "var(--primary)" }}>
                Efisiensi Maksimal
              </em>
            </h2>
            <p
              className="mt-3 max-w-lg text-sm leading-relaxed"
              style={{ color: "var(--on-surface-variant)" }}
            >
              Semua yang Anda butuhkan untuk mengelola properti dari genggaman tangan.
            </p>
          </div>
          <Link
            href="#"
            className="inline-flex shrink-0 items-center gap-1 text-sm font-semibold hover:opacity-80 transition-opacity"
            style={{ color: "var(--primary)" }}
          >
            Lihat Semua Fitur <HugeiconsIcon icon={ArrowRight01Icon} size={14} />
          </Link>
        </div>

        {/* Feature grid — editorial asymmetric layout */}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">

          {/* Card 1 — Room Management (spans 2 cols on lg) */}
          <div
            className="group rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl lg:col-span-2"
            style={{
              background: "var(--surface-container-lowest)",
              boxShadow: "var(--shadow-ambient)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <div className="my-auto">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 group-hover:bg-primary text-primary"
                  style={{ background: "var(--surface-container-low)" }}
                >
                  <HugeiconsIcon icon={BedDoubleIcon} size={20} color="inherit" />
                </div>
                <h3
                  className="text-lg font-bold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--on-surface)" }}
                >
                  Room Management
                </h3>
              </div>
              <p className="mb-4 max-w-sm text-sm leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>
                Visualisasikan status setiap kamar secara real-time. Kelola fasilitas,
                tagihan, dan harga dalam tampilan yang rapi.
              </p>
              <div className="flex flex-wrap gap-2">
                {["Kamar", "Maintenance Log"].map((t) => (
                  <span
                    key={t}
                    className="rounded-full px-3 py-1 text-xs font-medium"
                    style={{ background: "var(--surface-container-high)", color: "var(--on-surface-variant)" }}
                  >
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 2 — Tenant Records (accent terracotta) */}
          <div
            className="group rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            style={{
              background: "var(--primary-container)",
              boxShadow: "var(--shadow-float)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <div className="my-auto">

              <div className="flex items-center gap-2 mb-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 group-hover:bg-primary text-primary"
                  style={{ background: "var(--surface-container-low)" }}
                >
                  <HugeiconsIcon icon={UserGroupIcon} size={20} color="inherit" />
                </div>
                <h3
                  className="text-lg font-bold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--on-primary-container)" }}
                >
                  Tenant Records
                </h3>
              </div>
              <p className="mb-5 text-sm leading-relaxed" style={{ color: "var(--on-primary-container)" }}>
                Data penyewa terintegrasi lengkap dengan riwayat kontrak dan dokumen identitas.
              </p>
              <button
                className="rounded-full px-5 py-2 text-xs font-bold transition-all hover:-translate-y-0.5 hover:bg-white/10"
                style={{ background: "transparent", color: "var(--on-primary-container)", border: "1px solid var(--on-primary-container)" }}
              >
                Kelola Data
              </button>
            </div>
          </div>

          {/* Card 3 — Automated Billing (dark mahogany) */}
          <div
            className="group rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl"
            style={{
              background: "var(--on-surface)",
              boxShadow: "var(--shadow-float)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <div className="my-auto">
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 group-hover:bg-primary text-primary"
                  style={{ background: "var(--surface-container-low)" }}
                >
                  <HugeiconsIcon icon={CreditCardIcon} size={20} color="inherit" />
                </div>
                <h3
                  className="text-lg font-bold"
                  style={{ fontFamily: "var(--font-display)", color: "var(--surface)" }}
                >
                  Automated Billing
                </h3>
              </div>
              <p className="mb-4 text-sm leading-relaxed" style={{ color: "var(--surface-container-highest)" }}>
                Sistem penagihan otomatis via WhatsApp & Email. Tagihan tepat waktu.
              </p>
              <div className="flex flex-col gap-1.5">
                {["Tagihan WhatsApp/Otomatis", "Pengingat Pembayaran"].map((t) => (
                  <span key={t} className="flex items-center gap-2 text-xs" style={{ color: "var(--surface-container-highest)" }}>
                    <span className="h-1 w-1 rounded-full" style={{ background: "var(--primary)" }} />
                    {t}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Card 4 — Financial Reports (spans 2 cols on lg) */}
          <div
            className="group rounded-2xl p-6 transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl lg:col-span-2 flex flex-col justify-between"
            style={{
              background: "var(--surface-container-lowest)",
              boxShadow: "var(--shadow-ambient)",
              borderRadius: "var(--radius-xl)",
            }}
          >
            <div className="my-auto">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-4">
                    <div
                      className="flex h-10 w-10 items-center justify-center rounded-xl transition-transform duration-500 group-hover:scale-110 group-hover:bg-primary text-primary"
                      style={{ background: "var(--surface-container-low)" }}
                    >
                      <HugeiconsIcon icon={BarChartIcon} size={20} color="inherit" />
                    </div>
                    <h3
                      className="text-lg font-bold"
                      style={{ fontFamily: "var(--font-display)", color: "var(--on-surface)" }}
                    >
                      Financial Reports
                    </h3>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed" style={{ color: "var(--on-surface-variant)" }}>
                    Laporan keuangan bulanan dan pernyataan operasional yang detail dan dapat diekspor kapan saja.
                  </p>
                  <div className="flex flex-wrap gap-2 mb-4 sm:mb-0">
                    {["Export Excel/PDF", "Grafik Arus Bulanan"].map((t) => (
                      <span key={t} className="flex items-center gap-1.5 text-xs" style={{ color: "var(--primary)" }}>
                        <span className="h-1.5 w-1.5 rounded-full" style={{ background: "var(--primary)" }} />
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                {/* Posisi MiniChart diletakkan berdampingan untuk layar besar */}
                <MiniChart />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}