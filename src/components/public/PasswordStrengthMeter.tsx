"use client";

/**
 * PasswordStrengthMeter
 *
 * Indicateur visuel de robustesse d'un mot de passe.
 * Critères OWASP (alignés sur le backend `resetPasswordSchema` côté Nami) :
 *   - longueur ≥ 12
 *   - au moins une majuscule
 *   - au moins une minuscule
 *   - au moins un chiffre
 *   - au moins un caractère spécial
 *
 * Score 0-5 → 3 niveaux : Faible / Moyen / Fort.
 * Couleurs : Faible #DC2626, Moyen #F59E0B, Fort #5B4EC4 (violet Nami).
 *
 * A11y : barre `role="progressbar"` + label texte `aria-live="polite"`,
 * pour que les lecteurs d'écran annoncent l'évolution du score
 * sans interrompre la frappe.
 */

const NAMI_VIOLET = "#5B4EC4";
const AMBER = "#F59E0B";
const RED = "#DC2626";
const MUTED = "#E5E7EB";

const RULES = {
  length: /.{12,}/,
  upper: /[A-Z]/,
  lower: /[a-z]/,
  digit: /[0-9]/,
  special: /[^A-Za-z0-9]/,
};

export type PasswordStrengthResult = {
  score: 0 | 1 | 2 | 3 | 4 | 5;
  isValid: boolean;
  missing: string[];
};

export function evaluatePassword(password: string): PasswordStrengthResult {
  const checks: { key: keyof typeof RULES; label: string }[] = [
    { key: "length", label: "12 caractères minimum" },
    { key: "upper", label: "une majuscule" },
    { key: "lower", label: "une minuscule" },
    { key: "digit", label: "un chiffre" },
    { key: "special", label: "un caractère spécial" },
  ];

  const missing: string[] = [];
  let score = 0;
  for (const { key, label } of checks) {
    if (RULES[key].test(password)) {
      score += 1;
    } else {
      missing.push(label);
    }
  }

  return {
    score: score as PasswordStrengthResult["score"],
    isValid: score === 5,
    missing,
  };
}

function getLevel(score: number): { label: string; color: string } {
  if (score === 0) return { label: "—", color: MUTED };
  if (score <= 2) return { label: "Faible", color: RED };
  if (score <= 4) return { label: "Moyen", color: AMBER };
  return { label: "Fort", color: NAMI_VIOLET };
}

type Props = {
  password: string;
  id?: string;
};

export function PasswordStrengthMeter({ password, id = "password-strength" }: Props) {
  const { score, missing } = evaluatePassword(password);
  const level = getLevel(score);
  const showMissing = password.length > 0 && missing.length > 0;
  const segments = 5;

  return (
    <div className="space-y-2">
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={segments}
        aria-valuenow={score}
        aria-label="Robustesse du mot de passe"
        className="flex gap-1"
      >
        {Array.from({ length: segments }).map((_, i) => (
          <div
            key={i}
            className="h-1.5 flex-1 rounded-full transition-colors"
            style={{
              background: i < score ? level.color : MUTED,
            }}
          />
        ))}
      </div>

      <div
        id={id}
        aria-live="polite"
        className="flex items-baseline justify-between text-xs"
      >
        {password.length === 0 ? (
          <span style={{ color: "#6B7280" }}>
            12 caractères, majuscule, minuscule, chiffre, caractère spécial
          </span>
        ) : (
          <>
            <span className="font-semibold" style={{ color: level.color }}>
              {level.label}
            </span>
            {showMissing ? (
              <span className="text-right" style={{ color: "#6B7280" }}>
                Manque : {missing.join(", ")}
              </span>
            ) : (
              <span className="text-right" style={{ color: NAMI_VIOLET }}>
                Mot de passe conforme
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}
