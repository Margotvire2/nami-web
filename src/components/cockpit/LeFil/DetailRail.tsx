"use client";
import type { DashboardConsultation } from "@/hooks/useDashboard";

export function DetailRail({
  consultation,
  onStart,
  onOpenDossier,
}: {
  consultation: DashboardConsultation | null;
  onStart: () => void;
  onOpenDossier: () => void;
}) {
  return (
    <aside
      style={{
        width: 320,
        flexShrink: 0,
        borderLeft: "1px solid var(--line)",
        background: "linear-gradient(200deg, var(--surface-2), var(--paper))",
        overflowY: "auto",
        padding: "22px 20px 40px",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Eyebrow */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          fontSize: "10.5px",
          fontWeight: 700,
          letterSpacing: ".09em",
          textTransform: "uppercase",
          color: "var(--ink-faint)",
          marginBottom: 14,
        }}
      >
        <span style={{ width: 5, height: 5, borderRadius: "50%", background: "var(--teal)", flexShrink: 0 }} />
        Détail · suit votre fil
      </div>

      {!consultation ? (
        <div className="empty" style={{ flex: 1 }}>
          <h4>Aucune consultation</h4>
          <p>Votre fil du jour est libre.</p>
        </div>
      ) : (
        <>
          {/* Patient head */}
          <div style={{ display: "flex", gap: 13, alignItems: "center" }}>
            <div
              style={{
                width: 54,
                height: 54,
                borderRadius: 16,
                flexShrink: 0,
                background: "radial-gradient(circle at 34% 28%, var(--paper-2), var(--line-2))",
                boxShadow: "var(--sh-1), inset 0 0 0 1.5px rgba(255,255,255,.5)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "var(--font-sans)",
                fontWeight: 800,
                fontSize: 18,
                color: "var(--ink-2)",
              }}
            >
              {consultation.initials}
            </div>
            <div>
              <h2
                style={{
                  fontFamily: "var(--font-sans)",
                  fontSize: 18,
                  fontWeight: 800,
                  letterSpacing: "-.02em",
                  margin: "0 0 3px",
                }}
              >
                {consultation.patient}
              </h2>
              <div style={{ fontSize: "12.5px", color: "var(--ink-2)", fontFamily: "var(--font-mono)" }}>
                {consultation.detail.age > 0 ? `${consultation.detail.age} ans · ` : ""}
                {consultation.typeLabel}
              </div>
            </div>
          </div>

          {/* Chips */}
          <div style={{ display: "flex", gap: 7, flexWrap: "wrap", margin: "14px 0 4px" }}>
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 100,
                background: "var(--teal-tint)",
                border: "1px solid var(--teal)",
                color: "var(--teal-deep)",
              }}
            >
              {consultation.type === "premiere" ? "Premier contact" : "Suivi en cours"}
            </span>
            <span
              style={{
                fontSize: "11.5px",
                fontWeight: 600,
                padding: "4px 10px",
                borderRadius: 100,
                background: "var(--surface)",
                border: "1px solid var(--line)",
                color: "var(--ink-2)",
              }}
            >
              RDV {consultation.time}
            </span>
          </div>

          {/* Next RDV card */}
          <div className="railcard" style={{ marginTop: 18 }}>
            <div className="rc-h">
              <span className="t">Prochain rendez-vous</span>
            </div>
            <b style={{ fontSize: 14, display: "block" }}>Aujourd&apos;hui · {consultation.time}</b>
            <p className="hint">{consultation.mode} · {consultation.duration}</p>
          </div>

          {/* Actions */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginTop: 18 }}>
            <button
              className="btn btn-primary"
              style={{ justifyContent: "center", width: "100%", padding: 11 }}
              onClick={onStart}
            >
              <svg viewBox="0 0 24 24" style={{ width: 14, height: 14 }} fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="9" />
                <path d="M10 9l5 3-5 3z" fill="currentColor" stroke="none" />
              </svg>
              Démarrer la consultation
            </button>
            {consultation.careCaseId && (
              <button
                className="btn btn-ghost"
                style={{ justifyContent: "center", width: "100%", padding: 11 }}
                onClick={onOpenDossier}
              >
                Ouvrir le dossier complet
              </button>
            )}
          </div>
        </>
      )}

      {/* Legal footer — always present */}
      <div
        className="legal"
        style={{ marginTop: "auto", paddingTop: 22, borderTop: "1px solid var(--line)", textAlign: "center" }}
      >
        Outil de coordination · Non dispositif médical
        <br />
        Conforme RGPD
      </div>
    </aside>
  );
}
