import { Landmark } from "lucide-react";

export function PartenairesHero() {
  return (
    <header
      className="text-center pt-20 pb-12 md:pt-28 md:pb-16 px-4"
      style={{
        background:
          "linear-gradient(180deg, #FAFAF8 0%, #fff 100%)",
      }}
      aria-labelledby="partenaires-hero-title"
    >
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
        style={{
          background: "rgba(91,78,196,0.08)",
          color: "#5B4EC4",
          border: "1px solid rgba(91,78,196,0.15)",
        }}
      >
        <Landmark size={12} aria-hidden="true" />
        Partenariats institutionnels
      </div>

      <h1
        id="partenaires-hero-title"
        className="text-3xl md:text-5xl font-extrabold tracking-tight mb-5 max-w-3xl mx-auto"
        style={{
          color: "#1A1A2E",
          fontFamily: "var(--font-jakarta)",
          lineHeight: 1.1,
          letterSpacing: "-0.03em",
        }}
      >
        Coordination de parcours,
        <br />
        <span style={{ color: "#5B4EC4" }}>au service des institutions</span>
      </h1>

      <p
        className="text-base md:text-lg max-w-2xl mx-auto"
        style={{ color: "#374151", lineHeight: 1.6 }}
      >
        Nami met sa technologie de coordination au service des ARS, CPTS,
        hôpitaux, mutuelles, réseaux de soins et dispositifs d&apos;appui à
        la coordination. Une approche sobre, conforme et adaptable à votre
        périmètre.
      </p>
    </header>
  );
}
