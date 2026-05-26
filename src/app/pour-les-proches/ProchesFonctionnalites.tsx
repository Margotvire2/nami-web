import {
  Bell,
  Users,
  FileText,
  ListChecks,
  MessageCircle,
  type LucideIcon,
} from "lucide-react";
import { PROCHES_FEATURES, type FeatureIconName } from "./proches-data";

const ICON_MAP: Record<FeatureIconName, LucideIcon> = {
  bell: Bell,
  users: Users,
  "file-text": FileText,
  "list-checks": ListChecks,
  "message-circle": MessageCircle,
};

export function ProchesFonctionnalites() {
  return (
    <section
      aria-labelledby="features-title"
      className="py-16 md:py-24 px-4"
      style={{ background: "#FAFAF8" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-12 md:mb-14">
          <h2
            id="features-title"
            className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.03em",
            }}
          >
            Les outils essentiels
          </h2>
          <p
            className="text-base md:text-lg"
            style={{ color: "#6B7280", maxWidth: 540, margin: "0 auto" }}
          >
            5 fonctionnalités pensées pour faciliter votre rôle d&apos;aidant
            ou de parent au quotidien.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
          {PROCHES_FEATURES.map((feature) => {
            const Icon = ICON_MAP[feature.iconName];
            return (
              <article
                key={feature.id}
                className="p-6 rounded-2xl"
                style={{
                  background: "#fff",
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
                  className="text-base md:text-lg font-bold mb-2 tracking-tight"
                  style={{
                    color: "#1A1A2E",
                    fontFamily: "var(--font-jakarta)",
                  }}
                >
                  {feature.title}
                </h3>
                <p
                  className="text-sm"
                  style={{ color: "#6B7280", lineHeight: 1.55 }}
                >
                  {feature.description}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
