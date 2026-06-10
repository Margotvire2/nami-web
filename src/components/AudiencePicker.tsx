import Link from "next/link"
import { Stethoscope, Heart, Building2 } from "lucide-react"

const AUDIENCES = [
  {
    Icon: Stethoscope,
    title: "Soignant·e",
    subtitle: "Médecin, diététicien·ne, psychologue, kiné...",
    cta: "Découvrir Nami Pro",
    href: "/pour-les-soignants",
  },
  {
    Icon: Heart,
    title: "Patient·e ou aidant·e",
    subtitle: "Coordonnez votre parcours avec votre équipe de soins",
    cta: "Votre espace patient",
    href: "/pour-les-patients",
  },
  {
    Icon: Building2,
    title: "Structure / Réseau",
    subtitle: "Cabinet, CPTS, hôpital, réseau de soins",
    cta: "Nous contacter",
    href: "/pour-les-structures",
  },
] as const

export function AudiencePicker() {
  return (
    <section
      style={{
        background: "#F5F3EF",
        padding: "clamp(48px, 8vw, 80px) 24px",
        borderTop: "1px solid rgba(26,26,46,0.05)",
        borderBottom: "1px solid rgba(26,26,46,0.05)",
      }}
    >
      <style>{`
        .audience-card {
          display: block;
          padding: 28px 24px;
          background: #FFFFFF;
          border: 1px solid rgba(26,26,46,0.08);
          border-radius: 16px;
          text-decoration: none;
          color: inherit;
          transition: box-shadow 200ms cubic-bezier(0.16,1,0.3,1), transform 200ms cubic-bezier(0.16,1,0.3,1);
        }
        .audience-card:hover {
          box-shadow: 0 8px 28px rgba(91,78,196,0.12);
          transform: translateY(-2px);
        }
        .audience-card:hover .audience-cta {
          color: #5B4EC4;
        }
        @media (max-width: 767px) {
          .audience-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p
          style={{
            textAlign: "center",
            fontSize: "clamp(1.3rem, 2.5vw, 1.75rem)",
            fontWeight: 700,
            color: "#1A1A2E",
            marginBottom: "clamp(32px, 4vw, 48px)",
            fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
          }}
        >
          Vous êtes&nbsp;:
        </p>

        <div
          className="audience-grid"
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: 16,
          }}
        >
          {AUDIENCES.map(({ Icon, title, subtitle, cta, href }) => (
            <Link key={href} href={href} className="audience-card">
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 12,
                  background: "rgba(91,78,196,0.08)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginBottom: 16,
                  color: "#5B4EC4",
                }}
              >
                <Icon size={22} strokeWidth={1.6} aria-hidden="true" />
              </div>

              <h3
                style={{
                  fontSize: 17,
                  fontWeight: 700,
                  color: "#1A1A2E",
                  marginBottom: 6,
                  fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
                }}
              >
                {title}
              </h3>

              <p
                style={{
                  fontSize: 14,
                  color: "#6B7280",
                  lineHeight: 1.5,
                  marginBottom: 20,
                }}
              >
                {subtitle}
              </p>

              <span
                className="audience-cta"
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: "#374151",
                  transition: "color 200ms cubic-bezier(0.16,1,0.3,1)",
                }}
              >
                {cta} →
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
