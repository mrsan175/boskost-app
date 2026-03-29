const brands = [
  "Kos Melati Jakarta",
  "Griya Lestari Bandung",
  "Rumah Kos Harmoni",
  "Kos Premium Surabaya",
  "Villa Kost Bali",
  "Kos Sejahtera Semarang",
  "Kos Nyaman Jogja",
  "Graha Kost Malang",
  "Kos Bahagia Medan",
  "Kost Modern Makassar",
];

export default function Marquee() {
  return (
    <section
      className="relative overflow-hidden py-5 border-y"
      style={{
        background: "var(--surface-container-low)",
        borderColor: "var(--outline-variant)",
      }}
    >
      {/* Fade masks left and right */}
      <div
        className="pointer-events-none absolute left-0 top-0 z-10 h-full w-24"
        style={{
          background:
            "linear-gradient(to right, var(--surface-container-low), transparent)",
        }}
      />
      <div
        className="pointer-events-none absolute right-0 top-0 z-10 h-full w-24"
        style={{
          background:
            "linear-gradient(to left, var(--surface-container-low), transparent)",
        }}
      />

      <div className="flex">
        {/* Duplicate the list twice for seamless loop */}
        <div
          className="animate-marquee flex shrink-0 items-center gap-12 pr-12"
          style={{ willChange: "transform" }}
        >
          {[...brands, ...brands].map((name, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0">
              {/* Dot accent */}
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: "var(--primary)" }}
              />
              <span
                className="whitespace-nowrap text-sm font-semibold"
                style={{ color: "var(--on-surface-variant)" }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
        {/* Duplicate for true seamless */}
        <div
          className="animate-marquee flex shrink-0 items-center gap-12 pr-12"
          aria-hidden
          style={{ willChange: "transform" }}
        >
          {[...brands, ...brands].map((name, i) => (
            <div key={i} className="flex items-center gap-3 shrink-0">
              <span
                className="h-2 w-2 rounded-full shrink-0"
                style={{ background: "var(--primary)" }}
              />
              <span
                className="whitespace-nowrap text-sm font-semibold"
                style={{ color: "var(--on-surface-variant)" }}
              >
                {name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
