import {
  Heart,
  Baby,
  HandHeart,
  User as UserIcon,
  type LucideIcon,
} from "lucide-react";
import { PERSONAS, type Persona } from "./steps-data";

const ICON_MAP: Record<Persona["icon"], LucideIcon> = {
  heart: Heart,
  baby: Baby,
  "helping-hand": HandHeart,
  user: UserIcon,
};

export function CommentForWho() {
  return (
    <section
      aria-labelledby="for-who-title"
      className="py-16 md:py-24 px-4"
      style={{ background: "#fff" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-14">
          <h2
            id="for-who-title"
            className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.03em",
            }}
          >
            Pour qui&nbsp;?
          </h2>
          <p
            className="text-base md:text-lg"
            style={{ color: "#6B7280", maxWidth: 540, margin: "0 auto" }}
          >
            Nami s&apos;adapte à votre situation, quelle qu&apos;elle soit.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-5 md:gap-6">
          {PERSONAS.map((persona) => {
            const Icon = ICON_MAP[persona.icon];
            return (
              <article
                key={persona.id}
                className="p-6 md:p-7 rounded-2xl"
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
                  className="text-lg md:text-xl font-bold mb-2 tracking-tight"
                  style={{
                    color: "#1A1A2E",
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  {persona.title}
                </h3>
                <p
                  className="text-sm md:text-base"
                  style={{ color: "#6B7280", lineHeight: 1.55 }}
                >
                  {persona.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
