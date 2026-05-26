import { Clock } from "lucide-react";

/**
 * Références institutionnelles V1.
 *
 * État actuel : aucun partenariat institutionnel formellement signé.
 * Mention factuelle "en discussions" — AUCUN nom d'institution inventé.
 *
 * V2 (ticket dérivé F-PARTENAIRES-LOGOS-COLLECT) : logos et témoignages
 * uniquement avec autorisation écrite des partenaires.
 */
export function PartenairesReferences() {
  return (
    <section
      aria-labelledby="references-title"
      className="py-16 md:py-24 px-4"
      style={{ background: "#FAFAF8" }}
    >
      <div className="max-w-3xl mx-auto text-center">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-5"
          style={{
            background: "rgba(91,78,196,0.08)",
            color: "#5B4EC4",
            border: "1px solid rgba(91,78,196,0.15)",
          }}
        >
          <Clock size={12} aria-hidden="true" />
          En cours
        </div>

        <h2
          id="references-title"
          className="text-2xl md:text-4xl font-extrabold tracking-tight mb-5"
          style={{
            color: "#1A1A2E",
            fontFamily: "var(--font-jakarta)",
            letterSpacing: "-0.02em",
          }}
        >
          Premiers partenariats en cours
        </h2>

        <p
          className="text-base md:text-lg mb-3"
          style={{ color: "#374151", lineHeight: 1.6 }}
        >
          Nami est actuellement en discussions avec plusieurs ARS, CPTS et
          établissements de santé pour des déploiements à compter de
          juillet&nbsp;2026.
        </p>

        <p
          className="text-sm md:text-base mb-8"
          style={{ color: "#6B7280", lineHeight: 1.6 }}
        >
          Vous souhaitez être partenaire pilote ? Nous vous accompagnons
          dans le cadrage et le déploiement sur votre périmètre.
        </p>

        <div
          className="inline-block px-5 py-3 rounded-2xl text-sm italic"
          style={{
            background: "#fff",
            border: "1px solid rgba(26,26,46,0.06)",
            color: "#6B7280",
          }}
        >
          Les références institutionnelles seront publiées sur cette page
          après accord écrit des partenaires.
        </div>
      </div>
    </section>
  );
}
