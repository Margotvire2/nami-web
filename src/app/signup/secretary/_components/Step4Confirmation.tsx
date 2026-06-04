"use client";

// F-SECRETAIRE-SIGNUP-FLOW-V1 — Step 4 : récap + message + soumission.

import type { ProviderSearchLightResult } from "@/lib/api";

export interface Step4Values {
  requestMessage: string;
  acceptedRGPD:   boolean;
}

export function Step4Confirmation({
  email,
  firstName,
  lastName,
  selectedProviders,
  values,
  onChange,
}: {
  email:             string;
  firstName:         string;
  lastName:          string;
  selectedProviders: ProviderSearchLightResult[];
  values:            Step4Values;
  onChange:          <K extends keyof Step4Values>(field: K, value: Step4Values[K]) => void;
}) {
  return (
    <section className="space-y-4">
      <h2
        className="text-xl font-extrabold"
        style={{ color: "#1A1A2E", fontFamily: "var(--font-jakarta)" }}
      >
        Validation.
      </h2>
      <p className="text-sm" style={{ color: "#6B7280" }}>
        Vérifiez votre récapitulatif avant d&apos;envoyer vos demandes de
        rattachement.
      </p>

      {/* Récap identité */}
      <div
        className="rounded-xl p-4 space-y-2"
        style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.06)" }}
      >
        <p className="text-[11px] uppercase tracking-wider font-semibold" style={{ color: "#94A3B8" }}>
          Votre compte
        </p>
        <p className="text-sm font-semibold" style={{ color: "#1A1A2E" }}>
          {firstName} {lastName}
        </p>
        <p className="text-xs" style={{ color: "#6B7280" }}>{email}</p>
      </div>

      {/* Récap soignants */}
      <div
        className="rounded-xl p-4 space-y-2"
        style={{ background: "#fff", border: "1px solid rgba(26,26,46,0.06)" }}
      >
        <p
          className="text-[11px] uppercase tracking-wider font-semibold"
          style={{ color: "#94A3B8" }}
        >
          Soignants à rattacher ({selectedProviders.length})
        </p>
        <ul className="space-y-1.5">
          {selectedProviders.map((p) => (
            <li key={p.id} className="flex items-center justify-between gap-2 text-sm">
              <span style={{ color: "#1A1A2E" }} className="font-medium">
                {p.firstName} {p.lastName}
              </span>
              <span style={{ color: "#6B7280" }} className="text-xs">
                {p.profession ?? "Soignant"}
                {p.city ? ` · ${p.city}` : ""}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Message optionnel */}
      <div className="space-y-1.5">
        <label
          htmlFor="secretary-message"
          className="text-sm font-medium"
          style={{ color: "#1A1A2E" }}
        >
          Message à joindre à votre demande{" "}
          <span style={{ color: "#B0B0BA", fontWeight: 400 }}>(optionnel)</span>
        </label>
        <textarea
          id="secretary-message"
          rows={3}
          value={values.requestMessage}
          maxLength={1000}
          onChange={(e) => onChange("requestMessage", e.target.value)}
          placeholder="Bonjour, je suis assistante médicale au cabinet…"
          className="w-full rounded-xl border-0 px-4 py-3 text-sm resize-y"
          style={{ background: "#F5F3EF", color: "#1A1A2E" }}
        />
        <p className="text-xs" style={{ color: "#6B7280" }}>
          {values.requestMessage.length} / 1000
        </p>
      </div>

      {/* RGPD */}
      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={values.acceptedRGPD}
          onChange={(e) => onChange("acceptedRGPD", e.target.checked)}
          className="mt-0.5"
        />
        <span className="text-sm" style={{ color: "#374151" }}>
          Je consens au traitement de mes données pour la gestion de mes
          rattachements aux soignants (RGPD Art. 6.1.b — exécution contractuelle).
        </span>
      </label>

      <div
        className="rounded-xl p-4 text-xs leading-relaxed"
        style={{
          background: "#EEEDFB",
          border: "1px solid rgba(91,78,196,0.2)",
          color: "#374151",
        }}
      >
        Tant qu&apos;aucun soignant n&apos;a accepté votre demande, vous n&apos;avez
        accès à aucun dossier patient. Vous pourrez relancer vos demandes ou en
        retirer depuis votre espace.
      </div>
    </section>
  );
}

export function step4Valid(v: Step4Values): boolean {
  return v.acceptedRGPD;
}
