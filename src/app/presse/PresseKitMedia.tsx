import { Download, Image as ImageIcon, Clock } from "lucide-react";
import { KIT_MEDIA_ITEMS } from "./presse-data";

export function PresseKitMedia() {
  return (
    <section
      aria-labelledby="presse-kit-title"
      className="py-16 md:py-24 px-4"
      style={{ background: "#fff" }}
    >
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 md:mb-12">
          <h2
            id="presse-kit-title"
            className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.03em",
            }}
          >
            Kit media
          </h2>
          <p
            className="text-base md:text-lg max-w-2xl"
            style={{ color: "#6B7280" }}
          >
            Ressources visuelles officielles. Seul l&apos;usage éditorial et
            informatif est autorisé — pas de modification du logo, pas d&apos;usage
            commercial sans accord écrit.
          </p>
        </div>

        <div className="grid gap-4 md:gap-5 md:grid-cols-2">
          {KIT_MEDIA_ITEMS.map((item) => (
            <article
              key={item.id}
              className="flex flex-col rounded-2xl p-5 md:p-6 transition-shadow hover:shadow-md"
              style={{
                background: "#FAFAF8",
                border: "1px solid rgba(26,26,46,0.06)",
                boxShadow: "0 1px 3px rgba(26,26,46,0.03)",
              }}
            >
              <div className="flex items-start gap-3 mb-3">
                <div
                  className="shrink-0 flex items-center justify-center rounded-xl"
                  style={{
                    width: 40,
                    height: 40,
                    background: item.available
                      ? "rgba(91,78,196,0.10)"
                      : "rgba(107,114,128,0.10)",
                    color: item.available ? "#5B4EC4" : "#6B7280",
                  }}
                  aria-hidden="true"
                >
                  {item.available ? (
                    <ImageIcon size={18} />
                  ) : (
                    <Clock size={18} />
                  )}
                </div>

                <div className="flex-1">
                  <h3
                    className="text-base md:text-lg font-bold leading-snug"
                    style={{
                      color: "#1A1A2E",
                      fontFamily: "var(--font-jakarta)",
                    }}
                  >
                    {item.label}
                  </h3>
                  <p
                    className="text-xs mt-0.5"
                    style={{ color: "#6B7280" }}
                  >
                    {item.format}
                  </p>
                </div>
              </div>

              <p
                className="text-sm flex-1 mb-4"
                style={{ color: "#374151", lineHeight: 1.55 }}
              >
                {item.description}
              </p>

              {item.available ? (
                <a
                  href={item.href}
                  download
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
                  style={{
                    background: "#5B4EC4",
                    color: "#fff",
                  }}
                >
                  <Download size={14} aria-hidden="true" />
                  Télécharger
                </a>
              ) : (
                <span
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium"
                  style={{
                    background: "rgba(26,26,46,0.04)",
                    color: "#6B7280",
                    border: "1px dashed rgba(26,26,46,0.15)",
                  }}
                  aria-disabled="true"
                >
                  <Clock size={14} aria-hidden="true" />
                  À venir
                </span>
              )}
            </article>
          ))}
        </div>

        <p
          className="mt-8 text-xs italic"
          style={{ color: "#9CA3AF" }}
        >
          Besoin d&apos;une ressource non listée (photo en contexte, format
          spécifique, vidéo) ? Contactez-nous via la section ci-dessous.
        </p>
      </div>
    </section>
  );
}
