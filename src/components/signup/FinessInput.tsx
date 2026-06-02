"use client";

import { useId } from "react";
import { FINESS_REGEX } from "@/hooks/useSubmitApplication";

interface FinessInputProps {
  value: string;
  onChange: (next: string) => void;
  required: boolean;
  error?: string | null;
  disabled?: boolean;
}

function formatFiness(raw: string): string {
  return raw.replace(/\D/g, "").slice(0, 9);
}

export function isValidFiness(value: string): boolean {
  const digits = value.replace(/\D/g, "");
  return FINESS_REGEX.test(digits);
}

export function FinessInput({
  value,
  onChange,
  required,
  error,
  disabled,
}: FinessInputProps) {
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
        FINESS{" "}
        {required ? (
          <span style={{ color: "#DC2626" }}>*</span>
        ) : (
          <span style={{ color: "#6B7280", fontWeight: 400 }}>
            (optionnel)
          </span>
        )}
      </label>
      <input
        id={id}
        type="text"
        inputMode="numeric"
        autoComplete="off"
        placeholder="123456789"
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(formatFiness(e.target.value))}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        data-testid="finess-input"
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
        9 chiffres — identifiant ANS (Agence du Numérique en Santé).
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
