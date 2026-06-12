import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Cockpit soignant — Nami",
  description: "Accédez à votre espace soignant Nami : dossiers de coordination, messages, agenda, intelligence clinique.",
  robots: { index: false, follow: false },
}

const FEATURES = [
  { icon: "🎙️", label: "Dictée → brouillon structuré" },
  { icon: "👁️", label: "Visibilité équipe temps réel" },
  { icon: "📋", label: "Dossier de coordination partagé" },
  { icon: "📖", label: "60 000 sources cliniques" },
  { icon: "💊", label: "OCR ordonnances — 15M références" },
  { icon: "📱", label: "App patient connectée" },
]

export default function AppLandingPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        background: "#FAFAF8",
        fontFamily: "var(--font-jakarta), system-ui, sans-serif",
        padding: "40px 24px",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap');
        .app-btn-primary {
          display:inline-flex;align-items:center;gap:8px;
          background:#1A1A2E;color:#fff;font-size:15px;font-weight:700;
          padding:14px 32px;border-radius:100px;text-decoration:none;
          box-shadow:0 4px 16px rgba(26,26,46,0.22);
          transition:transform .2s cubic-bezier(0.16,1,0.3,1),box-shadow .2s;
          font-family:var(--font-jakarta),system-ui,sans-serif;
        }
        .app-btn-primary:hover{transform:translateY(-2px);box-shadow:0 10px 28px rgba(91,78,196,0.32)}
        .app-btn-secondary {
          display:inline-flex;align-items:center;
          border:1.5px solid rgba(26,26,46,0.15);color:#374151;font-size:15px;font-weight:500;
          padding:14px 28px;border-radius:100px;text-decoration:none;background:transparent;
          transition:all .2s;
          font-family:var(--font-jakarta),system-ui,sans-serif;
        }
        .app-btn-secondary:hover{border-color:rgba(91,78,196,0.4);color:#5B4EC4}
        .feature-chip {
          display:inline-flex;align-items:center;gap:8px;
          padding:8px 14px;border-radius:10px;
          background:#fff;border:1px solid rgba(26,26,46,0.07);
          font-size:13px;font-weight:500;color:#374151;
          box-shadow:0 1px 4px rgba(26,26,46,0.05);
        }
      `}</style>

      {/* Logo */}
      <div style={{ marginBottom: 48, display: "flex", alignItems: "center", gap: 10 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            background: "linear-gradient(135deg,#5B4EC4,#2BA89C)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#fff",
            fontWeight: 900,
            fontSize: 18,
          }}
        >
          N
        </div>
        <span style={{ fontSize: 20, fontWeight: 800, color: "#1A1A2E", letterSpacing: "-0.02em" }}>
          Nami <span style={{ fontWeight: 500, color: "#6B7280", fontSize: 14 }}>— Cockpit soignant</span>
        </span>
      </div>

      {/* Main card */}
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
        }}
      >
        <div
          style={{
            display: "inline-block",
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "#5B4EC4",
            marginBottom: 20,
            padding: "5px 14px",
            border: "1px solid rgba(91,78,196,0.2)",
            borderRadius: 100,
            background: "rgba(91,78,196,0.05)",
          }}
        >
          Espace professionnel de santé
        </div>

        <h1
          style={{
            fontSize: "clamp(1.8rem,5vw,2.6rem)",
            fontWeight: 800,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: "#1A1A2E",
            marginBottom: 16,
          }}
        >
          Votre cockpit
          <br />
          <span
            style={{
              background: "linear-gradient(135deg,#5B4EC4,#2BA89C)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            de coordination.
          </span>
        </h1>

        <p
          style={{
            fontSize: "1rem",
            color: "#6B7280",
            lineHeight: 1.65,
            marginBottom: 36,
            maxWidth: 400,
            margin: "0 auto 36px",
          }}
        >
          Dossiers partagés, dictée IA, sources cliniques, app patient.
          <br />
          Conçu par une soignante, pour les soignants.
        </p>

        {/* CTAs */}
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap", marginBottom: 48 }}>
          <Link href="/login" className="app-btn-primary">
            Se connecter
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7" /></svg>
          </Link>
          <Link href="/signup" className="app-btn-secondary">
            Créer un compte
          </Link>
        </div>

        {/* Feature chips */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, justifyContent: "center", marginBottom: 48 }}>
          {FEATURES.map(({ icon, label }) => (
            <span key={label} className="feature-chip">
              {icon} {label}
            </span>
          ))}
        </div>

        {/* Divider */}
        <div style={{ borderTop: "1px solid rgba(26,26,46,0.07)", paddingTop: 24 }}>
          <p style={{ fontSize: 13, color: "#9CA3AF" }}>
            Vous êtes patient ou proche ?{" "}
            <a
              href="https://namipourlavie.com/pour-les-patients"
              style={{ color: "#5B4EC4", fontWeight: 600, textDecoration: "none" }}
            >
              Espace patient →
            </a>
          </p>
          <p style={{ fontSize: 12, color: "#D1D5DB", marginTop: 8 }}>
            Nami n&apos;est pas un dispositif médical · Conforme RGPD
          </p>
        </div>
      </div>

      {/* Back link */}
      <div style={{ marginTop: 40 }}>
        <a
          href="https://namipourlavie.com"
          style={{ fontSize: 13, color: "#9CA3AF", textDecoration: "none" }}
        >
          ← namipourlavie.com
        </a>
      </div>
    </div>
  )
}
