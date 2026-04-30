/**
 * Normalise la valeur de sexe stockée en DB.
 * Valeurs observées en prod : "F", "M", "FEMALE", "MALE", null.
 */
export function normalizeSex(raw: string | null | undefined): "F" | "M" | null {
  if (!raw) return null;
  const v = raw.trim().toUpperCase();
  if (v === "F" || v === "FEMALE" || v === "FEMME" || v === "FEMININE" || v === "FÉMININ") return "F";
  if (v === "M" || v === "MALE" || v === "HOMME" || v === "MASCULIN") return "M";
  return null;
}

/** "Féminin" | "Masculin" | "Sexe non renseigné" */
export function labelSex(raw: string | null | undefined): string | null {
  const norm = normalizeSex(raw);
  if (norm === "F") return "Féminin";
  if (norm === "M") return "Masculin";
  return null;
}

/** "F" | "M" | null */
export function shortSex(raw: string | null | undefined): string | null {
  return normalizeSex(raw);
}
