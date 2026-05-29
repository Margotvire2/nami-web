"use client";

import { use, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Search, Users, MapPin, ExternalLink, Lock } from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { organizationsApi, type DirectoryMember } from "@/lib/api";

// Page annuaire structure (INIT-494)
// Vue computed depuis OrganizationMember.status=ACTIVE × Person × ProviderProfile.
// La visibilité par membre est gérée côté backend selon le viewer (ANON / MEMBER /
// ADMIN). Le frontend affiche un état adapté quand le résultat est vide ou réduit.

const ORG_TYPE_LABELS: Record<string, string> = {
  NETWORK: "Réseau",
  FEDERATION: "Fédération",
  CPTS: "CPTS",
  HOSPITAL: "Hôpital",
  HOSPITAL_SERVICE: "Service hospitalier",
  MSP: "MSP",
  CLINIC: "Clinique",
  HEALTH_CENTER: "Centre de santé",
  PRIVATE_PRACTICE: "Cabinet libéral",
  ASSOCIATION: "Association",
  PROFESSIONAL_GROUP: "Groupement professionnel",
};

const SECTOR_LABELS: Record<string, string> = {
  SECTOR_1: "Secteur 1",
  SECTOR_2: "Secteur 2",
  SECTOR_3: "Non conventionné",
};

export default function StructureAnnuairePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: orgId } = use(params);
  const accessToken = useAuthStore((s) => s.accessToken);

  const [specialty, setSpecialty] = useState("");
  const [city, setCity] = useState("");
  const [appliedSpecialty, setAppliedSpecialty] = useState("");
  const [appliedCity, setAppliedCity] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["organization", orgId, "directory", appliedSpecialty, appliedCity],
    queryFn: () =>
      organizationsApi.membersDirectory(accessToken!, orgId, {
        specialty: appliedSpecialty || undefined,
        city: appliedCity || undefined,
      }),
    enabled: !!accessToken,
  });

  const applyFilters = (e: React.FormEvent) => {
    e.preventDefault();
    setAppliedSpecialty(specialty.trim());
    setAppliedCity(city.trim());
  };

  const resetFilters = () => {
    setSpecialty("");
    setCity("");
    setAppliedSpecialty("");
    setAppliedCity("");
  };

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <div className="max-w-5xl mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-6">
          <Link
            href={`/reseau/${orgId}`}
            className="p-2 hover:bg-white rounded-lg text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Retour à la structure"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div className="flex-1 min-w-0">
            <h1
              className="text-xl font-bold text-[#0F172A] truncate"
              style={{ fontFamily: "var(--font-jakarta)" }}
            >
              {data?.organization.name ?? "Annuaire"}
            </h1>
            <p className="text-sm text-[#6B7280]">
              {data?.organization
                ? ORG_TYPE_LABELS[data.organization.type] ?? data.organization.type
                : "Membres de la structure"}
            </p>
          </div>
        </div>

        {/* Filtres */}
        <form
          onSubmit={applyFilters}
          className="bg-white border border-[#E8ECF4] rounded-xl p-4 mb-6 grid gap-3 sm:grid-cols-[1fr_1fr_auto]"
        >
          <label className="block">
            <span className="text-xs font-medium text-[#6B7280] mb-1 block">Spécialité</span>
            <input
              type="text"
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Ex : Psychiatrie, Diététique…"
              className="w-full border border-[#E8ECF4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5B4EC4] focus:ring-1 focus:ring-[#5B4EC4]"
              aria-label="Filtrer par spécialité"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-[#6B7280] mb-1 block">Ville</span>
            <input
              type="text"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="Ex : Paris, Lyon…"
              className="w-full border border-[#E8ECF4] rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#5B4EC4] focus:ring-1 focus:ring-[#5B4EC4]"
              aria-label="Filtrer par ville"
            />
          </label>
          <div className="flex items-end gap-2">
            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#5B4EC4] text-white text-sm font-medium rounded-lg hover:bg-[#4A3FAA] transition-colors"
            >
              <Search className="w-4 h-4" />
              Filtrer
            </button>
            {(appliedSpecialty || appliedCity) && (
              <button
                type="button"
                onClick={resetFilters}
                className="px-3 py-2 text-sm font-medium text-[#6B7280] hover:text-[#0F172A] transition-colors"
              >
                Réinitialiser
              </button>
            )}
          </div>
        </form>

        {/* Statut viewer */}
        {data && data.viewer !== "ADMIN" && (
          <div className="flex items-center gap-2 text-xs text-[#6B7280] mb-4">
            <Lock className="w-3 h-3" />
            {data.viewer === "MEMBER"
              ? "Vous voyez les membres visibles entre membres de la structure."
              : "Vous voyez uniquement les profils publics de cette structure."}
          </div>
        )}

        {/* Liste */}
        {isLoading ? (
          <DirectoryGridSkeleton />
        ) : error ? (
          <DirectoryErrorState />
        ) : !data || data.members.length === 0 ? (
          <DirectoryEmptyState viewer={data?.viewer} />
        ) : (
          <>
            <p className="text-sm text-[#6B7280] mb-3">
              {data.members.length} membre{data.members.length > 1 ? "s" : ""}
            </p>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.members.map((m) => (
                <DirectoryCard key={m.personId} member={m} />
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function DirectoryCard({ member }: { member: DirectoryMember }) {
  const initials = `${member.firstName?.[0] ?? "?"}${member.lastName?.[0] ?? ""}`.toUpperCase();
  const sectorLabel = member.conventionSector
    ? SECTOR_LABELS[member.conventionSector] ?? member.conventionSector
    : null;

  return (
    <div
      className="bg-white rounded-xl border border-[rgba(26,26,46,0.06)] p-4 transition-all hover:border-[rgba(91,78,196,0.18)]"
      style={{ boxShadow: "0 1px 3px rgba(26,26,46,0.04)" }}
      data-testid="directory-card"
    >
      <div className="flex items-start gap-3 mb-3">
        {member.photoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={member.photoUrl}
            alt=""
            className="w-12 h-12 rounded-full object-cover shrink-0"
          />
        ) : (
          <div
            className="w-12 h-12 rounded-full flex items-center justify-center text-sm font-semibold text-white shrink-0"
            style={{ background: "linear-gradient(135deg, #5B4EC4, #2BA89C)" }}
            aria-hidden
          >
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <p
            className="font-semibold text-[#0F172A] truncate"
            style={{ fontFamily: "var(--font-jakarta)" }}
          >
            {member.firstName} {member.lastName}
          </p>
          {member.specialty && (
            <p className="text-xs text-[#5B4EC4] font-medium truncate">{member.specialty}</p>
          )}
        </div>
      </div>

      <div className="space-y-1.5 text-xs text-[#6B7280] min-h-[2.5rem]">
        {member.city && (
          <p className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3 shrink-0" />
            <span className="truncate">{member.city}</span>
          </p>
        )}
        {sectorLabel && <p className="text-[11px] text-[#6B7280]">{sectorLabel}</p>}
      </div>

      {member.providerProfileSlug && (
        <Link
          href={`/trouver-un-soignant/${member.providerProfileSlug}`}
          className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-[#5B4EC4] hover:text-[#4A3FAA] transition-colors"
        >
          Voir le profil
          <ExternalLink className="w-3 h-3" />
        </Link>
      )}
    </div>
  );
}

function DirectoryGridSkeleton() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <div
          key={i}
          className="bg-white rounded-xl border border-[#E8ECF4] p-4 animate-pulse"
        >
          <div className="flex items-start gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 bg-gray-200 rounded w-3/4" />
              <div className="h-2 bg-gray-100 rounded w-1/2" />
            </div>
          </div>
          <div className="h-2 bg-gray-100 rounded w-2/3" />
        </div>
      ))}
    </div>
  );
}

function DirectoryErrorState() {
  return (
    <div className="bg-white border border-[#E8ECF4] rounded-2xl p-10 text-center">
      <p className="text-sm text-[#6B7280]">
        Annuaire indisponible pour le moment. Réessayez plus tard.
      </p>
    </div>
  );
}

function DirectoryEmptyState({ viewer }: { viewer: "ANON" | "MEMBER" | "ADMIN" | undefined }) {
  return (
    <div className="bg-white border border-dashed border-[#E8ECF4] rounded-2xl p-10 text-center space-y-3">
      <Users className="w-10 h-10 text-[#5B4EC4]/40 mx-auto" />
      <h2
        className="font-semibold text-[#0F172A]"
        style={{ fontFamily: "var(--font-jakarta)" }}
      >
        {viewer === "ANON" ? "Annuaire réservé aux membres" : "Aucun membre ne correspond"}
      </h2>
      <p className="text-sm text-[#6B7280] max-w-md mx-auto">
        {viewer === "ANON"
          ? "Aucun profil public à afficher pour cette structure. Rejoignez la structure pour voir l'annuaire complet."
          : "Ajustez les filtres pour élargir la recherche."}
      </p>
    </div>
  );
}
