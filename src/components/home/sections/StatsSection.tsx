"use client";
import { useEffect, useRef, useState } from "react";

interface StatItem {
  value: number;
  suffix: string;
  prefix?: string;
  label: string;
  description: string;
  color: string;
}

const stats: StatItem[] = [
  {
    value: 12000,
    suffix: "+",
    label: "Kamar Terkelola",
    description: "Di seluruh Indonesia",
    color: "var(--primary)",
  },
  {
    value: 3500,
    suffix: "+",
    label: "Pemilik Kos",
    description: "Mempercayai Boskost",
    color: "var(--secondary-container)",
  },
  {
    value: 98,
    suffix: "%",
    label: "Okupansi Rata-rata",
    description: "Lebih tinggi dari industri",
    color: "var(--tertiary)",
  },
  {
    value: 124,
    suffix: "M",
    prefix: "Rp ",
    label: "Revenue Dikelola",
    description: "Setiap bulannya",
    color: "var(--primary)",
  },
];

function Counter({ value, suffix, prefix = "" }: { value: number; suffix: string; prefix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !started.current) {
          started.current = true;
          const duration = 1800;
          const steps = 60;
          const increment = value / steps;
          let current = 0;
          const timer = setInterval(() => {
            current += increment;
            if (current >= value) {
              setCount(value);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);
        }
      },
      { threshold: 0.5 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {prefix}{count.toLocaleString("id-ID")}{suffix}
    </span>
  );
}

export default function StatsSection() {
  return (
    <section
      className="relative overflow-hidden py-20"
      style={{ background: "var(--surface)" }}
    >
      {/* Decorative spinning ring */}
      <div
        className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full border-4 opacity-10 animate-spin-slow"
        style={{ borderColor: "var(--primary)" }}
      />
      <div
        className="pointer-events-none absolute -bottom-20 -left-20 h-56 w-56 rounded-full border-2 opacity-10 animate-spin-slow"
        style={{ borderColor: "var(--secondary-container)", animationDirection: "reverse" }}
      />

      <div className="mx-auto max-w-7xl px-6">
        {/* Header */}
        <div className="mb-14 text-center animate-reveal-up">
          <div
            className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-bold uppercase tracking-widest"
            style={{ background: "var(--tertiary-container)", color: "var(--on-tertiary-container)" }}
          >
            Dipercaya Ribuan Pemilik Kos
          </div>
          <h2
            className="text-[clamp(1.75rem,3.5vw,2.75rem)] font-extrabold leading-tight"
            style={{ fontFamily: "var(--font-display)", color: "var(--on-surface)" }}
          >
            Angka yang Berbicara{" "}
            <span
              className="bg-clip-text text-transparent pr-1"
              style={{ backgroundImage: "var(--gradient-cta)" }}
            >
              Sendiri
            </span>
          </h2>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className={`shine-on-hover group relative rounded-2xl p-6 text-center transition-all duration-500 hover:-translate-y-3 hover:shadow-2xl delay-${(i + 1) * 100}`}
              style={{
                background: "var(--surface-container-lowest)",
                boxShadow: "var(--shadow-ambient)",
                borderRadius: "var(--radius-xl)",
                border: "1px solid var(--outline-variant)",
              }}
            >
              {/* Glow circle */}
              <div
                className="absolute inset-x-0 top-0 mx-auto h-px w-24 opacity-60 transition-all duration-500 group-hover:opacity-100 group-hover:w-36"
                style={{ background: stat.color }}
              />

              <p
                className="mb-1 text-[clamp(2rem,4vw,3rem)] font-extrabold leading-none tracking-tight"
                style={{ fontFamily: "var(--font-display)", color: stat.color }}
              >
                <Counter value={stat.value} suffix={stat.suffix} prefix={stat.prefix} />
              </p>
              <p
                className="mb-1 text-sm font-bold"
                style={{ color: "var(--on-surface)" }}
              >
                {stat.label}
              </p>
              <p className="text-xs" style={{ color: "var(--on-surface-variant)" }}>
                {stat.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
