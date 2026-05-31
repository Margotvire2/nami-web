"use client";

/**
 * UploadTargetingModal — CC #UPLOAD-MODAL-CARECASE-PICKER (Phase 3).
 *
 * Demande au patient à qui adresser le bilan qu'il vient de déposer.
 * Deux modes XOR (client-side aligné backend PR #96) :
 *   1. "Pour mes équipes soignantes" → checkboxes CareCases (multi)
 *   2. "En privé à un soignant"      → dropdown 1 soignant (DM)
 *
 * Avant cette modal : fan-out aveugle à TOUS les soignants de TOUS les
 * CareCases (violation isolation parcours croisés).
 * Après : envoi limité aux destinataires choisis.
 *
 * Source CareCases : usePatientCareCases() → patientFacingTitle si dispo,
 * sinon fallback caseTitle.
 * Source soignants : usePatientCareTeamByCareCases() dédupliqué par
 * providerProfile.id (un soignant peut être dans plusieurs parcours).
 *
 * Wording strict MDR : aucun terme clinique (cf. CLAUDE.md §Mots interdits).
 */

import { useEffect, useMemo, useState } from "react";
import { X, Users, User, Loader2, AlertCircle } from "lucide-react";
import { usePatientCareCases } from "@/hooks/usePatientCareCases";
import { usePatientCareTeamByCareCases } from "@/hooks/usePatientCareTeamByCareCases";
import type {
  PatientAuthorizedProvider,
  PatientCareCaseSummary,
} from "@/lib/api";

const C = {
  bg: "#FFFFFF",
  backdrop: "rgba(26,26,46,0.4)",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  border: "rgba(26,26,46,0.08)",
  borderActive: "#5B4EC4",
  primary: "#5B4EC4",
  primaryHover: "#4A3FA8",
  primaryLight: "#EEEDFB",
  disabled: "#E5E7EB",
};

type Mode = "team" | "direct";

export interface UploadTargetingPayload {
  careCaseIds?: string[];
  directRecipientPersonId?: string;
}

export interface UploadTargetingModalProps {
  isOpen: boolean;
  fileName?: string;
  onClose: () => void;
  onConfirm: (payload: UploadTargetingPayload) => void;
  /** True pendant l'upload (disable boutons). */
  isSubmitting?: boolean;
  /**
   * Permet de surcharger les data sources en test (DI léger).
   * En prod : laisser undefined, les hooks sont appelés.
   */
  __testOverrides?: {
    careCases?: PatientCareCaseSummary[];
    providersByCareCase?: PatientAuthorizedProvider[][];
    isLoading?: boolean;
  };
}

interface ProviderWithCareCase extends PatientAuthorizedProvider {
  careCaseIds: string[];
}

/**
 * Dédup soignants par id, conserve la liste des CareCases d'appartenance.
 * Un même soignant peut être dans 2 parcours — on l'affiche 1 fois.
 */
function dedupProviders(
  providersByCareCase: PatientAuthorizedProvider[][],
  careCaseIds: string[],
): ProviderWithCareCase[] {
  const map = new Map<string, ProviderWithCareCase>();
  providersByCareCase.forEach((providers, idx) => {
    const careCaseId = careCaseIds[idx];
    if (!careCaseId) return;
    for (const p of providers) {
      const existing = map.get(p.id);
      if (existing) {
        if (!existing.careCaseIds.includes(careCaseId)) {
          existing.careCaseIds.push(careCaseId);
        }
      } else {
        map.set(p.id, { ...p, careCaseIds: [careCaseId] });
      }
    }
  });
  return Array.from(map.values()).sort((a, b) =>
    `${a.lastName} ${a.firstName}`.localeCompare(`${b.lastName} ${b.firstName}`),
  );
}

function providerLabel(p: PatientAuthorizedProvider): string {
  const base = `${p.firstName} ${p.lastName}`.trim();
  return p.specialty ? `${base} — ${p.specialty}` : base;
}

export function UploadTargetingModal({
  isOpen,
  fileName,
  onClose,
  onConfirm,
  isSubmitting = false,
  __testOverrides,
}: UploadTargetingModalProps) {
  // ─── Data sources ────────────────────────────────────────────────────────
  const careCasesQuery = usePatientCareCases();
  const careCasesData = careCasesQuery.data;
  const overrideCareCases = __testOverrides?.careCases;
  const careCases = useMemo<PatientCareCaseSummary[]>(
    () => overrideCareCases ?? careCasesData ?? [],
    [overrideCareCases, careCasesData],
  );
  const careCaseIds = useMemo(() => careCases.map((c) => c.id), [careCases]);

  const careTeamQueries = usePatientCareTeamByCareCases(
    __testOverrides ? [] : careCaseIds,
  );
  const providersByCareCase: PatientAuthorizedProvider[][] =
    __testOverrides?.providersByCareCase ??
    careTeamQueries.map((q) => q.data ?? []);

  const isLoading =
    __testOverrides?.isLoading ??
    (careCasesQuery.isLoading ||
      careTeamQueries.some((q) => q.isLoading));

  const dedupedProviders = useMemo(
    () => dedupProviders(providersByCareCase, careCaseIds),
    [providersByCareCase, careCaseIds],
  );

  // ─── State ───────────────────────────────────────────────────────────────
  const [mode, setMode] = useState<Mode>("team");
  const [selectedCareCaseIds, setSelectedCareCaseIds] = useState<Set<string>>(
    new Set(),
  );
  const [selectedProviderId, setSelectedProviderId] = useState<string>("");

  // Pré-check si 1 seul CareCase (UX : pas besoin de cocher quand c'est évident)
  useEffect(() => {
    if (!isOpen) return;
    if (careCases.length === 1) {
      setSelectedCareCaseIds(new Set([careCases[0]!.id]));
    } else {
      setSelectedCareCaseIds(new Set());
    }
    setSelectedProviderId("");
    setMode("team");
  }, [isOpen, careCases]);

  // ─── Computed ─────────────────────────────────────────────────────────────
  const hasNoDestination =
    !isLoading && careCases.length === 0 && dedupedProviders.length === 0;

  const isValid =
    mode === "team"
      ? selectedCareCaseIds.size > 0
      : selectedProviderId.length > 0;

  // ─── Handlers ────────────────────────────────────────────────────────────
  function toggleCareCase(id: string) {
    setSelectedCareCaseIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function handleConfirm() {
    if (!isValid) return;
    if (mode === "team") {
      onConfirm({ careCaseIds: Array.from(selectedCareCaseIds) });
    } else {
      onConfirm({ directRecipientPersonId: selectedProviderId });
    }
  }

  if (!isOpen) return null;

  // ─── Helpers d'affichage ─────────────────────────────────────────────────
  function careCaseTitle(c: PatientCareCaseSummary): string {
    // Fallback chain : caseTitle (toujours présent). patientFacingTitle est
    // exposé côté CareCase modèle mais pas dans PatientCareCaseSummary actuel.
    return c.caseTitle || "Mon parcours de coordination";
  }

  function providersInCareCase(careCaseId: string): number {
    const idx = careCaseIds.indexOf(careCaseId);
    if (idx === -1) return 0;
    return (providersByCareCase[idx] ?? []).length;
  }

  // ─── Render ──────────────────────────────────────────────────────────────
  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="upload-targeting-title"
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: C.backdrop,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: C.bg,
          borderRadius: 20,
          padding: 24,
          maxWidth: 480,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(26,26,46,0.18)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            marginBottom: 8,
          }}
        >
          <div>
            <h2
              id="upload-targeting-title"
              style={{
                fontSize: 18,
                fontWeight: 700,
                color: C.text,
                letterSpacing: "-0.3px",
              }}
            >
              Ce bilan concerne :
            </h2>
            {fileName ? (
              <p
                style={{
                  fontSize: 12,
                  color: C.textSoft,
                  marginTop: 4,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 380,
                }}
                title={fileName}
              >
                {fileName}
              </p>
            ) : null}
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fermer"
            disabled={isSubmitting}
            style={{
              background: "transparent",
              border: "none",
              cursor: isSubmitting ? "not-allowed" : "pointer",
              color: C.textSoft,
              padding: 4,
            }}
          >
            <X size={20} aria-hidden="true" />
          </button>
        </div>

        {/* Loading */}
        {isLoading ? (
          <div
            style={{
              padding: "32px 0",
              textAlign: "center",
              color: C.textSoft,
              fontSize: 13,
            }}
          >
            <Loader2
              size={24}
              className="animate-spin"
              aria-hidden="true"
              style={{ margin: "0 auto 8px", color: C.primary }}
            />
            Chargement de vos parcours…
          </div>
        ) : hasNoDestination ? (
          <div
            role="alert"
            style={{
              padding: 16,
              borderRadius: 12,
              background: "rgba(217,119,6,0.08)",
              color: "#92400E",
              fontSize: 13,
              display: "flex",
              alignItems: "flex-start",
              gap: 8,
              marginTop: 12,
            }}
          >
            <AlertCircle size={16} aria-hidden="true" style={{ flexShrink: 0, marginTop: 2 }} />
            <div>
              <strong>Aucune destination disponible.</strong>
              <p style={{ marginTop: 4 }}>
                Demandez à votre équipe soignante de vous ouvrir un dossier de
                coordination pour envoyer votre bilan.
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Mode radio cards */}
            <div
              role="radiogroup"
              aria-label="Mode d'envoi du bilan"
              style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 16 }}
            >
              <ModeRadioCard
                checked={mode === "team"}
                disabled={careCases.length === 0}
                onChange={() => setMode("team")}
                icon={<Users size={18} aria-hidden="true" />}
                label="Pour mes équipes soignantes"
                description="Tous les soignants des parcours sélectionnés y auront accès."
              />
              <ModeRadioCard
                checked={mode === "direct"}
                disabled={dedupedProviders.length === 0}
                onChange={() => setMode("direct")}
                icon={<User size={18} aria-hidden="true" />}
                label="En privé à un soignant"
                description="Un seul soignant recevra ce bilan, sans partage à l'équipe."
              />
            </div>

            {/* Mode team : checkboxes CareCases */}
            {mode === "team" ? (
              <div style={{ marginTop: 16 }}>
                {careCases.length === 1 ? (
                  <p
                    style={{
                      fontSize: 13,
                      color: C.textSoft,
                      marginBottom: 8,
                    }}
                  >
                    Ce bilan sera envoyé aux soignants de ce parcours :
                  </p>
                ) : (
                  <p
                    style={{
                      fontSize: 13,
                      color: C.textSoft,
                      marginBottom: 8,
                    }}
                  >
                    Sélectionnez le(s) parcours concerné(s) :
                  </p>
                )}
                <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                  {careCases.map((c) => {
                    const checked = selectedCareCaseIds.has(c.id);
                    const nbProviders = providersInCareCase(c.id);
                    return (
                      <label
                        key={c.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 10,
                          padding: "10px 12px",
                          borderRadius: 10,
                          border: `1px solid ${
                            checked ? C.borderActive : C.border
                          }`,
                          background: checked ? C.primaryLight : "#FFFFFF",
                          cursor: "pointer",
                          transition: "all 120ms ease",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCareCase(c.id)}
                          aria-label={`Parcours ${careCaseTitle(c)}`}
                          style={{ width: 16, height: 16, accentColor: C.primary }}
                        />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div
                            style={{
                              fontSize: 14,
                              fontWeight: 600,
                              color: C.text,
                            }}
                          >
                            {careCaseTitle(c)}
                          </div>
                          <div style={{ fontSize: 12, color: C.textSoft, marginTop: 2 }}>
                            {nbProviders} soignant{nbProviders > 1 ? "s" : ""} dans ce parcours
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {/* Mode direct : dropdown soignants */}
            {mode === "direct" ? (
              <div style={{ marginTop: 16 }}>
                <label
                  htmlFor="upload-targeting-provider"
                  style={{
                    display: "block",
                    fontSize: 13,
                    color: C.textSoft,
                    marginBottom: 8,
                  }}
                >
                  Choisissez le soignant destinataire :
                </label>
                <select
                  id="upload-targeting-provider"
                  value={selectedProviderId}
                  onChange={(e) => setSelectedProviderId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    fontSize: 14,
                    borderRadius: 10,
                    border: `1px solid ${C.border}`,
                    background: "#FFFFFF",
                    color: C.text,
                    cursor: "pointer",
                  }}
                >
                  <option value="">— Sélectionner un soignant —</option>
                  {dedupedProviders.map((p) => (
                    <option key={p.id} value={p.id}>
                      {providerLabel(p)}
                    </option>
                  ))}
                </select>
              </div>
            ) : null}
          </>
        )}

        {/* Footer actions */}
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 24,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: "transparent",
              color: C.textSoft,
              fontSize: 14,
              fontWeight: 500,
              cursor: isSubmitting ? "not-allowed" : "pointer",
            }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={!isValid || isSubmitting || hasNoDestination}
            style={{
              padding: "10px 18px",
              borderRadius: 10,
              border: "none",
              background: !isValid || hasNoDestination ? C.disabled : C.primary,
              color: "#FFFFFF",
              fontSize: 14,
              fontWeight: 600,
              cursor: !isValid || isSubmitting || hasNoDestination ? "not-allowed" : "pointer",
              transition: "background 120ms ease",
            }}
          >
            {isSubmitting ? "Envoi…" : "Envoyer"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Sub-component ─────────────────────────────────────────────────────────

interface ModeRadioCardProps {
  checked: boolean;
  disabled: boolean;
  onChange: () => void;
  icon: React.ReactNode;
  label: string;
  description: string;
}

function ModeRadioCard({
  checked,
  disabled,
  onChange,
  icon,
  label,
  description,
}: ModeRadioCardProps) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: 12,
        borderRadius: 12,
        border: `1px solid ${checked ? C.borderActive : C.border}`,
        background: checked ? C.primaryLight : "#FFFFFF",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.5 : 1,
        transition: "all 120ms ease",
      }}
    >
      <input
        type="radio"
        checked={checked}
        disabled={disabled}
        onChange={onChange}
        aria-label={label}
        style={{
          width: 16,
          height: 16,
          marginTop: 2,
          accentColor: C.primary,
        }}
      />
      <div style={{ flex: 1 }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            fontWeight: 600,
            color: C.text,
          }}
        >
          <span style={{ color: C.primary }}>{icon}</span>
          {label}
        </div>
        <p style={{ fontSize: 12, color: C.textSoft, marginTop: 4, lineHeight: 1.4 }}>
          {description}
        </p>
      </div>
    </label>
  );
}
