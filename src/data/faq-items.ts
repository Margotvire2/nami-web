/**
 * F-PAGE-FAQ-PATIENT-V1 — Données structurées FAQ patient (acquisition + assistance).
 *
 * Cible : visiteurs et patients pré/post-signup. 20 questions essentielles V1.
 *
 * Wording strictement vérifié (CLAUDE.md nami-web + DGCCRF + MDR + ANSM + AI Act) :
 *   ❌ Aucun "alerte", "surveillance", "diagnostic", "anormal", "risque clinique"
 *   ❌ Aucun superlatif invérifiable, aucun chiffre non sourcé
 *   ❌ Aucun testimonial patient
 *   ✅ "Coordination", "outil de coordination", "rendez-vous", "soignant", "dossier de coordination"
 *   ✅ Mention "non dispositif médical" obligatoire (FAQ-COMPLIANCE-DM)
 *   ✅ Lien AI Act pour la question DM/IA (FAQ-COMPLIANCE-AI)
 *
 * Source canonique pour claims compliance : src/app/(legal)/confidentialite/page.tsx
 * et src/app/(legal)/ai-act/page.tsx.
 */

export type FAQIconName =
  | "compass"
  | "smartphone"
  | "wallet"
  | "shield"
  | "stethoscope"
  | "users";

export interface FAQItem {
  id: string;
  question: string;
  /** Markdown léger supporté : **gras**, *italique*, [texte](url) */
  answerMarkdown: string;
  /** Mots-clés pour la recherche fuzzy basique */
  keywords: string[];
}

export interface FAQSectionData {
  id: string;
  title: string;
  iconName: FAQIconName;
  description: string;
  items: FAQItem[];
}

export const FAQ_SECTIONS: FAQSectionData[] = [
  // ─── 1. Premiers pas (5) ──────────────────────────────────────────────────
  {
    id: "premiers-pas",
    title: "Premiers pas",
    iconName: "compass",
    description: "Découvrir Nami et créer son compte",
    items: [
      {
        id: "creer-compte",
        question: "Comment créer mon compte ?",
        answerMarkdown:
          "Allez sur [créer un compte patient](/signup?role=patient) et renseignez votre email, un mot de passe et votre date de naissance. Vous recevez un email de confirmation, puis vous accédez à votre espace personnel pour ajouter votre équipe de soin.",
        keywords: ["créer", "compte", "inscription", "signup", "email"],
      },
      {
        id: "quoi-nami",
        question: "Qu'est-ce que Nami ?",
        answerMarkdown:
          "Nami est un **outil de coordination de soins** qui aide les patients et leurs soignants à organiser le parcours de soin (rendez-vous, documents, messages). Nami **n'est pas un dispositif médical** et ne remplace pas une consultation médicale.",
        keywords: ["nami", "quoi", "coordination", "définition"],
      },
      {
        id: "remplace-medecin",
        question: "Nami remplace-t-il mon médecin ?",
        answerMarkdown:
          "**Non.** Nami est un outil de coordination — il ne fait aucun diagnostic, ne prescrit aucun traitement et ne remplace jamais votre médecin. Toutes les décisions médicales restent à votre soignant.",
        keywords: ["médecin", "remplace", "consultation", "décision"],
      },
      {
        id: "pour-qui",
        question: "À qui s'adresse Nami ?",
        answerMarkdown:
          "Nami s'adresse aux **patients** qui veulent organiser leur parcours, aux **aidants et parents** qui gèrent un suivi pour un proche, et aux **soignants** qui souhaitent mieux coordonner leurs équipes pluridisciplinaires.",
        keywords: ["pour qui", "public", "patient", "aidant", "soignant"],
      },
      {
        id: "mobile",
        question: "Nami fonctionne-t-il sur mobile ?",
        answerMarkdown:
          "Oui. Nami est conçu **responsive** : vous pouvez l'utiliser depuis votre navigateur sur ordinateur, tablette ou smartphone. Une application mobile dédiée est en cours de développement.",
        keywords: ["mobile", "smartphone", "application", "tablette"],
      },
    ],
  },

  // ─── 2. Mon parcours et mon équipe (4) ────────────────────────────────────
  {
    id: "parcours-equipe",
    title: "Mon parcours et mon équipe",
    iconName: "stethoscope",
    description: "Organiser son équipe de soin et son parcours",
    items: [
      {
        id: "ajouter-soignant",
        question: "Comment ajouter un soignant à mon parcours ?",
        answerMarkdown:
          "Depuis votre espace, allez dans **Mon équipe → Ajouter un soignant**. Vous pouvez rechercher un professionnel par nom ou spécialité sur l'[annuaire Nami](/trouver-un-soignant), ou inviter par email un soignant qui n'a pas encore de compte. Votre soignant reçoit une notification et accepte le partage.",
        keywords: ["ajouter", "soignant", "équipe", "inviter", "parcours"],
      },
      {
        id: "soignant-pas-inscrit",
        question: "Et si mon soignant n'est pas encore sur Nami ?",
        answerMarkdown:
          "Vous pouvez l'**inviter par email** depuis votre espace. L'inscription est gratuite pour un soignant qui souhaite simplement référencer son profil et recevoir des demandes de rendez-vous. Vous pouvez aussi lui en parler en consultation.",
        keywords: ["soignant", "absent", "inviter", "email"],
      },
      {
        id: "ajouter-document",
        question: "Comment ajouter un document papier (ordonnance, bilan) ?",
        answerMarkdown:
          "Scannez ou photographiez votre document, puis téléversez-le (PDF, JPEG, PNG, WebP — max 10 Mo) dans votre espace **Mes documents**. Les soignants de votre équipe y accèdent automatiquement selon les autorisations que vous avez données.",
        keywords: ["document", "ordonnance", "bilan", "papier", "scanner"],
      },
      {
        id: "rappels-rdv",
        question: "Vais-je recevoir des rappels de mes rendez-vous ?",
        answerMarkdown:
          "Oui. Vous recevez automatiquement une notification organisationnelle **24 heures avant** et **1 heure avant** votre rendez-vous. Vous pouvez les retrouver dans votre espace **Notifications**.",
        keywords: ["rappel", "notification", "rdv", "rendez-vous"],
      },
    ],
  },

  // ─── 3. Mes données (5) ───────────────────────────────────────────────────
  {
    id: "donnees",
    title: "Mes données",
    iconName: "shield",
    description: "Confidentialité, sécurité et droits RGPD",
    items: [
      {
        id: "qui-voit-documents",
        question: "Qui voit mes documents médicaux ?",
        answerMarkdown:
          "**Vous seul·e** par défaut. Vos documents ne sont visibles que par les soignants à qui vous avez **explicitement donné accès** dans votre équipe de soin. Vous pouvez retirer cet accès à tout moment depuis **Mon équipe → Autorisations**. Aucun document n'est partagé sans votre consentement.",
        keywords: ["voir", "documents", "confidentialité", "accès", "partage"],
      },
      {
        id: "hds",
        question: "Mes données sont-elles sécurisées (HDS) ?",
        answerMarkdown:
          "Oui. Vos données de santé sont hébergées en France sur une infrastructure certifiée **Hébergeur de Données de Santé (HDS)**, conformément à l'article L.1111-8 du Code de la santé publique. Les échanges sont chiffrés (TLS 1.3) et **aucune donnée de santé n'est transférée hors de l'Union européenne**.",
        keywords: ["hds", "sécurité", "hébergement", "france", "chiffrement"],
      },
      {
        id: "donnees-vendues",
        question: "Mes données sont-elles vendues ou partagées ?",
        answerMarkdown:
          "**Non.** Nami ne vend ni ne partage vos données à des tiers (assureurs, employeurs, publicitaires). Il n'y a **aucune publicité** dans Nami. Vos données restent confidentielles entre vous et les soignants que vous autorisez explicitement.",
        keywords: ["vendues", "partagées", "tiers", "publicité", "assureurs"],
      },
      {
        id: "supprimer-compte",
        question: "Puis-je supprimer mon compte ?",
        answerMarkdown:
          "**Oui, à tout moment.** Depuis votre espace **Mon compte → Supprimer mon compte**, vous pouvez demander la suppression définitive. Vos données sont anonymisées sous **30 jours**, conformément au RGPD Art. 17 (droit à l'effacement). Plus de détails dans notre [politique de confidentialité](/confidentialite).",
        keywords: ["supprimer", "compte", "effacement", "rgpd", "droit"],
      },
      {
        id: "que-devient-contenu",
        question: "Que devient mon contenu si je résilie ou supprime mon compte ?",
        answerMarkdown:
          "Vos documents et messages sont **anonymisés ou supprimés sous 30 jours**. Avant suppression, vous pouvez **exporter l'intégralité de votre contenu** (documents, historique, messages) au format ZIP depuis **Mon compte → Exporter mes données** — c'est votre droit à la portabilité (RGPD Art. 20).",
        keywords: ["résilier", "supprimer", "export", "portabilité", "contenu"],
      },
    ],
  },

  // ─── 4. IA et coordination (3) ────────────────────────────────────────────
  {
    id: "ia",
    title: "Intelligence artificielle",
    iconName: "compass",
    description: "Comment l'IA est utilisée — et ses limites",
    items: [
      {
        id: "ia-utilisee-comment",
        question: "Comment l'intelligence artificielle est-elle utilisée ?",
        answerMarkdown:
          "L'IA aide les **soignants** à structurer leurs notes vocales et à générer des **brouillons de synthèse** pour faciliter la coordination de votre dossier. Chaque sortie IA est étiquetée comme **« Brouillon IA — à vérifier »** et est **toujours validée par un humain** avant d'être intégrée à votre dossier de coordination.",
        keywords: ["ia", "intelligence artificielle", "synthèse", "brouillon"],
      },
      {
        id: "ia-peut-se-tromper",
        question: "L'IA peut-elle se tromper ?",
        answerMarkdown:
          "**Oui.** Comme tout outil automatique, l'IA peut produire des résultats imprécis ou incomplets. C'est pourquoi **chaque sortie IA est étiquetée comme brouillon** et doit être **relue et validée par un soignant humain** avant intégration au dossier. Aucune décision médicale n'est prise par l'IA seule.",
        keywords: ["ia", "erreur", "tromper", "fiabilité", "validation"],
      },
      {
        id: "dispositif-medical",
        question: "Nami est-il un dispositif médical ?",
        answerMarkdown:
          "**Non.** Nami est un **outil de coordination** et **n'est pas un dispositif médical** au sens du règlement européen MDR 2017/745. Nami ne fait pas de diagnostic, ne prescrit pas de traitement et ne se substitue pas à un avis médical. Notre IA est conforme à l'[AI Act européen](/ai-act) (catégorie « risque limité ») : transparence, supervision humaine et traçabilité.",
        keywords: ["dispositif médical", "dm", "mdr", "ai act", "régulation"],
      },
    ],
  },

  // ─── 5. Prix et aidants (3) ───────────────────────────────────────────────
  {
    id: "prix-aidants",
    title: "Prix et accompagnement d'un proche",
    iconName: "wallet",
    description: "Tarifs, gratuité pilote et profils délégués",
    items: [
      {
        id: "prix-patient",
        question: "Combien coûte Nami pour les patients ?",
        answerMarkdown:
          "**Nami est entièrement gratuit pour les patients** : création de compte, rendez-vous, messages, documents. Aucun frais caché, aucun abonnement. Pendant la phase pilote (V1), toutes les fonctionnalités patient restent gratuites — y compris les profils délégués pour vos proches.",
        keywords: ["prix", "gratuit", "patient", "coût", "pilote"],
      },
      {
        id: "gerer-enfant",
        question: "Puis-je gérer le compte de mon enfant mineur ?",
        answerMarkdown:
          "**Oui.** En tant que représentant légal, vous pouvez créer un profil délégué pour votre enfant mineur depuis votre propre compte. Vous gérez ses rendez-vous, documents et messages à sa place. À sa majorité, il peut reprendre la main sur son compte.",
        keywords: ["enfant", "mineur", "parent", "délégation"],
      },
      {
        id: "accompagner-proche",
        question: "Puis-je accompagner un proche majeur ?",
        answerMarkdown:
          "**Oui, avec son consentement explicite.** Vous pouvez devenir un *profil délégué* pour un proche majeur (parent âgé, conjoint). Votre proche reçoit une notification et accepte le partage. Il voit l'historique complet de vos actions et peut retirer cet accès à tout moment.",
        keywords: ["proche", "adulte", "consentement", "délégué", "aidant"],
      },
    ],
  },
];

/** Compteur total pour métriques / affichage / tests */
export const TOTAL_FAQ_ITEMS = FAQ_SECTIONS.reduce(
  (acc, c) => acc + c.items.length,
  0,
);
