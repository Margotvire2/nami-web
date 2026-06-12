"use client";

import { useMemo, useEffect, type ReactNode } from "react";
import Link from "next/link";
import { ArrowLeft, MapPin, Phone, UserRound, Calendar } from "lucide-react";
import { usePatientCareCases } from "@/hooks/usePatientCareCases";
import { usePatientCareTeamByCareCases } from "@/hooks/usePatientCareTeamByCareCases";
import { useEntityHub } from "@/hooks/useEntityHub";
import type { EntityHubProvider, EntityHubProviderLocation } from "@/lib/api";

// Filtre les codes RPPS/profession courts non lisibles pour le patient.
// Ex : "MY", "SM", "CABS" → cachés. "Diététicienne" → affiché.
const SPECIALTY_CODE_RE = /^[A-Z]{1,4}$/;

function isReadableSpecialty(specialty: string | null): specialty is string {
  if (!specialty) return false;
  return !SPECIALTY_CODE_RE.test(specialty.trim());
}

function getInitials(firstName: string, lastName: string): string {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`.toUpperCase();
}

const PLACEHOLDER_VALUES = new Set(["À renseigner", "à renseigner", "N/A", "-"]);

function isUsableLocation(loc: EntityHubProviderLocation): boolean {
  if (PLACEHOLDER_VALUES.has(loc.name)) return false;
  if (!loc.city && !loc.postalCode && !loc.name) return false;
  return true;
}

interface Props {
  providerId: string;
}

export function ProviderDetailPageClient({ providerId }: Props) {
  const careCasesQuery = usePatientCareCases();

  const careCaseIds = useMemo(
    () => (careCasesQuery.data ?? []).map((c) => c.id),
    [careCasesQuery.data],
  );

  const careTeamQueries = usePatientCareTeamByCareCases(careCaseIds);

  // Trouve le premier careCaseId contenant ce soignant.
  const careCaseId = useMemo<string | null>(() => {
    for (let i = 0; i < careCaseIds.length; i++) {
      const members = careTeamQueries[i]?.data ?? [];
      if (members.some((p) => p.id === providerId)) return careCaseIds[i];
    }
    return null;
  }, [careCaseIds, careTeamQueries, providerId]);

  const teamsLoading =
    careCaseIds.length > 0 && careTeamQueries.some((q) => q.isPending);

  const isLocating = careCasesQuery.isPending || teamsLoading;

  const providerQuery = useEntityHub<"provider">(
    careCaseId
      ? { type: "provider", careCaseId, entityId: providerId }
      : null,
  );

  // ── États de chargement ──────────────────────────────────────────────────

  if (careCasesQuery.isError) {
    return (
      <PageShell>
        <ErrorCard>
          Impossible de charger vos parcours de soins. Réessayez dans un instant.
        </ErrorCard>
      </PageShell>
    );
  }

  if (isLocating || (!!careCaseId && providerQuery.isPending)) {
    return <SkeletonLayout />;
  }

  if (!careCaseId) {
    return (
      <PageShell>
        <ErrorCard>
          Ce soignant ne fait plus partie de votre équipe soignante.
        </ErrorCard>
      </PageShell>
    );
  }

  if (providerQuery.isError) {
    return (
      <PageShell>
        <ErrorCard>
          Impossible de charger le profil de ce soignant. Réessayez dans un instant.
        </ErrorCard>
      </PageShell>
    );
  }

  if (!providerQuery.data) return <SkeletonLayout />;

  return <ProviderProfile data={providerQuery.data} providerId={providerId} />;
}

// ── Composant principal ────────────────────────────────────────────────────

function ProviderProfile({
  data,
  providerId,
}: {
  data: EntityHubProvider;
  providerId: string;
}) {
  const { provider } = data;
  const specialty = isReadableSpecialty(provider.specialty)
    ? provider.specialty
    : null;
  const locations = provider.locations.filter(isUsableLocation);
  const initials = getInitials(provider.firstName, provider.lastName);
  const fullName = `${provider.firstName} ${provider.lastName}`;

  // Titre dynamique : non connu côté serveur (page auth-gated noindex).
  useEffect(() => {
    document.title = `${fullName} — Nami`;
    return () => {
      document.title = "Nami";
    };
  }, [fullName]);

  return (
    <div className="max-w-2xl mx-auto py-8 md:py-10 space-y-6">
      {/* Breadcrumb + retour */}
      <nav aria-label="Fil d'Ariane">
        <ol className="flex items-center gap-1.5 text-sm text-[#8A8A96]">
          <li>
            <Link
              href="/mes-soignants"
              className="inline-flex items-center gap-1.5 font-medium text-[#5B4EC4] hover:text-[#4c44b0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 rounded transition-colors duration-150"
            >
              <ArrowLeft
                className="w-4 h-4 shrink-0"
                strokeWidth={2}
                aria-hidden="true"
              />
              Mes soignants
            </Link>
          </li>
          <li aria-hidden="true" className="text-[#D1D5DB]">
            /
          </li>
          <li
            aria-current="page"
            className="truncate max-w-[200px] text-[#4A4A5A]"
          >
            {provider.firstName} {provider.lastName}
          </li>
        </ol>
      </nav>

      {/* Hero */}
      <div className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] shadow-[0_1px_3px_rgba(26,26,46,0.04),0_4px_12px_rgba(26,26,46,0.03)] p-6 md:p-8">
        <div className="flex items-start gap-5">
          {/* Avatar */}
          <div
            aria-hidden="true"
            className="size-[72px] rounded-full bg-[rgba(91,78,196,0.10)] text-[#5B4EC4] flex items-center justify-center font-bold text-xl shrink-0 overflow-hidden"
          >
            {provider.photoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={provider.photoUrl}
                alt=""
                className="w-full h-full object-cover"
              />
            ) : initials ? (
              initials
            ) : (
              <UserRound className="w-7 h-7" strokeWidth={1.5} />
            )}
          </div>

          {/* Identité */}
          <div className="flex-1 min-w-0 pt-1">
            <h1 className="text-xl md:text-2xl font-bold text-[#1A1A2E] leading-snug">
              {provider.firstName} {provider.lastName}
            </h1>
            {specialty && (
              <span className="mt-2 inline-block text-[13px] font-medium text-[#5B4EC4] bg-[rgba(91,78,196,0.08)] rounded-full px-3 py-1">
                {specialty}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Bio / méthode */}
      {provider.publicBio && provider.publicBio.trim() && (
        <section aria-labelledby="section-bio">
          <div
            id="section-bio"
            className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A8A96] mb-3"
          >
            À propos
          </div>
          <div className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] shadow-[0_1px_3px_rgba(26,26,46,0.04)] p-4">
            <p className="text-sm text-[#4A4A5A] leading-relaxed whitespace-pre-line">
              {provider.publicBio}
            </p>
          </div>
        </section>
      )}

      {/* Coordonnées du cabinet */}
      {locations.length > 0 ? (
        <section aria-labelledby="section-cabinet">
          <div
            id="section-cabinet"
            className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A8A96] mb-3"
          >
            Cabinet
          </div>
          <div className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] shadow-[0_1px_3px_rgba(26,26,46,0.04)] divide-y divide-[rgba(26,26,46,0.05)]">
            {locations.map((loc) => (
              <div key={loc.id} className="flex items-start gap-3 p-4">
                <MapPin
                  className="w-4 h-4 text-[#5B4EC4] shrink-0 mt-0.5"
                  strokeWidth={2}
                  aria-hidden="true"
                />
                <div>
                  <div className="text-sm font-semibold text-[#1A1A2E]">
                    {loc.name}
                  </div>
                  {(loc.city || loc.postalCode) && (
                    <div className="text-sm text-[#4A4A5A] mt-0.5">
                      {[loc.postalCode, loc.city].filter(Boolean).join(" ")}
                    </div>
                  )}
                  {loc.phone && (
                    <a
                      href={`tel:${loc.phone.replace(/\s/g, "")}`}
                      className="inline-flex items-center gap-1.5 mt-1.5 text-sm text-[#5B4EC4] hover:text-[#4c44b0] transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 rounded"
                    >
                      <Phone className="w-3.5 h-3.5 shrink-0" strokeWidth={2} aria-hidden="true" />
                      {loc.phone}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : (
        <section aria-labelledby="section-cabinet-empty">
          <div
            id="section-cabinet-empty"
            className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8A8A96] mb-3"
          >
            Cabinet
          </div>
          <p className="text-sm text-[#8A8A96] italic py-2">
            Les coordonnées de ce soignant ne sont pas encore disponibles.
          </p>
        </section>
      )}

      {/* CTA Prendre rendez-vous */}
      <div className="pt-2">
        <Link
          href={`/rendez-vous?providerId=${encodeURIComponent(providerId)}`}
          className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-6 py-3 rounded-[10px] bg-[#5B4EC4] text-white text-[13px] font-semibold hover:bg-[#4c44b0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 transition-colors duration-150 shadow-sm"
        >
          <Calendar className="w-4 h-4" strokeWidth={2} aria-hidden="true" />
          Prendre rendez-vous
        </Link>
      </div>
    </div>
  );
}

// ── Composants utilitaires ─────────────────────────────────────────────────

function PageShell({ children }: { children: ReactNode }) {
  return (
    <div className="max-w-2xl mx-auto py-8 md:py-10 space-y-6">
      <nav aria-label="Fil d'Ariane">
        <Link
          href="/mes-soignants"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-[#5B4EC4] hover:text-[#4c44b0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 rounded transition-colors duration-150"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" strokeWidth={2} aria-hidden="true" />
          Mes soignants
        </Link>
      </nav>
      {children}
    </div>
  );
}

function ErrorCard({ children }: { children: ReactNode }) {
  return (
    <p
      role="alert"
      className="text-sm text-[#4A4A5A] bg-white border border-[rgba(26,26,46,0.06)] rounded-xl p-6 shadow-[0_1px_3px_rgba(26,26,46,0.04)]"
    >
      {children}
    </p>
  );
}

function SkeletonLayout() {
  return (
    <div
      className="max-w-2xl mx-auto py-8 md:py-10 space-y-6"
      aria-busy="true"
      aria-label="Chargement du profil soignant"
    >
      {/* Breadcrumb placeholder */}
      <div className="h-5 w-32 rounded bg-[#F5F3EF] animate-pulse" />

      {/* Hero skeleton */}
      <div className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-6 md:p-8">
        <div className="flex items-start gap-5">
          <div className="size-[72px] rounded-full bg-[#F5F3EF] animate-pulse shrink-0" />
          <div className="flex-1 pt-1 space-y-3">
            <div className="h-6 w-48 rounded bg-[#F5F3EF] animate-pulse" />
            <div className="h-5 w-28 rounded-full bg-[#F5F3EF] animate-pulse" />
          </div>
        </div>
      </div>

      {/* Cabinet skeleton */}
      <div className="space-y-3">
        <div className="h-3 w-16 rounded bg-[#F5F3EF] animate-pulse" />
        <div className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-4">
          <div className="flex gap-3">
            <div className="w-4 h-4 rounded bg-[#F5F3EF] animate-pulse shrink-0 mt-0.5" />
            <div className="space-y-2 flex-1">
              <div className="h-4 w-40 rounded bg-[#F5F3EF] animate-pulse" />
              <div className="h-3 w-24 rounded bg-[#F5F3EF] animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      {/* CTA skeleton */}
      <div className="h-11 w-48 rounded-[10px] bg-[#F5F3EF] animate-pulse" />
    </div>
  );
}
