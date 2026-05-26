import Link from "next/link";
import { ShieldCheck, MapPin, Briefcase, ExternalLink } from "lucide-react";
import { PRESSE_CONTACT } from "./presse-data";

interface ComplianceRowProps {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}

function ComplianceRow({ icon, label, children }: ComplianceRowProps) {
  return (
    <div
      className="flex items-start gap-4 py-4"
      style={{ borderTop: "1px solid rgba(26,26,46,0.06)" }}
    >
      <div
        className="shrink-0 flex items-center justify-center rounded-lg"
        style={{
          width: 36,
          height: 36,
          background: "rgba(91,78,196,0.10)",
          color: "#5B4EC4",
        }}
        aria-hidden="true"
      >
        {icon}
      </div>
      <div className="flex-1">
        <p
          className="text-xs font-semibold uppercase tracking-wide mb-1"
          style={{
            color: "#6B7280",
            letterSpacing: "0.06em",
          }}
        >
          {label}
        </p>
        <div
          className="text-sm md:text-base"
          style={{ color: "#1A1A2E", lineHeight: 1.6 }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export function PresseCompliance() {
  return (
    <section
      aria-labelledby="presse-compliance-title"
      className="py-16 md:py-24 px-4"
      style={{ background: "#FAFAF8" }}
    >
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 md:mb-10">
          <h2
            id="presse-compliance-title"
            className="text-2xl md:text-4xl font-extrabold tracking-tight mb-3"
            style={{
              color: "#1A1A2E",
              fontFamily: "var(--font-jakarta)",
              letterSpacing: "-0.03em",
            }}
          >
            Coordonnées institutionnelles
          </h2>
          <p
            className="text-sm md:text-base"
            style={{ color: "#6B7280" }}
          >
            Informations à citer dans toute publication officielle évoquant
            Nami.
          </p>
        </div>

        <div
          className="rounded-2xl px-6 md:px-8"
          style={{
            background: "#fff",
            border: "1px solid rgba(26,26,46,0.06)",
            boxShadow: "0 1px 3px rgba(26,26,46,0.03)",
          }}
        >
          <ComplianceRow
            icon={<Briefcase size={16} aria-hidden="true" />}
            label="Directrice de la publication"
          >
            {PRESSE_CONTACT.directricePublication}
            <span style={{ color: "#6B7280" }}>
              {" "}
              · RPPS {PRESSE_CONTACT.rpps}
            </span>
          </ComplianceRow>

          <ComplianceRow
            icon={<MapPin size={16} aria-hidden="true" />}
            label="Adresse"
          >
            <span>
              {PRESSE_CONTACT.adresseLigne1}
              <br />
              {PRESSE_CONTACT.adresseLigne2}
              <br />
              {PRESSE_CONTACT.adresseLigne3}
            </span>
          </ComplianceRow>

          <ComplianceRow
            icon={<ShieldCheck size={16} aria-hidden="true" />}
            label="Hébergement & conformité"
          >
            <span>{PRESSE_CONTACT.hebergement}</span>
            <p
              className="text-xs mt-1"
              style={{ color: "#6B7280" }}
            >
              Nami n&apos;est pas un dispositif médical au sens du règlement
              (UE) 2017/745.
            </p>
          </ComplianceRow>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/mentions-legales"
            className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 rounded-full px-3 py-1.5"
            style={{ color: "#5B4EC4" }}
          >
            Mentions légales
            <ExternalLink size={12} aria-hidden="true" />
          </Link>
          <Link
            href="/confidentialite"
            className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 rounded-full px-3 py-1.5"
            style={{ color: "#5B4EC4" }}
          >
            Politique de confidentialité
            <ExternalLink size={12} aria-hidden="true" />
          </Link>
          <Link
            href="/cgu"
            className="inline-flex items-center gap-1.5 text-xs font-semibold transition-opacity hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(91,78,196,0.4)] focus-visible:ring-offset-2 rounded-full px-3 py-1.5"
            style={{ color: "#5B4EC4" }}
          >
            CGU
            <ExternalLink size={12} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </section>
  );
}
