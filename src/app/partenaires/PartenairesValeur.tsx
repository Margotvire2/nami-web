import {
  Share2,
  ShieldCheck,
  Rocket,
  Settings2,
  type LucideIcon,
} from "lucide-react";
import { PILIERS_VALEUR, type Pilier } from "./partenaires-data";

const ICON_MAP: Record<Pilier["iconName"], LucideIcon> = {
  "share-2": Share2,
  "shield-check": ShieldCheck,
  rocket: Rocket,
  "settings-2": Settings2,
};

export function PartenairesValeur() {
  return (
    <section
      aria-labelledby="valeur-title"
      className="py-16 md:py-24 px-4"
      style={{ background: "#FAFAF8" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-14">
          <h2
            id="valeur-title"
            className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.02em",
            }}
          >
            Ce que Nami apporte
          </h2>
          <p
            className="text-base"
            style={{ color: "#6B7280", maxWidth: 540, margin: "0 auto" }}
          >
            Quatre points d&apos;appui pour vos missions de coordination.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
          {PILIERS_VALEUR.map((pilier) => {
            const Icon = ICON_MAP[pilier.iconName];
            return (
              <article
                key={pilier.id}
                className="p-6 rounded-2xl"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(26,26,46,0.06)",
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4"
                  style={{
                    background: "rgba(91,78,196,0.08)",
                    color: "#5B4EC4",
                  }}
                  aria-hidden="true"
                >
                  <Icon size={22} strokeWidth={1.8} />
                </div>
                <h3
                  className="text-lg md:text-xl font-bold mb-2 tracking-tight"
                  style={{
                    color: "#1A1A2E",
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  {pilier.title}
                </h3>
                <p
                  className="text-sm md:text-base"
                  style={{ color: "#6B7280", lineHeight: 1.55 }}
                >
                  {pilier.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
