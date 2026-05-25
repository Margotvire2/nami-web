import Link from "next/link";
import { ArrowRight, Sparkles, HandHeart } from "lucide-react";
import { STAT_AIDANTS } from "./proches-data";

export function ProchesHero() {
  return (
    <header
      className="text-center pt-20 pb-16 md:pt-28 md:pb-20 px-4"
      style={{
        background: "linear-gradient(180deg, #FAFAF8 0%, #fff 100%)",
      }}
      aria-labelledby="proches-hero-title"
    >
      <div
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
        style={{
          background: "rgba(91,78,196,0.08)",
          color: "#5B4EC4",
          border: "1px solid rgba(91,78,196,0.15)",
        }}
      >
        <Sparkles size={12} aria-hidden="true" />
        Pour les proches
      </div>

      <div
        className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5"
        style={{ background: "rgba(91,78,196,0.08)", color: "#5B4EC4" }}
        aria-hidden="true"
      >
        <HandHeart size={26} strokeWidth={1.8} />
      </div>

      <h1
        id="proches-hero-title"
        className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 max-w-3xl mx-auto"
        style={{
          color: "#1A1A2E",
          fontFamily: "var(--font-jakarta)",
          lineHeight: 1.05,
          letterSpacing: "-0.03em",
        }}
      >
        Vous accompagnez
        <br />
        <span style={{ color: "#5B4EC4" }}>un proche&nbsp;?</span>
      </h1>

      <p
        className="text-lg md:text-xl mb-10 max-w-2xl mx-auto"
        style={{ color: "#374151", lineHeight: 1.5 }}
      >
        Centralisez ses rendez-vous, ses documents et ses échanges avec ses
        soignants. En un seul endroit, avec son consentement explicite.
      </p>

      <div className="flex flex-col sm:flex-row gap-3 items-center justify-center mb-8">
        <Link
          href="/comment-ca-marche"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
          style={{
            background: "#5B4EC4",
            color: "#fff",
            boxShadow: "0 4px 16px rgba(91,78,196,0.3)",
          }}
        >
          Découvrir comment ça marche
          <ArrowRight size={14} aria-hidden="true" />
        </Link>
        <Link
          href="/signup?role=patient"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium transition-colors hover:bg-[rgba(91,78,196,0.04)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
          style={{
            border: "1.5px solid rgba(91,78,196,0.2)",
            color: "#5B4EC4",
            background: "transparent",
          }}
        >
          Créer un compte
        </Link>
      </div>

      {/* Encart factuel sourcé DREES 2024 */}
      <p
        className="text-xs italic"
        style={{ color: "#9CA3AF", maxWidth: 480, margin: "0 auto" }}
      >
        <strong style={{ color: "#6B7280", fontWeight: 600 }}>
          {STAT_AIDANTS.count}
        </strong>{" "}
        {STAT_AIDANTS.label} · Source&nbsp;:{" "}
        <span style={{ fontWeight: 500 }}>{STAT_AIDANTS.source}</span>
      </p>
    </header>
  );
}
