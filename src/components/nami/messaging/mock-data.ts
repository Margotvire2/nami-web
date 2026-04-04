import type { Channel, DmContact, ChatMessage, ChannelDetail } from "./types";

export const MOCK_CHANNELS: Channel[] = [
  { id: "ch-1", name: "diabète-pédiatrique", type: "PUBLIC", description: "Échanges sur la prise en charge du diabète chez l'enfant", tags: ["endocrinologie", "pédiatrie"], memberCount: 234, unreadCount: 3, lastMessageAt: new Date().toISOString() },
  { id: "ch-2", name: "nutrition-clinique", type: "PUBLIC", description: "Protocoles nutritionnels, cas cliniques, littérature", tags: ["diététique", "nutrition"], memberCount: 189, unreadCount: 0, lastMessageAt: new Date(Date.now() - 3600000).toISOString() },
  { id: "ch-3", name: "onco-digestif", type: "PUBLIC", description: "Oncologie digestive — RCP, protocoles, avis", tags: ["oncologie", "gastro"], memberCount: 312, unreadCount: 12, lastMessageAt: new Date(Date.now() - 1800000).toISOString() },
  { id: "ch-4", name: "rééducation-neuro", type: "PUBLIC", description: "Rééducation neurologique, kiné, ergothérapie", tags: ["neurologie", "kiné"], memberCount: 98, unreadCount: 0 },
  { id: "ch-5", name: "douleur-chronique", type: "PUBLIC", description: "Prise en charge de la douleur — approche pluridisciplinaire", tags: ["douleur", "pluridisciplinaire"], memberCount: 156, unreadCount: 1 },
];

export const MOCK_GROUPS: Channel[] = [
  { id: "gr-1", name: "Staff Nephro", type: "PRIVATE", description: "Staff hebdomadaire néphro CHU Lyon + CHU Grenoble", memberCount: 12, unreadCount: 5, lastMessageAt: new Date(Date.now() - 900000).toISOString() },
  { id: "gr-2", name: "Groupe de travail HAS", type: "PRIVATE", description: "Protocole nutrition — groupe de travail HAS", memberCount: 8, unreadCount: 0 },
  { id: "gr-3", name: "Diets pédiatriques IDF", type: "PRIVATE", description: "Réseau diététicien·ne·s pédiatriques Île-de-France", memberCount: 23, unreadCount: 2 },
];

export const MOCK_DMS: DmContact[] = [
  { id: "dm-1", firstName: "Sarah", lastName: "Moreau", specialty: "Endocrinologue", establishment: "CHU Necker", isOnline: true, unreadCount: 2, lastMessageAt: new Date(Date.now() - 300000).toISOString() },
  { id: "dm-2", firstName: "Marie", lastName: "Petit", specialty: "Diététicienne", establishment: "Clinique Saint-Jean", isOnline: true, unreadCount: 0 },
  { id: "dm-3", firstName: "Thomas", lastName: "Bernard", specialty: "Néphrologue", establishment: "CHU Lyon", isOnline: false, unreadCount: 0 },
  { id: "dm-4", firstName: "Camille", lastName: "Rousseau", specialty: "Pédiatre", establishment: "Hôpital Robert-Debré", isOnline: false, unreadCount: 1 },
];

export const MOCK_MESSAGES: ChatMessage[] = [
  {
    id: "msg-1",
    body: "Bonjour à tous, je voulais partager un cas intéressant. Patiente de 14 ans, diabète de type 1 depuis 3 ans, HbA1c en augmentation malgré le schéma basal-bolus. Quelqu'un a de l'expérience avec la pompe Omnipod chez les ados ?",
    createdAt: new Date(Date.now() - 7200000).toISOString(),
    sender: { id: "s-1", firstName: "Sarah", lastName: "Moreau", specialty: "Endocrinologue", establishment: "CHU Necker" },
    replyCount: 4,
    isPinned: false,
    reactions: [{ emoji: "👍", count: 3 }, { emoji: "💡", count: 1 }],
  },
  {
    id: "msg-2",
    body: "Oui, on a eu de très bons résultats avec l'Omnipod 5 chez les 12-16 ans dans notre service. Le mode automatique aide beaucoup pour la compliance, surtout chez les ados qui oublient les bolus.",
    createdAt: new Date(Date.now() - 6800000).toISOString(),
    sender: { id: "s-4", firstName: "Camille", lastName: "Rousseau", specialty: "Pédiatre", establishment: "Hôpital Robert-Debré" },
    replyCount: 0,
    isPinned: false,
    reactions: [{ emoji: "🙏", count: 2 }],
  },
  {
    id: "msg-3",
    body: "On a publié un retour d'expérience sur 45 patients l'an dernier. Je vous partage le lien : les résultats sur l'HbA1c sont significatifs à 6 mois (-0.8% en moyenne). Le vrai gain est sur la qualité de vie des familles.",
    createdAt: new Date(Date.now() - 6000000).toISOString(),
    sender: { id: "s-1", firstName: "Sarah", lastName: "Moreau", specialty: "Endocrinologue", establishment: "CHU Necker" },
    replyCount: 2,
    isPinned: true,
    reactions: [{ emoji: "🔥", count: 5 }, { emoji: "📄", count: 2 }],
  },
  {
    id: "msg-4",
    body: "Côté diét, attention au volet nutritionnel avec la pompe. Les patients ont tendance à se relâcher sur le comptage des glucides parce que la pompe \"corrige\". Il faut maintenir un suivi diététique régulier en parallèle.",
    createdAt: new Date(Date.now() - 3600000).toISOString(),
    sender: { id: "s-2", firstName: "Marie", lastName: "Petit", specialty: "Diététicienne", establishment: "Clinique Saint-Jean" },
    replyCount: 0,
    isPinned: false,
    reactions: [{ emoji: "👆", count: 4 }],
  },
  {
    id: "msg-5",
    body: "Très bon point Marie. Dans notre protocole on associe systématiquement un suivi diét mensuel les 3 premiers mois après la mise sous pompe. Ensuite trimestriel. Ça fait vraiment la différence.",
    createdAt: new Date(Date.now() - 1800000).toISOString(),
    sender: { id: "s-3", firstName: "Thomas", lastName: "Bernard", specialty: "Néphrologue", establishment: "CHU Lyon" },
    replyCount: 0,
    isPinned: false,
  },
  {
    id: "msg-6",
    body: "Quelqu'un a un contact en diabéto pédiatrique sur Nantes ? J'ai un patient qui déménage et il faut organiser le relais.",
    createdAt: new Date(Date.now() - 600000).toISOString(),
    sender: { id: "s-4", firstName: "Camille", lastName: "Rousseau", specialty: "Pédiatre", establishment: "Hôpital Robert-Debré" },
    replyCount: 0,
    isPinned: false,
  },
];

export const MOCK_CHANNEL_DETAIL: ChannelDetail = {
  id: "ch-1",
  name: "diabète-pédiatrique",
  type: "PUBLIC",
  description: "Échanges sur la prise en charge du diabète chez l'enfant et l'adolescent. Cas cliniques, protocoles, nouveautés thérapeutiques.",
  createdAt: "2025-09-15T10:00:00Z",
  createdBy: "Dr Sarah Moreau",
  memberCount: 234,
  members: [
    { id: "s-1", firstName: "Sarah", lastName: "Moreau", specialty: "Endocrinologue", establishment: "CHU Necker", isOnline: true },
    { id: "s-2", firstName: "Marie", lastName: "Petit", specialty: "Diététicienne", establishment: "Clinique Saint-Jean", isOnline: true },
    { id: "s-3", firstName: "Thomas", lastName: "Bernard", specialty: "Néphrologue", establishment: "CHU Lyon", isOnline: false },
    { id: "s-4", firstName: "Camille", lastName: "Rousseau", specialty: "Pédiatre", establishment: "Hôpital Robert-Debré", isOnline: false },
  ],
  pinnedMessages: [MOCK_MESSAGES[2]],
};

export const EXPLORE_CHANNELS: (Channel & { joined: boolean })[] = [
  { ...MOCK_CHANNELS[0], joined: true },
  { ...MOCK_CHANNELS[1], joined: true },
  { ...MOCK_CHANNELS[2], joined: false },
  { ...MOCK_CHANNELS[3], joined: false },
  { ...MOCK_CHANNELS[4], joined: false },
  { id: "ch-6", name: "psychiatrie-liaison", type: "PUBLIC", description: "Psychiatrie de liaison en milieu hospitalier — échanges interprofessionnels", tags: ["psychiatrie", "liaison"], memberCount: 67, unreadCount: 0, joined: false },
  { id: "ch-7", name: "TCA-adultes", type: "PUBLIC", description: "Troubles du comportement alimentaire chez l'adulte", tags: ["TCA", "nutrition", "psychiatrie"], memberCount: 143, unreadCount: 0, joined: false },
  { id: "ch-8", name: "gériatrie-nutrition", type: "PUBLIC", description: "Dénutrition et nutrition clinique en gériatrie", tags: ["gériatrie", "nutrition"], memberCount: 201, unreadCount: 0, joined: false },
];
