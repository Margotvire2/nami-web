"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@/lib/store";
import { CheckCircle2, XCircle, Mail, Clock, ShieldCheck, Users, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

interface PendingProvider {
  personId: string;
  providerId: string;
  firstName: string;
  lastName: string;
  email: string;
  rppsNumber: string | null;
  profession: string;
  registeredAt: string;
}

interface ValidatedProvider extends PendingProvider {
  validatedStatus: boolean;
}

type TabType = "pending" | "validated";

// ─── Avatar ──────────────────────────────────────────────────────────────────
function Avatar({ first, last }: { first: string; last: string }) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 12,
        background: "linear-gradient(135deg, #5B4EC4, #2BA89C)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#fff",
        fontSize: 13,
        fontWeight: 700,
        flexShrink: 0,
      }}
    >
      {first[0]}{last[0]}
    </div>
  );
}

// ─── RPPS status badge ────────────────────────────────────────────────────────
function RppsStatus({ rppsNumber }: { rppsNumber: string | null }) {
  if (!rppsNumber) {
    return (
      <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#D94F4F" }}>
        <XCircle size={11} /> Non renseigné
      </span>
    );
  }
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#E6993E" }}>
      <AlertTriangle size={11} /> RPPS {rppsNumber} — vérification manuelle
    </span>
  );
}

// ─── Confirm modal ────────────────────────────────────────────────────────────
function ConfirmModal({
  provider,
  action,
  onConfirm,
  onCancel,
}: {
  provider: PendingProvider;
  action: "VALIDATE" | "REJECT";
  onConfirm: (reason?: string) => void;
  onCancel: () => void;
}) {
  const [reason, setReason] = useState("");

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(26,26,46,0.4)",
        backdropFilter: "blur(4px)",
        zIndex: 1000,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
      onClick={onCancel}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: 20,
          padding: 28,
          width: "100%",
          maxWidth: 420,
          boxShadow: "0 20px 60px rgba(26,26,46,0.15)",
          animation: "modal-in 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <style>{`@keyframes modal-in { from { opacity:0; transform: scale(0.94) translateY(8px); } to { opacity:1; transform: scale(1) translateY(0); } }`}</style>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: action === "VALIDATE" ? "rgba(43,168,74,0.1)" : "rgba(217,79,79,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 16,
          }}
        >
          {action === "VALIDATE" ? (
            <CheckCircle2 size={22} style={{ color: "#2BA84A" }} />
          ) : (
            <XCircle size={22} style={{ color: "#D94F4F" }} />
          )}
        </div>

        <h2 style={{ fontSize: 16, fontWeight: 700, color: "#1A1A2E", marginBottom: 8 }}>
          {action === "VALIDATE" ? "Valider ce compte ?" : "Refuser ce compte ?"}
        </h2>
        <p style={{ fontSize: 13, color: "#374151", lineHeight: 1.6, marginBottom: 16 }}>
          {action === "VALIDATE" ? (
            <>
              <strong>{provider.firstName} {provider.lastName}</strong> recevra un email de confirmation et
              pourra accéder à l&apos;ensemble des fonctionnalités Nami.
            </>
          ) : (
            <>
              Le compte de <strong>{provider.firstName} {provider.lastName}</strong> sera refusé.
            </>
          )}
        </p>

        {action === "REJECT" && (
          <div style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: "#6B7280", display: "block", marginBottom: 6 }}>
              Motif (optionnel)
            </label>
            <input
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Ex : RPPS non trouvé dans l'annuaire…"
              style={{
                width: "100%",
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid rgba(26,26,46,0.12)",
                fontSize: 13,
                color: "#1A1A2E",
                outline: "none",
                background: "#F5F3EF",
                boxSizing: "border-box",
              }}
            />
          </div>
        )}

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end" }}>
          <button
            onClick={onCancel}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              border: "1px solid rgba(26,26,46,0.1)",
              fontSize: 13,
              fontWeight: 500,
              cursor: "pointer",
              background: "transparent",
              color: "#6B7280",
            }}
          >
            Annuler
          </button>
          <button
            onClick={() => onConfirm(reason || undefined)}
            style={{
              padding: "9px 18px",
              borderRadius: 10,
              border: "none",
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              background: action === "VALIDATE" ? "#2BA84A" : "#D94F4F",
              color: "#fff",
              transition: "opacity 0.2s",
            }}
          >
            {action === "VALIDATE" ? "Confirmer ✓" : "Refuser"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────
export default function AdminValidationsPage() {
  const { accessToken } = useAuthStore();
  const [tab, setTab] = useState<TabType>("pending");
  const [pending, setPending] = useState<PendingProvider[]>([]);
  const [validated, setValidated] = useState<ValidatedProvider[]>([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState<{ provider: PendingProvider; action: "VALIDATE" | "REJECT" } | null>(null);
  const [processing, setProcessing] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!accessToken) return;
    setLoading(true);
    try {
      const [pRes, vRes] = await Promise.all([
        fetch(`${API_URL}/admin/pending-validations`, { headers: { Authorization: `Bearer ${accessToken}` } }),
        fetch(`${API_URL}/admin/providers?status=validated&limit=50`, { headers: { Authorization: `Bearer ${accessToken}` } }),
      ]);
      const [pData, vData] = await Promise.all([pRes.json(), vRes.json()]);
      setPending(Array.isArray(pData) ? pData : []);
      setValidated(Array.isArray(vData.providers) ? vData.providers : []);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => { loadData(); }, [loadData]);

  async function handleAction(provider: PendingProvider, action: "VALIDATE" | "REJECT", reason?: string) {
    if (!accessToken) return;
    setProcessing(provider.personId);
    setModal(null);
    try {
      const r = await fetch(`${API_URL}/admin/validate/${provider.personId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${accessToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason }),
      });
      if (!r.ok) throw new Error();
      if (action === "VALIDATE") {
        toast.success(`✓ ${provider.firstName} ${provider.lastName} validé${provider.firstName.endsWith("e") ? "e" : ""}`);
      } else {
        toast.error(`${provider.firstName} ${provider.lastName} — compte refusé`);
      }
      await loadData();
    } catch {
      toast.error("Erreur lors de l'action");
    } finally {
      setProcessing(null);
    }
  }

  function timeAgo(dateStr: string): string {
    const diff = Date.now() - new Date(dateStr).getTime();
    const d = Math.floor(diff / 86400000);
    const h = Math.floor(diff / 3600000);
    if (h < 1) return "À l'instant";
    if (h < 24) return `Il y a ${h}h`;
    if (d === 1) return "Hier";
    return new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  }

  const currentList = tab === "pending" ? pending : validated;

  return (
    <div style={{ maxWidth: 860, fontFamily: "var(--font-jakarta)" }}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <p style={{ fontSize: 14, color: "#6B7280" }}>
          {pending.length > 0
            ? `${pending.length} compte${pending.length > 1 ? "s" : ""} en attente de vérification`
            : "Aucun compte en attente"}
        </p>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 4, marginBottom: 20 }}>
        {([
          { id: "pending" as TabType, label: "En attente", count: pending.length, icon: Clock },
          { id: "validated" as TabType, label: "Validés", count: validated.length, icon: ShieldCheck },
        ] as const).map(({ id, label, count, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 14px",
              borderRadius: 10,
              border: "none",
              cursor: "pointer",
              fontSize: 13,
              fontWeight: tab === id ? 600 : 400,
              background: tab === id ? "rgba(91,78,196,0.08)" : "transparent",
              color: tab === id ? "#5B4EC4" : "#6B7280",
              transition: "all 0.2s",
            }}
          >
            <Icon size={14} strokeWidth={1.75} />
            {label}
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                padding: "1px 7px",
                borderRadius: 8,
                background: tab === id ? (id === "pending" && count > 0 ? "#D94F4F" : "rgba(91,78,196,0.15)") : "rgba(26,26,46,0.06)",
                color: tab === id ? (id === "pending" && count > 0 ? "#fff" : "#5B4EC4") : "#6B7280",
              }}
            >
              {count}
            </span>
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: 60, color: "#6B7280", fontSize: 13 }}>
          Chargement…
        </div>
      ) : currentList.length === 0 ? (
        <div
          className="admin-card-static"
          style={{ textAlign: "center", padding: "48px 24px" }}
        >
          <Users size={32} style={{ color: "#E8ECF4", margin: "0 auto 12px" }} />
          <p style={{ fontSize: 14, fontWeight: 600, color: "#6B7280" }}>
            {tab === "pending" ? "Aucun compte en attente" : "Aucun compte validé"}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {currentList.map((provider, i) => {
            const isProcessing = processing === provider.personId;
            return (
              <div
                key={provider.personId}
                className="admin-card-static admin-stagger"
                style={{
                  padding: "16px 20px",
                  animationDelay: `${i * 60}ms`,
                  opacity: isProcessing ? 0.5 : 1,
                  transition: "opacity 0.3s",
                }}
              >
                <div style={{ display: "flex", alignItems: "flex-start", gap: 14 }}>
                  <Avatar first={provider.firstName} last={provider.lastName} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 15, fontWeight: 600, color: "#1A1A2E" }}>
                        {provider.firstName} {provider.lastName}
                      </span>
                      {tab === "validated" && (
                        <span style={{ fontSize: 11, fontWeight: 600, color: "#2BA84A", background: "rgba(43,168,74,0.1)", padding: "2px 8px", borderRadius: 6 }}>
                          ✓ Validé
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: 12, color: "#6B7280", margin: "2px 0 6px" }}>{provider.email}</p>
                    <p style={{ fontSize: 12, color: "#374151", marginBottom: 4 }}>
                      {provider.profession}
                    </p>
                    <RppsStatus rppsNumber={provider.rppsNumber} />
                  </div>

                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <p style={{ fontSize: 11, color: "#6B7280", marginBottom: 10 }}>
                      {timeAgo(provider.registeredAt)}
                    </p>
                    {tab === "pending" && (
                      <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                        <button
                          className="admin-btn admin-btn-validate"
                          disabled={isProcessing}
                          onClick={() => setModal({ provider, action: "VALIDATE" })}
                        >
                          <CheckCircle2 size={13} /> Valider
                        </button>
                        <button
                          className="admin-btn admin-btn-reject"
                          disabled={isProcessing}
                          onClick={() => setModal({ provider, action: "REJECT" })}
                        >
                          <XCircle size={13} /> Refuser
                        </button>
                        <a
                          href={`mailto:${provider.email}?subject=Votre inscription Nami&body=Bonjour ${provider.firstName},%0A%0ANous avons besoin d'informations complémentaires pour vérifier votre identité professionnelle.%0A%0AL'équipe Nami`}
                          className="admin-btn admin-btn-contact"
                          style={{ textDecoration: "none" }}
                        >
                          <Mail size={13} /> Contacter
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <ConfirmModal
          provider={modal.provider}
          action={modal.action}
          onConfirm={(reason) => handleAction(modal.provider, modal.action, reason)}
          onCancel={() => setModal(null)}
        />
      )}
    </div>
  );
}
