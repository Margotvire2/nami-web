"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Users,
  Search,
  UserPlus,
  Mail,
  Phone,
  ChevronRight,
  Loader2,
} from "lucide-react";
import { useAuthStore } from "@/lib/store";
import { secretaryApi, type SecretaryPatientResult } from "@/lib/api";
import { CreatePatientAdminModal } from "./_components/CreatePatientAdminModal";

// INIT-626 — Page patients secrétariat (lecture seule).
// Scope RGPD SECRETARY : coordonnées + RDV uniquement (cf. /secretary/patients/*).
// La création et la modification sortent en INIT-626-bis (backend manquant +
// CreatePatientModal cockpit crée un dossier clinique hors scope).

function fullName(p: SecretaryPatientResult) {
  return `${p.firstName} ${p.lastName}`.trim();
}

function formatBirth(date: string | null) {
  if (!date) return null;
  try {
    return format(parseISO(date), "dd MMM yyyy", { locale: fr });
  } catch {
    return null;
  }
}

function ageFromBirth(date: string | null): number | null {
  if (!date) return null;
  try {
    const d = parseISO(date);
    const diff = Date.now() - d.getTime();
    const age = new Date(diff).getUTCFullYear() - 1970;
    return Number.isFinite(age) && age >= 0 && age < 130 ? age : null;
  } catch {
    return null;
  }
}

export default function SecretariatPatientsPage() {
  const { accessToken } = useAuthStore();
  const api = useMemo(() => secretaryApi(accessToken ?? ""), [accessToken]);
  const router = useRouter();
  const qc = useQueryClient();

  const [createOpen, setCreateOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 250);
    return () => clearTimeout(t);
  }, [query]);

  const q = debouncedQuery;
  const enabled = !!accessToken && q.length >= 2;

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["secretary-patients-search", q],
    queryFn: () => api.searchPatients(q),
    enabled,
    staleTime: 30_000,
  });

  const patients = data ?? [];
  const showEmptyState = enabled && !isLoading && patients.length === 0;
  const showIdlePrompt = !enabled;

  return (
    <div className="min-h-screen bg-[#FAFAF8]">
      <header className="flex items-center justify-between px-6 py-4 bg-white border-b border-[#E8ECF4]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#EEEDFB] flex items-center justify-center">
            <Users size={18} className="text-[#5B4EC4]" />
          </div>
          <div>
            <h1 className="text-[15px] font-bold text-[#1A1A2E] leading-tight">
              Patients
            </h1>
            <p className="text-[11px] text-[#6B7280]">
              Annuaire patient du cabinet — coordonnées et RDV
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCreateOpen(true)}
          className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-[12px] font-medium bg-[#EEEDFB] text-[#5B4EC4] hover:bg-[#DDD9F7] transition"
        >
          <UserPlus size={14} />
          Créer un patient
        </button>
      </header>

      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Barre de recherche */}
        <div className="relative">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher par nom, prénom, email ou téléphone…"
            className="w-full h-11 pl-9 pr-10 rounded-xl bg-white border border-[#E8ECF4] text-[13px] text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/30 focus:border-[#5B4EC4] transition"
            autoFocus
          />
          {isFetching && enabled && (
            <Loader2
              size={14}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#5B4EC4] animate-spin"
            />
          )}
        </div>

        {/* État vide — pas de recherche en cours */}
        {showIdlePrompt && (
          <div className="rounded-2xl bg-white border border-[#E8ECF4] px-6 py-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-[#EEEDFB] flex items-center justify-center mx-auto">
              <Search size={20} className="text-[#5B4EC4]" />
            </div>
            <h2 className="text-[14px] font-semibold text-[#1A1A2E]">
              Recherchez un patient
            </h2>
            <p className="text-[12px] text-[#6B7280] max-w-md mx-auto">
              Tapez au moins 2 caractères pour rechercher dans l&apos;annuaire
              patient. La recherche couvre nom, prénom, email et téléphone.
            </p>
          </div>
        )}

        {/* Chargement initial */}
        {isLoading && enabled && (
          <div className="rounded-2xl bg-white border border-[#E8ECF4] px-6 py-8 text-center">
            <Loader2
              size={20}
              className="text-[#5B4EC4] animate-spin mx-auto mb-2"
            />
            <p className="text-[12px] text-[#6B7280]">Recherche…</p>
          </div>
        )}

        {/* Aucun résultat */}
        {showEmptyState && (
          <div className="rounded-2xl bg-white border border-[#E8ECF4] px-6 py-10 text-center space-y-2">
            <p className="text-[13px] font-semibold text-[#1A1A2E]">
              Aucun patient trouvé
            </p>
            <p className="text-[12px] text-[#6B7280]">
              Aucun résultat pour «&nbsp;{q}&nbsp;». Vérifiez l&apos;orthographe
              ou essayez un autre terme.
            </p>
          </div>
        )}

        {/* Résultats */}
        {patients.length > 0 && (
          <div className="space-y-2">
            <p className="text-[11px] font-medium text-[#6B7280] px-1">
              {patients.length} résultat{patients.length > 1 ? "s" : ""}
            </p>
            <ul className="space-y-2">
              {patients.map((p) => {
                const age = ageFromBirth(p.birthDate);
                return (
                  <li key={p.id}>
                    <Link
                      href={`/secretariat/patients/${p.id}`}
                      className="group flex items-center gap-4 bg-white border border-[#E8ECF4] rounded-xl px-4 py-3 hover:border-[#5B4EC4]/40 hover:shadow-sm transition"
                    >
                      <div className="w-10 h-10 rounded-full bg-[#EEEDFB] flex items-center justify-center text-[#5B4EC4] text-[12px] font-semibold shrink-0">
                        {(p.firstName?.[0] ?? "?").toUpperCase()}
                        {(p.lastName?.[0] ?? "").toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[#1A1A2E] truncate">
                          {fullName(p)}
                        </p>
                        <div className="flex items-center gap-3 mt-0.5 text-[11px] text-[#6B7280]">
                          {age !== null && <span>{age} ans</span>}
                          {p.sex && <span>{p.sex === "M" ? "Homme" : "Femme"}</span>}
                          {p.email && (
                            <span className="flex items-center gap-1 truncate">
                              <Mail size={10} />
                              <span className="truncate">{p.email}</span>
                            </span>
                          )}
                          {p.phone && (
                            <span className="flex items-center gap-1">
                              <Phone size={10} />
                              {p.phone}
                            </span>
                          )}
                        </div>
                      </div>
                      <ChevronRight
                        size={16}
                        className="text-[#9CA3AF] group-hover:text-[#5B4EC4] shrink-0"
                      />
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* Note RGPD */}
        <p className="text-[10px] text-[#9CA3AF] text-center pt-4">
          Vue secrétariat — coordonnées administratives uniquement. Les notes
          cliniques ne sont accessibles qu&apos;aux soignants.
        </p>
      </div>

      <CreatePatientAdminModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={(p) => {
          qc.invalidateQueries({ queryKey: ["secretary-patients-search"] });
          router.push(`/secretariat/patients/${p.id}`);
        }}
      />
    </div>
  );
}
