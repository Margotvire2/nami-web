/**
 * Données figées de l'espace presse Nami.
 *
 * Wording STRICT (CLAUDE.md + DGCCRF + RGPD + MDR) :
 *   ❌ Aucun journaliste nommé / aucun média partenaire cité
 *   ❌ Aucun communiqué inventé — état vide explicite tant que rien n'est paru
 *   ❌ Aucun superlatif DGCCRF ("leader", "n°1", "meilleur", "révolutionnaire")
 *   ❌ Aucun claim DM ("surveillance", "détection", "alerte clinique")
 *   ❌ Aucun claim de certification HDS — formulation "migration HDS prévue 2026"
 *   ✅ Vocabulaire "coordination", "synthèses structurées", "indicateurs de complétude"
 *   ✅ Boilerplate aligné avec /partenaires, /faq, /pour-les-proches, /comment-ca-marche
 *
 * Source canonique compliance :
 *   - Directrice de la publication : Margot Vire (RPPS 10007322976)
 *   - Adresse : Hôpital Américain de Paris, 55 boulevard du Château,
 *               92200 Neuilly-sur-Seine
 *   - Contact : contact@namipourlavie.com
 */

export interface KitMediaItem {
  id: string;
  label: string;
  description: string;
  /** Lien direct vers la ressource ou "#" si à paraître. */
  href: string;
  /** True = ressource publique disponible, false = "À venir". */
  available: boolean;
  /** Indication de format affichée à l'utilisateur. */
  format: string;
}

/**
 * Boilerplate court — utilisé en encart de fin d'article presse.
 * Limite cible : ~50 mots, FR, ton institutionnel sobre.
 */
export const BOILERPLATE_COURT = `Nami est une plateforme française de coordination des parcours de soins complexes destinée aux professionnels de santé et à leurs patients. Nami centralise les informations partagées entre soignants pluri-professionnels, dans le respect du consentement patient et de la réglementation RGPD. Nami n'est pas un dispositif médical.`;

/**
 * Boilerplate long — utilisé en fin de communiqué ou en dossier de presse.
 * Limite cible : ~150 mots, FR, structuré en 3 paragraphes.
 */
export const BOILERPLATE_LONG = `Nami est une plateforme française de coordination des parcours de soins complexes. Elle est destinée aux professionnels de santé pluri-professionnels (médecins, paramédicaux, psychologues, diététiciens) et à leurs patients. Nami centralise dans un espace partagé les informations utiles à la coordination : rendez-vous, documents, échanges sécurisés, indicateurs de complétude du dossier de coordination.

Conçue par une professionnelle de santé en exercice, Nami est complémentaire des dispositifs publics existants (DAC, CPTS, plateformes territoriales) et ne s'y substitue pas. L'usage est encadré par le consentement explicite du patient pour chaque soignant ajouté à son espace de coordination.

Nami est hébergée en France, conforme au RGPD. La migration vers une infrastructure HDS certifiée est prévue en 2026. Nami n'est pas un dispositif médical au sens du règlement (UE) 2017/745 (MDR) et ne se substitue à aucun acte ou avis médical.`;

/**
 * Kit media — 4 ressources standard d'un espace presse.
 * Seul le logo principal est publiquement disponible aujourd'hui
 * (nami-mascot.png présent dans /public). Les autres ressources sont
 * marquées "À venir" tant qu'elles n'ont pas été préparées.
 */
export const KIT_MEDIA_ITEMS: KitMediaItem[] = [
  {
    id: "logo-principal",
    label: "Logo principal Nami",
    description:
      "Identité visuelle Nami, fond transparent, format PNG haute résolution.",
    href: "/nami-mascot.png",
    available: true,
    format: "PNG · ~283 Ko",
  },
  {
    id: "logo-pack",
    label: "Pack logos (variantes)",
    description:
      "Déclinaisons sur fond clair, fond sombre, monochrome, formats SVG et PNG.",
    href: "#",
    available: false,
    format: "À venir · ZIP",
  },
  {
    id: "photos-fondatrice",
    label: "Photos de la fondatrice",
    description:
      "Portraits officiels de Margot Vire, fondatrice de Nami, formats web et print.",
    href: "#",
    available: false,
    format: "À venir · ZIP",
  },
  {
    id: "dossier-presse",
    label: "Dossier de presse complet",
    description:
      "Document de synthèse : contexte, fonctionnalités, gouvernance, chiffres clés vérifiés.",
    href: "#",
    available: false,
    format: "À venir · PDF",
  },
];

/**
 * Communiqués — état vide explicite tant qu'aucun communiqué n'a été
 * publié. NE PAS inventer de communiqué de presse fictif.
 */
export interface Communique {
  id: string;
  date: string;
  title: string;
  href: string;
}

export const COMMUNIQUES: Communique[] = [];

export const COMMUNIQUES_EMPTY_LABEL =
  "Premiers communiqués à paraître à compter de juillet 2026.";

/**
 * Coordonnées institutionnelles — source unique pour la page presse.
 * Référence : CLAUDE.md + /(legal)/mentions-legales + /(legal)/confidentialite.
 */
export const PRESSE_CONTACT = {
  directricePublication: "Margot Vire",
  rpps: "10007322976",
  email: "contact@namipourlavie.com",
  mailtoSubject: "%5BPRESSE%5D%20Demande%20d%27information",
  adresseLigne1: "Hôpital Américain de Paris",
  adresseLigne2: "55 boulevard du Château",
  adresseLigne3: "92200 Neuilly-sur-Seine, France",
  hebergement: "Hébergement en France · Migration HDS certifiée prévue en 2026",
} as const;
