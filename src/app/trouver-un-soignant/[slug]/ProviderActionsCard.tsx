import Link from "next/link";
import { CalendarPlus, MessageSquare, ArrowRight } from "lucide-react";
import type { PublicProviderDetail } from "@/lib/api";

interface ProviderActionsCardProps {
  provider: PublicProviderDetail;
}

export function ProviderActionsCard({ provider }: ProviderActionsCardProps) {
  const bookingHref = `/trouver-un-soignant/${provider.slug}/booking`;
  const canBook = provider.acceptsNewPatients;

  return (
    <aside
      aria-labelledby="provider-actions-title"
      className="rounded-2xl p-6 md:p-7"
      style={{
        background: "#fff",
        border: "1px solid rgba(91,78,196,0.18)",
        boxShadow: "0 6px 24px rgba(91,78,196,0.08)",
      }}
    >
      <h2
        id="provider-actions-title"
        className="text-base font-bold mb-1"
        style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
      >
        Prendre rendez-vous
      </h2>
      <p
        className="text-xs mb-5"
        style={{ color: "#6B7280" }}
      >
        Choisissez un créneau directement en ligne, sans inscription préalable.
      </p>

      <div className="flex flex-col gap-2.5">
        {canBook ? (
          <Link
            href={bookingHref}
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-semibold transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
            style={{
              background: "#5B4EC4",
              color: "#fff",
              boxShadow: "0 4px 16px rgba(91,78,196,0.30)",
            }}
          >
            <CalendarPlus size={16} aria-hidden="true" />
            Prendre rendez-vous
            <ArrowRight size={14} aria-hidden="true" />
          </Link>
        ) : (
          <div
            className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
            style={{
              background: "rgba(26,26,46,0.04)",
              color: "#6B7280",
              border: "1px dashed rgba(26,26,46,0.12)",
            }}
            aria-disabled="true"
          >
            Ce soignant n&apos;accepte pas de nouveaux patients
          </div>
        )}

        <Link
          href="/login?next=/messages"
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2"
          style={{
            background: "rgba(91,78,196,0.08)",
            color: "#5B4EC4",
            border: "1px solid rgba(91,78,196,0.18)",
          }}
        >
          <MessageSquare size={14} aria-hidden="true" />
          Poser une question
        </Link>
      </div>

      {/* Modes de consultation */}
      {provider.consultationModes.length > 0 && (
        <div
          className="mt-5 pt-5"
          style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-2"
            style={{ color: "#6B7280", letterSpacing: "0.06em" }}
          >
            Modes de consultation
          </p>
          <ul className="flex flex-wrap gap-1.5">
            {provider.consultationModes.map((m) => (
              <li
                key={m}
                className="text-xs px-2 py-1 rounded-full"
                style={{
                  background: "rgba(43,168,156,0.10)",
                  color: "#0F766E",
                  border: "1px solid rgba(43,168,156,0.20)",
                }}
              >
                {m}
              </li>
            ))}
          </ul>
        </div>
      )}
    </aside>
  );
}
