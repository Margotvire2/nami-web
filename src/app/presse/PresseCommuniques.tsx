import { FileText, Calendar } from "lucide-react";
import { COMMUNIQUES, COMMUNIQUES_EMPTY_LABEL } from "./presse-data";

export function PresseCommuniques() {
  const hasCommuniques = COMMUNIQUES.length > 0;

  return (
    <section
      aria-labelledby="presse-communiques-title"
      className="py-16 md:py-24 px-4"
      style={{ background: "#F5F3EF" }}
    >
      <div className="max-w-4xl mx-auto">
        <div className="mb-10 md:mb-12">
          <h2
            id="presse-communiques-title"
            className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.03em",
            }}
          >
            Communiqués
          </h2>
          <p
            className="text-base md:text-lg max-w-2xl"
            style={{ color: "#6B7280" }}
          >
            Publications officielles de Nami, par ordre antéchronologique.
          </p>
        </div>

        {hasCommuniques ? (
          <ul className="flex flex-col gap-3">
            {COMMUNIQUES.map((c) => (
              <li
                key={c.id}
                className="rounded-xl"
                style={{
                  background: "#fff",
                  border: "1px solid rgba(26,26,46,0.06)",
                }}
              >
                <a
                  href={c.href}
                  className="flex items-center gap-4 px-5 py-4 rounded-xl transition-colors hover:bg-[rgba(91,78,196,0.02)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)]"
                >
                  <div
                    className="shrink-0 flex items-center justify-center rounded-lg"
                    style={{
                      width: 36,
                      height: 36,
                      background: "rgba(91,78,196,0.10)",
                      color: "#5B4EC4",
                    }}
                    aria-hidden="true"
                  >
                    <FileText size={16} />
                  </div>
                  <div className="flex-1">
                    <p
                      className="text-sm md:text-base font-semibold"
                      style={{ color: "#1A1A2E" }}
                    >
                      {c.title}
                    </p>
                    <p
                      className="text-xs mt-0.5 inline-flex items-center gap-1"
                      style={{ color: "#6B7280" }}
                    >
                      <Calendar size={12} aria-hidden="true" />
                      {c.date}
                    </p>
                  </div>
                </a>
              </li>
            ))}
          </ul>
        ) : (
          <div
            className="rounded-2xl p-8 md:p-10 text-center"
            style={{
              background: "#fff",
              border: "1px dashed rgba(26,26,46,0.12)",
            }}
          >
            <div
              className="inline-flex items-center justify-center rounded-full mx-auto mb-5"
              style={{
                width: 56,
                height: 56,
                background: "rgba(91,78,196,0.08)",
                color: "#5B4EC4",
              }}
              aria-hidden="true"
            >
              <FileText size={22} />
            </div>
            <p
              className="text-base md:text-lg font-semibold mb-2"
              style={{
                color: "#1A1A2E",
                fontFamily: "var(--font-jakarta)",
              }}
            >
              Aucun communiqué publié à ce jour
            </p>
            <p
              className="text-sm md:text-base max-w-md mx-auto"
              style={{ color: "#6B7280", lineHeight: 1.6 }}
            >
              {COMMUNIQUES_EMPTY_LABEL} Cette page sera mise à jour dès leur
              publication.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
