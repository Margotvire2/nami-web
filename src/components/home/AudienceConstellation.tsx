"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"

const ROLES = [
  {
    id: "soignant",
    badge: "Soignants",
    headline: "Coordonnez sans friction.",
    sub: "Dossier partagé, dictée IA sourcée HAS, adressage sécurisé entre confrères.",
    bullets: ["Dossier de coordination partagé", "Dictée IA · 22 308 sources HAS", "Réseau soignants local"],
    cta: { label: "Essayer gratuitement", href: "/pour-les-soignants" },
    ctaSec: { label: "Voir comment ça marche", href: "/pour-les-soignants#comment-ca-marche" },
    colorA: "#5B4EC4",
    colorB: "#7A6BD6",
    glow: "rgba(91,78,196,0.14)",
  },
  {
    id: "patient",
    badge: "Patients",
    headline: "Voyez clair dans votre parcours.",
    sub: "Votre équipe de soins réunie, vos rendez-vous, vos documents — au même endroit.",
    bullets: ["Équipe soignante réunie", "Prise de RDV en ligne", "Messagerie sécurisée"],
    cta: { label: "Trouver un soignant", href: "/trouver-un-soignant" },
    ctaSec: { label: "Créer mon espace", href: "/signup?role=patient" },
    colorA: "#2BA89C",
    colorB: "#35C4B8",
    glow: "rgba(43,168,156,0.13)",
  },
  {
    id: "structure",
    badge: "Structures",
    headline: "Orchestrez votre réseau.",
    sub: "CPTS, MSP, hôpitaux : pilotez la coordination de vos équipes pluridisciplinaires.",
    bullets: ["Console structure dédiée", "Invitation de vos soignants", "Validation en 24-48 h"],
    cta: { label: "Demander un pilote", href: "/pour-les-structures" },
    ctaSec: { label: "Parler à l'équipe", href: "/demander-une-demo" },
    colorA: "#1A1A2E",
    colorB: "#3A3A60",
    glow: "rgba(26,26,46,0.12)",
  },
] as const

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  )
}

function SoignantSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="26" height="26" aria-hidden="true">
      <path d="M8 2v3" /><path d="M16 2v3" />
      <rect x="3" y="5" width="18" height="16" rx="2" />
      <path d="M12 11v4" /><path d="M10 13h4" />
    </svg>
  )
}

function PatientSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="26" height="26" aria-hidden="true">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  )
}

function StructureSvg({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="26" height="26" aria-hidden="true">
      <path d="M3 21h18" /><path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 9h.01" /><path d="M9 13h.01" /><path d="M9 17h.01" />
      <path d="M15 9h.01" /><path d="M15 13h.01" /><path d="M15 17h.01" />
    </svg>
  )
}

const ROLE_ICONS = {
  soignant: SoignantSvg,
  patient: PatientSvg,
  structure: StructureSvg,
}

export function AudienceConstellation() {
  const [active, setActive] = useState<string | null>(null)
  const [visible, setVisible] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true) },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <section
      ref={ref}
      style={{
        position: "relative",
        padding: "80px clamp(20px, 5vw, 80px)",
        borderTop: "1px solid rgba(26,26,46,0.05)",
        background: "#FAFAF8",
        overflow: "hidden",
      }}
    >
      <style>{`
        @keyframes ac-float-a {
          0%,100% { transform:translate(0,0) scale(1); }
          50%      { transform:translate(12px,-18px) scale(1.04); }
        }
        @keyframes ac-float-b {
          0%,100% { transform:translate(0,0) scale(1); }
          50%      { transform:translate(-14px,12px) scale(1.06); }
        }
        @keyframes ac-float-c {
          0%,100% { transform:translate(0,0) scale(1); }
          33%      { transform:translate(10px,10px) scale(1.02); }
          66%      { transform:translate(-8px,-6px) scale(1.04); }
        }
        .ac-orb-a { animation: ac-float-a 7s ease-in-out infinite; }
        .ac-orb-b { animation: ac-float-b 9s ease-in-out infinite; }
        .ac-orb-c { animation: ac-float-c 11s ease-in-out infinite; }

        .ac-card {
          background: #FFFFFF;
          border: 1.5px solid rgba(26,26,46,0.07);
          border-radius: 20px;
          padding: 28px 28px 24px;
          cursor: pointer;
          transition:
            transform .4s cubic-bezier(0.16,1,0.3,1),
            box-shadow .4s cubic-bezier(0.16,1,0.3,1),
            border-color .3s cubic-bezier(0.16,1,0.3,1);
          position: relative;
          text-decoration: none;
          display: flex;
          flex-direction: column;
          gap: 0;
        }
        .ac-card:hover, .ac-card.is-active {
          transform: translateY(-6px);
          box-shadow: 0 24px 60px -12px rgba(26,26,46,0.14), 0 8px 20px -8px rgba(26,26,46,0.07);
        }
        .ac-card-soignant:hover, .ac-card-soignant.is-active { border-color: rgba(91,78,196,0.35); }
        .ac-card-patient:hover, .ac-card-patient.is-active { border-color: rgba(43,168,156,0.35); }
        .ac-card-structure:hover, .ac-card-structure.is-active { border-color: rgba(26,26,46,0.30); }

        .ac-card-enter {
          opacity: 0;
          transform: translateY(24px);
          transition: opacity .6s cubic-bezier(0.16,1,0.3,1), transform .6s cubic-bezier(0.16,1,0.3,1);
        }
        .ac-card-enter.visible { opacity: 1; transform: translateY(0); }

        .ac-cta-primary {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 20px;
          border-radius: 100px;
          font-size: 14px;
          font-weight: 700;
          text-decoration: none;
          color: #fff;
          transition: transform .2s, box-shadow .2s, opacity .2s;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }
        .ac-cta-primary:hover { opacity: .88; transform: translateY(-1px); }

        .ac-cta-sec {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          font-weight: 500;
          color: #6B7280;
          text-decoration: none;
          padding: 6px 0;
          transition: color .2s;
          font-family: 'Plus Jakarta Sans', system-ui, sans-serif;
        }
        .ac-cta-sec:hover { color: #374151; }

        .ac-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) {
          .ac-grid { grid-template-columns: 1fr; max-width: 480px; margin-left: auto; margin-right: auto; }
          .ac-card-enter { transition-delay: 0s !important; }
        }
        @media (max-width: 600px) {
          .ac-card { padding: 22px 20px 18px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .ac-orb-a, .ac-orb-b, .ac-orb-c { animation: none; }
          .ac-card, .ac-card-enter { transition-duration: .01ms !important; }
        }
      `}</style>

      {/* Decorative orbs */}
      <div aria-hidden="true" style={{ position: "absolute", inset: 0, overflow: "hidden", pointerEvents: "none", zIndex: 0 }}>
        <div className="ac-orb-a" style={{ position: "absolute", top: "-10%", right: "5%", width: "clamp(180px,22vw,300px)", height: "clamp(180px,22vw,300px)", borderRadius: "50%", background: "radial-gradient(circle at 35% 35%, rgba(91,78,196,0.18), transparent 70%)", filter: "blur(1px)" }} />
        <div className="ac-orb-b" style={{ position: "absolute", bottom: "-5%", left: "2%", width: "clamp(140px,18vw,240px)", height: "clamp(140px,18vw,240px)", borderRadius: "50%", background: "radial-gradient(circle at 60% 60%, rgba(43,168,156,0.16), transparent 70%)", filter: "blur(1px)" }} />
        <div className="ac-orb-c" style={{ position: "absolute", top: "30%", left: "45%", width: "clamp(80px,10vw,140px)", height: "clamp(80px,10vw,140px)", borderRadius: "50%", background: "radial-gradient(circle at 50% 50%, rgba(91,78,196,0.08), transparent 70%)" }} />
      </div>

      <div style={{ position: "relative", zIndex: 1, maxWidth: 1100, margin: "0 auto" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: 52 }}>
          <div style={{
            display: "inline-block",
            fontSize: 11, fontWeight: 700, letterSpacing: "0.12em",
            textTransform: "uppercase", color: "#5B4EC4",
            marginBottom: 18, padding: "5px 16px",
            border: "1px solid rgba(91,78,196,0.2)", borderRadius: 100,
            background: "rgba(91,78,196,0.05)",
          }}>
            Nami pour vous
          </div>
          <h2 style={{
            fontSize: "clamp(1.8rem, 4vw, 2.8rem)",
            fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1,
            color: "#1A1A2E", marginBottom: 14,
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}>
            Qui êtes-vous ?
          </h2>
          <p style={{ fontSize: "clamp(15px, 1.4vw, 17px)", color: "#6B7280", maxWidth: 420, margin: "0 auto", lineHeight: 1.6 }}>
            Nami s&apos;adapte à votre rôle dans le parcours de soins.
          </p>
        </div>

        {/* Cards */}
        <div className="ac-grid">
          {ROLES.map((role, i) => {
            const Icon = ROLE_ICONS[role.id as keyof typeof ROLE_ICONS]
            const isActive = active === role.id
            return (
              <div
                key={role.id}
                className={`ac-card-enter ac-card ac-card-${role.id}${isActive ? " is-active" : ""}${visible ? " visible" : ""}`}
                style={{ transitionDelay: visible ? `${i * 80}ms` : "0ms" }}
                onMouseEnter={() => setActive(role.id)}
                onMouseLeave={() => setActive(null)}
              >
                {/* Top row: icon + badge */}
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
                  <div style={{
                    width: 48, height: 48, borderRadius: 14, flexShrink: 0,
                    background: `linear-gradient(135deg, ${role.colorA}18, ${role.colorB}12)`,
                    border: `1px solid ${role.colorA}22`,
                    display: "flex", alignItems: "center", justifyContent: "center",
                  }}>
                    <Icon color={role.colorA} />
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, letterSpacing: "0.08em",
                    textTransform: "uppercase", color: role.colorA,
                    padding: "4px 10px", borderRadius: 100,
                    background: `${role.colorA}12`,
                    border: `1px solid ${role.colorA}20`,
                  }}>
                    {role.badge}
                  </span>
                </div>

                {/* Headline */}
                <h3 style={{
                  fontSize: "clamp(1.15rem, 1.6vw, 1.4rem)",
                  fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.2,
                  color: "#1A1A2E", marginBottom: 10,
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                }}>
                  {role.headline}
                </h3>

                {/* Sub */}
                <p style={{ fontSize: 14, color: "#6B7280", lineHeight: 1.55, marginBottom: 20 }}>
                  {role.sub}
                </p>

                {/* Bullets */}
                <ul style={{ listStyle: "none", padding: 0, margin: "0 0 24px", display: "flex", flexDirection: "column", gap: 8 }}>
                  {role.bullets.map(b => (
                    <li key={b} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151", fontWeight: 500 }}>
                      <span style={{ color: role.colorA, flexShrink: 0 }}>
                        <CheckIcon />
                      </span>
                      {b}
                    </li>
                  ))}
                </ul>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Divider */}
                <div style={{ height: 1, background: "rgba(26,26,46,0.06)", marginBottom: 20 }} />

                {/* CTAs */}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <Link
                    href={role.cta.href}
                    className="ac-cta-primary"
                    style={{
                      background: `linear-gradient(135deg, ${role.colorA}, ${role.colorB})`,
                      boxShadow: `0 6px 20px ${role.glow}`,
                    }}
                  >
                    {role.cta.label}
                    <ArrowIcon />
                  </Link>
                  <Link href={role.ctaSec.href} className="ac-cta-sec">
                    {role.ctaSec.label} →
                  </Link>
                </div>
              </div>
            )
          })}
        </div>

        {/* Footnote */}
        <p style={{ textAlign: "center", marginTop: 36, fontSize: 12, color: "#9CA3AF", letterSpacing: "0.03em" }}>
          <strong style={{ color: "#6B7280", fontWeight: 600 }}>Outil de coordination</strong>
          {" · "}Non dispositif médical
          {" · "}Conforme RGPD
        </p>
      </div>
    </section>
  )
}
