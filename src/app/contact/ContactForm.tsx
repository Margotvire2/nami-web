"use client";

import { useState } from "react";
import { Send, CheckCircle2, AlertTriangle, PhoneCall } from "lucide-react";

/**
 * Formulaire de contact support — F-PAGE-CONTACT-SUPPORT-V1.
 *
 * Wording MDR safe (cf. CLAUDE.md nami-web) :
 * - aucun terme clinique (alerte / surveillance / risque)
 * - bannière urgence vitale : 15 / 112 / 3114 (psy)
 * - délai indicatif de réponse 48h ouvrées, non engageant
 *
 * Discipline anti-spam :
 * - validation client (nom, email, sujet, message ≥ 10 caractères)
 * - le POST /api/contact-support applique un rate limit serveur (IP).
 */

export const CONTACT_SUBJECTS = [
  { value: "patient", label: "Je suis patient ou proche d'un patient" },
  { value: "soignant", label: "Je suis professionnel de santé" },
  { value: "compte", label: "Question sur mon compte" },
  { value: "rgpd", label: "Protection des données (RGPD)" },
  { value: "partenariat", label: "Partenariat ou institutionnel" },
  { value: "autre", label: "Autre" },
] as const;

export type ContactSubjectValue = (typeof CONTACT_SUBJECTS)[number]["value"];

export interface ContactFormValues {
  name: string;
  email: string;
  subject: ContactSubjectValue | "";
  message: string;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

export function isValidSubject(value: string): value is ContactSubjectValue {
  return CONTACT_SUBJECTS.some((s) => s.value === value);
}

export function validateContactForm(values: ContactFormValues): Record<string, string> {
  const errors: Record<string, string> = {};
  if (values.name.trim().length < 2) {
    errors.name = "Merci d'indiquer votre nom (2 caractères min).";
  }
  if (!isValidEmail(values.email)) {
    errors.email = "Merci d'indiquer un email valide.";
  }
  if (!isValidSubject(values.subject)) {
    errors.subject = "Merci de choisir un sujet.";
  }
  if (values.message.trim().length < 10) {
    errors.message = "Votre message doit contenir au moins 10 caractères.";
  }
  if (values.message.length > 4000) {
    errors.message = "Votre message dépasse 4000 caractères.";
  }
  return errors;
}

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success" }
  | { kind: "error"; message: string };

export function ContactForm() {
  const [values, setValues] = useState<ContactFormValues>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const setField = <K extends keyof ContactFormValues>(key: K, value: ContactFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) {
      const next = { ...errors };
      delete next[key];
      setErrors(next);
    }
  };

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const validation = validateContactForm(values);
    setErrors(validation);
    if (Object.keys(validation).length > 0) return;

    setStatus({ kind: "submitting" });
    try {
      const res = await fetch("/api/contact-support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: values.name.trim(),
          email: values.email.trim(),
          subject: values.subject,
          message: values.message.trim(),
        }),
      });
      if (res.status === 429) {
        setStatus({
          kind: "error",
          message:
            "Trop de demandes envoyées depuis votre connexion. Merci de réessayer dans une heure ou écrivez directement à support@namipourlavie.com.",
        });
        return;
      }
      if (!res.ok) {
        const data = (await res.json().catch(() => null)) as { error?: string } | null;
        setStatus({
          kind: "error",
          message:
            data?.error ??
            "Une erreur est survenue. Vous pouvez écrire directement à support@namipourlavie.com.",
        });
        return;
      }
      setStatus({ kind: "success" });
      setValues({ name: "", email: "", subject: "", message: "" });
    } catch {
      setStatus({
        kind: "error",
        message:
          "Réseau indisponible. Vous pouvez écrire directement à support@namipourlavie.com.",
      });
    }
  }

  const inputClasses =
    "w-full rounded-lg border border-[#E8ECF4] bg-white px-3 py-2.5 text-sm text-[#1A1A2E] placeholder:text-[#9CA3AF] focus:border-[#5B4EC4] focus:outline-none focus:ring-2 focus:ring-[#5B4EC4]/20";

  return (
    <section
      aria-labelledby="contact-form-title"
      className="border-t border-[#E8ECF4] bg-[#FAFAF8]"
    >
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Infos contact + urgence */}
          <aside className="lg:col-span-1">
            <h2
              id="contact-form-title"
              className="text-2xl font-bold tracking-tight text-[#1A1A2E] sm:text-3xl"
              style={{ fontFamily: "var(--font-jakarta), system-ui, sans-serif" }}
            >
              Écrire au support
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-[#374151]">
              Notre équipe vous répond sous 48 heures ouvrées en moyenne. Pour les questions
              générales, vous pouvez aussi écrire à{" "}
              <a
                href="mailto:support@namipourlavie.com"
                className="font-semibold text-[#5B4EC4] underline-offset-4 hover:underline"
              >
                support@namipourlavie.com
              </a>
              .
            </p>

            <div
              role="note"
              aria-label="En cas d'urgence vitale"
              className="mt-6 rounded-xl border border-[#FECACA] bg-[#FEF2F2] p-4"
            >
              <div className="flex items-center gap-2">
                <PhoneCall size={16} strokeWidth={2} className="text-[#DC2626]" aria-hidden="true" />
                <p className="text-sm font-semibold text-[#7F1D1D]">
                  En cas d&apos;urgence vitale
                </p>
              </div>
              <p className="mt-2 text-xs leading-relaxed text-[#7F1D1D]">
                Le formulaire n&apos;est pas un canal d&apos;urgence. Appelez le{" "}
                <strong>15</strong> (SAMU) ou le <strong>112</strong> (urgences européennes).
                Pour une souffrance psychologique, le numéro national de prévention du suicide
                est le <strong>3114</strong> (24h/24, gratuit).
              </p>
            </div>

            <p className="mt-6 text-xs text-[#6B7280]">
              Nami n&apos;est pas un dispositif médical. Les échanges via ce formulaire ne se
              substituent pas à une consultation.
            </p>
          </aside>

          {/* Formulaire */}
          <form
            onSubmit={handleSubmit}
            noValidate
            aria-describedby={status.kind === "error" ? "contact-form-error" : undefined}
            className="rounded-2xl border border-[#E8ECF4] bg-white p-6 sm:p-8 lg:col-span-2"
          >
            {status.kind === "success" ? (
              <div
                role="status"
                aria-live="polite"
                className="flex flex-col items-start gap-3 rounded-xl border border-[#A7F3D0] bg-[#ECFDF5] p-6"
              >
                <div className="flex items-center gap-2">
                  <CheckCircle2 size={20} strokeWidth={2} className="text-[#059669]" aria-hidden="true" />
                  <p className="text-base font-semibold text-[#065F46]">Message envoyé</p>
                </div>
                <p className="text-sm leading-relaxed text-[#065F46]">
                  Merci, votre message est bien arrivé. Nous revenons vers vous sous 48 heures
                  ouvrées à l&apos;adresse que vous avez indiquée.
                </p>
                <button
                  type="button"
                  onClick={() => setStatus({ kind: "idle" })}
                  className="mt-2 inline-flex items-center gap-2 rounded-lg bg-[#5B4EC4] px-4 py-2 text-sm font-semibold text-white hover:bg-[#4D42AE]"
                >
                  Écrire un autre message
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#374151]"
                    >
                      Nom et prénom
                    </label>
                    <input
                      id="contact-name"
                      name="name"
                      type="text"
                      autoComplete="name"
                      required
                      maxLength={120}
                      aria-invalid={Boolean(errors.name)}
                      aria-describedby={errors.name ? "contact-name-error" : undefined}
                      value={values.name}
                      onChange={(e) => setField("name", e.target.value)}
                      className={inputClasses}
                      placeholder="Margot Vire"
                    />
                    {errors.name && (
                      <p id="contact-name-error" className="mt-1 text-xs text-[#DC2626]">
                        {errors.name}
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#374151]"
                    >
                      Email
                    </label>
                    <input
                      id="contact-email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      maxLength={200}
                      aria-invalid={Boolean(errors.email)}
                      aria-describedby={errors.email ? "contact-email-error" : undefined}
                      value={values.email}
                      onChange={(e) => setField("email", e.target.value)}
                      className={inputClasses}
                      placeholder="vous@exemple.fr"
                    />
                    {errors.email && (
                      <p id="contact-email-error" className="mt-1 text-xs text-[#DC2626]">
                        {errors.email}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="contact-subject"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#374151]"
                  >
                    Sujet
                  </label>
                  <select
                    id="contact-subject"
                    name="subject"
                    required
                    aria-invalid={Boolean(errors.subject)}
                    aria-describedby={errors.subject ? "contact-subject-error" : undefined}
                    value={values.subject}
                    onChange={(e) => setField("subject", e.target.value as ContactSubjectValue)}
                    className={inputClasses}
                  >
                    <option value="" disabled>
                      — Choisir un sujet —
                    </option>
                    {CONTACT_SUBJECTS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                  {errors.subject && (
                    <p id="contact-subject-error" className="mt-1 text-xs text-[#DC2626]">
                      {errors.subject}
                    </p>
                  )}
                </div>

                <div className="mt-4">
                  <label
                    htmlFor="contact-message"
                    className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#374151]"
                  >
                    Votre message
                  </label>
                  <textarea
                    id="contact-message"
                    name="message"
                    required
                    rows={6}
                    minLength={10}
                    maxLength={4000}
                    aria-invalid={Boolean(errors.message)}
                    aria-describedby={errors.message ? "contact-message-error" : "contact-message-hint"}
                    value={values.message}
                    onChange={(e) => setField("message", e.target.value)}
                    className={inputClasses}
                    placeholder="Décrivez votre demande en quelques phrases. Merci de ne pas inclure d'informations cliniques sensibles."
                  />
                  <p id="contact-message-hint" className="mt-1 text-xs text-[#6B7280]">
                    {values.message.length}/4000 caractères. Évitez les informations cliniques
                    sensibles dans ce formulaire — utilisez votre espace patient pour cela.
                  </p>
                  {errors.message && (
                    <p id="contact-message-error" className="mt-1 text-xs text-[#DC2626]">
                      {errors.message}
                    </p>
                  )}
                </div>

                {status.kind === "error" && (
                  <div
                    id="contact-form-error"
                    role="alert"
                    className="mt-4 flex items-start gap-2 rounded-lg border border-[#FECACA] bg-[#FEF2F2] p-3 text-sm text-[#7F1D1D]"
                  >
                    <AlertTriangle size={16} strokeWidth={2} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span>{status.message}</span>
                  </div>
                )}

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <button
                    type="submit"
                    disabled={status.kind === "submitting"}
                    className="inline-flex items-center gap-2 rounded-lg bg-[#5B4EC4] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#4D42AE] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#5B4EC4]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <Send size={14} strokeWidth={2.25} aria-hidden="true" />
                    {status.kind === "submitting" ? "Envoi en cours…" : "Envoyer le message"}
                  </button>
                  <p className="text-xs text-[#6B7280]">
                    En envoyant ce formulaire, vous acceptez le traitement de vos données pour la
                    réponse à votre demande (base légale : intérêt légitime, RGPD art. 6.1.f).
                  </p>
                </div>
              </>
            )}
          </form>
        </div>
      </div>
    </section>
  );
}
