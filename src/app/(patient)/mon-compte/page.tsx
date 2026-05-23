"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { apiWithToken, authApi, type PatientMe } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { User, Shield, Loader2, Check, Mail } from "lucide-react";
import { toast } from "sonner";

// ─── Tokens Tahoe × Nami ────────────────────────────────────────────────────
const C = {
  primary: "#5B4EC4",
  primaryLight: "rgba(91,78,196,0.08)",
  text: "#1A1A2E",
  textSoft: "#6B7280",
  border: "rgba(26,26,46,0.08)",
  card: "#FFFFFF",
  bg: "#FAFAF8",
};

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
        background: C.card,
        borderRadius: 16,
        border: `1px solid ${C.border}`,
        overflow: "hidden",
        marginBottom: 16,
      }}
    >
      <div
        style={{
          padding: "14px 20px",
          borderBottom: `1px solid ${C.border}`,
          display: "flex",
          alignItems: "center",
          gap: 8,
        }}
      >
        <Icon size={16} strokeWidth={2} color={C.primary} />
        <span style={{ fontSize: 14, fontWeight: 700, color: C.text }}>{title}</span>
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
        borderBottom: `1px solid ${C.border}`,
      }}
    >
      <span style={{ fontSize: 13, color: C.textSoft }}>{label}</span>
      <span style={{ fontSize: 14, color: C.text, fontWeight: 500 }}>{value || "—"}</span>
    </div>
  );
}

const inputSt: React.CSSProperties = {
  width: "100%",
  padding: "9px 12px",
  border: `1.5px solid ${C.border}`,
  borderRadius: 10,
  fontSize: 14,
  fontFamily: "inherit",
  color: C.text,
  background: C.bg,
  outline: "none",
};
const labelSt: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: C.textSoft,
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
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    birthDate: "",
    sex: "",
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
    });
    setEditing(true);
  }

  // Single mutation : passe par api.persons.patch (Art. 16 unifié pour tous
  // les champs editables — firstName/lastName/phone/birthDate/sex).
  // Email volontairement EXCLU (read-only V1 — cf. ticket dérivé D2.2).
  const patchMutation = useMutation({
    mutationFn: () => {
      if (!user?.id) throw new Error("User ID manquant");
      const sexEnum = normalizeSexForBackend(form.sex);
      // birthDate en input HTML "yyyy-MM-dd" → conversion ISO datetime
      const birthDateISO = form.birthDate
        ? new Date(form.birthDate + "T00:00:00Z").toISOString()
        : undefined;
      return api.persons.patch(user.id, {
        firstName: form.firstName || undefined,
        lastName: form.lastName || undefined,
        phone: form.phone || undefined,
        birthDate: birthDateISO,
        sex: sexEnum,
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["patient-me"] });
      setEditing(false);
      toast.success("Informations mises à jour");
    },
    onError: () => toast.error("Erreur lors de la mise à jour"),
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
        <Loader2 size={24} className="animate-spin" style={{ color: C.primary }} />
      </div>
    );
  }

  return (
    <div
      style={{
        padding: "28px 24px 80px",
        maxWidth: 540,
        margin: "0 auto",
        background: C.bg,
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
            background: C.primaryLight,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{ fontSize: 22, fontWeight: 700, color: C.primary }}>
            {user?.firstName?.[0]}
            {user?.lastName?.[0]}
          </span>
        </div>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: C.text }}>
            {user?.firstName} {user?.lastName}
          </div>
          <div style={{ fontSize: 13, color: C.textSoft }}>{user?.email}</div>
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
            <button
              onClick={startEdit}
              style={{
                marginTop: 14,
                padding: "9px 18px",
                borderRadius: 10,
                border: `1.5px solid ${C.primary}`,
                background: C.primaryLight,
                color: C.primary,
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
                  color: C.textSoft,
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
                  color: C.textSoft,
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
            <div style={{ display: "flex", gap: 10, marginTop: 4 }}>
              <button
                onClick={() => patchMutation.mutate()}
                disabled={patchMutation.isPending}
                style={{
                  flex: 1,
                  padding: "10px 0",
                  borderRadius: 10,
                  border: "none",
                  background: C.primary,
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
                  border: `1.5px solid ${C.border}`,
                  background: C.card,
                  color: C.textSoft,
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
        <div style={{ fontSize: 14, color: C.textSoft, marginBottom: 12, lineHeight: 1.5 }}>
          Vous recevrez un lien sécurisé par email pour définir un nouveau mot de passe.
        </div>
        <button
          onClick={() => resetPasswordMutation.mutate()}
          disabled={resetPasswordMutation.isPending || !user?.email}
          style={{
            padding: "9px 18px",
            borderRadius: 10,
            border: `1.5px solid ${C.primary}`,
            background: C.primaryLight,
            color: C.primary,
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
          border: `1.5px solid ${C.border}`,
          background: C.card,
          color: C.textSoft,
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
