/**
 * Provider slug helpers — frontend.
 *
 * INIT-672 / SMOKE C1 : reflète `src/lib/providerSlug.ts` côté backend pour
 * permettre une redirection 308 quand un visiteur arrive sur un ancien slug
 * (cf. `app/soignants/[slug]/page.tsx`).
 *
 * Le slug canonique est désormais émis par l'API
 * (`/providers/public`) — le frontend n'a donc pas à le recalculer pour le
 * cas nominal. Cette fonction sert UNIQUEMENT à reconnaître un slug LEGACY
 * arrivant sur la fiche (lien externe SEO, marque-page, etc.) et à émettre
 * la redirection vers le slug canonique fourni par l'API.
 */

/**
 * Ancien algo (DEPRECATED côté backend, conservé ici pour le matching legacy).
 *   `${firstName-lastName-normalise}-${providerId.slice(-6)}`
 *
 * Bug d'origine : pour les IDs lisibles type "seed-pp-dr-laurent",
 * `id.slice(-6)` renvoie "aurent" (la fin du nom) — collision visible dans le
 * slug final "francois-laurent-aurent". Le nouvel algo backend remplace ce
 * suffix par un hash SHA-256.
 */
export function buildLegacyProviderSlug(
  firstName: string,
  lastName: string,
  providerId: string,
): string {
  const base = `${firstName}-${lastName}`
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9-]/g, "-")
    .replace(/-+/g, "-");
  return `${base}-${providerId.slice(-6)}`;
}
