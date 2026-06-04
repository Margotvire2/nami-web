"use client";

import Link from "next/link";
import { User, MapPin, Video, Phone, ArrowRight } from "lucide-react";
import { getProviderName } from "@/lib/appointment-helpers";
import type { PatientAppointmentDetail } from "@/lib/api";

interface RdvDetailProviderProps {
  appointment: PatientAppointmentDetail;
}

// "À renseigner" est le placeholder seedé côté backend (onboarding/page.tsx)
// pour les organisations créées sans adresse. On NE l'expose JAMAIS au patient :
// il est traité comme une chaîne vide pour le rendu.
function cleanPlaceholder(value: string | null | undefined): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.toLowerCase() === "à renseigner") return null;
  return trimmed;
}

export function RdvDetailProvider({ appointment }: RdvDetailProviderProps) {
  const providerName = getProviderName(appointment);
  const providerId = appointment.provider?.id;
  const specialty = appointment.provider?.specialties?.[0] ?? null;

  const isVideo = appointment.locationType === "VIDEO" || appointment.locationType === "TELECONSULTATION";
  const isPhone = appointment.locationType === "PHONE";
  const loc = appointment.location;
  // Masque les placeholders backend ("À renseigner") côté patient.
  const locName = cleanPlaceholder(loc?.name);
  const locAddress = cleanPlaceholder(loc?.address);
  const locCity = cleanPlaceholder(loc?.city);
  const hasAnyLocation = Boolean(locName || locAddress || locCity);

  return (
    <section
      aria-labelledby="rdv-provider-title"
      className="rounded-2xl p-5 md:p-6 space-y-5"
      style={{
        background: "#fff",
        border: "1px solid rgba(26,26,46,0.06)",
        boxShadow: "0 1px 3px rgba(26,26,46,0.04)",
      }}
    >
      <div className="flex items-start gap-4">
        <div
          className="shrink-0 flex items-center justify-center rounded-xl"
          style={{
            width: 56,
            height: 56,
            background: "rgba(91,78,196,0.10)",
            color: "#5B4EC4",
          }}
          aria-hidden="true"
        >
          <User size={26} />
        </div>

        <div className="flex-1 min-w-0">
          <h2
            id="rdv-provider-title"
            className="text-lg md:text-xl font-semibold truncate"
            style={{ color: "#1A1A2E" }}
          >
            {providerName}
          </h2>
          {specialty && (
            <p className="text-sm" style={{ color: "#6B7280" }}>
              {specialty}
            </p>
          )}
          {providerId && (
            <Link
              href={`/trouver-un-soignant/${providerId}`}
              className="mt-2 inline-flex items-center gap-1 text-xs font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 rounded-full"
              style={{ color: "#5B4EC4" }}
            >
              Voir le profil
              <ArrowRight size={12} aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>

      {/* Lieu — masqué entièrement si aucune info utile côté patient
          (le placeholder backend "À renseigner" est filtré en amont). */}
      {(isVideo || isPhone || hasAnyLocation) && (
        <div
          className="pt-4"
          style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}
        >
          {isVideo ? (
            <div className="flex items-start gap-3">
              <Video
                size={18}
                aria-hidden="true"
                className="shrink-0 mt-0.5"
                style={{ color: "#5B4EC4" }}
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1A1A2E" }}>
                  Téléconsultation
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                  Le lien de connexion vous sera communiqué avant le rendez-vous.
                </p>
              </div>
            </div>
          ) : isPhone ? (
            <div className="flex items-start gap-3">
              <Phone
                size={18}
                aria-hidden="true"
                className="shrink-0 mt-0.5"
                style={{ color: "#5B4EC4" }}
              />
              <div>
                <p className="text-sm font-semibold" style={{ color: "#1A1A2E" }}>
                  Consultation téléphonique
                </p>
                <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                  Le soignant vous appellera à l&apos;heure indiquée.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3">
              <MapPin
                size={18}
                aria-hidden="true"
                className="shrink-0 mt-0.5"
                style={{ color: "#5B4EC4" }}
              />
              <div className="text-sm" style={{ color: "#1A1A2E" }}>
                {locName && <p className="font-semibold">{locName}</p>}
                {locAddress && (
                  <p style={{ color: "#374151" }}>{locAddress}</p>
                )}
                {locCity && (
                  <p style={{ color: "#6B7280" }}>{locCity}</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Notes patient pré-saisies (read-only) */}
      {appointment.notes && (
        <div
          className="pt-4"
          style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}
        >
          <p
            className="text-xs font-semibold uppercase tracking-wide mb-1.5"
            style={{ color: "#6B7280", letterSpacing: "0.06em" }}
          >
            Vos notes
          </p>
          <p
            className="text-sm whitespace-pre-line"
            style={{ color: "#374151", lineHeight: 1.6 }}
          >
            {appointment.notes}
          </p>
        </div>
      )}
    </section>
  );
}
