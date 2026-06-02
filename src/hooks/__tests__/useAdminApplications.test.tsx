import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import {
  useAdminApplicationsList,
  useAdminApplicationDetail,
  useStartReview,
  useApproveApplication,
  useRejectApplication,
} from "../useAdminApplications";

vi.mock("@/lib/store", () => ({
  useAuthStore: (selector: (s: { accessToken: string | null }) => unknown) =>
    selector({ accessToken: "test-token" }),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return Wrapper;
}

describe("useAdminApplications hooks", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("useAdminApplicationsList → GET /admin/organization-applications avec Bearer token", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        items: [
          {
            id: "a-1",
            proposedName: "Cabinet Vire",
            proposedType: "PRIVATE_PRACTICE",
            proposedCity: "Lyon",
            proposedSiret: "11111111100011",
            applicantEmail: "vire@example.fr",
            applicantFirstName: "Marie",
            applicantLastName: "Vire",
            applicantRoleInOrg: "Diététicienne",
            status: "PENDING_REVIEW",
            createdAt: "2026-06-01T10:00:00Z",
            reviewedAt: null,
          },
        ],
      }),
    });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const { result } = renderHook(() => useAdminApplicationsList(), { wrapper: makeWrapper() });
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/admin\/organization-applications$/);
    expect((opts.headers as Record<string, string>).Authorization).toBe("Bearer test-token");
    expect(result.current.data?.[0].proposedName).toBe("Cabinet Vire");
  });

  it("useAdminApplicationDetail → 404 résout en null sans erreur", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => ({ error: "Candidature introuvable." }),
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useAdminApplicationDetail("missing"), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toBeNull();
    expect(result.current.isError).toBe(false);
  });

  it("useStartReview → POST start-review avec Bearer token", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ status: "IN_REVIEW" }),
    });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const { result } = renderHook(() => useStartReview(), { wrapper: makeWrapper() });
    await act(async () => {
      await result.current.mutateAsync("app-123");
    });

    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/admin\/organization-applications\/app-123\/start-review$/);
    expect(opts.method).toBe("POST");
    expect((opts.headers as Record<string, string>).Authorization).toBe("Bearer test-token");
  });

  it("useApproveApplication → POST approve avec body { reviewNotes }", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "APPROVED",
        organizationId: "org-1",
        adminPersonId: "p-1",
      }),
    });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const { result } = renderHook(() => useApproveApplication(), { wrapper: makeWrapper() });
    await act(async () => {
      await result.current.mutateAsync({ id: "app-9", reviewNotes: "Tout est OK" });
    });

    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/admin\/organization-applications\/app-9\/approve$/);
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body as string)).toEqual({ reviewNotes: "Tout est OK" });
  });

  it("useRejectApplication → POST reject avec body { rejectionReason }", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        status: "REJECTED",
        rejectionReason: "SIRET non vérifiable",
      }),
    });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const { result } = renderHook(() => useRejectApplication(), { wrapper: makeWrapper() });
    await act(async () => {
      await result.current.mutateAsync({
        id: "app-9",
        rejectionReason: "SIRET non vérifiable",
      });
    });

    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/admin\/organization-applications\/app-9\/reject$/);
    expect(opts.method).toBe("POST");
    expect(JSON.parse(opts.body as string)).toEqual({
      rejectionReason: "SIRET non vérifiable",
    });
  });

  it("useApproveApplication 409 → propage l'erreur backend (currentStatus)", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 409,
      json: async () => ({
        error: "Impossible d'approuver depuis le statut APPROVED.",
        currentStatus: "APPROVED",
      }),
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => useApproveApplication(), { wrapper: makeWrapper() });
    await expect(
      act(async () => {
        await result.current.mutateAsync({ id: "app-9", reviewNotes: null });
      }),
    ).rejects.toThrow(/Impossible d'approuver/);
  });
});
