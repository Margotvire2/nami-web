export type PhaseStatus = "completed" | "active" | "upcoming";
export type StepStatus = "done" | "in_progress" | "pending";

export interface ParcoursStep {
  id: string;
  label: string;
  status: StepStatus;
  date?: string; // ISO ou undefined si à venir
}

export interface ParcoursPhase {
  id: string;
  title: string;
  status: PhaseStatus;
  startedAt?: string;
  steps: ParcoursStep[];
}

/**
 * Données mock illustratives V1 — aucune pathologie inventée.
 * Motifs neutres centrés sur la coordination du suivi.
 * Wording strictement organisationnel (pas de contenu clinique).
 */
export const MOCK_PARCOURS: ParcoursPhase[] = [
  {
    id: "p1",
    title: "Bilan initial",
    status: "completed",
    startedAt: "2026-03-12",
    steps: [
      { id: "s1", label: "Premier rendez-vous", status: "done", date: "2026-03-12" },
      { id: "s2", label: "Questionnaire rempli", status: "done", date: "2026-03-14" },
      { id: "s3", label: "Documents transmis", status: "done", date: "2026-03-15" },
    ],
  },
  {
    id: "p2",
    title: "Évaluation initiale",
    status: "completed",
    startedAt: "2026-03-20",
    steps: [
      { id: "s4", label: "Examens complémentaires", status: "done", date: "2026-03-22" },
      { id: "s5", label: "Restitution avec l'équipe", status: "done", date: "2026-03-28" },
    ],
  },
  {
    id: "p3",
    title: "Mise en place du suivi",
    status: "active",
    startedAt: "2026-04-05",
    steps: [
      { id: "s6", label: "Plan de coordination défini", status: "done", date: "2026-04-05" },
      { id: "s7", label: "Premier rendez-vous de suivi", status: "done", date: "2026-04-15" },
      { id: "s8", label: "Bilan intermédiaire", status: "in_progress" },
      { id: "s9", label: "Ajustement du suivi", status: "pending" },
    ],
  },
  {
    id: "p4",
    title: "Suivi régulier",
    status: "upcoming",
    steps: [
      { id: "s10", label: "Consultations mensuelles", status: "pending" },
      { id: "s11", label: "Bilans périodiques", status: "pending" },
      { id: "s12", label: "Suivi multidisciplinaire", status: "pending" },
      { id: "s13", label: "Coordination équipe soignante", status: "pending" },
      { id: "s14", label: "Documents partagés", status: "pending" },
    ],
  },
  {
    id: "p5",
    title: "Bilan annuel",
    status: "upcoming",
    steps: [
      { id: "s15", label: "Synthèse annuelle", status: "pending" },
      { id: "s16", label: "Réévaluation du plan de coordination", status: "pending" },
    ],
  },
];

export function computeGlobalProgress(phases: ParcoursPhase[]): {
  current: number;
  total: number;
} {
  const completed = phases.filter((p) => p.status === "completed").length;
  const active = phases.filter((p) => p.status === "active").length;
  return { current: completed + active, total: phases.length };
}
