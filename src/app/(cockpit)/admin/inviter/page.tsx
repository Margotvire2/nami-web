"use client";

import { useState, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import {
  Mail, User, Stethoscope, MessageSquare, Send, Copy, Check,
  Clock, CheckCircle2, XCircle, RefreshCw,
} from "lucide-react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

const SPECIALTIES = [
  "Médecin généraliste",
  "Pédiatre",
  "Endocrinologue",
  "Psychiatre",
  "Psychologue",
  "Diététicien(ne)",
  "Infirmier(e)",
  "Kinésithérapeute",
  "Orthophoniste",
  "Neurologue",
  "Cardiologue",
  "Nutritionniste",
  "Médecin du sport",
  "Autre",
];

interface SentInvite {
  id: string;
  token: string;
  email: string;
  firstName: string;
  lastName: string;
  specialty?: string;
  inviteLink: string;
  status: string;
  createdAt: string;
  expiresAt: string;
}

// ─── Field ───────────────────────────────────────────────────────────────────
function Field({
  label, required, children,
}: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 12,
          fontWeight: 600,
          color: "#4A4A5A",
          marginBottom: 6,
          letterSpacing: "0.01em",
        }}
      >
        {label}
        {required && <span style={{ color: "#D94F4F", marginLeft: 3 }}>*</span>}
      </label>
      {children}
    </div>
  );
}

const inputStyle: React.CSSProperties = {
  width: "100%",
  height: 40,
  padding: "0 12px",
  fontSize: 13,
  color: "#1A1A2E",
  background: "#FAFAF8",
  border: "1px solid rgba(26,26,46,0.12)",
  borderRadius: 10,
  outline: "none",
  transition: "border-color 0.2s",
  boxSizing: "border-box",
};

// ─── CopyButton ──────────────────────────────────────────────────────────────
function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  function handleCopy() {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <button
      onClick={handleCopy}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 6,
        padding: "6px 12px",
        fontSize: 12,
        fontWeight: 600,
        color: copied ? "#2BA84A" : "#5B4EC4",
        background: copied ? "rgba(43,168,74,0.08)" : "rgba(91,78,196,0.08)",
        border: "none",
        borderRadius: 8,
        cursor: "pointer",
        transition: "all 0.2s",
        flexShrink: 0,
      }}
    >
      {copied ? <Check size={13} /> : <Copy size={13} />}
      {copied ? "Copié !" : "Copier"}
    </button>
  );
}

// ─── StatusBadge ─────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const cfg: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    PENDING:  { label: "En attente", color: "#E6993E", bg: "rgba(230,153,62,0.10)", icon: <Clock size={10} /> },
    ACCEPTED: { label: "Acceptée",   color: "#2BA84A", bg: "rgba(43,168,74,0.10)",  icon: <CheckCircle2 size={10} /> },
    EXPIRED:  { label: "Expirée",    color: "#8A8A96", bg: "rgba(138,138,150,0.10)",icon: <XCircle size={10} /> },
  };
  const { label, color, bg, icon } = cfg[status] ?? cfg.PENDING;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
        padding: "2px 8px",
        fontSize: 11,
        fontWeight: 600,
        color,
        background: bg,
        borderRadius: 6,
      }}
    >
      {icon} {label}
    </span>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InviterPage() {
  const { accessToken } = useAuthStore();

  // Form state
  const [email, setEmail]     = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName]   = useState("");
  const [specialty, setSpecialty] = useState("");
  const [message, setMessage]     = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Result state
  const [result, setResult] = useState<{ inviteLink: string; email: string } | null>(null);
  const [error, setError]   = useState<string | null>(null);

  // History
  const [invites, setInvites]   = useState<SentInvite[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);

  function loadHistory() {
    if (!accessToken) return;
    setLoadingHistory(true);
    fetch(`${API_URL}/admin/invitations`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
      .then((r) => r.ok ? r.json() : [])
      .then((data: SentInvite[]) => setInvites(data))
      .catch(() => setInvites([]))
      .finally(() => setLoadingHistory(false));
  }

  useEffect(() => { loadHistory(); }, [accessToken]); // eslint-disable-line react-hooks/exhaustive-deps

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || !firstName.trim() || !lastName.trim()) return;
    setSubmitting(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`${API_URL}/admin/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          email:           email.trim(),
          firstName:       firstName.trim(),
          lastName:        lastName.trim(),
          specialty:       specialty || undefined,
          personalMessage: message.trim() || undefined,
        }),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({})) as { error?: string };
        throw new Error(body.error ?? `Erreur ${res.status}`);
      }
      const data = await res.json() as { inviteLink: string; email: string };
      setResult(data);
      // Reset form
      setEmail(""); setFirstName(""); setLastName(""); setSpecialty(""); setMessage("");
      // Refresh history
      loadHistory();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Erreur inconnue";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  function timeAgo(dateStr: string) {
    const diff = Date.now() - new Date(dateStr).getTime();
    const h = Math.floor(diff / 3600000);
    const d = Math.floor(diff / 86400000);
    if (h < 1) return "À l'instant";
    if (h < 24) return `Il y a ${h}h`;
    if (d === 1) return "Hier";
    return `Il y a ${d}j`;
  }

  return (
    <div style={{ maxWidth: 900 }}>
      <div style={{ display: "grid", gridTemplateColumns: "480px 1fr", gap: 20, alignItems: "start" }}>

        {/* ── Formulaire ── */}
        <div
          className="admin-card-static"
          style={{ padding: 28 }}
        >
          <div style={{ marginBottom: 22 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E", letterSpacing: "-0.01em" }}>
              Inviter un soignant
            </h2>
            <p style={{ fontSize: 12, color: "#8A8A96", marginTop: 4, lineHeight: 1.5 }}>
              L&apos;invitation envoie un lien d&apos;accès direct. Le soignant crée son compte en 2 min et arrive dans le cockpit avec le dossier de démonstration.
            </p>
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Prénom + Nom */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Field label="Prénom" required>
                <div style={{ position: "relative" }}>
                  <User
                    size={14}
                    style={{
                      position: "absolute",
                      left: 10,
                      top: "50%",
                      transform: "translateY(-50%)",
                      color: "#8A8A96",
                      pointerEvents: "none",
                    }}
                  />
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Éric"
                    required
                    style={{ ...inputStyle, paddingLeft: 30 }}
                    onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#5B4EC4"; }}
                    onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(26,26,46,0.12)"; }}
                  />
                </div>
              </Field>
              <Field label="Nom" required>
                <input
                  type="text"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Hanachi"
                  required
                  style={inputStyle}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#5B4EC4"; }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(26,26,46,0.12)"; }}
                />
              </Field>
            </div>

            {/* Email */}
            <Field label="Email professionnel" required>
              <div style={{ position: "relative" }}>
                <Mail
                  size={14}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#8A8A96",
                    pointerEvents: "none",
                  }}
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="eric.hanachi@hopital.fr"
                  required
                  style={{ ...inputStyle, paddingLeft: 30 }}
                  onFocus={(e) => { (e.target as HTMLInputElement).style.borderColor = "#5B4EC4"; }}
                  onBlur={(e) => { (e.target as HTMLInputElement).style.borderColor = "rgba(26,26,46,0.12)"; }}
                />
              </div>
            </Field>

            {/* Spécialité */}
            <Field label="Spécialité">
              <div style={{ position: "relative" }}>
                <Stethoscope
                  size={14}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: "50%",
                    transform: "translateY(-50%)",
                    color: "#8A8A96",
                    pointerEvents: "none",
                  }}
                />
                <select
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  style={{
                    ...inputStyle,
                    paddingLeft: 30,
                    appearance: "none",
                    cursor: "pointer",
                  }}
                  onFocus={(e) => { (e.target as HTMLSelectElement).style.borderColor = "#5B4EC4"; }}
                  onBlur={(e) => { (e.target as HTMLSelectElement).style.borderColor = "rgba(26,26,46,0.12)"; }}
                >
                  <option value="">Sélectionner…</option>
                  {SPECIALTIES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </Field>

            {/* Message personnalisé */}
            <Field label="Message personnel (facultatif)">
              <div style={{ position: "relative" }}>
                <MessageSquare
                  size={14}
                  style={{
                    position: "absolute",
                    left: 10,
                    top: 11,
                    color: "#8A8A96",
                    pointerEvents: "none",
                  }}
                />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Suite à notre échange, voici votre accès à Nami…"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px 10px 30px",
                    fontSize: 13,
                    color: "#1A1A2E",
                    background: "#FAFAF8",
                    border: "1px solid rgba(26,26,46,0.12)",
                    borderRadius: 10,
                    outline: "none",
                    resize: "vertical",
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                    transition: "border-color 0.2s",
                  }}
                  onFocus={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "#5B4EC4"; }}
                  onBlur={(e) => { (e.target as HTMLTextAreaElement).style.borderColor = "rgba(26,26,46,0.12)"; }}
                />
              </div>
            </Field>

            {/* Erreur */}
            {error && (
              <div
                style={{
                  padding: "10px 14px",
                  background: "rgba(217,79,79,0.06)",
                  border: "1px solid rgba(217,79,79,0.18)",
                  borderRadius: 10,
                  fontSize: 13,
                  color: "#D94F4F",
                }}
              >
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !email.trim() || !firstName.trim() || !lastName.trim()}
              style={{
                width: "100%",
                height: 44,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                color: "#fff",
                background: submitting ? "rgba(91,78,196,0.5)" : "#5B4EC4",
                border: "none",
                borderRadius: 12,
                cursor: submitting ? "not-allowed" : "pointer",
                boxShadow: submitting ? "none" : "0 2px 12px rgba(91,78,196,0.30)",
                transition: "all 0.2s",
              }}
              onMouseEnter={(e) => {
                if (!submitting) {
                  (e.currentTarget as HTMLButtonElement).style.transform = "translateY(-1px)";
                  (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 20px rgba(91,78,196,0.40)";
                }
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.transform = "translateY(0)";
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 2px 12px rgba(91,78,196,0.30)";
              }}
            >
              {submitting ? (
                <>
                  <div
                    style={{
                      width: 14,
                      height: 14,
                      border: "2px solid rgba(255,255,255,0.4)",
                      borderTopColor: "#fff",
                      borderRadius: "50%",
                      animation: "spin 0.7s linear infinite",
                    }}
                  />
                  Envoi en cours…
                </>
              ) : (
                <>
                  <Send size={14} />
                  Envoyer l&apos;invitation
                </>
              )}
            </button>
          </form>

          {/* ── Résultat ── */}
          {result && (
            <div
              style={{
                marginTop: 20,
                padding: 16,
                background: "rgba(43,168,74,0.06)",
                border: "1px solid rgba(43,168,74,0.20)",
                borderRadius: 12,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <CheckCircle2 size={16} style={{ color: "#2BA84A", flexShrink: 0 }} />
                <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E" }}>
                  Invitation envoyée à <span style={{ color: "#2BA84A" }}>{result.email}</span>
                </p>
              </div>
              <p style={{ fontSize: 11, color: "#8A8A96", marginBottom: 10 }}>
                Un email a été envoyé. Vous pouvez aussi partager le lien directement par WhatsApp ou SMS.
              </p>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "8px 12px",
                  background: "#FAFAF8",
                  border: "1px solid rgba(26,26,46,0.08)",
                  borderRadius: 8,
                }}
              >
                <span
                  style={{
                    flex: 1,
                    fontSize: 11,
                    color: "#5B4EC4",
                    wordBreak: "break-all",
                    fontFamily: "monospace",
                  }}
                >
                  {result.inviteLink}
                </span>
                <CopyButton text={result.inviteLink} />
              </div>
            </div>
          )}

          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>

        {/* ── Historique ── */}
        <div className="admin-card-static" style={{ padding: 24 }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              marginBottom: 16,
            }}
          >
            <h3 style={{ fontSize: 14, fontWeight: 600, color: "#1A1A2E" }}>
              Invitations envoyées
            </h3>
            <button
              onClick={loadHistory}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                fontSize: 11,
                color: "#8A8A96",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 4,
              }}
            >
              <RefreshCw size={12} />
              Rafraîchir
            </button>
          </div>

          {loadingHistory ? (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 80 }}>
              <div
                style={{
                  width: 20,
                  height: 20,
                  border: "2px solid #5B4EC4",
                  borderTopColor: "transparent",
                  borderRadius: "50%",
                  animation: "spin 0.8s linear infinite",
                }}
              />
            </div>
          ) : invites.length === 0 ? (
            <div
              style={{
                padding: "32px 0",
                textAlign: "center",
                color: "#8A8A96",
                fontSize: 13,
              }}
            >
              <Mail size={28} style={{ margin: "0 auto 10px", opacity: 0.3 }} />
              <p>Aucune invitation envoyée</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {invites.map((inv) => (
                <div
                  key={inv.id}
                  style={{
                    padding: "12px 14px",
                    background: "#FAFAF8",
                    border: "1px solid rgba(26,26,46,0.06)",
                    borderRadius: 10,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      justifyContent: "space-between",
                      gap: 8,
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <p style={{ fontSize: 13, fontWeight: 600, color: "#1A1A2E", marginBottom: 1 }}>
                        {inv.firstName} {inv.lastName}
                      </p>
                      <p style={{ fontSize: 11, color: "#8A8A96", marginBottom: 4 }}>
                        {inv.email}
                        {inv.specialty && (
                          <span style={{ marginLeft: 6, color: "#5B4EC4" }}>· {inv.specialty}</span>
                        )}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <StatusBadge status={inv.status} />
                        <span style={{ fontSize: 10, color: "#8A8A96" }}>{timeAgo(inv.createdAt)}</span>
                      </div>
                    </div>
                    {inv.status === "PENDING" && (
                      <CopyButton text={inv.inviteLink} />
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
