import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { SecretariatTasksSection } from "../SecretariatTasksSection";

// ─── Mocks ──────────────────────────────────────────────────────────────────

const listSpy = vi.fn();
const tasksUpdateSpy = vi.fn();

vi.mock("@/lib/store", () => ({
  useAuthStore: (selector: (s: { accessToken: string | null; user: { id: string } | null }) => unknown) =>
    selector({ accessToken: "test-token", user: { id: "user-secretary-1" } }),
}));

vi.mock("@/lib/api", () => ({
  apiWithToken: (token: string) => ({
    tasksMine: {
      list: (status?: string) => listSpy(token, status),
    },
    tasks: {
      update: (careCaseId: string, taskId: string, data: unknown) =>
        tasksUpdateSpy(token, careCaseId, taskId, data),
    },
  }),
}));

function withQuery(children: ReactNode) {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>;
}

const FAKE_PENDING_TASK = {
  id: "task-1",
  title: "Rappeler le patient pour confirmation RDV",
  taskType: "FOLLOW_UP",
  status: "PENDING",
  priority: "MEDIUM",
  description: null,
  dueDate: "2099-06-10T10:00:00Z",
  createdAt: "2026-06-03T09:00:00Z",
  assignedTo: { id: "user-secretary-1", firstName: "S", lastName: "M" },
  createdBy:  { id: "user-secretary-1", firstName: "S", lastName: "M" },
  careCase: {
    id: "cc-1",
    caseTitle: "Suivi TCA",
    patient: { id: "p-1", firstName: "Léa", lastName: "Rousseau" },
  },
};

const FAKE_COMPLETED_TASK = {
  ...FAKE_PENDING_TASK,
  id: "task-2",
  title: "Confirmer le bilan biologique",
  status: "COMPLETED",
};

beforeEach(() => {
  listSpy.mockReset();
  tasksUpdateSpy.mockReset();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("SecretariatTasksSection", () => {
  it("affiche l'état vide quand aucune tâche n'est retournée", async () => {
    listSpy.mockResolvedValue([]);
    render(withQuery(<SecretariatTasksSection />));

    await waitFor(() => {
      expect(screen.getByText(/Aucune tâche assignée/i)).toBeInTheDocument();
    });
    // Aucun row tâche rendu
    expect(screen.queryAllByTestId("secretariat-task-row")).toHaveLength(0);
  });

  it("affiche le titre, le patient et l'échéance d'une tâche PENDING", async () => {
    listSpy.mockResolvedValue([FAKE_PENDING_TASK]);
    render(withQuery(<SecretariatTasksSection />));

    await waitFor(() => {
      expect(screen.getByText(/Rappeler le patient pour confirmation RDV/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/Léa Rousseau/i)).toBeInTheDocument();
    // Bouton "Marquer fait" visible sur tâche PENDING
    expect(screen.getByRole("button", { name: /Marquer fait/i })).toBeInTheDocument();
  });

  it("filtre 'Fait' : appelle tasksMine.list('COMPLETED') et affiche le label 'Fait'", async () => {
    // Par défaut on est sur PENDING — premier load
    listSpy.mockResolvedValueOnce([FAKE_PENDING_TASK]);
    // Après clic sur "Fait", second load avec COMPLETED
    listSpy.mockResolvedValueOnce([FAKE_COMPLETED_TASK]);

    const user = userEvent.setup();
    render(withQuery(<SecretariatTasksSection />));

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith("test-token", "PENDING");
    });

    await user.click(screen.getByRole("button", { name: /^Fait$/i }));

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith("test-token", "COMPLETED");
    });
    await waitFor(() => {
      expect(screen.getByText(/Confirmer le bilan biologique/i)).toBeInTheDocument();
    });
    // Le badge "Fait" (sans bouton "Marquer fait") doit être présent
    expect(screen.queryByRole("button", { name: /Marquer fait/i })).toBeNull();
  });

  it("filtre 'Toutes' : appelle tasksMine.list() sans status", async () => {
    listSpy.mockResolvedValue([]);
    const user = userEvent.setup();
    render(withQuery(<SecretariatTasksSection />));

    await waitFor(() => expect(listSpy).toHaveBeenCalledWith("test-token", "PENDING"));

    await user.click(screen.getByRole("button", { name: /^Toutes$/i }));

    await waitFor(() => {
      expect(listSpy).toHaveBeenCalledWith("test-token", undefined);
    });
  });

  it("clic sur 'Marquer fait' appelle tasks.update avec (careCaseId, taskId, { status: 'COMPLETED' })", async () => {
    listSpy.mockResolvedValue([FAKE_PENDING_TASK]);
    tasksUpdateSpy.mockResolvedValue({ ...FAKE_PENDING_TASK, status: "COMPLETED" });

    const user = userEvent.setup();
    render(withQuery(<SecretariatTasksSection />));

    await waitFor(() => {
      expect(screen.getByRole("button", { name: /Marquer fait/i })).toBeInTheDocument();
    });

    await user.click(screen.getByRole("button", { name: /Marquer fait/i }));

    await waitFor(() => {
      expect(tasksUpdateSpy).toHaveBeenCalledWith(
        "test-token",
        "cc-1",
        "task-1",
        { status: "COMPLETED" },
      );
    });
  });
});
