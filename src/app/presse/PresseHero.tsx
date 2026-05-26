import { Newspaper } from "lucide-react";

export function PresseHero() {
  return (
    <section
      aria-labelledby="presse-hero-title"
      className="relative overflow-hidden py-24 md:py-32 px-4"
      style={{ background: "#1A1A2E" }}
    >
      {/* Glow ambient subtil */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 50% at 50% 0%, rgba(91,78,196,0.20) 0%, rgba(26,26,46,0) 70%)",
        }}
      />

      <div className="relative max-w-3xl mx-auto text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold tracking-wide uppercase"
          style={{
            background: "rgba(91,78,196,0.18)",
            color: "#C9C2F5",
            border: "1px solid rgba(91,78,196,0.30)",
            letterSpacing: "0.08em",
          }}
        >
          <Newspaper size={14} aria-hidden="true" />
          Espace presse
        </div>

        <h1
          id="presse-hero-title"
          className="text-4xl md:text-6xl font-extrabold tracking-tight mb-5"
          style={{
            color: "#FAFAF8",
            fontFamily: "var(--font-jakarta)",
            letterSpacing: "-0.03em",
            lineHeight: 1.05,
          }}
        >
          Parler de Nami&nbsp;?
          <br />
          Voici les ressources officielles.
        </h1>

        <p
          className="text-base md:text-lg mt-4 max-w-2xl mx-auto"
          style={{ color: "rgba(238,236,234,0.7)", lineHeight: 1.6 }}
        >
          Boilerplate institutionnel, logos, contact dédié et coordonnées
          juridiques pour les rédactions, médias spécialisés santé, podcasts
          et organisations professionnelles.
        </p>
      </div>
    </section>
  );
}
