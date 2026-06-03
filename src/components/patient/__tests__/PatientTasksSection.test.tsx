import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PatientTasksSection } from "../PatientTasksSection";
import type { PatientTask } from "@/lib/api";

const mockComplete = vi.fn();
const mockListReturn = { data: undefined, isLoading: false };

vi.mock("@/hooks/usePatientTasks", () => ({
  usePatientTasks: () => mockListReturn,
  useCompletePatientTask: () => ({
    mutate: mockComplete,
    isPending: false,
    variables: undefined,
  }),
}));

function makeTask(overrides: Partial<PatientTask> = {}): PatientTask {
  return {
    id: "task-1",
    title: "Peser Léa cette semaine",
    taskType: "FOLLOW_UP",
    description: null,
    status: "PENDING",
    priority: "MEDIUM",
    dueDate: null,
    createdAt: "2026-06-01T10:00:00.000Z",
    assignedTo: null,
    createdBy: { id: "p-soignant", firstName: "Margot", lastName: "Vire" },
    careCase: {
      id: "cc-1",
      caseTitle: "Suivi nutrition Léa",
      patient: { id: "p-lea", firstName: "Léa", lastName: "B" },
    },
    ...overrides,
  };
}

beforeEach(() => {
  mockComplete.mockReset();
});

describe("PatientTasksSection", () => {
  it("1. n'affiche rien si aucune task PENDING/IN_PROGRESS", () => {
    const { container } = render(
      <PatientTasksSection tasksOverride={[makeTask({ status: "COMPLETED" })]} />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("2. affiche le titre, le compteur et la task quand il y en a une", () => {
    render(
      <PatientTasksSection
        tasksOverride={[makeTask({ title: "Faire le questionnaire EDE-Q" })]}
      />,
    );
    expect(screen.getByText("Mes tâches")).toBeInTheDocument();
    expect(screen.getByText("1 à faire")).toBeInTheDocument();
    expect(screen.getByText("Faire le questionnaire EDE-Q")).toBeInTheDocument();
  });

  it("3. filtre par careCaseId quand fourni", () => {
    render(
      <PatientTasksSection
        careCaseId="cc-1"
        tasksOverride={[
          makeTask({ id: "t1", title: "Tâche A", careCase: { id: "cc-1", caseTitle: "A", patient: { id: "p", firstName: "p", lastName: "p" } } }),
          makeTask({ id: "t2", title: "Tâche B", careCase: { id: "cc-2", caseTitle: "B", patient: { id: "p", firstName: "p", lastName: "p" } } }),
        ]}
      />,
    );
    expect(screen.getByText("Tâche A")).toBeInTheDocument();
    expect(screen.queryByText("Tâche B")).not.toBeInTheDocument();
    expect(screen.getByText("1 à faire")).toBeInTheDocument();
  });

  it("4. trie par priorité (URGENT avant MEDIUM) puis par dueDate", () => {
    render(
      <PatientTasksSection
        tasksOverride={[
          makeTask({ id: "t1", title: "Normale", priority: "MEDIUM" }),
          makeTask({ id: "t2", title: "Urgente", priority: "URGENT" }),
          makeTask({ id: "t3", title: "Importante", priority: "HIGH" }),
        ]}
      />,
    );
    const titles = screen.getAllByRole("button", { name: /Marquer/ });
    // 3 boutons "Marquer" — un par task affichée
    expect(titles).toHaveLength(3);
    // Vérifie l'ordre via le DOM (liste ordonnée)
    const items = screen.getAllByRole("listitem");
    expect(items[0]).toHaveTextContent("Urgente");
    expect(items[1]).toHaveTextContent("Importante");
    expect(items[2]).toHaveTextContent("Normale");
  });

  it("5. déclenche complete avec careCaseId + taskId au clic", () => {
    render(
      <PatientTasksSection
        tasksOverride={[makeTask({ id: "task-42", title: "À faire" })]}
      />,
    );
    fireEvent.click(screen.getByLabelText('Marquer "À faire" comme fait'));
    expect(mockComplete).toHaveBeenCalledTimes(1);
    expect(mockComplete).toHaveBeenCalledWith({
      careCaseId: "cc-1",
      taskId: "task-42",
    });
  });

  it("6. affiche le badge priorité pour URGENT et HIGH, pas pour MEDIUM/LOW", () => {
    render(
      <PatientTasksSection
        tasksOverride={[
          makeTask({ id: "t1", title: "T-Urg", priority: "URGENT" }),
          makeTask({ id: "t2", title: "T-High", priority: "HIGH" }),
          makeTask({ id: "t3", title: "T-Med", priority: "MEDIUM" }),
          makeTask({ id: "t4", title: "T-Low", priority: "LOW" }),
        ]}
      />,
    );
    expect(screen.getByText("Prioritaire")).toBeInTheDocument();
    expect(screen.getByText("Important")).toBeInTheDocument();
    expect(screen.queryByText("Normal")).not.toBeInTheDocument();
    expect(screen.queryByText("Quand vous pouvez")).not.toBeInTheDocument();
  });
});
