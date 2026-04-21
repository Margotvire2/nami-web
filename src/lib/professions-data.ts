export interface ProfessionConfig {
  slug: string;
  name: string;
  badge: string;
  heroLine1: string;
  heroLine2: string;
  heroDesc: string;
  caseTitle: string;
  caseIntro: string;
  steps: Array<{ title: string; desc: string }>;
  features: Array<{ icon: string; title: string; desc: string }>;
  faqs: Array<{ q: string; a: string }>;
  pricingBadge: string;
  pricingNote: string;
  ctaLine1: string;
  ctaLine2: string;
  seoTitle: string;
  seoDesc: string;
}

const PROFESSIONS: ProfessionConfig[] = [
  {
    slug: "dieteticien",
    name: "Diététicien-nutritionniste",
    badge: "Pour les diététiciens-nutritionnistes",
    heroLine1: "Vous coordonnez déjà.",
    heroLine2: "Rendez-le visible.",
    heroDesc:
      "Médecin traitant, endocrinologue, psychologue, APA : vous travaillez déjà avec eux. Nami structure cette coordination pour que chaque soignant voie ce que les autres ont fait. Un seul espace, un seul parcours.",
    caseTitle: "Gabrielle, 16 ans. Anorexie mentale.",
    caseIntro:
      "5 soignants la suivent en ambulatoire : vous (diététicienne), son médecin traitant, une psychologue, un endocrinologue, un éducateur APA. Aujourd'hui, chacun travaille dans son coin. Avec Nami, chacun voit ce que les autres ont fait, sans sortir de son cabinet.",
    steps: [
      {
        title: "Vous dictez votre consultation",
        desc: "En fin de séance, vous dictez vos observations. L'IA transcrit, structure en brouillon sourcé. Vous relisez, vous validez. 2 minutes au lieu de 15.",
      },
      {
        title: "L'équipe voit vos observations",
        desc: "Le médecin traitant voit que vous avez noté une baisse d'apport protéique. La psychologue voit que l'humeur en séance est stable. L'endocrino vérifie les résultats bio. Chacun a le contexte.",
      },
      {
        title: "Gabrielle avance dans son parcours",
        desc: "Sur son app, Gabrielle voit son équipe, ses prochains RDV, sa progression. Elle renseigne ses repas avec des photos, l'IA structure, vous recevez un récapitulatif avant la prochaine séance.",
      },
      {
        title: "Personne ne se perd en chemin",
        desc: "L'indicateur de complétude montre que le bilan endocrino trimestriel est en retard. Vous adressez un rappel via Nami. La chaîne ne se casse plus.",
      },
    ],
    features: [
      { icon: "🎙️", title: "Dictez, l'IA structure", desc: "Dictez vos observations en fin de consultation. L'IA transcrit et produit un brouillon structuré, sourcé HAS et FFAB. Vous validez." },
      { icon: "👥", title: "Vue équipe en temps réel", desc: "Chaque soignant de l'équipe voit les dernières observations, les résultats bio, les prochaines étapes. Tout le monde a les mêmes cartes." },
      { icon: "📸", title: "Photos repas par le patient", desc: "Votre patient photographie ses repas. L'IA structure un récapitulatif nutritionnel. Vous arrivez en consultation avec un aperçu de la semaine." },
      { icon: "📋", title: "Adressage en un clic", desc: "Adressez un patient vers un endocrinologue avec tout le contexte clinique. Le confrère reçoit le dossier structuré, pas un post-it." },
      { icon: "📊", title: "Extraction bio automatique", desc: "Scannez les résultats biologiques de votre patient. Nami structure les données et les intègre au dossier. Plus de saisie manuelle." },
      { icon: "✅", title: "Indicateur de complétude", desc: "Nami identifie les étapes manquantes du parcours HAS : bilan initial, consultations de suivi, examens complémentaires. Rien ne se perd." },
    ],
    faqs: [
      { q: "Nami remplace-t-il mon logiciel de cabinet ?", a: "Nami n'est pas un logiciel métier. C'est un outil de coordination. Vous pouvez continuer à utiliser votre logiciel pour vos notes internes. Nami structure ce que vous partagez avec l'équipe. L'agenda et la facturation intégrés vous permettent cependant de tout centraliser si vous le souhaitez." },
      { q: "Mes confrères doivent-ils aussi payer ?", a: "Non. Vous les invitez, ils s'inscrivent gratuitement et voient qu'ils font partie de l'équipe. Pour contribuer activement au parcours, ils passent à Coordination (79€). Souvent, c'est le patient qui invite ses soignants via son app." },
      { q: "Les notes du psychologue sont-elles visibles par l'équipe ?", a: "Non. Par défaut, seul le fait que la prise en charge psychologique est en cours est visible. Le contenu des séances reste confidentiel. Le psychologue peut choisir de partager des observations spécifiques — toujours opt-in." },
      { q: "L'IA prend-elle des décisions cliniques ?", a: "Jamais. L'IA produit des brouillons que vous validez. Elle transcrit, structure et source. Chaque synthèse porte le badge « Brouillon IA, à vérifier » et un bouton « Voir les sources »." },
      { q: "Comment fonctionne la facturation à 19€ ?", a: "Le tier Essentiel couvre la facturation non conventionnée : notes d'honoraires, suivi des paiements, export comptable. Adapté aux diététiciens et toutes les professions non conventionnées." },
    ],
    pricingBadge: "Recommandé pour les diét",
    pricingNote: "79€/mois = environ 2-3% du CA moyen d'un diététicien libéral.",
    ctaLine1: "Vos patients ont déjà une équipe.",
    ctaLine2: "Donnez-leur un couloir.",
    seoTitle: "Nami pour les diététiciens-nutritionnistes — Coordination pluridisciplinaire",
    seoDesc: "Nami permet aux diététiciens-nutritionnistes de coordonner leurs patients avec l'équipe soignante : médecin, psychologue, endocrino, APA. Gratuit pour commencer.",
  },

  {
    slug: "medecin-generaliste",
    name: "Médecin généraliste",
    badge: "Pour les médecins généralistes",
    heroLine1: "Vous êtes le chef d'orchestre.",
    heroLine2: "Nami vous donne la partition.",
    heroDesc:
      "Diététicienne, psychologue, endocrinologue, APA, kinésithérapeute : vous orientez chaque jour vers des spécialistes. Nami vous permet de suivre ce que chacun fait, de fermer la boucle et de ne plus perdre un patient entre deux consultations.",
    caseTitle: "Marc, 52 ans. Obésité complexe PCR.",
    caseIntro:
      "Vous êtes son médecin traitant. Il est suivi par une diététicienne, un endocrinologue, un psychologue et un éducateur APA dans le cadre d'un PCR obésité. Aujourd'hui, vous n'avez aucune visibilité sur ce que les autres font. Avec Nami, vous avez tout dans un seul espace.",
    steps: [
      {
        title: "Vous adressez structuré",
        desc: "Adressez Marc vers l'endocrino avec tout le contexte : antécédents, traitements, résultats bio, objectifs. Le confrère reçoit le dossier structuré en 30 secondes.",
      },
      {
        title: "Vous voyez ce que les autres font",
        desc: "La diét a noté une amélioration des apports. Le psychologue confirme que l'adhérence est bonne. L'éducateur APA a augmenté l'intensité. Vous avez la vue complète.",
      },
      {
        title: "La RCP se prépare toute seule",
        desc: "Avant la réunion pluridisciplinaire, Nami génère un brouillon de compte rendu avec les observations de chaque intervenant. Vous validez, vous signez.",
      },
      {
        title: "Vous fermez la boucle",
        desc: "L'indicateur de complétude montre que le suivi ophtalmologique est en retard. Vous adressez directement depuis Nami. Le dossier avance.",
      },
    ],
    features: [
      { icon: "🎙️", title: "Dictée médicale intelligente", desc: "Dictez vos observations. L'IA transcrit, structure le brouillon en 6 blocs cliniques, sourcé sur les référentiels HAS. Vous validez en 2 minutes." },
      { icon: "👁️", title: "Vue 360° de chaque patient", desc: "Toutes les observations de l'équipe, les résultats bio, les comptes rendus, les médicaments en cours — dans un seul dossier de coordination." },
      { icon: "📬", title: "Adressage avec contexte", desc: "Adressez vers un spécialiste avec le dossier complet. Il reçoit le contexte, pas un post-it. La lettre d'adressage est générée par l'IA." },
      { icon: "🧪", title: "Extraction bio automatique", desc: "Importez les résultats biologiques de votre patient. Nami structure et intègre au dossier. Valeurs anormales identifiables d'un coup d'œil." },
      { icon: "📅", title: "RCP virtuelle", desc: "Organisez une réunion pluridisciplinaire virtuelle. Nami génère un brouillon de compte rendu pré-rempli avec les observations de chaque intervenant." },
      { icon: "✅", title: "Complétude du parcours", desc: "Nami identifie les étapes manquantes ou en retard dans le parcours de soins : dépistages, bilans, consultations de suivi. Rien ne se perd." },
    ],
    faqs: [
      { q: "Est-ce compatible avec mon logiciel médecin actuel ?", a: "Nami est un outil de coordination, complémentaire à votre logiciel métier. Vous continuez à utiliser votre logiciel pour vos actes et prescriptions. Nami structure ce qui est partagé avec l'équipe et le patient." },
      { q: "Mes patients doivent-ils télécharger une app ?", a: "Non, c'est optionnel. L'app patient enrichit le suivi (photos repas, questionnaires, messagerie) mais le parcours fonctionne même sans. Le soignant reste toujours maître de ce qui est partagé." },
      { q: "La confidentialité psy est-elle respectée ?", a: "Oui, par design. Les notes du psychologue sont confidentielles par défaut. Seul le statut de prise en charge est visible. Le psychologue partage uniquement ce qu'il choisit explicitement." },
      { q: "Puis-je inviter des spécialistes hors de Nami ?", a: "Oui. Vous les invitez par email. Ils créent un compte gratuit et accèdent au dossier partagé. Ils n'ont pas besoin d'un abonnement pour voir les éléments que vous leur partagez." },
    ],
    pricingBadge: "Recommandé pour les MG",
    pricingNote: "79€/mois pour un suivi pluridisciplinaire complet. Moins qu'une heure de consultation.",
    ctaLine1: "Vos patients ont un parcours.",
    ctaLine2: "Vous méritez d'en voir chaque étape.",
    seoTitle: "Nami pour les médecins généralistes — Coordination pluridisciplinaire",
    seoDesc: "Nami permet aux médecins généralistes de coordonner les parcours complexes : adressage structuré, vue équipe, RCP virtuelle, complétude du parcours.",
  },

  {
    slug: "psychologue",
    name: "Psychologue",
    badge: "Pour les psychologues",
    heroLine1: "Votre travail compte.",
    heroLine2: "Il reste confidentiel.",
    heroDesc:
      "Vous faites partie d'équipes pluridisciplinaires — TCA, obésité, maladies chroniques. Nami vous permet de collaborer avec l'équipe sans exposer le contenu de vos séances. Confidentialité par défaut. Coordination par choix.",
    caseTitle: "Gabrielle, 16 ans. Anorexie mentale.",
    caseIntro:
      "Vous suivez Gabrielle en parallèle d'une diététicienne, d'un endocrinologue et d'un éducateur APA. Aujourd'hui, vous recevez des SMS du médecin pour lui donner des nouvelles. Avec Nami, chacun contribue à sa mesure, sans jamais violer le cadre thérapeutique.",
    steps: [
      {
        title: "Vous rejoignez l'équipe",
        desc: "Le médecin traitant ou la diété vous invite sur le dossier. Vous acceptez en 30 secondes. Vous voyez l'équipe, les prochains RDV, le parcours en cours.",
      },
      {
        title: "Vous choisissez ce que vous partagez",
        desc: "Par défaut, l'équipe voit uniquement que le suivi psychologique est en cours et sa date. Le contenu de vos séances est à vous. Vous pouvez partager une observation si vous le jugez utile — toujours opt-in.",
      },
      {
        title: "Vous dictez vos observations partagées",
        desc: "À la fin d'une séance, si vous choisissez de contribuer au dossier partagé, dictez une observation courte. L'IA structure. L'équipe voit que l'adhérence est bonne sans voir votre process thérapeutique.",
      },
      {
        title: "La coordination se fait sans vous déranger",
        desc: "Vous n'avez plus à répondre au téléphone entre deux séances. Les autres soignants voient votre contribution dans le dossier. La messagerie sécurisée remplace les SMS informels.",
      },
    ],
    features: [
      { icon: "🔒", title: "Confidentialité par défaut", desc: "Vos notes cliniques ne sont jamais accessibles à l'équipe. Seul le statut de votre prise en charge est visible, sauf si vous décidez de partager davantage." },
      { icon: "🤝", title: "Coordination sans exposition", desc: "Participez aux RCP, lisez les observations des autres, contribuez à votre mesure. Sans jamais exposer votre cadre thérapeutique." },
      { icon: "💬", title: "Messagerie sécurisée", desc: "Échangez avec le médecin traitant ou la diét via messagerie sécurisée. Fini les SMS depuis votre téléphone personnel." },
      { icon: "📅", title: "RCP virtuelle", desc: "Participez à une réunion pluridisciplinaire sans vous déplacer. Le compte rendu est généré automatiquement. Vous validez votre contribution." },
      { icon: "📋", title: "Adressage reçu proprement", desc: "Quand un médecin vous adresse un patient, vous recevez le contexte clinique complet. Pas un SMS avec juste le nom et le numéro de téléphone." },
      { icon: "🎙️", title: "Dictée sécurisée", desc: "Dictez vos observations partagées après séance. L'IA transcrit, structure. Le résultat reste un brouillon que vous validez avant toute publication." },
    ],
    faqs: [
      { q: "Le contenu de mes séances est-il vraiment protégé ?", a: "Oui, par design et par défaut. Nami ne collecte pas les notes de séance que vous ne choisissez pas de partager. La confidentialité psy n'est pas une option — c'est l'architecture du système." },
      { q: "Dois-je payer pour rejoindre une équipe ?", a: "Non, c'est gratuit. Si vous voulez coordonner vos propres patients avec votre propre équipe — agenda, messagerie, dossier partagé — Coordination à 79€/mois. Mais rejoindre l'équipe d'un confrère est toujours gratuit." },
      { q: "Comment gère-t-on le secret professionnel ?", a: "Nami respecte le cadre légal du secret partagé (article L.1110-4 CSP). Vous ne partagez que ce que vous décidez. Le dossier de coordination est distinct de votre dossier clinique. Aucun partage automatique." },
      { q: "Puis-je utiliser Nami pour ma patientèle propre ?", a: "Oui. Vous créez votre espace, invitez les soignants qui suivent vos patients, gérez votre agenda, vos messages, et si vous le souhaitez, utilisez l'IA pour structurer les observations partagées." },
    ],
    pricingBadge: "Recommandé pour les psychologues",
    pricingNote: "Rejoindre une équipe est gratuit. Coordonner votre propre patientèle à partir de 79€/mois.",
    ctaLine1: "Votre travail mérite mieux qu'un SMS.",
    ctaLine2: "Coordonnez sans tout exposer.",
    seoTitle: "Nami pour les psychologues — Coordination pluridisciplinaire confidentielle",
    seoDesc: "Nami permet aux psychologues de participer aux équipes pluridisciplinaires TCA, obésité, maladies chroniques, avec confidentialité par défaut.",
  },

  {
    slug: "endocrinologue",
    name: "Endocrinologue",
    badge: "Pour les endocrinologues",
    heroLine1: "Vos bilans structurent le parcours.",
    heroLine2: "Nami les met en circulation.",
    heroDesc:
      "Obésité complexe, TCA, diabète, thyroïde : vous êtes au cœur des parcours pluridisciplinaires. Nami vous donne une vue complète du patient avant la consultation et rend vos conclusions accessibles à toute l'équipe immédiatement.",
    caseTitle: "Marc, 52 ans. Obésité complexe — PCR niveau C.",
    caseIntro:
      "Marc est suivi par vous, son médecin traitant, une diététicienne, un psychologue et un éducateur APA. Avant chaque consultation, vous cherchez ses anciens bilans dans votre messagerie. Avec Nami, tout est là : résultats structurés, observations de l'équipe, parcours en cours.",
    steps: [
      {
        title: "Vous recevez le dossier complet avant la consultation",
        desc: "Les bilans biologiques précédents, les observations de la diét et du MG, les traitements en cours. Tout est structuré, pas scanné-collé dans un email.",
      },
      {
        title: "Vous dictez vos conclusions",
        desc: "En fin de consultation, vous dictez vos observations. L'IA transcrit, structure. La diét et le MG voient immédiatement votre bilan glycémique et vos recommandations.",
      },
      {
        title: "L'extraction bio se fait automatiquement",
        desc: "Importez les résultats de laboratoire. Nami structure et intègre au dossier. Les valeurs hors normes sont identifiables par l'équipe d'un coup d'œil — sans divulguer votre raisonnement clinique.",
      },
      {
        title: "Le prochain RDV est dans le parcours",
        desc: "Le bilan trimestriel s'affiche comme étape du parcours PCR. Toute l'équipe sait que Marc vient vous voir dans 8 semaines. La coordination se fait sans appels téléphoniques.",
      },
    ],
    features: [
      { icon: "🧪", title: "Extraction bio automatique", desc: "Importez les bilans biologiques — PDF, photo. Nami structure et intègre : glycémie, HbA1c, bilan thyroïdien, lipides, ferritine. Plus de saisie manuelle." },
      { icon: "📊", title: "Vue longitudinale des paramètres", desc: "Suivez l'évolution des indicateurs biologiques dans le temps. L'équipe voit les tendances, pas seulement la dernière valeur." },
      { icon: "🎙️", title: "Dictée clinique structurée", desc: "Dictez vos conclusions après consultation. L'IA produit un brouillon sourcé sur les référentiels HAS, DSM-5, PNDS. Vous validez, l'équipe est informée." },
      { icon: "👁️", title: "Vue équipe complète", desc: "Avant de voir Marc, vous lisez ce que la diét et le psy ont noté la semaine dernière. Vous êtes déjà dans le contexte." },
      { icon: "📬", title: "Adressage vers les sous-spécialités", desc: "Adressez vers un chirurgien bariatrique, un ophtalmologue, un cardiologue — avec le contexte métabolique complet. La lettre d'adressage est générée par l'IA." },
      { icon: "✅", title: "Parcours PCR documenté", desc: "Nami intègre les 4 profils PCR obésité (A/B/C/D). Chaque étape est documentée, chaque interlocuteur est traçable." },
    ],
    faqs: [
      { q: "Comment fonctionnent les parcours PCR dans Nami ?", a: "Nami intègre les 4 profils de parcours obésité (A à D) avec leurs étapes, leurs intervenants et leurs durées recommandées. Chaque consultation est rattachée à une étape du parcours, chaque résultat bio est tracé." },
      { q: "Puis-je importer des bilans depuis mon logiciel de biologie ?", a: "Vous pouvez importer des PDF de bilans ou photographier les résultats. Nami extrait automatiquement les valeurs et les structure dans le dossier. L'intégration directe avec les laboratoires est sur la roadmap." },
      { q: "L'équipe voit-elle mes conclusions cliniques ?", a: "Vous choisissez ce que vous partagez. Par défaut, l'équipe voit les bilans biologiques structurés et vos observations partagées. Vos notes cliniques internes restent privées." },
      { q: "Est-ce compatible avec mes outils actuels ?", a: "Nami est complémentaire à votre logiciel métier. Vous continuez à utiliser vos outils pour les actes. Nami coordonne ce qui circule entre les membres de l'équipe." },
    ],
    pricingBadge: "Recommandé pour les endocrinologues",
    pricingNote: "79€/mois pour coordonner vos parcours PCR obésité et TCA.",
    ctaLine1: "Vos bilans sont précieux.",
    ctaLine2: "Faites-les circuler.",
    seoTitle: "Nami pour les endocrinologues — Coordination PCR obésité et TCA",
    seoDesc: "Nami permet aux endocrinologues de coordonner les parcours obésité complexe (PCR A/B/C/D) et TCA avec extraction bio automatique et vue équipe en temps réel.",
  },

  {
    slug: "educateur-aps",
    name: "Éducateur en APS / APA",
    badge: "Pour les éducateurs APS et APA",
    heroLine1: "Votre bilan fonctionnel",
    heroLine2: "parle à toute l'équipe.",
    heroDesc:
      "TCA, obésité, maladies chroniques : vous intervenez dans des équipes pluridisciplinaires où chaque professionnel travaille encore trop souvent en silo. Nami rend votre contribution visible, structurée et utile à l'ensemble de l'équipe.",
    caseTitle: "Marc, 52 ans. Obésité complexe — programme APA.",
    caseIntro:
      "Marc est en parcours obésité avec un MG, une diét, un endocrino et un psy. Vous assurez la partie APA. Aujourd'hui, vous ne savez pas ce que les autres ont dit depuis votre dernière session. Avec Nami, vous arrivez à chaque séance avec le contexte complet.",
    steps: [
      {
        title: "Vous voyez l'état général de Marc avant la séance",
        desc: "Son humeur cette semaine, ses apports notés par la diét, les commentaires du médecin sur ses capacités cardiorespiratoires. Vous adaptez votre programme en connaissance de cause.",
      },
      {
        title: "Vous structurez votre bilan fonctionnel",
        desc: "En fin de séance, vous dictez votre bilan : VO2max estimée, endurance, force, mobilité, tolérance à l'effort. L'IA structure. L'équipe voit vos résultats sans que vous ayez à les appeler.",
      },
      {
        title: "Votre programme est documenté dans le parcours",
        desc: "La progression de Marc est tracée. La diét ajuste ses apports en fonction de l'intensité que vous avez notée. Le MG valide l'augmentation de charge. La coordination est fluide.",
      },
      {
        title: "Marc voit sa progression",
        desc: "Sur son app, Marc voit ses séances APA, ses résultats, son évolution. Il est acteur de son parcours. Ça change la motivation.",
      },
    ],
    features: [
      { icon: "🏃", title: "Bilan fonctionnel documenté", desc: "Structurez vos évaluations fonctionnelles : endurance, force, mobilité, tolérance à l'effort. L'IA transcrit et structure. L'équipe a la vue complète." },
      { icon: "👥", title: "Coordination avec l'équipe", desc: "Voyez ce que le médecin, la diét et le psy ont noté avant chaque séance. Adaptez votre programme en temps réel." },
      { icon: "📱", title: "Engagement du patient", desc: "Marc voit ses séances, sa progression et ses résultats sur son app. L'engagement augmente, les abandons diminuent." },
      { icon: "📊", title: "Traçabilité complète", desc: "Chaque séance est documentée dans le parcours de soins. Indicateurs de progression semaine après semaine. Utile pour la RCP et les bilans intermédiaires." },
      { icon: "📬", title: "Inclus dans le parcours PCR", desc: "Nami intègre l'APA dans les parcours PCR obésité (profils B, C, D). Votre rôle est explicitement documenté dans le parcours structuré." },
      { icon: "💬", title: "Messagerie sécurisée", desc: "Échangez avec le médecin ou la diét via messagerie sécurisée. Fini les messages informels hors cadre." },
    ],
    faqs: [
      { q: "Nami reconnaît-il officiellement la profession d'éducateur APS ?", a: "Oui. Nami intègre les éducateurs en activité physique adaptée comme membres à part entière des équipes pluridisciplinaires. Votre rôle est explicitement documenté dans les parcours PCR obésité." },
      { q: "Dois-je payer pour rejoindre une équipe ?", a: "Non, rejoindre l'équipe d'un patient est gratuit. Pour créer vos propres dossiers et coordonner votre propre patientèle, Coordination à 79€/mois." },
      { q: "Comment puis-je documenter mes bilans VO2max ou tests de marche ?", a: "Via la dictée ou la saisie directe dans le dossier. Nami structure les données fonctionnelles (endurance, force, mobilité, tolérance) dans un format lisible par l'équipe. Des champs standardisés pour les tests habituels sont en cours de développement." },
    ],
    pricingBadge: "Recommandé pour les APS/APA",
    pricingNote: "Rejoindre une équipe est gratuit. Coordonner votre patientèle à partir de 79€/mois.",
    ctaLine1: "Votre bilan fonctionnel",
    ctaLine2: "mérite d'être lu par toute l'équipe.",
    seoTitle: "Nami pour les éducateurs APS et APA — Coordination pluridisciplinaire",
    seoDesc: "Nami permet aux éducateurs en activité physique adaptée de documenter leurs bilans fonctionnels et de coordonner avec l'équipe soignante dans les parcours obésité et TCA.",
  },

  {
    slug: "infirmier",
    name: "Infirmier(ère)",
    badge: "Pour les infirmiers et infirmières",
    heroLine1: "Vous voyez le patient le plus souvent.",
    heroLine2: "Faites-le savoir à l'équipe.",
    heroDesc:
      "Vous êtes souvent le premier à voir une évolution : une plaie qui n'évolue pas, un moral qui chute, une observance qui déraille. Nami vous permet de le documenter et de le partager avec le médecin en quelques secondes, sans attendre le prochain rendez-vous.",
    caseTitle: "Léa, 58 ans. Diabète de type 2 — insulinothérapie.",
    caseIntro:
      "Vous passez chez Léa 3 fois par semaine pour l'insuline. Le médecin la voit tous les 3 mois. Aujourd'hui, vous appelez le cabinet quand quelque chose change. Avec Nami, vous documentez en temps réel, l'équipe est informée sans que vous décrochiez le téléphone.",
    steps: [
      {
        title: "Vous documentez votre passage",
        desc: "Après chaque visite, vous dictez vos observations en 2 minutes : glycémie, état de la plaie, humeur, observance, douleurs. L'IA transcrit et structure.",
      },
      {
        title: "Le médecin voit l'évolution",
        desc: "Le Dr Moreau voit que la glycémie de Léa est instable depuis 3 jours. Il ajuste le traitement entre deux consultations, sans attendre 3 mois.",
      },
      {
        title: "L'équipe réagit vite",
        desc: "Vous notez que l'appétit a baissé. La diét est informée. Elle contacte Léa avant que la situation ne se dégrade. La coordination se fait sans que Léa soit au milieu.",
      },
      {
        title: "Le dossier se construit à chaque passage",
        desc: "Chaque visite est documentée. Le médecin arrive à la consultation avec 3 mois d'observations structurées, pas juste le souvenir de Léa.",
      },
    ],
    features: [
      { icon: "🎙️", title: "Dictée au chevet du patient", desc: "Dictez vos observations après chaque visite. L'IA transcrit et structure : paramètres vitaux, état clinique, observance, ressenti. 2 minutes." },
      { icon: "📊", title: "Paramètres vitaux intégrés", desc: "Tension, glycémie, saturation, poids, température : intégrés au dossier à chaque passage. L'équipe voit les tendances." },
      { icon: "👥", title: "Visible par toute l'équipe", desc: "Chaque observation que vous partagez est immédiatement visible par le médecin, la diét ou le kiné. Plus besoin d'appeler entre deux patients." },
      { icon: "💬", title: "Messagerie sécurisée", desc: "Échangez avec le médecin via messagerie sécurisée depuis votre téléphone. Fini les SMS depuis votre numéro personnel." },
      { icon: "📋", title: "Plan de soins structuré", desc: "Le plan de soins est dans Nami. Chaque acte est tracé. Les prescriptions, les fréquences, les durées. Tout est accessible depuis le domicile du patient." },
      { icon: "🔒", title: "RGPD et confidentialité", desc: "Vos observations sont chiffrées, pseudonymisées, tracées. Consentement patient explicite. MFA sur votre compte. Conforme RGPD." },
    ],
    faqs: [
      { q: "Puis-je utiliser Nami depuis mon téléphone lors des visites à domicile ?", a: "Oui, c'est le cas d'usage principal. L'app mobile soignant vous permet de dicter, de consulter le dossier et de contacter l'équipe depuis n'importe où." },
      { q: "Dois-je payer pour rejoindre l'équipe d'un patient ?", a: "Non, rejoindre l'équipe d'un patient est gratuit. Pour créer vos propres dossiers et coordonner votre patientèle, Coordination à 79€/mois." },
      { q: "Comment est gérée la confidentialité de mes observations ?", a: "Vous choisissez ce que vous partagez avec l'équipe. Les observations que vous gardez pour vous restent privées. Tout ce que vous partagez est tracé et auditable." },
    ],
    pricingBadge: "Recommandé pour les infirmiers",
    pricingNote: "Rejoindre une équipe est gratuit. Coordonner votre propre patientèle à partir de 79€/mois.",
    ctaLine1: "Vous êtes le lien entre le patient et l'équipe.",
    ctaLine2: "Nami en fait un atout.",
    seoTitle: "Nami pour les infirmiers — Coordination et documentation à domicile",
    seoDesc: "Nami permet aux infirmiers de documenter leurs passages à domicile et de partager leurs observations avec l'équipe soignante en temps réel.",
  },

  {
    slug: "kinesitherapeute",
    name: "Kinésithérapeute",
    badge: "Pour les kinésithérapeutes",
    heroLine1: "Votre bilan fonctionnel,",
    heroLine2: "vu par toute l'équipe.",
    heroDesc:
      "Rééducation post-chirurgicale, maladies chroniques, douleurs complexes : vous intervenez en bout de chaîne d'un parcours où le chirurgien, le médecin et la diét ne savent pas ce que vous observez. Nami ferme cette boucle.",
    caseTitle: "Sophie, 48 ans. Obésité — suivi post-sleeve.",
    caseIntro:
      "Sophie a été opérée d'une sleeve gastrectomie. Elle est suivie par son chirurgien, sa diét, son médecin et vous pour la rééducation musculaire et la reprise de l'activité. Chacun travaille encore de son côté. Avec Nami, votre bilan fonctionnel enrichit le parcours de chacun.",
    steps: [
      {
        title: "Vous recevez le contexte post-op",
        desc: "Le chirurgien a documenté l'opération dans Nami. Vous arrivez à la première séance en sachant exactement ce qui a été fait, sans appeler le cabinet.",
      },
      {
        title: "Vous documentez la progression",
        desc: "Bilan fonctionnel initial, objectifs, progression séance par séance. L'IA structure vos observations dictées. Le médecin et le chirurgien voient l'évolution.",
      },
      {
        title: "La diét adapte en temps réel",
        desc: "Vous notez que Sophie supporte mieux l'effort depuis 3 séances. La diét augmente les apports protéiques pour accompagner la reconstruction musculaire. Coordination parfaite.",
      },
      {
        title: "Le bilan final est dans le parcours",
        desc: "Votre bilan de fin de rééducation est documenté dans le dossier de coordination. Le médecin a tout pour la consultation de suivi à 3 mois.",
      },
    ],
    features: [
      { icon: "🏋️", title: "Bilan fonctionnel structuré", desc: "Documentez vos bilans : amplitudes articulaires, force musculaire, test de marche, douleurs. L'IA transcrit et structure. L'équipe voit votre travail." },
      { icon: "📈", title: "Progression séance par séance", desc: "Chaque séance documentée enrichit le dossier. Le chirurgien et le médecin voient la progression objective de Sophie au fil du temps." },
      { icon: "👥", title: "Vue équipe complète", desc: "Avant la séance, vous lisez ce que la diét et le médecin ont noté. Vous adaptez en connaissance de cause." },
      { icon: "📬", title: "Adressage reçu proprement", desc: "Le chirurgien vous adresse Sophie avec le compte rendu opératoire complet dans Nami. Pas un fax de 4 pages illisible." },
      { icon: "💬", title: "Messagerie sécurisée", desc: "Échangez avec le médecin sur une douleur inhabituelle via messagerie sécurisée. Tracé, confidentiel, sans SMS perso." },
      { icon: "🎙️", title: "Dictée rapide entre patients", desc: "2 minutes entre deux patients pour dicter le bilan de séance. L'IA structure, le dossier est à jour." },
    ],
    faqs: [
      { q: "Puis-je recevoir les ordonnances directement dans Nami ?", a: "Oui. Les ordonnances de kinésithérapie peuvent être transmises via Nami si le prescripteur est sur la plateforme. Vous recevez le contexte clinique avec la prescription." },
      { q: "Comment documenter les bilans fonctionnels standardisés ?", a: "Via la dictée ou la saisie directe. Nami structure les données fonctionnelles. Des champs standardisés pour les tests habituels (6MWT, bilan Barbell, etc.) sont en cours de développement." },
      { q: "Dois-je payer pour rejoindre l'équipe d'un patient ?", a: "Non, rejoindre l'équipe d'un patient est gratuit. Pour créer vos propres dossiers et coordonner votre patientèle, Coordination à 79€/mois." },
    ],
    pricingBadge: "Recommandé pour les kinés",
    pricingNote: "Rejoindre une équipe est gratuit. Coordonner votre patientèle à partir de 79€/mois.",
    ctaLine1: "Votre rééducation mérite d'être",
    ctaLine2: "vue par toute l'équipe.",
    seoTitle: "Nami pour les kinésithérapeutes — Coordination pluridisciplinaire",
    seoDesc: "Nami permet aux kinésithérapeutes de documenter leurs bilans fonctionnels et de coordonner avec chirurgiens, médecins et diététiciens dans le cadre des parcours de soins complexes.",
  },

  {
    slug: "orthophoniste",
    name: "Orthophoniste",
    badge: "Pour les orthophonistes",
    heroLine1: "Votre bilan de langage",
    heroLine2: "éclaire toute l'équipe.",
    heroDesc:
      "Épilepsie pédiatrique, troubles neurodéveloppementaux, AVC, maladies neurodégénératives : vous êtes un maillon essentiel de parcours complexes où médecins, neuropsy et enseignants travaillent encore trop souvent en silo. Nami les relie.",
    caseTitle: "Léo, 8 ans. Épilepsie pédiatrique.",
    caseIntro:
      "Léo est suivi par un neuropédiatre, vous, un neuropsychologue, son médecin traitant et son enseignant référent. Chacun observe des choses différentes. Avec Nami, vos observations de langage enrichissent le dossier de coordination de toute l'équipe.",
    steps: [
      {
        title: "Vous avez le contexte avant la séance",
        desc: "Le neuropédiatre a documenté la dernière EEG. Le neuropsychologue a noté des difficultés de mémoire de travail. Vous arrivez à votre séance avec Léo en connaissant ces éléments.",
      },
      {
        title: "Vous documentez votre bilan de langage",
        desc: "Langage expressif, réceptif, mémoire verbale, fluence, articulation. Vous dictez, l'IA structure. Le neuropédiatre et le neuropsychologue voient vos résultats.",
      },
      {
        title: "L'enseignant référent est dans la boucle",
        desc: "L'enseignant de Léo contribue dans Nami : difficultés en classe, adaptations en cours. Vous ajustez vos objectifs thérapeutiques. Le PAI s'appuie sur des données réelles.",
      },
      {
        title: "La RCP se prépare en 10 minutes",
        desc: "Avant la réunion de suivi, Nami agrège les observations de chaque intervenant. Le compte rendu est pré-rempli. Vous validez votre partie. La réunion est productive.",
      },
    ],
    features: [
      { icon: "🗣️", title: "Bilan de langage documenté", desc: "Structurez vos bilans : langage expressif, réceptif, mémoire verbale, fluence, articulation. L'IA transcrit et structure. L'équipe voit vos résultats." },
      { icon: "👶", title: "Milestones pédiatriques intégrés", desc: "Nami intègre les jalons de développement du langage selon les normes ANAES. Comparez la progression de Léo aux repères de son âge." },
      { icon: "👥", title: "Équipe pluridisciplinaire complète", desc: "Neuropédiatre, neuropsychologue, médecin traitant, enseignant référent : chacun contribue. Vous voyez tout. Tout le monde voit votre contribution." },
      { icon: "📋", title: "PAI et GEVASCO facilités", desc: "Vos bilans alimentent directement les documents nécessaires au PAI et au GEVASCO. Moins de saisie redondante." },
      { icon: "📅", title: "RCP virtuelle", desc: "Participez à la réunion pluridisciplinaire sans vous déplacer. Le compte rendu est généré automatiquement. Vous validez votre contribution." },
      { icon: "🎙️", title: "Dictée rapide entre patients", desc: "Dictez votre bilan de séance en 2 minutes. L'IA structure. Le dossier est à jour pour le neuropédiatre." },
    ],
    faqs: [
      { q: "Nami est-il adapté aux suivis pédiatriques ?", a: "Oui. Nami intègre les courbes de croissance OMS, les milestones de développement ESPGHAN et ANAES, et les équipes pédiatriques complètes (neuropédiatre, neuropsychologue, orthophoniste, enseignant référent)." },
      { q: "L'enseignant de Léo peut-il accéder au dossier ?", a: "Oui, avec un accès limité et contrôlé. L'enseignant référent peut voir les informations que l'équipe médicale choisit de partager pour le soutien scolaire, sans accéder aux données médicales confidentielles." },
      { q: "Dois-je payer pour rejoindre l'équipe d'un patient ?", a: "Non, rejoindre l'équipe d'un patient est toujours gratuit. Pour créer vos propres dossiers et coordonner votre patientèle, Coordination à 79€/mois." },
      { q: "Puis-je documenter des tests standardisés (ELO, EVIP, BECS...) ?", a: "Oui via la dictée ou la saisie directe. Des champs spécifiques pour les bilans orthophoniques standardisés sont en cours de développement. Vos résultats bruts peuvent déjà être intégrés au dossier." },
    ],
    pricingBadge: "Recommandé pour les orthophonistes",
    pricingNote: "Rejoindre une équipe est gratuit. Coordonner votre patientèle à partir de 79€/mois.",
    ctaLine1: "Vos bilans de langage sont essentiels.",
    ctaLine2: "Faites-en profiter toute l'équipe.",
    seoTitle: "Nami pour les orthophonistes — Coordination pluridisciplinaire pédiatrique",
    seoDesc: "Nami permet aux orthophonistes de documenter leurs bilans de langage et de coordonner avec neuropédiatres, neuropsychologues et enseignants dans les parcours pédiatriques complexes.",
  },
];

export function getProfession(slug: string): ProfessionConfig | null {
  return PROFESSIONS.find((p) => p.slug === slug) ?? null;
}

export function getAllSlugs(): string[] {
  return PROFESSIONS.map((p) => p.slug);
}

export { PROFESSIONS };
