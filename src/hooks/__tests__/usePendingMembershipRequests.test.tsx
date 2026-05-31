import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { usePendingMembershipRequests } from "../usePendingMembershipRequests";

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/lib/store", () => ({
  useAuthStore: (selector: (s: { accessToken: string }) => unknown) =>
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

const ORG_ID = "org-rtf";

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("usePendingMembershipRequests — wiring PR #92", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("appelle GET /organizations/:orgId/membership-requests?status=PENDING&limit=5 avec le bon Bearer token", async () => {
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ requests: [] }),
    });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const { result } = renderHook(() => usePendingMembershipRequests(ORG_ID), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url, opts] = fetchSpy.mock.calls[0] as [string, RequestInit];
    expect(url).toMatch(/\/organizations\/org-rtf\/membership-requests\?status=PENDING&limit=5$/);
    expect((opts.headers as Record<string, string>).Authorization).toBe("Bearer test-token");
  });

  it("Empty state (backend `{ requests: [] }`) → requests = []", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ requests: [] }),
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => usePendingMembershipRequests(ORG_ID), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.requests).toEqual([]);
    expect(result.current.isError).toBe(false);
  });

  it("3 PENDING avec providerProfile → mapping person → applicant correct (specialty = specialties[0])", async () => {
    const backendResponse = {
      requests: [
        {
          id: "req-1",
          organizationId: ORG_ID,
          personId: "p-1",
          status: "PENDING",
          motivationMessage: "Je veux rejoindre le réseau.",
          createdAt: "2026-05-30T10:00:00Z",
          person: {
            id: "p-1",
            firstName: "Alice",
            lastName: "Durand",
            providerProfile: { specialties: ["NUTRITIONIST", "ENDOCRINOLOGIST"] },
          },
        },
        {
          id: "req-2",
          organizationId: ORG_ID,
          personId: "p-2",
          status: "PENDING",
          motivationMessage: null,
          createdAt: "2026-05-29T10:00:00Z",
          person: {
            id: "p-2",
            firstName: "Bob",
            lastName: "Martin",
            providerProfile: { specialties: ["PSYCHIATRIST"] },
          },
        },
        {
          id: "req-3",
          organizationId: ORG_ID,
          personId: "p-3",
          status: "PENDING",
          motivationMessage: "Spécialiste TCA.",
          createdAt: "2026-05-28T10:00:00Z",
          person: {
            id: "p-3",
            firstName: "Chloé",
            lastName: "Petit",
            providerProfile: { specialties: [] },
          },
        },
      ],
    };
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => backendResponse,
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => usePendingMembershipRequests(ORG_ID), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.requests.length).toBe(3));

    const [r1, r2, r3] = result.current.requests;
    expect(r1.id).toBe("req-1");
    expect(r1.motivationMessage).toBe("Je veux rejoindre le réseau.");
    expect(r1.applicant).toEqual({
      id: "p-1",
      firstName: "Alice",
      lastName: "Durand",
      specialty: "NUTRITIONIST",
      city: null,
      photoUrl: null,
    });

    expect(r2.applicant.specialty).toBe("PSYCHIATRIST");
    expect(r2.motivationMessage).toBeNull();

    // specialties[] vide → specialty null
    expect(r3.applicant.specialty).toBeNull();

    // person doit avoir été extrait — pas re-exposé sur la row mappée
    expect((r1 as unknown as { person?: unknown }).person).toBeUndefined();
  });

  it("Person sans providerProfile (ORG_ADMIN pur, applicant non-soignant) → specialty null", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        requests: [
          {
            id: "req-1",
            organizationId: ORG_ID,
            personId: "p-1",
            status: "PENDING",
            motivationMessage: "Coordinatrice CPTS.",
            createdAt: "2026-05-30T10:00:00Z",
            person: {
              id: "p-1",
              firstName: "Sylvie",
              lastName: "Bernard",
              providerProfile: null,
            },
          },
        ],
      }),
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => usePendingMembershipRequests(ORG_ID), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.requests.length).toBe(1));
    expect(result.current.requests[0].applicant.specialty).toBeNull();
    expect(result.current.requests[0].applicant.firstName).toBe("Sylvie");
  });

  it("Erreur réseau (response.ok=false) → isError true, requests vide", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 403,
      json: async () => ({ error: "Forbidden" }),
    }) as unknown as typeof fetch;

    const { result } = renderHook(() => usePendingMembershipRequests(ORG_ID), {
      wrapper: makeWrapper(),
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(result.current.requests).toEqual([]);
  });
});
