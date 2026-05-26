import {
  Landmark,
  UsersRound,
  Building2,
  ShieldPlus,
  Network,
  Compass,
  Check,
  type LucideIcon,
} from "lucide-react";
import { INSTITUTION_TYPES, type IconName } from "./partenaires-data";

const ICON_MAP: Record<IconName, LucideIcon> = {
  landmark: Landmark,
  "users-round": UsersRound,
  "building-2": Building2,
  "shield-plus": ShieldPlus,
  network: Network,
  compass: Compass,
};

export function PartenairesPourQui() {
  return (
    <section
      aria-labelledby="pour-qui-title"
      className="py-16 md:py-24 px-4"
      style={{ background: "#fff" }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12 md:mb-14">
          <h2
            id="pour-qui-title"
            className="text-2xl md:text-4xl font-extrabold tracking-tight mb-4"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.02em",
            }}
          >
            Pour qui&nbsp;?
          </h2>
          <p
            className="text-base"
            style={{ color: "#6B7280", maxWidth: 560, margin: "0 auto" }}
          >
            Nami s&apos;adresse aux structures de coordination du système de
            santé français.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {INSTITUTION_TYPES.map((typo) => {
            const Icon = ICON_MAP[typo.iconName];
            const headingId = `typo-${typo.id}-title`;
            return (
              <article
                key={typo.id}
                aria-labelledby={headingId}
                className="p-6 rounded-2xl"
                style={{
                  background: "#FAFAF8",
                  border: "1px solid rgba(26,26,46,0.06)",
                }}
              >
                <div
                  className="inline-flex items-center justify-center w-11 h-11 rounded-xl mb-4"
                  style={{
                    background: "rgba(91,78,196,0.08)",
                    color: "#5B4EC4",
                  }}
                  aria-hidden="true"
                >
                  <Icon size={20} strokeWidth={1.8} />
                </div>
                <h3
                  id={headingId}
                  className="text-base md:text-lg font-bold mb-2 tracking-tight"
                  style={{
                    color: "#1A1A2E",
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  {typo.label}
                </h3>
                <p
                  className="text-sm mb-4"
                  style={{ color: "#6B7280", lineHeight: 1.55 }}
                >
                  {typo.description}
                </p>

                <div className="mb-4">
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mb-2"
                    style={{ color: "#9CA3AF", letterSpacing: "0.1em" }}
                  >
                    Cas d&apos;usage typiques
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {typo.useCases.map((uc, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs"
                        style={{ color: "#374151", lineHeight: 1.5 }}
                      >
                        <Check
                          size={12}
                          strokeWidth={2.4}
                          style={{
                            color: "#5B4EC4",
                            flexShrink: 0,
                            marginTop: 3,
                          }}
                          aria-hidden="true"
                        />
                        {uc}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p
                    className="text-[10px] font-bold uppercase tracking-wider mb-2"
                    style={{ color: "#5B4EC4", letterSpacing: "0.1em" }}
                  >
                    Apport Nami
                  </p>
                  <ul className="flex flex-col gap-1.5">
                    {typo.namiValue.map((v, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-xs"
                        style={{ color: "#374151", lineHeight: 1.5 }}
                      >
                        <Check
                          size={12}
                          strokeWidth={2.4}
                          style={{
                            color: "#5B4EC4",
                            flexShrink: 0,
                            marginTop: 3,
                          }}
                          aria-hidden="true"
                        />
                        {v}
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
