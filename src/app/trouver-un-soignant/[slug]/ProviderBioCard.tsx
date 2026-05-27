import { Award } from "lucide-react";
import type { PublicProviderDetail } from "@/lib/api";

interface ProviderBioCardProps {
  provider: PublicProviderDetail;
}

const SECTOR_LABEL: Record<string, string> = {
  SECTOR_1: "Conventionné secteur 1",
  SECTOR_2: "Conventionné secteur 2",
  SECTOR_3: "Non conventionné",
  OPTAM: "OPTAM",
};

const DELAY_LABEL: Record<string, string> = {
  WITHIN_WEEK: "Disponibilités cette semaine",
  WITHIN_MONTH: "Disponibilités ce mois-ci",
  OVER_MONTH: "Délai supérieur à un mois",
};

export function ProviderBioCard({ provider }: ProviderBioCardProps) {
  const sectorLabel = provider.conventionSector
    ? SECTOR_LABEL[provider.conventionSector] ?? null
    : null;
  const delayLabel = provider.averageDelay
    ? DELAY_LABEL[provider.averageDelay] ?? null
    : null;

  return (
    <section
      aria-labelledby="provider-bio-title"
      className="rounded-2xl p-6 md:p-8"
      style={{
        background: "#fff",
        border: "1px solid rgba(26,26,46,0.06)",
        boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
      }}
    >
      <h2
        id="provider-bio-title"
        className="text-lg md:text-xl font-bold mb-4"
        style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
      >
        À propos
      </h2>

      {provider.publicBio ? (
        <p
          className="text-sm md:text-base whitespace-pre-line"
          style={{ color: "#374151", lineHeight: 1.7 }}
        >
          {provider.publicBio}
        </p>
      ) : (
        <p className="text-sm italic" style={{ color: "#9CA3AF" }}>
          Ce soignant n&apos;a pas encore rédigé de présentation publique.
        </p>
      )}

      {/* Conditions de consultation */}
      <dl className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sectorLabel && (
          <div>
            <dt
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#6B7280", letterSpacing: "0.06em" }}
            >
              Convention
            </dt>
            <dd className="text-sm mt-1" style={{ color: "#1A1A2E" }}>
              {sectorLabel}
            </dd>
          </div>
        )}

        {delayLabel && (
          <div>
            <dt
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#6B7280", letterSpacing: "0.06em" }}
            >
              Délai indicatif
            </dt>
            <dd className="text-sm mt-1" style={{ color: "#1A1A2E" }}>
              {delayLabel}
            </dd>
          </div>
        )}

        {provider.languages.length > 0 && (
          <div>
            <dt
              className="text-xs font-semibold uppercase tracking-wide"
              style={{ color: "#6B7280", letterSpacing: "0.06em" }}
            >
              Langues
            </dt>
            <dd className="text-sm mt-1" style={{ color: "#1A1A2E" }}>
              {provider.languages.join(", ")}
            </dd>
          </div>
        )}

        <div>
          <dt
            className="text-xs font-semibold uppercase tracking-wide"
            style={{ color: "#6B7280", letterSpacing: "0.06em" }}
          >
            Prises en charge
          </dt>
          <dd className="text-sm mt-1" style={{ color: "#1A1A2E" }}>
            {[
              provider.acceptsCMU ? "CMU" : null,
              provider.acceptsALD ? "ALD" : null,
              provider.acceptsNewPatients ? "Nouveaux patients" : null,
            ]
              .filter(Boolean)
              .join(" · ") || "Non précisé"}
          </dd>
        </div>
      </dl>

      {/* Certifications */}
      {provider.certifications.length > 0 && (
        <div
          className="mt-6 pt-6"
          style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wide mb-3"
            style={{ color: "#6B7280", letterSpacing: "0.06em" }}
          >
            Certifications
          </h3>
          <ul className="flex flex-col gap-2">
            {provider.certifications.map((cert, i) => (
              <li
                key={`${cert.name}-${i}`}
                className="flex items-start gap-2 text-sm"
                style={{ color: "#1A1A2E" }}
              >
                <Award
                  size={14}
                  aria-hidden="true"
                  className="shrink-0 mt-0.5"
                  style={{ color: "#5B4EC4" }}
                />
                <span>
                  <span className="font-semibold">{cert.name}</span>
                  {cert.organism && (
                    <span style={{ color: "#6B7280" }}> · {cert.organism}</span>
                  )}
                  {cert.year && (
                    <span style={{ color: "#9CA3AF" }}> · {cert.year}</span>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Mention compliance MDR */}
      <p
        className="mt-6 text-xs italic"
        style={{ color: "#9CA3AF" }}
      >
        Les informations affichées sont déclarées par le soignant. Nami
        n&apos;est pas un dispositif médical.
      </p>
    </section>
  );
}
