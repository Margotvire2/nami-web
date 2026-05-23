"use client";

import { useState, useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getProviderTitle, formatProviderSpecialty } from "@/lib/provider-display";

interface NamiProvider {
  personId: string;
  providerId: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
  specialty: string | null;
  specialtyView: string | null;
  consultationCity: string | null;
  validated: boolean;
}

type RoleInCase = "MEMBER" | "LEAD";

interface Props {
  careCaseId: string;
  patientFirstName: string;
  patientLastName: string;
  onClose: () => void;
}

function errorToast(message: string): void {
  const code = message;
  if (code === "ALREADY_MEMBER") {
    toast.error("Ce soignant fait déjà partie de l'équipe de soins");
  } else if (code === "INVITATION_ALREADY_PENDING") {
    toast.error("Une invitation est déjà en attente pour ce soignant");
  } else if (code === "SELF_INVITE_FORBIDDEN") {
    toast.error("Vous ne pouvez pas vous inviter vous-même");
  } else if (code === "PROVIDER_NOT_FOUND") {
    toast.error("Soignant introuvable, veuillez réessayer");
  } else if (code === "CARE_CASE_NOT_FOUND") {
    toast.error("Dossier introuvable");
  } else if (code === "UPGRADE_REQUIRED" || code === "SUBSCRIPTION_REQUIRED") {
    toast.error("Vous n'avez pas les droits pour inviter sur ce dossier");
  } else if (code.startsWith("Erreur 5")) {
    toast.error("Une erreur serveur est survenue, réessayez dans quelques instants");
  } else {
    toast.error("Données invalides, vérifiez le formulaire");
  }
}

export function InviteTeamModal({ careCaseId, patientFirstName, patientLastName, onClose }: Props) {
  const qc = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NamiProvider[]>([]);
  const [searching, setSearching] = useState(false);
  const [selected, setSelected] = useState<NamiProvider | null>(null);
  const [role, setRole] = useState<RoleInCase>("MEMBER");
  const [patientConsent, setPatientConsent] = useState(false);

  // Guard anti-doublon : désactive la sélection si statusV2 ACTIVE ou PENDING_PROVIDER_ACCEPT
  const { data: teamAll } = useQuery({
    queryKey: ["team-guard", careCaseId],
    queryFn: async () => {
      const res = await api.get<Array<{ personId: string; statusV2: string }>>(
        `/care-cases/${careCaseId}/team?includeAllStatuses=true`
      );
      return res.data;
    },
  });

  const blockedProviders: Record<string, "ACTIVE" | "PENDING_PROVIDER_ACCEPT"> =
    (teamAll ?? []).reduce<Record<string, "ACTIVE" | "PENDING_PROVIDER_ACCEPT">>((acc, m) => {
      if (m.statusV2 === "ACTIVE" || m.statusV2 === "PENDING_PROVIDER_ACCEPT") {
        acc[m.personId] = m.statusV2 as "ACTIVE" | "PENDING_PROVIDER_ACCEPT";
      }
      return acc;
    }, {});

  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Debounce search — 300ms, min 2 chars
  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }
    setSearching(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get<NamiProvider[]>(`/providers/nami?q=${encodeURIComponent(query)}`);
        setResults(res.data);
      } catch {
        setResults([]);
      } finally {
        setSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const inviteMutation = useMutation({
    mutationFn: () =>
      api.post(`/care-cases/${careCaseId}/team/invite`, {
        targetProviderPersonId: selected!.personId,
        targetProviderId: selected!.providerId,
        roleInCase: role,
        patientNoticeAcknowledged: true,
      }),
    onSuccess: () => {
      toast.success(`Invitation envoyée à ${getProviderTitle(selected!.specialtyView)}${selected!.firstName} ${selected!.lastName}`);
      qc.invalidateQueries({ queryKey: ["team", careCaseId] });
      onClose();
    },
    onError: (err: Error) => {
      errorToast(err.message);
      // Ne pas fermer le modal sur ALREADY_MEMBER ou INVITATION_ALREADY_PENDING
    },
  });

  function selectProvider(p: NamiProvider) {
    setSelected(p);
    setStep(2);
  }

  function goBack() {
    if (step === 2) setStep(1);
    if (step === 3) setStep(2);
  }

  const stepTitles: Record<1 | 2 | 3, string> = {
    1: "Rechercher un soignant",
    2: "Définir le rôle",
    3: "Confirmer l'invitation",
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(26,26,46,0.6)", backdropFilter: "blur(2px)" }}
      onClick={onClose}
    >
      <div
        className="w-full max-w-md mx-4 rounded-2xl shadow-2xl overflow-hidden"
        style={{ background: "#FAFAF8" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {step > 1 && (
                <button
                  onClick={goBack}
                  className="text-gray-400 hover:text-gray-600 transition-colors text-sm mr-1"
                  aria-label="Retour"
                >
                  ←
                </button>
              )}
              <h2
                className="text-base font-semibold"
                style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
              >
                {stepTitles[step]}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors text-lg leading-none"
              aria-label="Fermer"
            >
              ✕
            </button>
          </div>
          {/* Step progress bar */}
          <div className="flex gap-1.5 mt-3">
            {([1, 2, 3] as const).map((s) => (
              <div
                key={s}
                className="h-1 rounded-full flex-1 transition-all duration-300"
                style={{
                  background: s <= step ? "#5B4EC4" : "#E8ECF4",
                  opacity: s < step ? 0.5 : 1,
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Step 1 — Recherche ────────────────────────────────────────── */}
        {step === 1 && (
          <div className="px-6 py-5">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Nom, prénom du soignant…"
                className="w-full text-sm rounded-xl px-4 py-3 border border-gray-200 focus:outline-none focus:border-[#5B4EC4] focus:ring-2 focus:ring-[#5B4EC4]/20"
                style={{ background: "#F5F3EF", color: "#1A1A2E" }}
              />
              {searching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <div className="w-4 h-4 border-2 border-[#5B4EC4] border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>

            {query.length < 2 && (
              <p className="text-xs text-gray-400 mt-3 text-center">
                Entrez au moins 2 caractères pour rechercher
              </p>
            )}

            {query.length >= 2 && !searching && results.length === 0 && (
              <p className="text-sm text-gray-400 italic mt-4 text-center">
                Aucun soignant trouvé pour &ldquo;{query}&rdquo;
              </p>
            )}

            {results.length > 0 && (
              <div className="mt-3 space-y-1.5 max-h-60 overflow-y-auto">
                {results.map((p) => {
                  const blockStatus = blockedProviders[p.personId];
                  return (
                    <button
                      key={p.personId}
                      onClick={() => !blockStatus && selectProvider(p)}
                      disabled={!!blockStatus}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors text-left hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: "#F5F3EF" }}
                    >
                      <div
                        className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                        style={{ background: "#EDE9FC", color: "#5B4EC4" }}
                      >
                        {(p.firstName[0] ?? "?").toUpperCase()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium" style={{ color: "#1A1A2E" }}>
                          {getProviderTitle(p.specialtyView)}{p.firstName} {p.lastName}
                        </p>
                        {(p.specialty || p.consultationCity) && (
                          <p className="text-xs truncate" style={{ color: "#6B7280" }}>
                            {formatProviderSpecialty(p.specialty)}
                            {p.specialty && p.consultationCity ? " · " : ""}
                            {p.consultationCity ?? ""}
                          </p>
                        )}
                      </div>
                      {blockStatus ? (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                          style={{ background: "#FEF3C7", color: "#92400E" }}
                        >
                          {blockStatus === "ACTIVE" ? "Déjà membre" : "Invitation en attente"}
                        </span>
                      ) : p.validated ? (
                        <span
                          className="text-[10px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                          style={{ background: "#E6F7F6", color: "#2BA89C" }}
                        >
                          ✓ Vérifié
                        </span>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Step 2 — Rôle ─────────────────────────────────────────────── */}
        {step === 2 && selected && (
          <div className="px-6 py-5">
            {/* Soignant sélectionné */}
            <div
              className="flex items-center gap-3 p-3 rounded-xl mb-5"
              style={{ background: "#F5F3EF" }}
            >
              <div
                className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0"
                style={{ background: "#EDE9FC", color: "#5B4EC4" }}
              >
                {(selected.firstName[0] ?? "?").toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium" style={{ color: "#1A1A2E" }}>
                  {getProviderTitle(selected.specialtyView)}{selected.firstName} {selected.lastName}
                </p>
                {selected.specialty && (
                  <p className="text-xs" style={{ color: "#6B7280" }}>
                    {formatProviderSpecialty(selected.specialty)}
                  </p>
                )}
              </div>
            </div>

            <p
              className="text-xs font-semibold uppercase tracking-wider mb-3"
              style={{ color: "#6B7280" }}
            >
              Rôle dans ce parcours
            </p>

            <div className="space-y-2.5">
              <label
                className="flex items-start gap-3 cursor-pointer p-3 rounded-xl transition-all"
                style={{
                  background: role === "MEMBER" ? "#EDE9FC" : "#F5F3EF",
                  border: `1.5px solid ${role === "MEMBER" ? "#5B4EC4" : "transparent"}`,
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="MEMBER"
                  checked={role === "MEMBER"}
                  onChange={() => setRole("MEMBER")}
                  className="mt-0.5 accent-[#5B4EC4]"
                />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#1A1A2E" }}>
                    Membre de l&apos;équipe
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                    Contribue au parcours de soins, accès aux notes et à la coordination
                  </p>
                </div>
              </label>

              <label
                className="flex items-start gap-3 cursor-pointer p-3 rounded-xl transition-all"
                style={{
                  background: role === "LEAD" ? "#EDE9FC" : "#F5F3EF",
                  border: `1.5px solid ${role === "LEAD" ? "#5B4EC4" : "transparent"}`,
                }}
              >
                <input
                  type="radio"
                  name="role"
                  value="LEAD"
                  checked={role === "LEAD"}
                  onChange={() => setRole("LEAD")}
                  className="mt-0.5 accent-[#5B4EC4]"
                />
                <div>
                  <p className="text-sm font-semibold" style={{ color: "#1A1A2E" }}>
                    Coordinateur (Lead)
                  </p>
                  <p className="text-xs mt-0.5" style={{ color: "#6B7280" }}>
                    Pilote la prise en charge, droits étendus sur le parcours
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-2 mt-6">
              <button
                onClick={goBack}
                className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 transition-colors hover:bg-gray-50"
                style={{ color: "#374151" }}
              >
                Retour
              </button>
              <button
                onClick={() => setStep(3)}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition-colors"
                style={{ background: "#5B4EC4" }}
              >
                Continuer →
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 — Consentement ─────────────────────────────────────── */}
        {step === 3 && selected && (
          <div className="px-6 py-5">
            {/* Récapitulatif */}
            <div className="rounded-xl p-4 mb-4 space-y-2.5" style={{ background: "#F5F3EF" }}>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#6B7280" }}>Patient</span>
                <span className="font-medium" style={{ color: "#1A1A2E" }}>
                  {patientFirstName} {patientLastName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#6B7280" }}>Soignant invité</span>
                <span className="font-medium" style={{ color: "#1A1A2E" }}>
                  {getProviderTitle(selected.specialtyView)}{selected.firstName} {selected.lastName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: "#6B7280" }}>Rôle</span>
                <span className="font-medium" style={{ color: "#5B4EC4" }}>
                  {role === "LEAD" ? "Coordinateur (Lead)" : "Membre de l'équipe"}
                </span>
              </div>
            </div>

            {/* Case consentement */}
            <label
              className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all mb-4"
              style={{
                background: patientConsent ? "#EDE9FC" : "#FAFAF8",
                borderColor: patientConsent ? "#5B4EC4" : "#E8ECF4",
              }}
            >
              <input
                type="checkbox"
                checked={patientConsent}
                onChange={(e) => setPatientConsent(e.target.checked)}
                className="mt-0.5 accent-[#5B4EC4] w-4 h-4 flex-shrink-0"
              />
              <p className="text-sm leading-relaxed" style={{ color: "#1A1A2E" }}>
                <strong>
                  {patientFirstName} {patientLastName}
                </strong>{" "}
                est au courant et consent à ce que{" "}
                {getProviderTitle(selected.specialtyView)}<strong>
                  {selected.firstName} {selected.lastName}
                </strong>{" "}
                rejoigne son équipe de soins
              </p>
            </label>

            {/* Note légale */}
            <p
              className="text-[10px] italic mb-5"
              style={{ color: "#9CA3AF", fontVariant: "small-caps" }}
            >
              Art. L.1110-4 CSP — Cette attestation est tracée dans Nami
            </p>

            <div className="flex gap-2">
              <button
                onClick={goBack}
                className="flex-1 py-2.5 text-sm font-medium rounded-xl border border-gray-200 transition-colors hover:bg-gray-50"
                style={{ color: "#374151" }}
              >
                Retour
              </button>
              <button
                onClick={() => inviteMutation.mutate()}
                disabled={!patientConsent || inviteMutation.isPending}
                className="flex-1 py-2.5 text-sm font-semibold rounded-xl text-white transition-all disabled:opacity-40"
                style={{ background: "#5B4EC4" }}
              >
                {inviteMutation.isPending ? "Envoi…" : "Envoyer l'invitation"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
