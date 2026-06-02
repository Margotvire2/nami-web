import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMyEvents } from "../useMyEvents";
import type { EventListItem } from "../useOrgEvents";

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("@/lib/store", () => ({
  useAuthStore: (selector: (s: { accessToken: string; user: { id: string } }) => unknown) =>
    selector({ accessToken: "test-token", user: { id: "me-1" } }),
}));

const mineMock = vi.fn();
vi.mock("@/lib/api", async () => {
  const actual = await vi.importActual<typeof import("@/lib/api")>("@/lib/api");
  return {
    ...actual,
    organizationsApi: {
      ...actual.organizationsApi,
      mine: (...args: unknown[]) => mineMock(...args),
    },
  };
});

function makeEvent(overrides: Partial<EventListItem> = {}): EventListItem {
  const start = new Date(Date.now() + 86_400_000).toISOString();
  const end = new Date(Date.now() + 86_400_000 + 3_600_000).toISOString();
  return {
    id: "evt-1",
    type: "RCP_ELARGIE",
    title: "RCP TCA",
    description: null,
    startAt: start,
    endAt: end,
    format: "VISIO",
    locationLabel: null,
    visioUrl: "https://meet.example.com/x",
    visibility: "ORGANIZATION_MEMBERS",
    status: "PUBLISHED",
    maxParticipants: null,
    isDpcEligible: false,
    dpcReferenceCode: null,
    workingGroupConvId: null,
    acceptsPatientSubmissions: false,
    patientSubmissionDeadline: null,
    cancelledAt: null,
    cancelReason: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: {
      id: "u1",
      firstName: "Margot",
      lastName: "Vire",
      photoUrl: null,
    },
    _count: { participants: 2, patientSubmissions: 0 },
    ...overrides,
  };
}

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "TestWrapper";
  return Wrapper;
}

describe("useMyEvents", () => {
  beforeEach(() => {
    mineMock.mockReset();
  });

  it("aucune org → liste vide, pas de fetch events", async () => {
    mineMock.mockResolvedValue([]);
    const fetchSpy = vi.fn();
    global.fetch = fetchSpy as unknown as typeof fetch;
    const { result } = renderHook(() => useMyEvents(), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.events).toEqual([]);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it("fan-out sur 2 orgs → fetch parallèle + merge + tri ascendant si upcoming", async () => {
    mineMock.mockResolvedValue([
      { id: "org-a", name: "Org A", type: "NETWORK", memberCount: 1, myRole: "MEMBER" },
      { id: "org-b", name: "Org B", type: "NETWORK", memberCount: 1, myRole: "MEMBER" },
    ]);
    const fetchSpy = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("/organizations/org-a/events")) {
        return {
          ok: true,
          json: async () => ({
            count: 1,
            events: [
              makeEvent({
                id: "ev-a",
                startAt: new Date(Date.now() + 7 * 86_400_000).toISOString(),
                endAt: new Date(Date.now() + 7 * 86_400_000 + 3_600_000).toISOString(),
              }),
            ],
          }),
        };
      }
      if (url.includes("/organizations/org-b/events")) {
        return {
          ok: true,
          json: async () => ({
            count: 1,
            events: [
              makeEvent({
                id: "ev-b",
                startAt: new Date(Date.now() + 2 * 86_400_000).toISOString(),
                endAt: new Date(Date.now() + 2 * 86_400_000 + 3_600_000).toISOString(),
              }),
            ],
          }),
        };
      }
      return { ok: false, status: 500, json: async () => ({}) };
    });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const { result } = renderHook(() => useMyEvents({ upcoming: true }), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.events).toHaveLength(2);
    // ev-b est plus proche → vient en premier (tri ascendant pour upcoming).
    expect(result.current.events[0].id).toBe("ev-b");
    expect(result.current.events[0].organizationId).toBe("org-b");
    expect(result.current.events[0].organizationName).toBe("Org B");
    expect(result.current.events[1].id).toBe("ev-a");
  });

  it("propage les filtres status/type dans la querystring", async () => {
    mineMock.mockResolvedValue([
      { id: "org-a", name: "Org A", type: "NETWORK", memberCount: 1, myRole: "MEMBER" },
    ]);
    const fetchSpy = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ count: 0, events: [] }),
    });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const { result } = renderHook(
      () => useMyEvents({ status: "PUBLISHED", type: "RCP_ELARGIE", upcoming: true }),
      { wrapper: makeWrapper() },
    );
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(fetchSpy).toHaveBeenCalledTimes(1);
    const [url] = fetchSpy.mock.calls[0] as [string];
    expect(url).toContain("status=PUBLISHED");
    expect(url).toContain("type=RCP_ELARGIE");
    expect(url).toContain("upcoming=true");
  });

  it("une org en erreur ne casse pas le merge (Promise.allSettled)", async () => {
    mineMock.mockResolvedValue([
      { id: "org-ok", name: "Org OK", type: "NETWORK", memberCount: 1, myRole: "MEMBER" },
      { id: "org-403", name: "Org 403", type: "NETWORK", memberCount: 1, myRole: "MEMBER" },
    ]);
    const fetchSpy = vi.fn().mockImplementation(async (url: string) => {
      if (url.includes("org-403")) {
        return { ok: false, status: 403, json: async () => ({ error: "forbidden" }) };
      }
      return {
        ok: true,
        json: async () => ({
          count: 1,
          events: [makeEvent({ id: "ev-ok" })],
        }),
      };
    });
    global.fetch = fetchSpy as unknown as typeof fetch;

    const { result } = renderHook(() => useMyEvents(), {
      wrapper: makeWrapper(),
    });
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.events).toHaveLength(1);
    expect(result.current.events[0].id).toBe("ev-ok");
  });
});
