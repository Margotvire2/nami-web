"use client";

import { useId } from "react";
import { SIRET_REGEX } from "@/hooks/useSubmitApplication";

interface SiretInputProps {
  value: string;
  onChange: (next: string) => void;
  error?: string | null;
  disabled?: boolean;
}

function formatSiret(raw: string): string {
  const digits = raw.replace(/\D/g, "").slice(0, 14);
  // 14 chiffres → groupes 3-3-3-5 pour lisibilité.
  const parts = [
    digits.slice(0, 3),
    digits.slice(3, 6),
    digits.slice(6, 9),
    digits.slice(9, 14),
  ].filter((p) => p.length > 0);
  return parts.join(" ");
}

export function isValidSiret(rawOrFormatted: string): boolean {
  const digits = rawOrFormatted.replace(/\D/g, "");
  return SIRET_REGEX.test(digits);
}

export function SiretInput({
  value,
  onChange,
  error,
  disabled,
}: SiretInputProps) {
  const id = useId();
  return (
    <div>
      <label
        htmlFor={id}
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 600,
          color: "#1A1A2E",
          marginBottom: 6,
        }}
      >
        SIRET <span style={{ color: "#DC2626" }}>*</span>
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="123 456 789 00012"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(formatSiret(e.target.value))}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        data-testid="siret-input"
        style={{
          width: "100%",
          padding: "10px 12px",
          fontSize: 15,
          fontFamily: "Inter, system-ui, sans-serif",
          letterSpacing: 0.5,
          border: error
            ? "1px solid #DC2626"
            : "1px solid rgba(26,26,46,0.12)",
          borderRadius: 8,
          background: disabled ? "#F5F3EF" : "#FFFFFF",
          color: "#1A1A2E",
        }}
      />
      <p
        style={{
          fontSize: 12,
          color: "#6B7280",
          marginTop: 4,
        }}
      >
        14 chiffres — identifiant légal INSEE.
      </p>
      {error ? (
        <p
          id={`${id}-error`}
          role="alert"
          style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
