"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import {
  apiWithToken,
  authApi,
  GLOBAL_SCOPE_KEY,
  type ConsentMatrix,
  type ConsentTypeName,
  type PatientMe,
  type SwitchableProfile,
} from "@/lib/api";
import { computeAge } from "@/lib/age";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  User,
  Shield,
  Loader2,
  Check,
  Mail,
  Users,
  ShieldCheck,
  ChevronDown,
  Download,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";
import {
  DeleteAccountModal,
  type ActiveCareCaseSummary,
} from "@/components/patient/DeleteAccountModal";

// ─── Helpers UI ─────────────────────────────────────────────────────────────

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "var(--nami-card)",
        borderRadius: 16,
        border: `1px solid var(--nami-border)`,
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: `1px solid var(--nami-border)`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Icon size={16} strokeWidth={2} color={"var(--nami-primary)"} />
        <span style={{ fontSize: 14, fontWeight: 700, color: "var(--nami-dark)" }}>{title}</span>
      </div>
      <div style={{ padding: "16px 20px" }}>{children}</div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "8px 0",
        borderBottom: `1px solid var(--nami-border)`,
      }}
    >
      <span style={{ fontSize: 13, color: "var(--nami-text-muted)" }}>{label}</span>
      <span style={{ fontSize: 14, color: "var(--nami-dark)", fontWeight: 500 }}>{value || "—"}</span>
    </div>
  );
}

const inputSt: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: `1.5px solid var(--nami-border)`,
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "inherit",
  color: "var(--nami-dark)",
  background: "var(--nami-bg)",
  outline: "none",
};
const labelSt: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--nami-text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.6px",
  display: "block",
  marginBottom: 5,
};

// Labels affichables — couvre les valeurs legacy (M/F/O) ET normalisées (MALE/FEMALE/OTHER/UNKNOWN)
const SEX_LABELS: Record<string, string> = {
  M: "Homme",
  F: "Femme",
  O: "Autre",
  MALE: "Homme",
  FEMALE: "Femme",
  OTHER: "Autre",
  UNKNOWN: "Non précisé",
};

// Conversion legacy M/F/O → enum backend MALE/FEMALE/OTHER/UNKNOWN (au submit)
type SexEnum = "MALE" | "FEMALE" | "OTHER" | "UNKNOWN";
function normalizeSexForBackend(raw: string): SexEnum | undefined {
  if (!raw) return undefined;
  if (raw === "M" || raw === "MALE") return "MALE";
  if (raw === "F" || raw === "FEMALE") return "FEMALE";
  if (raw === "O" || raw === "OTHER") return "OTHER";
  if (raw === "UNKNOWN") return "UNKNOWN";
  return undefined;
}

// ─── Constantes D2.B — labels FR + scopes V1 ────────────────────────────────

// Catalog scopes V1 par ConsentType (miroir frontend de CONSENT_SCOPES_V1
// backend F4 G5). Types absents = mono-axe (uniquement __global__).
const CONSENT_SCOPES_V1: Record<ConsentTypeName, readonly string[]> = {
  AI_PROCESSING: ["transcription_audio", "note_summarization", "bio_extraction"],
  DATA_SHARING: ["care_team", "referral_partner", "family_pediatric_parent"],
  NOTIFICATIONS: ["appointment_reminder", "message_alert"],
  RGPD_PROCESSING: [],
  CARE_COORDINATION: [],
  MARKETING: [],
};

// Labels FR — vocabulaire MDR-safe (cf. CLAUDE.md). Aucun "surveillance",
// "détection", "monitoring". "Notifications de messages" préféré à "Alertes
// de messages" pour éviter toute ambiguïté DM.
const CONSENT_TYPE_LABELS_FR: Record<ConsentTypeName, string> = {
  AI_PROCESSING: "Traitement par intelligence artificielle",
  DATA_SHARING: "Partage de données",
  NOTIFICATIONS: "Notifications",
  RGPD_PROCESSING: "Traitement des données personnelles",
  CARE_COORDINATION: "Coordination des soins",
  MARKETING: "Communications marketing",
};

const CONSENT_SCOPE_LABELS_FR: Record<string, string> = {
  transcription_audio: "Transcription audio",
  note_summarization: "Synthèse de notes",
  bio_extraction: "Extraction d'informations biologiques",
  care_team: "Équipe de soins",
  referral_partner: "Partenaire d'adressage",
  family_pediatric_parent: "Parent (suivi pédiatrique)",
  appointment_reminder: "Rappels de rendez-vous",
  message_alert: "Notifications de messages",
  [GLOBAL_SCOPE_KEY]: "Consentement général (donné avant le détail)",
};

// Labels FR pour les delegationScopes affichés en Section 3
const DELEGATION_SCOPE_LABELS_FR: Record<string, string> = {
  BOOK_APPOINTMENTS: "Prendre des rendez-vous",
  CANCEL_APPOINTMENTS: "Annuler des rendez-vous",
  SEND_MESSAGES: "Envoyer des messages",
  UPLOAD_DOCUMENTS: "Téléverser des documents",
  COMPLETE_QUESTIONNAIRES: "Remplir des questionnaires",
  MANAGE_CARE_TEAM: "Gérer l'équipe de soins",
  MANAGE_CONSENTS: "Gérer les consentements",
  VIEW_MEDICAL_HISTORY: "Voir l'historique de coordination",
  VIEW_DOCUMENTS: "Voir les documents",
  VIEW_APPOINTMENTS: "Voir les rendez-vous",
};

const ORDERED_TYPES: ConsentTypeName[] = [
  "RGPD_PROCESSING",
  "CARE_COORDINATION",
  "DATA_SHARING",
  "NOTIFICATIONS",
  "AI_PROCESSING",
  "MARKETING",
];

// ─── Toggle inline (a11y role="switch") ────────────────────────────────────

function Toggle({
  checked,
  onChange,
  disabled = false,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      style={{
        position: "relative",
        width: 40,
        height: 22,
        borderRadius: 999,
        border: "none",
        background: checked ? "var(--nami-primary)" : "#E5E7EB",
        cursor: disabled ? "wait" : "pointer",
        transition: "background 0.18s ease",
        flexShrink: 0,
        outline: "none",
        padding: 0,
        opacity: disabled ? 0.65 : 1,
      }}
    >
      <span
        aria-hidden="true"
        style={{
          position: "absolute",
          top: 3,
          left: checked ? 21 : 3,
          width: 16,
          height: 16,
          borderRadius: "50%",
          background: "#FFFFFF",
          boxShadow: "0 1px 3px rgba(26,26,46,0.25)",
          transition: "left 0.18s ease",
        }}
      />
    </button>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Page
// ═══════════════════════════════════════════════════════════════════════════

export default function MonComptePage() {
  const accessToken = useAuthStore((s) => s.accessToken);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const api = apiWithToken(accessToken!);
  const qc = useQueryClient();
  const [editing, setEditing] = useState(false);

  // me.careCases est chargé volontairement (consommé par garde-fou doux
  // suppression dans D2.C — ne pas retirer le fetch).
  const { data: me, isLoading } = useQuery<PatientMe>({
    queryKey: ["patient-me"],
    queryFn: () => api.patient.me(),
    enabled: !!accessToken,
  });

  const person = me?.person;

  // ─── Form rectification Art. 16 ──────────────────────────────────────────
  // PR #76 backend (CC #92) : ajout adresse FR (address/city/postalCode →
  // PatientProfile.address/city/zipcode). Validation postalCode FR 5 chiffres
  // côté frontend cohérente backend Zod.
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    birthDate: "",
    sex: "",
    address: "",
    city: "",
    postalCode: "",
  });

  function startEdit() {
    setForm({
      firstName: person?.firstName ?? "",
      lastName: person?.lastName ?? "",
      phone: person?.phone ?? "",
      birthDate: person?.birthDate
        ? format(parseISO(person.birthDate), "yyyy-MM-dd")
        : "",
      sex: person?.sex ?? "",
      address: person?.address ?? "",
      city: person?.city ?? "",
      postalCode: person?.postalCode ?? "",
    });
    setEditing(true);
  }

  // Validation locale postalCode FR (cohérente backend Zod /^\d{5}$/).
  // Vide = OK (champ optionnel). Sinon : exactement 5 chiffres.
  const postalCodeError =
    form.postalCode && !/^\d{5}$/.test(form.postalCode)
      ? "Code postal invalide (5 chiffres)"
      : null;

  // Mutation : persons.patch pour firstName/lastName/phone/birthDate/sex
  // (Art. 16 existant) PUIS patient.patchMe pour address/city/postalCode
  // (PR #76 backend, mapping postalCode ↔ DB.zipcode côté Nami). Email exclu
  // (read-only V1 — cf. ticket dérivé D2.2).
  const patchMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User ID manquant");
      if (postalCodeError) throw new Error(postalCodeError);
      const sexEnum = normalizeSexForBackend(form.sex);
      // birthDate en input HTML "yyyy-MM-dd" → conversion ISO datetime
      const birthDateISO = form.birthDate
        ? new Date(form.birthDate + "T00:00:00Z").toISOString()
        : undefined;
      await api.persons.patch(user.id, {
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        phone: form.phone || undefined,
        birthDate: birthDateISO,
        sex: sexEnum,
      });
      // PR #76 : adresse FR via /patient/me (PatientProfile écrit côté backend)
      await api.patient.patchMe({
        address: form.address || undefined,
        city: form.city || undefined,
        postalCode: form.postalCode || undefined,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-me"] });
      setEditing(false);
      toast.success("Profil mis à jour");
    },
    onError: (e: Error) =>
      toast.error(e.message || "Erreur lors de la mise à jour"),
  });

  // ─── Réinitialisation mot de passe (Option A — bouton trigger email) ─────
  const resetPasswordMutation = useMutation({
    mutationFn: () => {
      if (!user?.email) throw new Error("Email manquant");
      return authApi.forgotPassword(user.email);
    },
    onSuccess: () => {
      toast.success(`Un email de réinitialisation a été envoyé à ${user?.email}`);
    },
    onError: () => toast.error("Erreur lors de l'envoi de l'email"),
  });

  // ─── D2.B — Section 3 Profils + Section 4 Consentements ──────────────────

  // Profils disponibles (self + délégations actives). Source unique pour
  // Sections 3 et 4 (matrice ciblée).
  const { data: profiles } = useQuery<SwitchableProfile[]>({
    queryKey: ["patient-switchable-profiles"],
    queryFn: () => api.patient.switchableProfiles(),
    enabled: !!accessToken,
  });

  // Profil actif déduit de l'URL (?profile=X), pattern F6 hoisting.
  // Self par défaut quand pas de paramètre.
  const searchParams = useSearchParams();
  const urlProfileId = searchParams.get("profile");
  const selfProfile = profiles?.find((p) => p.isSelf) ?? null;
  const targetProfileId = urlProfileId ?? selfProfile?.personId ?? user?.id ?? null;
  const targetProfile =
    profiles?.find((p) => p.personId === targetProfileId) ?? null;

  // Détection MANAGE_CONSENTS proactif : si on consulte un enfant et que la
  // délégation ne contient pas MANAGE_CONSENTS → on n'appelle PAS /matrix
  // (qui renverrait 403). On affiche un message propre à la place.
  const canManageConsents = useMemo(() => {
    if (!targetProfile) return false;
    if (targetProfile.isSelf) return true;
    return targetProfile.delegationScopes?.includes("MANAGE_CONSENTS") ?? false;
  }, [targetProfile]);

  const { data: consentMatrix, error: matrixError } = useQuery<ConsentMatrix>({
    queryKey: ["consents-matrix", targetProfileId],
    queryFn: () => api.persons.consentsMatrix(targetProfileId!),
    enabled: !!accessToken && !!targetProfileId && canManageConsents,
    retry: false,
  });

  // Mutation toggle consent : POST avec granted=true/false (event-sourcing,
  // dernier event fait foi — pas besoin de DELETE / consentId).
  const toggleConsentMutation = useMutation({
    mutationFn: (params: { consentType: ConsentTypeName; scope: string; granted: boolean }) => {
      if (!targetProfileId) throw new Error("Profil cible manquant");
      return api.persons.grantConsent(targetProfileId, {
        consentType: params.consentType,
        granted: params.granted,
        scope: params.scope === GLOBAL_SCOPE_KEY ? null : params.scope,
        source: "WEB",
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["consents-matrix", targetProfileId] });
    },
    onError: () => toast.error("Erreur lors de la mise à jour du consentement"),
  });

  // État local : quelles cards accordéon sont dépliées (par ConsentType)
  const [expandedTypes, setExpandedTypes] = useState<Record<string, boolean>>({});

  // ─── D2.C — Export Art. 15/20 + Suppression Art. 17 ──────────────────────

  // Liste filtrée des parcours actifs pour le garde-fou doux (Art. 17).
  // Récupère le firstName du lead provider via members[].provider (premier
  // membre avec un provider attaché). me.careCases est déjà fetché (D2.A).
  const activeCareCasesForGuard = useMemo<ActiveCareCaseSummary[]>(() => {
    if (!me?.careCases) return [];
    return me.careCases
      .filter((c) => c.status === "ACTIVE")
      .map((c) => {
        const leadMember = c.members.find((m) => m.provider) ?? c.members[0];
        return {
          id: c.id,
          caseTitle: c.caseTitle,
          leadProviderFirstName: leadMember?.person?.firstName ?? null,
        };
      });
  }, [me]);

  // Modal de suppression
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Mutation export — déclenche download blob JSON côté client
  const exportMutation = useMutation({
    mutationFn: async () => {
      if (!user?.id) throw new Error("User ID manquant");
      return api.persons.dataExport(user.id);
    },
    onSuccess: (data) => {
      try {
        const json = JSON.stringify(data, null, 2);
        const blob = new Blob([json], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const dateStr = new Date().toISOString().split("T")[0];
        const a = document.createElement("a");
        a.href = url;
        a.download = `mes-donnees-nami-${dateStr}.json`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Téléchargement de vos données démarré");
      } catch {
        toast.error("Erreur lors de la préparation du fichier");
      }
    },
    onError: () => toast.error("Erreur lors de l'export de vos données"),
  });

  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "60vh",
        }}
      >
        <Loader2 size={24} className="animate-spin" style={{ color: "var(--nami-primary)" }} />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "28px 24px 80px",
        maxWidth: 540,
        margin: "0 auto",
        background: "var(--nami-bg)",
        minHeight: "100vh",
      }}
    >
      {/* Avatar + nom */}
      <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
        <div
          style={{
            width: 60,
            height: 60,
            borderRadius: "50%",
            background: "var(--nami-primary-light)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 700, color: "var(--nami-primary)" }}>
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </span>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "var(--nami-dark)" }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ fontSize: 13, color: "var(--nami-text-muted)" }}>{user?.email}</div>
        </div>
      </div>

      {/* ─── Section 1 — Mes informations (rectification Art. 16) ────────── */}
      <Section title="Mes informations" icon={User}>
        {!editing ? (
          <>
            <Field label="Prénom" value={person?.firstName ?? ""} />
            <Field label="Nom" value={person?.lastName ?? ""} />
            <Field label="Email" value={person?.email ?? ""} />
            <Field label="Téléphone" value={person?.phone ?? ""} />
            <Field
              label="Date de naissance"
              value={
                person?.birthDate
                  ? format(parseISO(person.birthDate), "d MMMM yyyy", { locale: fr })
                  : ""
              }
            />
            <Field label="Sexe" value={SEX_LABELS[person?.sex ?? ""] ?? ""} />
            <Field label="Adresse" value={person?.address ?? ""} />
            <Field label="Code postal" value={person?.postalCode ?? ""} />
            <Field label="Ville" value={person?.city ?? ""} />
            <button
              onClick={startEdit}
              style={{
                marginTop: 14,
                padding: "9px 18px",
                borderRadius: 10,
                border: `1.5px solid var(--nami-primary)`,
                background: "var(--nami-primary-light)",
                color: "var(--nami-primary)",
                fontSize: 13,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: "inherit",
              }}
            >
              Modifier mes informations
            </button>
          </>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={labelSt}>Prénom</label>
              <input
                style={inputSt}
                type="text"
                value={form.firstName}
                onChange={(e) => setForm({ ...form, firstName: e.target.value })}
                aria-label="Prénom"
              />
            </div>
            <div>
              <label style={labelSt}>Nom</label>
              <input
                style={inputSt}
                type="text"
                value={form.lastName}
                onChange={(e) => setForm({ ...form, lastName: e.target.value })}
                aria-label="Nom"
              />
            </div>

            {/* Email READ-ONLY (Option B doute #2) */}
            <div>
              <label style={labelSt}>Email</label>
              <input
                style={{
                  ...inputSt,
                  background: "#F5F3EF",
                  color: "var(--nami-text-muted)",
                  cursor: "not-allowed",
                }}
                type="email"
                value={person?.email ?? ""}
                disabled
                readOnly
                aria-label="Email (non modifiable)"
              />
              <p
                style={{
                  fontSize: 11,
                  color: "var(--nami-text-muted)",
                  marginTop: 4,
                  display: "flex",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Mail size={11} strokeWidth={1.8} />
                Pour changer votre email, contactez le support
              </p>
            </div>

            <div>
              <label style={labelSt}>Téléphone</label>
              <input
                style={inputSt}
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="06 12 34 56 78"
                aria-label="Téléphone"
              />
            </div>
            <div>
              <label style={labelSt}>Date de naissance</label>
              <input
                style={inputSt}
                type="date"
                value={form.birthDate}
                onChange={(e) => setForm({ ...form, birthDate: e.target.value })}
                aria-label="Date de naissance"
              />
            </div>
            <div>
              <label style={labelSt}>Sexe</label>
              <select
                style={inputSt}
                value={form.sex}
                onChange={(e) => setForm({ ...form, sex: e.target.value })}
                aria-label="Sexe"
              >
                <option value="">Non précisé</option>
                <option value="MALE">Homme</option>
                <option value="FEMALE">Femme</option>
                <option value="OTHER">Autre</option>
              </select>
            </div>
            <div>
              <label style={labelSt}>Adresse</label>
              <input
                style={inputSt}
                type="text"
                maxLength={255}
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="12 rue de Rivoli"
                aria-label="Adresse"
              />
            </div>
            <div>
              <label style={labelSt}>Code postal</label>
              <input
                style={{
                  ...inputSt,
                  borderColor: postalCodeError
                    ? "var(--nami-danger, #DC2626)"
                    : (inputSt.border as string),
                }}
                type="text"
                inputMode="numeric"
                maxLength={5}
                value={form.postalCode}
                onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                placeholder="75001"
                aria-label="Code postal"
                aria-invalid={postalCodeError ? true : undefined}
              />
              {postalCodeError && (
                <p
                  style={{
                    fontSize: 11,
                    color: "var(--nami-danger, #DC2626)",
                    marginTop: 4,
                  }}
                >
                  {postalCodeError}
                </p>
              )}
            </div>
            <div>
              <label style={labelSt}>Ville</label>
              <input
                style={inputSt}
                type="text"
                maxLength={100}
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="Paris"
                aria-label="Ville"
              />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                onClick={() => patchMutation.mutate()}
                disabled={patchMutation.isPending || !!postalCodeError}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "none",
                  background: "var(--nami-primary)",
                  color: "#fff",
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: "pointer",
                  fontFamily: "inherit",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 6,
                }}
              >
                {patchMutation.isPending ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <Check size={14} />
                )}
                Enregistrer
              </button>
              <button
                onClick={() => setEditing(false)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: `1.5px solid var(--nami-border)`,
                  background: "var(--nami-card)",
                  color: "var(--nami-text-muted)",
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  fontFamily: "inherit",
                }}
              >
                Annuler
              </button>
            </div>
          </div>
        )}
      </Section>

      {/* ─── Section 2 — Sécurité (Option A : trigger forgot-password) ─── */}
      <Section title="Sécurité" icon={Shield}>
        <div style={{ fontSize: 14, color: "var(--nami-text-muted)", marginBottom: 12, lineHeight: 1.5 }}>
          Vous recevrez un lien sécurisé par email pour définir un nouveau mot de passe.
        </div>
        <button
          onClick={() => resetPasswordMutation.mutate()}
          disabled={resetPasswordMutation.isPending || !user?.email}
          style={{
            padding: "9px 18px",
            borderRadius: 10,
            border: `1.5px solid var(--nami-primary)`,
            background: "var(--nami-primary-light)",
            color: "var(--nami-primary)",
            fontSize: 13,
            fontWeight: 600,
            cursor: resetPasswordMutation.isPending ? "wait" : "pointer",
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {resetPasswordMutation.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Shield size={14} strokeWidth={2} />
          )}
          Réinitialiser mon mot de passe
        </button>
      </Section>

      {/* ─── Section 3 — Mes profils (D2.B, lecture seule) ──────────────── */}
      {profiles && profiles.length > 1 && (
        <Section title="Mes profils" icon={Users}>
          <p
            style={{
              fontSize: 13,
              color: "var(--nami-text-muted)",
              marginBottom: 12,
              lineHeight: 1.5,
            }}
          >
            Vous pouvez consulter et agir au nom de ces personnes. Pour basculer
            entre les profils, utilisez le sélecteur en haut de page.
          </p>
          <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
            {[...profiles]
              .sort((a, b) => (a.isSelf === b.isSelf ? 0 : a.isSelf ? -1 : 1))
              .map((p) => (
                <li
                  key={p.personId}
                  style={{
                    padding: "10px 0",
                    borderBottom: `1px solid var(--nami-border)`,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
                    <span
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "var(--nami-dark)",
                      }}
                    >
                      {p.firstName} {p.lastName}
                    </span>
                    {p.isSelf ? (
                      <span
                        style={{
                          fontSize: 11,
                          fontWeight: 700,
                          color: "var(--nami-primary)",
                          background: "var(--nami-primary-light)",
                          padding: "2px 8px",
                          borderRadius: 6,
                          textTransform: "uppercase",
                          letterSpacing: "0.4px",
                        }}
                      >
                        Vous
                      </span>
                    ) : (
                      p.birthDate && (
                        <span style={{ fontSize: 12, color: "var(--nami-text-muted)" }}>
                          {computeAge(p.birthDate)} ans
                        </span>
                      )
                    )}
                  </div>
                  {!p.isSelf && p.delegationScopes && p.delegationScopes.length > 0 && (
                    <div style={{ marginTop: 6, display: "flex", flexWrap: "wrap", gap: 6 }}>
                      {p.delegationScopes.map((s) => (
                        <span
                          key={s}
                          style={{
                            fontSize: 11,
                            color: "var(--nami-text-muted)",
                            background: "var(--nami-bg)",
                            padding: "3px 8px",
                            borderRadius: 6,
                            border: `1px solid var(--nami-border)`,
                          }}
                        >
                          {DELEGATION_SCOPE_LABELS_FR[s] ?? s}
                        </span>
                      ))}
                    </div>
                  )}
                </li>
              ))}
          </ul>
        </Section>
      )}

      {/* ─── Section 4 — Mes consentements (D2.B, matrice F4 G5) ────────── */}
      <Section title="Mes consentements" icon={ShieldCheck}>
        {!canManageConsents && targetProfile && !targetProfile.isSelf ? (
          <p
            style={{
              fontSize: 14,
              color: "var(--nami-text-muted)",
              lineHeight: 1.5,
              padding: "8px 0",
            }}
            role="status"
          >
            Vous n&apos;avez pas les droits pour gérer les consentements de{" "}
            <strong>{targetProfile.firstName}</strong>.
          </p>
        ) : matrixError ? (
          <p
            style={{
              fontSize: 14,
              color: "var(--nami-text-muted)",
              lineHeight: 1.5,
              padding: "8px 0",
            }}
            role="alert"
          >
            Impossible de charger vos consentements pour le moment.
          </p>
        ) : !consentMatrix ? (
          <div style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: 8 }}>
            <Loader2 size={16} className="animate-spin" style={{ color: "var(--nami-primary)" }} />
            <span style={{ fontSize: 13, color: "var(--nami-text-muted)" }}>Chargement…</span>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <p
              style={{
                fontSize: 13,
                color: "var(--nami-text-muted)",
                marginBottom: 8,
                lineHeight: 1.5,
              }}
            >
              Vous pouvez activer ou désactiver chaque consentement à tout moment.
              Les modifications sont enregistrées immédiatement.
            </p>
            {ORDERED_TYPES.map((type) => {
              const v1Scopes = CONSENT_SCOPES_V1[type];
              const isMonoAxis = v1Scopes.length === 0;
              const typeMatrix = consentMatrix[type] ?? {};

              // Liste des scopes à exposer selon la décision #4 :
              //  - mono-axe : uniquement __global__ (le toggle = le type)
              //  - multi-scopes : les scopes V1 + __global__ SI true (legacy)
              const displayedScopes: string[] = isMonoAxis
                ? [GLOBAL_SCOPE_KEY]
                : [
                    ...v1Scopes,
                    ...(typeMatrix[GLOBAL_SCOPE_KEY] ? [GLOBAL_SCOPE_KEY] : []),
                  ];

              const activeCount = displayedScopes.filter((s) => typeMatrix[s]).length;
              const totalCount = displayedScopes.length;
              const expanded = expandedTypes[type] ?? false;

              return (
                <div
                  key={type}
                  style={{
                    border: `1px solid var(--nami-border)`,
                    borderRadius: 12,
                    background: "var(--nami-bg)",
                    overflow: "hidden",
                  }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedTypes((prev) => ({ ...prev, [type]: !expanded }))
                    }
                    aria-expanded={expanded}
                    aria-controls={`consent-section-${type}`}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 14px",
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      fontFamily: "inherit",
                      textAlign: "left",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 600, color: "var(--nami-dark)" }}>
                        {CONSENT_TYPE_LABELS_FR[type]}
                      </span>
                      <span style={{ fontSize: 12, color: "var(--nami-text-muted)" }}>
                        {activeCount}/{totalCount} actif{activeCount > 1 ? "s" : ""}
                      </span>
                    </div>
                    <ChevronDown
                      size={18}
                      color={"var(--nami-text-muted)"}
                      strokeWidth={1.8}
                      style={{
                        transition: "transform 0.2s ease",
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                      }}
                    />
                  </button>
                  {expanded && (
                    <div
                      id={`consent-section-${type}`}
                      style={{
                        padding: "4px 14px 14px",
                        display: "flex",
                        flexDirection: "column",
                        gap: 10,
                        borderTop: `1px solid var(--nami-border)`,
                        background: "var(--nami-card)",
                      }}
                    >
                      {displayedScopes.map((scope) => {
                        const checked = !!typeMatrix[scope];
                        const label = CONSENT_SCOPE_LABELS_FR[scope] ?? scope;
                        return (
                          <div
                            key={scope}
                            style={{
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "space-between",
                              gap: 12,
                              paddingTop: 8,
                            }}
                          >
                            <span style={{ fontSize: 13, color: "var(--nami-dark)", flex: 1 }}>
                              {label}
                            </span>
                            <Toggle
                              checked={checked}
                              onChange={(next) =>
                                toggleConsentMutation.mutate({
                                  consentType: type,
                                  scope,
                                  granted: next,
                                })
                              }
                              disabled={toggleConsentMutation.isPending}
                              label={`${CONSENT_TYPE_LABELS_FR[type]} — ${label}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </Section>

      {/* ─── Section 5 — Mes données (D2.C, RGPD Art. 15/20) ─────────────── */}
      <Section title="Mes données" icon={Download}>
        <p
          style={{
            fontSize: 14,
            color: "var(--nami-text-muted)",
            marginBottom: 12,
            lineHeight: 1.5,
          }}
        >
          Téléchargez l&apos;ensemble de vos données personnelles au format JSON.
          Conforme au droit à la portabilité (RGPD Art. 15 et 20).
        </p>
        <button
          type="button"
          onClick={() => exportMutation.mutate()}
          disabled={exportMutation.isPending}
          style={{
            padding: "9px 18px",
            borderRadius: 10,
            border: `1.5px solid var(--nami-primary)`,
            background: "var(--nami-primary-light)",
            color: "var(--nami-primary)",
            fontSize: 13,
            fontWeight: 600,
            cursor: exportMutation.isPending ? "wait" : "pointer",
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          {exportMutation.isPending ? (
            <Loader2 size={14} className="animate-spin" />
          ) : (
            <Download size={14} strokeWidth={2} />
          )}
          Télécharger mes données
        </button>
      </Section>

      {/* ─── Section 6 — Supprimer mon compte (D2.C, RGPD Art. 17) ──────── */}
      <Section title="Supprimer mon compte" icon={Trash2}>
        <p
          style={{
            fontSize: 14,
            color: "var(--nami-text-muted)",
            marginBottom: 12,
            lineHeight: 1.5,
          }}
        >
          La suppression de votre compte est <strong>définitive</strong>. Vos données
          seront anonymisées conformément au RGPD (Art. 17 — droit à
          l&apos;effacement). Cette action est irréversible.
        </p>
        <button
          type="button"
          onClick={() => setDeleteModalOpen(true)}
          style={{
            padding: "9px 18px",
            borderRadius: 10,
            border: "1.5px solid #DC2626",
            background: "rgba(220,38,38,0.06)",
            color: "#DC2626",
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: "inherit",
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Trash2 size={14} strokeWidth={2} />
          Supprimer mon compte
        </button>
      </Section>

      {/* Modal de suppression (Art. 17, ouvert depuis Section 6) */}
      {user?.id && (
        <DeleteAccountModal
          open={deleteModalOpen}
          onOpenChange={setDeleteModalOpen}
          personId={user.id}
          activeCareCases={activeCareCasesForGuard}
        />
      )}

      {/* ─── Déconnexion ─────────────────────────────────────────────────── */}
      <button
        onClick={() => {
          logout();
          window.location.href = "/login";
        }}
        style={{
          width: "100%",
          padding: "12px 0",
          borderRadius: 12,
          border: `1.5px solid var(--nami-border)`,
          background: "var(--nami-card)",
          color: "var(--nami-text-muted)",
          fontSize: 14,
          fontWeight: 500,
          cursor: "pointer",
          fontFamily: "inherit",
          marginBottom: 12,
        }}
      >
        Se déconnecter
      </button>
    </div>
  );
}
