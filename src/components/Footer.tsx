"use client";
import Link from "next/link";
import { HugeiconsIcon } from "@hugeicons/react";
import { InstagramIcon, TwitterIcon, YoutubeIcon } from "@hugeicons/core-free-icons";

const cols = [
  {
    heading: "Quick Links",
    links: [
      { label: "Fitur", href: "#features" },
      { label: "Harga", href: "#pricing" },
      { label: "FAQ", href: "#faq" },
    ],
  },
  {
    heading: "Support",
    links: [
      { label: "Pusat Bantuan", href: "#" },
      { label: "Kontak", href: "#" },
      { label: "Privasi", href: "#" },
      { label: "Syarat & Ketentuan", href: "#" },
    ],
  },
  {
    heading: "Subscription",
    links: [
      { label: "Paket Starter", href: "#pricing" },
      { label: "Paket Professional", href: "#pricing" },
      { label: "Paket Enterprise", href: "#pricing" },
      { label: "Coba Gratis", href: "#" },
    ],
  },
];

export default function Footer() {
  return (
    <footer
      className="border-t pt-16 pb-10"
      style={{
        background: "var(--surface-container-low)",
        borderColor: "rgba(206,200,180,0.2)",
      }}
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-12 grid grid-cols-2 gap-8 sm:grid-cols-4 lg:grid-cols-4">
          {/* Brand col */}
          <div className="col-span-2 sm:col-span-1">
            <span
              className="text-2xl font-extrabold"
              style={{ fontFamily: "var(--font-display)", color: "var(--primary)" }}
            >
              Boskost
            </span>
            <p
              className="mt-3 max-w-[200px] text-xs leading-relaxed"
              style={{ color: "var(--on-surface-variant)" }}
            >
              Solusi manajemen properti kos terdepan di Indonesia. Efisien, terpercaya, dan mudah digunakan.
            </p>
            <div className="mt-5 flex gap-3">
              {[InstagramIcon, TwitterIcon, YoutubeIcon].map((icon, i) => (
                <Link
                  key={i}
                  href="#"
                  className="flex h-8 w-8 items-center justify-center rounded-full transition-all hover:-translate-y-0.5"
                  style={{
                    background: "var(--surface-container-high)",
                    color: "var(--on-surface-variant)",
                  }}
                >
                  <HugeiconsIcon icon={icon} size={14} />
                </Link>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {cols.map((col) => (
            <div key={col.heading}>
              <p
                className="mb-4 text-xs font-bold uppercase tracking-widest"
                style={{ color: "var(--on-surface)" }}
              >
                {col.heading}
              </p>
              <ul className="flex flex-col">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <Link
                      href={l.href}
                      className="text-xs transition-colors py-1 block hover:bg-transparent"
                      style={{ color: "var(--on-surface-variant)" }}
                      onMouseEnter={(e) => (e.currentTarget.style.color = "var(--primary)")}
                      onMouseLeave={(e) => (e.currentTarget.style.color = "var(--on-surface-variant)")}
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div
          className="flex flex-col items-center justify-between gap-3 border-t pt-8 sm:flex-row"
          style={{ borderColor: "rgba(206,200,180,0.2)" }}
        >
          <p className="text-xs" style={{ color: "var(--on-surface-variant)" }}>
            © {new Date().getFullYear()} Boskost. Hak cipta dilindungi undang-undang.
          </p>
          <p className="text-xs" style={{ color: "var(--on-surface-variant)" }}>
            Dibuat dengan ❤️ untuk pemilik kos Indonesia
          </p>
        </div>
      </div>
    </footer>
  );
}
