"use client";

import Link from "next/link";
import { CGU_VERSION } from "@/hooks/useSubmitApplication";

export interface CguAcceptanceValue {
  acceptedTerms: boolean;
  acceptedRgpd: boolean;
}

interface CguAcceptanceProps {
  value: CguAcceptanceValue;
  onChange: (next: CguAcceptanceValue) => void;
  disabled?: boolean;
}

function Row({
  checked,
  onChange,
  disabled,
  children,
  testid,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  children: React.ReactNode;
  testid: string;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 12,
        padding: 14,
        borderRadius: 12,
        border: "1px solid rgba(26,26,46,0.08)",
        background: "#FFFFFF",
        cursor: disabled ? "not-allowed" : "pointer",
      }}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        data-testid={testid}
        onChange={(e) => onChange(e.target.checked)}
        style={{
          marginTop: 3,
          width: 18,
          height: 18,
          accentColor: "#5B4EC4",
          flexShrink: 0,
        }}
      />
      <span style={{ fontSize: 14, lineHeight: 1.5, color: "#1A1A2E" }}>
        {children}
      </span>
    </label>
  );
}

export function CguAcceptance({
  value,
  onChange,
  disabled,
}: CguAcceptanceProps) {
  return (
    <div style={{ display: "grid", gap: 10 }}>
      <Row
        checked={value.acceptedTerms}
        disabled={disabled}
        testid="cgu-terms"
        onChange={(next) => onChange({ ...value, acceptedTerms: next })}
      >
        Je reconnais avoir lu et accepté les{" "}
        <Link
          href="/cgu"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#5B4EC4", textDecoration: "underline" }}
        >
          conditions générales d&apos;utilisation
        </Link>{" "}
        (version {CGU_VERSION}).
      </Row>
      <Row
        checked={value.acceptedRgpd}
        disabled={disabled}
        testid="cgu-rgpd"
        onChange={(next) => onChange({ ...value, acceptedRgpd: next })}
      >
        Je consens au traitement de mes données personnelles dans les
        conditions décrites dans la{" "}
        <Link
          href="/confidentialite"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: "#5B4EC4", textDecoration: "underline" }}
        >
          politique de confidentialité
        </Link>
        . Les données collectées servent exclusivement à l&apos;examen de cette
        candidature par l&apos;équipe Nami.
      </Row>
      <p style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}>
        Nami n&apos;est pas un dispositif médical. Aucune donnée clinique de
        patient n&apos;est requise pour cette candidature.
      </p>
    </div>
  );
}
