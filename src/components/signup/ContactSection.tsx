"use client";

import { useId } from "react";
import { RPPS_REGEX } from "@/hooks/useSubmitApplication";

export interface ContactSectionValue {
  applicantFirstName: string;
  applicantLastName: string;
  applicantEmail: string;
  applicantPhone: string;
  applicantRoleInOrg: string;
  applicantHasRpps: boolean;
  applicantRpps: string;
}

export interface ContactSectionErrors {
  applicantFirstName?: string | null;
  applicantLastName?: string | null;
  applicantEmail?: string | null;
  applicantPhone?: string | null;
  applicantRoleInOrg?: string | null;
  applicantRpps?: string | null;
}

interface ContactSectionProps {
  value: ContactSectionValue;
  errors?: ContactSectionErrors;
  onChange: (next: ContactSectionValue) => void;
  disabled?: boolean;
}

const ROLE_OPTIONS: ReadonlyArray<string> = [
  "Coordinateur·rice",
  "Directeur·rice",
  "Soignant·e membre",
  "Bénévole",
  "Administratif·ve",
  "Autre",
];

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function isValidRpps(value: string): boolean {
  return RPPS_REGEX.test(value.replace(/\D/g, ""));
}

function Field({
  id,
  label,
  required,
  error,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string | null;
  children: React.ReactNode;
}) {
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
        {label}{" "}
        {required ? <span style={{ color: "#DC2626" }}>*</span> : null}
      </label>
      {children}
      {error ? (
        <p
          role="alert"
          style={{ fontSize: 12, color: "#DC2626", marginTop: 4 }}
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputBase = (hasError: boolean, disabled?: boolean): React.CSSProperties => ({
  width: "100%",
  padding: "10px 12px",
  fontSize: 15,
  fontFamily: "inherit",
  border: hasError ? "1px solid #DC2626" : "1px solid rgba(26,26,46,0.12)",
  borderRadius: 8,
  background: disabled ? "#F5F3EF" : "#FFFFFF",
  color: "#1A1A2E",
});

export function ContactSection({
  value,
  errors,
  onChange,
  disabled,
}: ContactSectionProps) {
  const e = errors ?? {};
  const baseId = useId();
  const patch = (p: Partial<ContactSectionValue>) =>
    onChange({ ...value, ...p });

  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 12,
        }}
      >
        <Field
          id={`${baseId}-firstname`}
          label="Prénom"
          required
          error={e.applicantFirstName}
        >
          <input
            id={`${baseId}-firstname`}
            type="text"
            autoComplete="given-name"
            value={value.applicantFirstName}
            disabled={disabled}
            data-testid="contact-firstname"
            onChange={(ev) => patch({ applicantFirstName: ev.target.value })}
            style={inputBase(Boolean(e.applicantFirstName), disabled)}
          />
        </Field>
        <Field
          id={`${baseId}-lastname`}
          label="Nom"
          required
          error={e.applicantLastName}
        >
          <input
            id={`${baseId}-lastname`}
            type="text"
            autoComplete="family-name"
            value={value.applicantLastName}
            disabled={disabled}
            data-testid="contact-lastname"
            onChange={(ev) => patch({ applicantLastName: ev.target.value })}
            style={inputBase(Boolean(e.applicantLastName), disabled)}
          />
        </Field>
      </div>

      <Field
        id={`${baseId}-email`}
        label="Email professionnel"
        required
        error={e.applicantEmail}
      >
        <input
          id={`${baseId}-email`}
          type="email"
          autoComplete="email"
          value={value.applicantEmail}
          disabled={disabled}
          data-testid="contact-email"
          onChange={(ev) => patch({ applicantEmail: ev.target.value })}
          style={inputBase(Boolean(e.applicantEmail), disabled)}
        />
      </Field>

      <Field
        id={`${baseId}-phone`}
        label="Téléphone"
        error={e.applicantPhone}
      >
        <input
          id={`${baseId}-phone`}
          type="tel"
          autoComplete="tel"
          placeholder="06 12 34 56 78"
          value={value.applicantPhone}
          disabled={disabled}
          data-testid="contact-phone"
          onChange={(ev) => patch({ applicantPhone: ev.target.value })}
          style={inputBase(Boolean(e.applicantPhone), disabled)}
        />
      </Field>

      <Field
        id={`${baseId}-role`}
        label="Votre rôle dans la structure"
        required
        error={e.applicantRoleInOrg}
      >
        <select
          id={`${baseId}-role`}
          value={value.applicantRoleInOrg}
          disabled={disabled}
          data-testid="contact-role"
          onChange={(ev) => patch({ applicantRoleInOrg: ev.target.value })}
          style={inputBase(Boolean(e.applicantRoleInOrg), disabled)}
        >
          <option value="">Sélectionner…</option>
          {ROLE_OPTIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </Field>

      <div>
        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            fontSize: 14,
            color: "#1A1A2E",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={value.applicantHasRpps}
            disabled={disabled}
            data-testid="contact-hasrpps"
            onChange={(ev) =>
              patch({
                applicantHasRpps: ev.target.checked,
                applicantRpps: ev.target.checked ? value.applicantRpps : "",
              })
            }
            style={{ width: 18, height: 18, accentColor: "#5B4EC4" }}
          />
          Je dispose d&apos;un numéro RPPS
        </label>
      </div>

      {value.applicantHasRpps ? (
        <Field
          id={`${baseId}-rpps`}
          label="Numéro RPPS"
          required
          error={e.applicantRpps}
        >
          <input
            id={`${baseId}-rpps`}
            type="text"
            inputMode="numeric"
            autoComplete="off"
            placeholder="11 chiffres"
            value={value.applicantRpps}
            disabled={disabled}
            data-testid="contact-rpps"
            onChange={(ev) =>
              patch({
                applicantRpps: ev.target.value.replace(/\D/g, "").slice(0, 11),
              })
            }
            style={inputBase(Boolean(e.applicantRpps), disabled)}
          />
        </Field>
      ) : null}
    </div>
  );
}
