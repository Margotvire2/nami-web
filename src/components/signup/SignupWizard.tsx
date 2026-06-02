"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  useSubmitApplication,
  requiresFiness,
  CGU_VERSION,
  ZIP_REGEX,
  type OrgType,
  type SubmitApplicationInput,
} from "@/hooks/useSubmitApplication";
import { OrgTypeSelector } from "./OrgTypeSelector";
import { SiretInput, isValidSiret } from "./SiretInput";
import { FinessInput, isValidFiness } from "./FinessInput";
import {
  ContactSection,
  isValidEmail,
  isValidRpps,
  type ContactSectionValue,
  type ContactSectionErrors,
} from "./ContactSection";
import { CguAcceptance, type CguAcceptanceValue } from "./CguAcceptance";

const TOTAL_STEPS = 5;

interface FormState {
  proposedType: OrgType | null;
  proposedName: string;
  proposedSiret: string;
  proposedFiness: string;
  proposedAddress: string;
  proposedCity: string;
  proposedZipCode: string;
  proposedRegion: string;
  proposedDescription: string;
  proposedMissionStatement: string;
  proposedSpecialty: string;
  proposedWebsite: string;
  proposedSince: string;
  contact: ContactSectionValue;
  cgu: CguAcceptanceValue;
}

const initial: FormState = {
  proposedType: null,
  proposedName: "",
  proposedSiret: "",
  proposedFiness: "",
  proposedAddress: "",
  proposedCity: "",
  proposedZipCode: "",
  proposedRegion: "",
  proposedDescription: "",
  proposedMissionStatement: "",
  proposedSpecialty: "",
  proposedWebsite: "",
  proposedSince: "",
  contact: {
    applicantFirstName: "",
    applicantLastName: "",
    applicantEmail: "",
    applicantPhone: "",
    applicantRoleInOrg: "",
    applicantHasRpps: false,
    applicantRpps: "",
  },
  cgu: { acceptedTerms: false, acceptedRgpd: false },
};

interface StepErrors {
  proposedType?: string;
  proposedName?: string;
  proposedSiret?: string;
  proposedFiness?: string;
  proposedAddress?: string;
  proposedCity?: string;
  proposedZipCode?: string;
  proposedWebsite?: string;
  contact?: ContactSectionErrors;
  cgu?: string;
}

function validateStep(step: number, f: FormState): StepErrors {
  const errs: StepErrors = {};

  if (step === 1) {
    if (!f.proposedType) {
      errs.proposedType = "Sélectionnez le type de votre structure.";
    }
  }

  if (step === 2) {
    if (f.proposedName.trim().length < 2) {
      errs.proposedName = "Nom de la structure requis (2 caractères minimum).";
    }
    if (!isValidSiret(f.proposedSiret)) {
      errs.proposedSiret = "SIRET invalide — 14 chiffres attendus.";
    }
    if (f.proposedType && requiresFiness(f.proposedType)) {
      if (!isValidFiness(f.proposedFiness)) {
        errs.proposedFiness =
          "FINESS requis pour ce type de structure (9 chiffres).";
      }
    } else if (f.proposedFiness && !isValidFiness(f.proposedFiness)) {
      errs.proposedFiness = "FINESS invalide — 9 chiffres attendus.";
    }
    if (f.proposedAddress.trim().length < 3) {
      errs.proposedAddress = "Adresse complète requise.";
    }
    if (f.proposedCity.trim().length < 1) {
      errs.proposedCity = "Ville requise.";
    }
    if (!ZIP_REGEX.test(f.proposedZipCode)) {
      errs.proposedZipCode = "Code postal invalide (5 chiffres).";
    }
  }

  if (step === 3) {
    if (f.proposedWebsite.trim().length > 0) {
      try {
        new URL(f.proposedWebsite);
      } catch {
        errs.proposedWebsite =
          "URL invalide. Exemple : https://www.mastructure.fr";
      }
    }
  }

  if (step === 4) {
    const c: ContactSectionErrors = {};
    if (f.contact.applicantFirstName.trim().length < 1) {
      c.applicantFirstName = "Prénom requis.";
    }
    if (f.contact.applicantLastName.trim().length < 1) {
      c.applicantLastName = "Nom requis.";
    }
    if (!isValidEmail(f.contact.applicantEmail)) {
      c.applicantEmail = "Adresse email invalide.";
    }
    if (f.contact.applicantRoleInOrg.trim().length < 1) {
      c.applicantRoleInOrg = "Sélectionnez votre rôle.";
    }
    if (f.contact.applicantHasRpps && !isValidRpps(f.contact.applicantRpps)) {
      c.applicantRpps = "RPPS invalide — 11 chiffres attendus.";
    }
    if (Object.keys(c).length > 0) errs.contact = c;
  }

  if (step === 5) {
    if (!f.cgu.acceptedTerms || !f.cgu.acceptedRgpd) {
      errs.cgu = "Acceptation des CGU et de la politique RGPD obligatoire.";
    }
  }

  return errs;
}

function hasErrors(e: StepErrors): boolean {
  for (const k of Object.keys(e) as Array<keyof StepErrors>) {
    const v = e[k];
    if (k === "contact") {
      if (v && Object.keys(v).length > 0) return true;
    } else if (v) {
      return true;
    }
  }
  return false;
}

function buildPayload(f: FormState): SubmitApplicationInput {
  if (!f.proposedType) {
    throw new Error("proposedType must be set before submission");
  }
  return {
    proposedName: f.proposedName.trim(),
    proposedType: f.proposedType,
    proposedSiret: f.proposedSiret.replace(/\D/g, ""),
    proposedFiness: f.proposedFiness
      ? f.proposedFiness.replace(/\D/g, "")
      : null,
    proposedAddress: f.proposedAddress.trim(),
    proposedCity: f.proposedCity.trim(),
    proposedZipCode: f.proposedZipCode.trim(),
    proposedRegion: f.proposedRegion.trim() || null,
    proposedDescription: f.proposedDescription.trim() || null,
    proposedMissionStatement: f.proposedMissionStatement.trim() || null,
    proposedSpecialty: f.proposedSpecialty.trim() || null,
    proposedWebsite: f.proposedWebsite.trim() || null,
    proposedSince: f.proposedSince || null,
    applicantEmail: f.contact.applicantEmail.trim(),
    applicantFirstName: f.contact.applicantFirstName.trim(),
    applicantLastName: f.contact.applicantLastName.trim(),
    applicantPhone: f.contact.applicantPhone.trim() || null,
    applicantRoleInOrg: f.contact.applicantRoleInOrg.trim(),
    applicantHasRpps: f.contact.applicantHasRpps,
    applicantRpps: f.contact.applicantHasRpps
      ? f.contact.applicantRpps.replace(/\D/g, "")
      : null,
    cguVersion: CGU_VERSION,
    acceptedTerms: true,
    acceptedRgpd: true,
  };
}

const stepLabels: ReadonlyArray<string> = [
  "Type",
  "Identité légale",
  "Profil",
  "Contact",
  "Validation",
];

interface SignupWizardProps {
  onSubmitted?: (token: string) => void;
}

export function SignupWizard({ onSubmitted }: SignupWizardProps = {}) {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState<FormState>(initial);
  const [errors, setErrors] = useState<StepErrors>({});
  const submitMutation = useSubmitApplication();

  const submitting = submitMutation.isPending;
  const finessNeeded = form.proposedType
    ? requiresFiness(form.proposedType)
    : false;

  function goNext() {
    const stepErrors = validateStep(step, form);
    setErrors(stepErrors);
    if (hasErrors(stepErrors)) return;
    if (step < TOTAL_STEPS) {
      setStep(step + 1);
      setErrors({});
    }
  }

  function goBack() {
    if (step > 1) {
      setStep(step - 1);
      setErrors({});
    }
  }

  function handleSubmit() {
    const stepErrors = validateStep(5, form);
    setErrors(stepErrors);
    if (hasErrors(stepErrors)) return;

    const payload = buildPayload(form);
    submitMutation.mutate(payload, {
      onSuccess: (res) => {
        if (onSubmitted) {
          onSubmitted(res.trackingToken);
        } else {
          router.push(
            `/pour-structures/merci?token=${encodeURIComponent(res.trackingToken)}`,
          );
        }
      },
    });
  }

  return (
    <div data-testid="signup-wizard">
      <ProgressBar step={step} total={TOTAL_STEPS} labels={stepLabels} />

      <div
        style={{
          marginTop: 32,
          padding: 24,
          borderRadius: 16,
          background: "#FFFFFF",
          border: "1px solid rgba(26,26,46,0.06)",
          boxShadow: "0 4px 24px rgba(26,26,46,0.04)",
        }}
      >
        {step === 1 ? (
          <Step1
            value={form.proposedType}
            error={errors.proposedType}
            onChange={(t) =>
              setForm({ ...form, proposedType: t, proposedFiness: "" })
            }
          />
        ) : null}

        {step === 2 ? (
          <Step2
            form={form}
            errors={errors}
            finessRequired={finessNeeded}
            onChange={(p) => setForm({ ...form, ...p })}
            disabled={submitting}
          />
        ) : null}

        {step === 3 ? (
          <Step3
            form={form}
            errors={errors}
            onChange={(p) => setForm({ ...form, ...p })}
            disabled={submitting}
          />
        ) : null}

        {step === 4 ? (
          <ContactSection
            value={form.contact}
            errors={errors.contact}
            disabled={submitting}
            onChange={(c) => setForm({ ...form, contact: c })}
          />
        ) : null}

        {step === 5 ? (
          <Step5
            form={form}
            cguError={errors.cgu}
            submitting={submitting}
            apiError={submitMutation.error?.message ?? null}
            onCguChange={(c) => setForm({ ...form, cgu: c })}
          />
        ) : null}
      </div>

      <NavButtons
        step={step}
        total={TOTAL_STEPS}
        canGoBack={step > 1 && !submitting}
        submitting={submitting}
        onBack={goBack}
        onNext={goNext}
        onSubmit={handleSubmit}
      />
    </div>
  );
}

// ─── Sous-composants des étapes ──────────────────────────────────────────────

function ProgressBar({
  step,
  total,
  labels,
}: {
  step: number;
  total: number;
  labels: ReadonlyArray<string>;
}) {
  const pct = (step / total) * 100;
  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: 12,
          color: "#6B7280",
          marginBottom: 8,
        }}
      >
        <span>
          Étape {step} / {total} — {labels[step - 1]}
        </span>
        <span>{Math.round(pct)}%</span>
      </div>
      <div
        style={{
          height: 6,
          background: "#F5F3EF",
          borderRadius: 999,
          overflow: "hidden",
        }}
      >
        <div
          data-testid="progress-fill"
          style={{
            width: `${pct}%`,
            height: "100%",
            background:
              "linear-gradient(135deg, #5B4EC4, #2BA89C)",
            transition: "width 240ms ease",
          }}
        />
      </div>
    </div>
  );
}

function Step1({
  value,
  error,
  onChange,
}: {
  value: OrgType | null;
  error?: string;
  onChange: (t: OrgType) => void;
}) {
  return (
    <div>
      <h2 style={{ fontSize: 22, color: "#1A1A2E", marginBottom: 8 }}>
        Quel est le type de votre structure&nbsp;?
      </h2>
      <p style={{ fontSize: 14, color: "#6B7280", marginBottom: 20 }}>
        Choisissez la catégorie qui correspond le mieux. Pour certaines
        structures sanitaires, un numéro FINESS sera demandé à l&apos;étape
        suivante.
      </p>
      <OrgTypeSelector value={value} onChange={onChange} />
      {error ? (
        <p role="alert" style={{ marginTop: 12, color: "#DC2626", fontSize: 13 }}>
          {error}
        </p>
      ) : null}
    </div>
  );
}

function TextField({
  label,
  value,
  onChange,
  required,
  error,
  disabled,
  placeholder,
  testid,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
  error?: string | null;
  disabled?: boolean;
  placeholder?: string;
  testid?: string;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 600,
          color: "#1A1A2E",
          marginBottom: 6,
        }}
      >
        {label} {required ? <span style={{ color: "#DC2626" }}>*</span> : null}
      </label>
      <input
        type="text"
        value={value}
        disabled={disabled}
        placeholder={placeholder}
        data-testid={testid}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        style={{
          width: "100%",
          padding: "10px 12px",
          fontSize: 15,
          fontFamily: "inherit",
          border: error
            ? "1px solid #DC2626"
            : "1px solid rgba(26,26,46,0.12)",
          borderRadius: 8,
          background: disabled ? "#F5F3EF" : "#FFFFFF",
          color: "#1A1A2E",
        }}
      />
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

function TextArea({
  label,
  value,
  onChange,
  disabled,
  placeholder,
  rows = 4,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  disabled?: boolean;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <div>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: 600,
          color: "#1A1A2E",
          marginBottom: 6,
        }}
      >
        {label}
      </label>
      <textarea
        value={value}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        style={{
          width: "100%",
          padding: "10px 12px",
          fontSize: 14,
          fontFamily: "inherit",
          border: "1px solid rgba(26,26,46,0.12)",
          borderRadius: 8,
          background: disabled ? "#F5F3EF" : "#FFFFFF",
          color: "#1A1A2E",
          resize: "vertical",
        }}
      />
    </div>
  );
}

function Step2({
  form,
  errors,
  finessRequired,
  onChange,
  disabled,
}: {
  form: FormState;
  errors: StepErrors;
  finessRequired: boolean;
  onChange: (p: Partial<FormState>) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 22, color: "#1A1A2E", marginBottom: 8 }}>
          Identité légale
        </h2>
        <p style={{ fontSize: 14, color: "#6B7280" }}>
          Ces informations sont utilisées pour vérifier votre structure auprès
          des référentiels publics (INSEE, ANS).
        </p>
      </div>

      <TextField
        label="Nom légal de la structure"
        value={form.proposedName}
        onChange={(v) => onChange({ proposedName: v })}
        required
        error={errors.proposedName}
        disabled={disabled}
        testid="org-name"
      />

      <SiretInput
        value={form.proposedSiret}
        onChange={(v) => onChange({ proposedSiret: v })}
        error={errors.proposedSiret}
        disabled={disabled}
      />

      <FinessInput
        value={form.proposedFiness}
        onChange={(v) => onChange({ proposedFiness: v })}
        required={finessRequired}
        error={errors.proposedFiness}
        disabled={disabled}
      />

      <TextField
        label="Adresse"
        value={form.proposedAddress}
        onChange={(v) => onChange({ proposedAddress: v })}
        required
        error={errors.proposedAddress}
        disabled={disabled}
        placeholder="12 rue de l'Hôpital"
        testid="org-address"
      />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "120px 1fr 1fr",
          gap: 12,
        }}
      >
        <TextField
          label="Code postal"
          value={form.proposedZipCode}
          onChange={(v) =>
            onChange({ proposedZipCode: v.replace(/\D/g, "").slice(0, 5) })
          }
          required
          error={errors.proposedZipCode}
          disabled={disabled}
          testid="org-zip"
        />
        <TextField
          label="Ville"
          value={form.proposedCity}
          onChange={(v) => onChange({ proposedCity: v })}
          required
          error={errors.proposedCity}
          disabled={disabled}
          testid="org-city"
        />
        <TextField
          label="Région"
          value={form.proposedRegion}
          onChange={(v) => onChange({ proposedRegion: v })}
          disabled={disabled}
          placeholder="Île-de-France"
        />
      </div>
    </div>
  );
}

function Step3({
  form,
  errors,
  onChange,
  disabled,
}: {
  form: FormState;
  errors: StepErrors;
  onChange: (p: Partial<FormState>) => void;
  disabled?: boolean;
}) {
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div>
        <h2 style={{ fontSize: 22, color: "#1A1A2E", marginBottom: 8 }}>
          Profil de la structure
        </h2>
        <p style={{ fontSize: 14, color: "#6B7280" }}>
          Aidez l&apos;équipe Nami à comprendre votre activité. Tous ces
          champs sont optionnels.
        </p>
      </div>

      <TextArea
        label="Description de votre structure"
        value={form.proposedDescription}
        onChange={(v) => onChange({ proposedDescription: v })}
        disabled={disabled}
        placeholder="Activité principale, équipe, file active estimée…"
      />

      <TextArea
        label="Mission / spécificité"
        value={form.proposedMissionStatement}
        onChange={(v) => onChange({ proposedMissionStatement: v })}
        disabled={disabled}
        rows={3}
        placeholder="Ce qui fait votre singularité (territoire, populations, parcours)."
      />

      <TextField
        label="Spécialité ou domaine principal"
        value={form.proposedSpecialty}
        onChange={(v) => onChange({ proposedSpecialty: v })}
        disabled={disabled}
        placeholder="Endocrinologie, neurologie pédiatrique, gériatrie…"
      />

      <TextField
        label="Site web"
        value={form.proposedWebsite}
        onChange={(v) => onChange({ proposedWebsite: v })}
        error={errors.proposedWebsite}
        disabled={disabled}
        placeholder="https://www.mastructure.fr"
        testid="org-website"
      />

      <div>
        <label
          style={{
            display: "block",
            fontSize: 13,
            fontWeight: 600,
            color: "#1A1A2E",
            marginBottom: 6,
          }}
        >
          Date de création
        </label>
        <input
          type="date"
          value={form.proposedSince}
          disabled={disabled}
          onChange={(e) => onChange({ proposedSince: e.target.value })}
          style={{
            padding: "10px 12px",
            fontSize: 15,
            fontFamily: "inherit",
            border: "1px solid rgba(26,26,46,0.12)",
            borderRadius: 8,
            background: disabled ? "#F5F3EF" : "#FFFFFF",
            color: "#1A1A2E",
          }}
        />
      </div>
    </div>
  );
}

function Step5({
  form,
  cguError,
  apiError,
  submitting,
  onCguChange,
}: {
  form: FormState;
  cguError?: string;
  apiError: string | null;
  submitting: boolean;
  onCguChange: (c: CguAcceptanceValue) => void;
}) {
  return (
    <div style={{ display: "grid", gap: 20 }}>
      <div>
        <h2 style={{ fontSize: 22, color: "#1A1A2E", marginBottom: 8 }}>
          Récapitulatif et validation
        </h2>
        <p style={{ fontSize: 14, color: "#6B7280" }}>
          Vérifiez les informations avant d&apos;envoyer votre demande. Vous
          recevrez un email de suivi à l&apos;adresse renseignée.
        </p>
      </div>

      <RecapList form={form} />

      <CguAcceptance
        value={form.cgu}
        onChange={onCguChange}
        disabled={submitting}
      />

      {cguError ? (
        <p role="alert" style={{ color: "#DC2626", fontSize: 13 }}>
          {cguError}
        </p>
      ) : null}

      {apiError ? (
        <div
          role="alert"
          data-testid="api-error"
          style={{
            padding: 12,
            borderRadius: 10,
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#991B1B",
            fontSize: 13,
            lineHeight: 1.5,
          }}
        >
          {apiError}
        </div>
      ) : null}
    </div>
  );
}

function RecapList({ form }: { form: FormState }) {
  const rows: Array<[string, string]> = [
    ["Type", form.proposedType ?? "—"],
    ["Nom", form.proposedName || "—"],
    ["SIRET", form.proposedSiret || "—"],
    ["FINESS", form.proposedFiness || "—"],
    [
      "Adresse",
      [
        form.proposedAddress,
        [form.proposedZipCode, form.proposedCity].filter(Boolean).join(" "),
        form.proposedRegion,
      ]
        .filter(Boolean)
        .join(" — ") || "—",
    ],
    [
      "Contact",
      `${form.contact.applicantFirstName} ${form.contact.applicantLastName} (${form.contact.applicantEmail})`,
    ],
    ["Rôle", form.contact.applicantRoleInOrg || "—"],
  ];
  return (
    <dl
      style={{
        display: "grid",
        gridTemplateColumns: "180px 1fr",
        gap: "8px 16px",
        padding: 16,
        background: "#FAFAF8",
        borderRadius: 10,
        fontSize: 14,
      }}
    >
      {rows.map(([k, v]) => (
        <div key={k} style={{ display: "contents" }}>
          <dt style={{ color: "#6B7280", fontWeight: 500 }}>{k}</dt>
          <dd style={{ color: "#1A1A2E", margin: 0 }}>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

function NavButtons({
  step,
  total,
  canGoBack,
  submitting,
  onBack,
  onNext,
  onSubmit,
}: {
  step: number;
  total: number;
  canGoBack: boolean;
  submitting: boolean;
  onBack: () => void;
  onNext: () => void;
  onSubmit: () => void;
}) {
  const isLast = step === total;
  return (
    <div
      style={{
        marginTop: 24,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: 12,
      }}
    >
      <button
        type="button"
        onClick={onBack}
        disabled={!canGoBack}
        data-testid="wizard-back"
        style={{
          padding: "10px 20px",
          fontSize: 14,
          fontWeight: 600,
          borderRadius: 999,
          border: "1px solid rgba(26,26,46,0.12)",
          background: canGoBack ? "#FFFFFF" : "#F5F3EF",
          color: canGoBack ? "#1A1A2E" : "#9CA3AF",
          cursor: canGoBack ? "pointer" : "not-allowed",
          fontFamily: "inherit",
        }}
      >
        Retour
      </button>
      <button
        type="button"
        onClick={isLast ? onSubmit : onNext}
        disabled={submitting}
        data-testid={isLast ? "wizard-submit" : "wizard-next"}
        style={{
          padding: "10px 24px",
          fontSize: 14,
          fontWeight: 600,
          borderRadius: 999,
          border: "none",
          background:
            "linear-gradient(135deg, #5B4EC4, #2BA89C)",
          color: "#FFFFFF",
          cursor: submitting ? "wait" : "pointer",
          opacity: submitting ? 0.7 : 1,
          fontFamily: "inherit",
        }}
      >
        {submitting
          ? "Envoi en cours…"
          : isLast
            ? "Envoyer ma demande"
            : "Continuer"}
      </button>
    </div>
  );
}
