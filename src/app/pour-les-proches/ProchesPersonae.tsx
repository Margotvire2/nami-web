import {
  Baby,
  Heart,
  Users,
  HandHeart,
  X,
  Check,
  type LucideIcon,
} from "lucide-react";
import { PROCHES_PERSONAE, type PersonaIconName } from "./proches-data";

const ICON_MAP: Record<PersonaIconName, LucideIcon> = {
  baby: Baby,
  heart: Heart,
  users: Users,
  "hand-heart": HandHeart,
};

export function ProchesPersonae() {
  return (
    <section
      aria-labelledby="personae-title"
      className="py-16 md:py-24 px-4"
      style={{ background: "#fff" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-14">
          <h2
            id="personae-title"
            className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.03em",
            }}
          >
            Qui êtes-vous&nbsp;?
          </h2>
          <p
            className="text-base md:text-lg"
            style={{ color: "#6B7280", maxWidth: 580, margin: "0 auto" }}
          >
            Nami s&apos;adapte à votre situation d&apos;aidant, parent ou
            conjoint(e).
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-5 md:gap-6">
          {PROCHES_PERSONAE.map((persona) => {
            const Icon = ICON_MAP[persona.iconName];
            const headingId = `persona-${persona.id}-title`;
            return (
              <article
                key={persona.id}
                aria-labelledby={headingId}
                className="p-6 md:p-7 rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-md"
                style={{
                  background: "#FAFAF8",
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
                  id={headingId}
                  className="text-lg md:text-xl font-bold mb-2 tracking-tight"
                  style={{
                    color: "#1A1A2E",
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  {persona.label}
                </h3>
                <p
                  className="text-sm md:text-base mb-4"
                  style={{ color: "#6B7280", lineHeight: 1.55 }}
                >
                  {persona.description}
                </p>

                {/* Pain points */}
                <div className="mb-4">
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: "#9CA3AF", letterSpacing: "0.08em" }}
                  >
                    Vos difficultés
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {persona.painPoints.map((pp, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: "#374151", lineHeight: 1.5 }}
                      >
                        <X
                          size={14}
                          strokeWidth={2.4}
                          style={{
                            color: "#9CA3AF",
                            flexShrink: 0,
                            marginTop: 3,
                          }}
                          aria-hidden="true"
                        />
                        {pp}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Nami helps */}
                <div>
                  <p
                    className="text-xs font-bold uppercase tracking-wider mb-2"
                    style={{ color: "#5B4EC4", letterSpacing: "0.08em" }}
                  >
                    Nami vous aide à
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {persona.namiHelps.map((h, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                        style={{ color: "#374151", lineHeight: 1.5 }}
                      >
                        <Check
                          size={14}
                          strokeWidth={2.4}
                          style={{
                            color: "#5B4EC4",
                            flexShrink: 0,
                            marginTop: 3,
                          }}
                          aria-hidden="true"
                        />
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
