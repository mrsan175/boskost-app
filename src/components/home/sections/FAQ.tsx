"use client";
import { useState } from "react";
import { HugeiconsIcon } from "@hugeicons/react";
import { ArrowDown01Icon } from "@hugeicons/core-free-icons";

const faqs = [
  {
    q: "Apakah data penyewa saya aman di Boskost?",
    a: "Sangat aman. Data penyewa dienkripsi dengan standar SHA-256, disimpan semua data Anda di cloud ternama. Privasi data adalah prioritas utama kami dan semua transaksi diproses secara terenkripsi sepenuhnya.",
  },
  {
    q: "Bagaimana cara kerja penagihan otomatis WhatsApp?",
    a: "Sistem kami terhubung langsung dengan WhatsApp Business API. Setiap tanggal jatuh tempo yang Anda tentukan, tagihan otomatis terkirim lengkap dengan nominal, nomor rekening, dan instruksi pembayaran.",
  },
  {
    q: "Apakah saya bisa menggunakan Boskost untuk banyak lokasi kos?",
    a: "Ya! Paket Professional dan Enterprise mendukung manajemen multi-properti dari satu dashboard terpusat. Kelola semua lokasi kos Anda tanpa perlu berpindah akun.",
  },
  {
    q: "Apakah ada biaya tambahan untuk update fitur?",
    a: "Tidak ada biaya tambahan. Semua update fitur dan peningkatan keamanan sudah termasuk dalam paket langganan Anda tanpa biaya tersembunyi.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section
      id="faq"
      className="py-24"
      style={{ background: "var(--surface-container-low)" }}
    >
      <div className="mx-auto max-w-3xl px-6">
        <div className="mb-12 text-center">
          <h2
            className="text-[clamp(1.75rem,3.5vw,2.5rem)] font-bold"
            style={{ fontFamily: "var(--font-display)", color: "var(--on-surface)" }}
          >
            Sering Ditanyakan{" "}
            <em className="not-italic" style={{ color: "var(--primary)" }}>
              (FAQ)
            </em>
          </h2>
          <p className="mt-3 text-sm" style={{ color: "var(--on-surface-variant)" }}>
            Temukan jawaban cepat atas pertanyaan umum Anda.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          {faqs.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden rounded-2xl transition-all"
              style={{
                background: "var(--surface-container-lowest)",
                boxShadow: open === i ? "var(--shadow-float)" : "var(--shadow-ambient)",
                borderRadius: "var(--radius-lg)",
              }}
            >
              <button
                onClick={() => setOpen(open === i ? null : i)}
                className="flex w-full items-center justify-between px-6 py-5 text-left cursor-pointer"
              >
                <span
                  className="pr-6 text-sm font-semibold leading-snug"
                  style={{ fontFamily: "var(--font-display)", color: "var(--on-surface)" }}
                >
                  {faq.q}
                </span>
                <HugeiconsIcon
                  icon={ArrowDown01Icon}
                  size={18}
                  className="shrink-0 transition-transform duration-300"
                  color="var(--primary)"
                  style={{
                    transform: open === i ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                />
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{ maxHeight: open === i ? "200px" : "0px" }}
              >
                <p
                  className="px-6 pb-5 text-sm leading-relaxed"
                  style={{ color: "var(--on-surface-variant)" }}
                >
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
