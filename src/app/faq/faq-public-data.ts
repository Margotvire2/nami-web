/**
 * FAQ publique acquisition — données structurées V1.
 *
 * Distinct de /aide (CC #37 authed patient) : ici on adresse les questions
 * de visiteurs PRÉ-signup ("Nami c'est quoi ?", "Mes données sont vendues ?").
 *
 * Wording strictement vérifié (CLAUDE.md + DGCCRF + MDR + ANSM) :
 *   ❌ Aucun "diagnostic", "traitement", "prescription", "guérison"
 *   ❌ Aucun superlatif invérifiable
 *   ❌ Aucun chiffre non sourcé
 *   ❌ Aucun testimonial patient
 *   ✅ "Coordination", "outil de coordination", "rendez-vous", "soignant"
 *   ✅ Mention "non dispositif médical" obligatoire au moins 1x
 *
 * Source officielle pour claims compliance : src/app/(legal)/confidentialite/page.tsx (PR #49).
 */

export type FAQIconName =
  | "compass"
  | "smartphone"
  | "wallet"
  | "shield"
  | "stethoscope"
  | "users";

export interface FAQPublicItem {
  id: string;
  question: string;
  /** Markdown léger : **gras**, *italique*, [texte](url) */
  answerMarkdown: string;
  /** Mots-clés pour la recherche fuzzy basique */
  keywords: string[];
}

export interface FAQPublicCategory {
  id: string;
  title: string;
  iconName: FAQIconName;
  description: string;
  items: FAQPublicItem[];
}

export const FAQ_PUBLIC_CATEGORIES: FAQPublicCategory[] = [
  // ─── 1. Découvrir Nami ────────────────────────────────────────────────────
  {
    id: "decouvrir",
    title: "Découvrir Nami",
    iconName: "compass",
    description: "Qu'est-ce que Nami et à quoi ça sert ?",
    items: [
      {
        id: "decouvrir-quoi",
        question: "Qu'est-ce que Nami ?",
        answerMarkdown:
          "Nami est un **outil de coordination de soins** qui aide les patients et les soignants à organiser le parcours de soin. Nami **n'est pas un dispositif médical** et ne remplace pas une consultation médicale.",
        keywords: ["nami", "quoi", "coordination", "outil"],
      },
      {
        id: "decouvrir-remplace",
        question: "Nami remplace-t-il mon médecin ?",
        answerMarkdown:
          "**Non.** Nami est un outil de coordination — il ne fait aucun diagnostic, ne prescrit aucun traitement et ne remplace jamais votre médecin. Toutes les décisions médicales restent à votre soignant.",
        keywords: ["médecin", "remplace", "remplacer", "consultation"],
      },
      {
        id: "decouvrir-pour-qui",
        question: "À qui s'adresse Nami ?",
        answerMarkdown:
          "Nami s'adresse aux **patients** qui veulent organiser leur parcours, aux **aidants et parents** qui gèrent un suivi pour un proche, et aux **soignants** qui souhaitent mieux coordonner leurs équipes.",
        keywords: ["pour qui", "public", "patient", "aidant", "soignant"],
      },
      {
        id: "decouvrir-difference",
        question: "Quelle différence avec Doctolib ou Maiia ?",
        answerMarkdown:
          "Doctolib et Maiia sont avant tout des outils de **prise de rendez-vous**. Nami ajoute la **coordination après le rendez-vous** : suivi des documents, messages avec votre équipe de soin, vue d'ensemble de votre parcours longitudinal.",
        keywords: ["doctolib", "maiia", "différence", "comparaison"],
      },
      {
        id: "decouvrir-langue",
        question: "Dans quelles langues Nami est-il disponible ?",
        answerMarkdown:
          "Nami est actuellement disponible en **français**. D'autres langues seront ajoutées progressivement selon les besoins exprimés par notre communauté.",
        keywords: ["langue", "français", "anglais", "international"],
      },
    ],
  },

  // ─── 2. Utilisation ───────────────────────────────────────────────────────
  {
    id: "utilisation",
    title: "Utilisation",
    iconName: "smartphone",
    description: "Comment utiliser Nami au quotidien ?",
    items: [
      {
        id: "utilisation-mobile",
        question: "Nami fonctionne-t-il sur mobile ?",
        answerMarkdown:
          "Oui. Nami est conçu **responsive** : vous pouvez l'utiliser depuis votre navigateur sur ordinateur, tablette ou smartphone. Une application mobile dédiée est en cours de développement.",
        keywords: ["mobile", "smartphone", "application", "tablette"],
      },
      {
        id: "utilisation-soignant",
        question: "Mon soignant doit-il être inscrit sur Nami ?",
        answerMarkdown:
          "Oui, pour bénéficier de la coordination complète, votre soignant doit être inscrit. Si ce n'est pas encore le cas, vous pouvez lui en parler — c'est gratuit pour les patients et avantageux pour la coordination.",
        keywords: ["soignant", "inscrit", "compte", "équipe"],
      },
      {
        id: "utilisation-papier",
        question: "Comment ajouter un document papier (ordonnance, bilan) ?",
        answerMarkdown:
          "Scannez ou photographiez votre document avec votre téléphone, puis téléversez le fichier (PDF, JPEG, PNG, WebP — max 10 Mo) dans votre espace **Mes documents**. Votre soignant y accède automatiquement.",
        keywords: ["document", "papier", "scanner", "ordonnance", "photo"],
      },
      {
        id: "utilisation-rappel",
        question: "Vais-je recevoir des rappels de mes rendez-vous ?",
        answerMarkdown:
          "Oui. Vous recevez automatiquement une notification **24 heures avant** et **1 heure avant** votre rendez-vous. Vous pouvez les retrouver dans votre espace **Notifications**.",
        keywords: ["rappel", "notification", "rdv", "alerte"],
      },
    ],
  },

  // ─── 3. Prix et accès ─────────────────────────────────────────────────────
  {
    id: "prix",
    title: "Prix et accès",
    iconName: "wallet",
    description: "Combien ça coûte ?",
    items: [
      {
        id: "prix-patient",
        question: "Nami est-il gratuit pour les patients ?",
        answerMarkdown:
          "**Oui.** L'utilisation de Nami est entièrement gratuite pour les patients : création de compte, prise de rendez-vous, messages avec votre équipe soignante, gestion de vos documents. Aucun frais caché, aucun abonnement.",
        keywords: ["prix", "gratuit", "patient", "coût", "abonnement"],
      },
      {
        id: "prix-soignant",
        question: "Comment Nami est-il financé si c'est gratuit pour les patients ?",
        answerMarkdown:
          "Nami est financé par les abonnements des **soignants et structures de soin** qui utilisent les fonctionnalités avancées (coordination d'équipe, agenda multi-praticiens, parcours structurés). Les patients accèdent gratuitement aux fonctionnalités essentielles.",
        keywords: ["financement", "modèle", "soignant", "abonnement"],
      },
      {
        id: "prix-engagement",
        question: "Y a-t-il un engagement de durée ?",
        answerMarkdown:
          "**Non**, aucun engagement. Vous pouvez créer un compte, l'utiliser ponctuellement ou sur le long terme, et le supprimer à tout moment — votre choix.",
        keywords: ["engagement", "durée", "abonnement"],
      },
      {
        id: "prix-publicite",
        question: "Y a-t-il de la publicité dans Nami ?",
        answerMarkdown:
          "**Non.** Nami ne diffuse aucune publicité, ne vend pas votre attention et ne profile pas vos données pour des annonceurs. Notre modèle reste centré sur la coordination de soins.",
        keywords: ["publicité", "annonceurs", "ad", "tracking"],
      },
    ],
  },

  // ─── 4. Données et sécurité ───────────────────────────────────────────────
  {
    id: "donnees",
    title: "Données et sécurité",
    iconName: "shield",
    description: "Comment mes données sont-elles protégées ?",
    items: [
      {
        id: "donnees-vendues",
        question: "Mes données sont-elles vendues ou partagées ?",
        answerMarkdown:
          "**Non.** Nami ne vend ni ne partage vos données à des tiers (assureurs, employeurs, publicitaires, marketeurs). Vos données restent confidentielles entre vous et les soignants que vous autorisez explicitement.",
        keywords: ["données", "vendues", "partagées", "tiers", "assureurs"],
      },
      {
        id: "donnees-hebergement",
        question: "Où sont stockées mes données de santé ?",
        answerMarkdown:
          "Vos données de santé sont hébergées en France sur une infrastructure certifiée **Hébergeur de Données de Santé (HDS)**, conformément à l'article L.1111-8 du Code de la santé publique. **Aucune donnée de santé n'est transférée hors de l'Union européenne.**",
        keywords: ["hébergement", "france", "hds", "europe", "stockage"],
      },
      {
        id: "donnees-rgpd",
        question: "Quels sont mes droits RGPD ?",
        answerMarkdown:
          "Conformément au RGPD, vous disposez de **6 droits** : accès, rectification, effacement, limitation, portabilité et opposition. Vous pouvez les exercer à tout moment depuis votre espace **Mon compte** une fois connecté(e), ou en écrivant à [contact@namipourlavie.com](mailto:contact@namipourlavie.com).",
        keywords: ["droits", "rgpd", "accès", "rectification", "portabilité"],
      },
      {
        id: "donnees-supprimer",
        question: "Puis-je supprimer mon compte ?",
        answerMarkdown:
          "**Oui, à tout moment.** Depuis votre espace **Mon compte**, vous pouvez demander la suppression définitive de votre compte. Vos données sont alors anonymisées sous **30 jours**, conformément au RGPD Art. 17 (droit à l'effacement).",
        keywords: ["supprimer", "compte", "effacement", "rgpd"],
      },
      {
        id: "donnees-ia",
        question: "Comment l'intelligence artificielle est-elle utilisée ?",
        answerMarkdown:
          "L'IA structure les notes vocales des soignants et génère des brouillons de synthèse pour faciliter la coordination — toujours soumis à validation humaine. Détails complets dans notre [Politique de confidentialité](/confidentialite).",
        keywords: ["ia", "intelligence artificielle", "automatique", "synthèse"],
      },
    ],
  },

  // ─── 5. Soignants ─────────────────────────────────────────────────────────
  {
    id: "soignants",
    title: "Soignants",
    iconName: "stethoscope",
    description: "Comment trouver un soignant ?",
    items: [
      {
        id: "soignants-trouver",
        question: "Comment trouver un soignant sur Nami ?",
        answerMarkdown:
          "Allez sur [Trouver un soignant](/trouver-un-soignant) et recherchez par spécialité, ville ou nom. Vous voyez les profils détaillés, les disponibilités et pouvez prendre rendez-vous directement.",
        keywords: ["trouver", "rechercher", "soignant", "annuaire"],
      },
      {
        id: "soignants-specialites",
        question: "Quelles spécialités sont disponibles ?",
        answerMarkdown:
          "Médecine générale, spécialités médicales (cardiologie, dermatologie, gynécologie, psychiatrie, etc.), professions paramédicales (kinésithérapie, orthophonie, podologie) et soins de support (diététique, psychologie). Le réseau s'élargit régulièrement.",
        keywords: ["spécialités", "métiers", "professions"],
      },
      {
        id: "soignants-pas-trouve",
        question: "Et si mon soignant n'est pas encore sur Nami ?",
        answerMarkdown:
          "Vous pouvez créer votre compte dès maintenant et **lui parler de Nami** — l'inscription est gratuite pour les soignants qui souhaitent simplement référencer leur profil et recevoir des demandes de rendez-vous.",
        keywords: ["soignant", "absent", "pas inscrit", "inviter"],
      },
      {
        id: "soignants-confiance",
        question: "Comment savoir si un soignant est vérifié ?",
        answerMarkdown:
          "Tous les soignants présents sur Nami sont vérifiés via leur **numéro RPPS** (Répertoire Partagé des Professionnels de Santé). Ce numéro est validé auprès des bases officielles avant l'activation du compte.",
        keywords: ["rpps", "vérification", "authentique", "officiel"],
      },
    ],
  },

  // ─── 6. Aidants et proches ────────────────────────────────────────────────
  {
    id: "aidants",
    title: "Aidants et proches",
    iconName: "users",
    description: "Gérer le compte d'un proche",
    items: [
      {
        id: "aidants-enfant",
        question: "Puis-je gérer le compte de mon enfant mineur ?",
        answerMarkdown:
          "**Oui.** En tant que représentant légal, vous pouvez créer un profil délégué pour votre enfant mineur depuis votre propre compte. Vous gérez ses rendez-vous, documents et messages à sa place.",
        keywords: ["enfant", "mineur", "parent", "délégation"],
      },
      {
        id: "aidants-proche-adulte",
        question: "Puis-je accompagner un proche majeur ?",
        answerMarkdown:
          "**Oui, avec son consentement explicite.** Vous pouvez devenir un *profil délégué* pour un proche majeur (parent âgé, conjoint, ami). Votre proche reçoit une notification et accepte le partage. Il peut retirer cet accès à tout moment.",
        keywords: ["proche", "adulte", "consentement", "délégué"],
      },
      {
        id: "aidants-plusieurs",
        question: "Puis-je gérer plusieurs profils ?",
        answerMarkdown:
          "**Oui.** Vous pouvez gérer plusieurs profils délégués depuis un seul compte (par exemple : vos deux enfants + votre mère âgée). Vous basculez d'un profil à l'autre en un clic via le **sélecteur de profil** dans votre espace.",
        keywords: ["plusieurs", "multiprofil", "famille", "switcher"],
      },
      {
        id: "aidants-voit",
        question: "Que voit mon proche de ce que je fais sur son compte ?",
        answerMarkdown:
          "Votre proche voit l'**historique complet** de toutes les actions effectuées en son nom : rendez-vous pris ou annulés, documents ajoutés, messages envoyés. La traçabilité est totale, conformément au RGPD.",
        keywords: ["transparence", "historique", "traçabilité", "voir"],
      },
      {
        id: "aidants-retrait",
        question: "Comment retirer mon accès à un proche ?",
        answerMarkdown:
          "Le proche concerné (ou vous-même) peut retirer l'accès à tout moment depuis **Mon compte → Profils délégués**. L'historique est conservé pour audit, mais vous ne pouvez plus agir au nom de votre proche.",
        keywords: ["retirer", "révoquer", "accès", "fin"],
      },
    ],
  },
];

/** Compteur total pour métriques / affichage */
export const TOTAL_PUBLIC_FAQ_COUNT = FAQ_PUBLIC_CATEGORIES.reduce(
  (acc, c) => acc + c.items.length,
  0,
);
