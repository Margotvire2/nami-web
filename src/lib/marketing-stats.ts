// Source unique pour le nombre de professionnels de santé en France
// affiché dans les pages publiques (marketing, SEO, annuaire, cockpit).
//
// Référence : Ameli — Open Data professionnels de santé (data.gouv.fr).
// Ne jamais hardcoder ce chiffre ailleurs : importer ces constantes.
// La volumétrie technique réelle de la base ANS interne (admin/donnees)
// est un autre indicateur, distinct de la promesse publique.

export const PROVIDERS_COUNT = 564000;
export const PROVIDERS_COUNT_LABEL = "564 000+";
export const PROVIDERS_COUNT_SOURCE = "Source : Ameli (data.gouv.fr)";
export const PROVIDERS_COUNT_LABEL_FULL = `${PROVIDERS_COUNT_LABEL} professionnels de santé en France`;
