"use client";

import Link from "next/link";
import Image from "next/image";
import { CalendarClock, ShieldOff, UserRound } from "lucide-react";
import type { AuthorizedProvider } from "./mock-data";

interface MesSoignantsCardProps {
  provider: AuthorizedProvider;
  onRevoke: (provider: AuthorizedProvider) => void;
}

const DATE_FORMATTER = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
});

function formatDate(iso: string): string {
  return DATE_FORMATTER.format(new Date(iso));
}

function initialsOf(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

/**
 * Carte d'un soignant autorisé.
 *
 * Wording MDR strict (conforme lexique Nami) :
 *   - "Ce soignant", JAMAIS "votre médecin"
 *   - libellés autorisés : consultation, spécialité, accès
 *   - aucune donnée clinique affichée
 *
 * Pattern Nami : ring violet #5B4EC4/40 sur focus visible (hex direct).
 */
export function MesSoignantsCard({ provider, onRevoke }: MesSoignantsCardProps) {
  const fullName = `${provider.firstName} ${provider.lastName}`;
  const initials = initialsOf(provider.firstName, provider.lastName);
  const labelId = `provider-${provider.id}-name`;

  return (
    <article
      role="listitem"
      aria-labelledby={labelId}
      className="bg-white rounded-xl border border-[rgba(26,26,46,0.08)] p-5 md:p-6 shadow-[0_1px_3px_rgba(26,26,46,0.04)] transition-shadow duration-150 hover:shadow-[0_4px_12px_rgba(26,26,46,0.06)]"
    >
      <div className="flex items-start gap-4">
        {provider.avatarUrl ? (
          <Image
            src={provider.avatarUrl}
            alt=""
            width={56}
            height={56}
            className="w-14 h-14 rounded-full object-cover bg-[#F5F3EF] shrink-0"
          />
        ) : (
          <div
            aria-hidden="true"
            className="w-14 h-14 rounded-full bg-[rgba(91,78,196,0.10)] text-[#5B4EC4] flex items-center justify-center font-semibold text-base shrink-0"
          >
            {initials || <UserRound className="w-6 h-6" strokeWidth={2} />}
          </div>
        )}

        <div className="flex-1 min-w-0">
          <h2
            id={labelId}
            className="text-base md:text-lg font-semibold text-[#1A1A2E] truncate"
          >
            {fullName}
          </h2>
          <p className="text-sm text-[#6B7280] mt-0.5">{provider.specialty}</p>

          <dl className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm">
            <div className="flex items-center gap-2 text-[#374151]">
              <CalendarClock
                className="w-4 h-4 text-[#6B7280] shrink-0"
                strokeWidth={2}
                aria-hidden="true"
              />
              <dt className="sr-only">Accès accordé depuis</dt>
              <dd>
                Accès accordé depuis le{" "}
                <span className="text-[#1A1A2E]">
                  {formatDate(provider.authorizedSince)}
                </span>
              </dd>
            </div>

            <div className="flex items-center gap-2 text-[#374151]">
              <dt className="sr-only">Dernier rendez-vous</dt>
              <dd>
                {provider.lastAppointmentAt ? (
                  <>
                    Dernier RDV&nbsp;:{" "}
                    <span className="text-[#1A1A2E]">
                      {formatDate(provider.lastAppointmentAt)}
                    </span>
                  </>
                ) : (
                  <span className="text-[#6B7280]">Aucun RDV pour le moment</span>
                )}
              </dd>
            </div>

            <div className="flex items-center gap-2 text-[#374151] sm:col-span-2">
              <dt className="sr-only">Nombre de consultations</dt>
              <dd>
                {provider.totalAppointments === 0
                  ? "0 consultation"
                  : `${provider.totalAppointments} consultation${provider.totalAppointments > 1 ? "s" : ""}`}
              </dd>
            </div>
          </dl>
        </div>
      </div>

      <div className="mt-5 flex flex-col sm:flex-row gap-2 sm:gap-3 sm:justify-end">
        <Link
          href={`/mes-soignants/${provider.id}`}
          className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium text-[#5B4EC4] border border-[rgba(91,78,196,0.25)] hover:bg-[rgba(91,78,196,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 transition-colors duration-150"
        >
          Voir son profil
        </Link>
        <button
          type="button"
          onClick={() => onRevoke(provider)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#DC2626] border border-[rgba(220,38,38,0.25)] hover:bg-[rgba(220,38,38,0.06)] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#DC2626]/40 transition-colors duration-150"
        >
          <ShieldOff className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          Révoquer l&apos;accès
        </button>
      </div>
    </article>
  );
}
