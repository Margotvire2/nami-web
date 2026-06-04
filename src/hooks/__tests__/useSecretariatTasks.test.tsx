import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import {
  useSecretariatTasks,
  useCompleteSecretariatTask,
} from "../useSecretariatTasks";

// ─── Mocks ──────────────────────────────────────────────────────────────────
// useAuthStore est un Zustand store — appelé en mode selector dans le hook.
// On mock le module pour retourner { accessToken, user } via le selector.
vi.mock("@/lib/store", () => ({
  useAuthStore: (selector: (s: { accessToken: string | null; user: { id: string } | null }) => unknown) =>
    selector({ accessToken: "test-token", user: { id: "user-secretary-1" } }),
}));

// apiWithToken est centralisé — on remplace par un spy pour vérifier les args.
const listSpy = vi.fn();
const tasksUpdateSpy = vi.fn();

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

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return { Wrapper, queryClient };
}

const FAKE_TASK = {
  id: "task-1",
  title: "Rappeler le patient",
  taskType: "FOLLOW_UP",
  status: "PENDING",
  priority: "MEDIUM",
  description: null,
  dueDate: "2026-06-10T10:00:00Z",
  createdAt: "2026-06-03T09:00:00Z",
  assignedTo: { id: "user-secretary-1", firstName: "S", lastName: "M" },
  createdBy:  { id: "user-secretary-1", firstName: "S", lastName: "M" },
  careCase: {
    id: "cc-1",
    caseTitle: "Suivi TCA",
    patient: { id: "p-1", firstName: "Léa", lastName: "Rousseau" },
  },
};

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("useSecretariatTasks", () => {
  beforeEach(() => {
    listSpy.mockReset();
    tasksUpdateSpy.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("appelle apiWithToken(token).tasksMine.list() avec le status fourni", async () => {
    listSpy.mockResolvedValue([FAKE_TASK]);
    const { Wrapper } = makeWrapper();

    const { result } = renderHook(() => useSecretariatTasks("PENDING"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(listSpy).toHaveBeenCalledTimes(1);
    expect(listSpy).toHaveBeenCalledWith("test-token", "PENDING");
    expect(result.current.data).toEqual([FAKE_TASK]);
  });

  it("queryKey inclut userId + status (cache séparé PENDING vs COMPLETED)", async () => {
    listSpy.mockResolvedValueOnce([FAKE_TASK]);
    listSpy.mockResolvedValueOnce([]);
    const { Wrapper } = makeWrapper();

    const { result: r1 } = renderHook(() => useSecretariatTasks("PENDING"), { wrapper: Wrapper });
    await waitFor(() => expect(r1.current.isLoading).toBe(false));

    const { result: r2 } = renderHook(() => useSecretariatTasks("COMPLETED"), { wrapper: Wrapper });
    await waitFor(() => expect(r2.current.isLoading).toBe(false));

    // Deux appels distincts = cache key bien différenciée.
    expect(listSpy).toHaveBeenCalledTimes(2);
    expect(listSpy.mock.calls[0][1]).toBe("PENDING");
    expect(listSpy.mock.calls[1][1]).toBe("COMPLETED");
  });

  it("status undefined → 'Toutes' : appelle list() sans paramètre", async () => {
    listSpy.mockResolvedValue([]);
    const { Wrapper } = makeWrapper();

    const { result } = renderHook(() => useSecretariatTasks(undefined), { wrapper: Wrapper });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(listSpy).toHaveBeenCalledWith("test-token", undefined);
  });
});

describe("useCompleteSecretariatTask", () => {
  beforeEach(() => {
    listSpy.mockReset();
    tasksUpdateSpy.mockReset();
  });

  it("appelle tasks.update(careCaseId, taskId, { status: 'COMPLETED' })", async () => {
    tasksUpdateSpy.mockResolvedValue({ ...FAKE_TASK, status: "COMPLETED" });
    const { Wrapper } = makeWrapper();

    const { result } = renderHook(() => useCompleteSecretariatTask(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({ careCaseId: "cc-1", taskId: "task-1" });
    });

    expect(tasksUpdateSpy).toHaveBeenCalledTimes(1);
    expect(tasksUpdateSpy).toHaveBeenCalledWith(
      "test-token",
      "cc-1",
      "task-1",
      { status: "COMPLETED" },
    );
  });

  it("post-success invalide la query key 'secretariat-tasks' avec userId", async () => {
    tasksUpdateSpy.mockResolvedValue({ ...FAKE_TASK, status: "COMPLETED" });
    const { Wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useCompleteSecretariatTask(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync({ careCaseId: "cc-1", taskId: "task-1" });
    });

    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["secretariat-tasks", "user-secretary-1"],
    });
  });
});
