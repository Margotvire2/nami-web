import { Phone, FileX2, CalendarX2, ArrowRight, CheckCircle2 } from "lucide-react";

/**
 * Scénario type — Sophie aide sa mère.
 *
 * IMPORTANT : Sophie est un PERSONNAGE FICTIF. Mention explicite à la fin.
 * Pas un témoignage réel — conformément RGPD (consentement écrit requis pour
 * témoignages identifiables).
 *
 * Aucune pathologie nominale (RGPD + MDR). On parle de "suivi cardio et
 * endocrino" (spécialités OK) — JAMAIS de nom de maladie.
 */
export function ProchesUseCase() {
  return (
    <section
      aria-labelledby="usecase-title"
      className="py-16 md:py-24 px-4"
      style={{ background: "#FAFAF8" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10 md:mb-12">
          <p
            className="text-xs font-bold uppercase tracking-widest mb-3"
            style={{ color: "#5B4EC4", letterSpacing: "0.1em" }}
          >
            Scénario type
          </p>
          <h2
            id="usecase-title"
            className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.02em",
            }}
          >
            Sophie aide sa mère
          </h2>
          <p
            className="text-base md:text-lg"
            style={{ color: "#6B7280", maxWidth: 520, margin: "0 auto" }}
          >
            Sophie, 45 ans, vit à Paris. Sa mère, 78 ans, vit à Bordeaux. Suivi
            cardio et endocrino, kiné régulière, médecin traitant.
          </p>
        </div>

        {/* Avant Nami / Avec Nami — 2 colonnes */}
        <div className="grid md:grid-cols-2 gap-5">
          {/* Avant Nami */}
          <div
            className="p-6 rounded-2xl"
            style={{
              background: "rgba(220,38,38,0.04)",
              border: "1px solid rgba(220,38,38,0.15)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-4"
              style={{ color: "#991B1B", letterSpacing: "0.1em" }}
            >
              Avant Nami
            </p>
            <ul className="flex flex-col gap-3">
              <li
                className="flex items-start gap-2.5 text-sm"
                style={{ color: "#374151", lineHeight: 1.55 }}
              >
                <Phone
                  size={16}
                  style={{ color: "#991B1B", flexShrink: 0, marginTop: 2 }}
                  aria-hidden="true"
                />
                Appels téléphoniques entre quatre soignants
              </li>
              <li
                className="flex items-start gap-2.5 text-sm"
                style={{ color: "#374151", lineHeight: 1.55 }}
              >
                <FileX2
                  size={16}
                  style={{ color: "#991B1B", flexShrink: 0, marginTop: 2 }}
                  aria-hidden="true"
                />
                Ordonnances et bilans égarés entre les rendez-vous
              </li>
              <li
                className="flex items-start gap-2.5 text-sm"
                style={{ color: "#374151", lineHeight: 1.55 }}
              >
                <CalendarX2
                  size={16}
                  style={{ color: "#991B1B", flexShrink: 0, marginTop: 2 }}
                  aria-hidden="true"
                />
                Rendez-vous oubliés ou pris en double
              </li>
            </ul>
          </div>

          {/* Avec Nami */}
          <div
            className="p-6 rounded-2xl"
            style={{
              background: "rgba(91,78,196,0.04)",
              border: "1px solid rgba(91,78,196,0.15)",
            }}
          >
            <p
              className="text-xs font-bold uppercase tracking-wider mb-4"
              style={{ color: "#5B4EC4", letterSpacing: "0.1em" }}
            >
              Avec Nami
            </p>
            <ul className="flex flex-col gap-3">
              <li
                className="flex items-start gap-2.5 text-sm"
                style={{ color: "#374151", lineHeight: 1.55 }}
              >
                <CheckCircle2
                  size={16}
                  style={{ color: "#5B4EC4", flexShrink: 0, marginTop: 2 }}
                  aria-hidden="true"
                />
                Tous les soignants visibles dans un seul espace
              </li>
              <li
                className="flex items-start gap-2.5 text-sm"
                style={{ color: "#374151", lineHeight: 1.55 }}
              >
                <CheckCircle2
                  size={16}
                  style={{ color: "#5B4EC4", flexShrink: 0, marginTop: 2 }}
                  aria-hidden="true"
                />
                Documents centralisés, accessibles à toute l&apos;équipe
              </li>
              <li
                className="flex items-start gap-2.5 text-sm"
                style={{ color: "#374151", lineHeight: 1.55 }}
              >
                <CheckCircle2
                  size={16}
                  style={{ color: "#5B4EC4", flexShrink: 0, marginTop: 2 }}
                  aria-hidden="true"
                />
                Notifications partagées des rendez-vous
              </li>
            </ul>
          </div>
        </div>

        {/* Mention fictif */}
        <p
          className="text-xs italic mt-8 text-center"
          style={{ color: "#9CA3AF" }}
        >
          <ArrowRight
            size={11}
            className="inline-block mr-1 align-middle"
            aria-hidden="true"
          />
          Scénario illustratif. Sophie et sa mère sont des personnages
          fictifs.
        </p>
      </div>
    </section>
  );
}
