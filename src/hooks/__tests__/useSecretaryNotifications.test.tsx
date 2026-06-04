import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, cleanup } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useSecretaryNotifications } from "../useSecretaryNotifications";
import * as apiModule from "@/lib/api";

vi.mock("@/lib/store", () => ({
  useAuthStore: (selector: (s: { accessToken: string; user: { id: string } }) => unknown) =>
    selector({ accessToken: "test-token", user: { id: "sec-1" } }),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return Wrapper;
}

describe("useSecretaryNotifications", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    cleanup();
  });

  it("returns feed data when api succeeds", async () => {
    const feedFn = vi.fn().mockResolvedValue({
      items: [
        {
          id: "notif-1",
          recipientId: "sec-1",
          type: "SECRETARIAT_LINK_ACCEPTED",
          title: "Dr Martin a accepté votre rattachement",
          body: null,
          appointmentId: null,
          messageId: null,
          documentId: null,
          careCaseId: null,
          createdAt: new Date().toISOString(),
          readAt: null,
          archivedAt: null,
          deliveries: [],
        },
      ],
      counts: { unread: 1, total: 1 },
    });
    vi.spyOn(apiModule, "secretaryApi").mockReturnValue({
      notifications: { feed: feedFn },
    } as never);

    const Wrapper = makeWrapper();
    const { result } = renderHook(() => useSecretaryNotifications({ limit: 20 }), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(feedFn).toHaveBeenCalledWith({ limit: 20 });
    expect(result.current.data?.counts.unread).toBe(1);
    expect(result.current.data?.items).toHaveLength(1);
  });

  it("returns empty feed gracefully on 404 (endpoint not yet deployed)", async () => {
    const err = { status: 404, message: "Not found" };
    const feedFn = vi.fn().mockRejectedValue(err);
    vi.spyOn(apiModule, "secretaryApi").mockReturnValue({
      notifications: { feed: feedFn },
    } as never);

    const Wrapper = makeWrapper();
    const { result } = renderHook(() => useSecretaryNotifications(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toEqual({ items: [], counts: { unread: 0, total: 0 } });
  });

  it("propagates non-404 errors instead of swallowing them", async () => {
    const err = { status: 500, message: "Server crashed" };
    const feedFn = vi.fn().mockRejectedValue(err);
    vi.spyOn(apiModule, "secretaryApi").mockReturnValue({
      notifications: { feed: feedFn },
    } as never);

    const Wrapper = makeWrapper();
    const { result } = renderHook(() => useSecretaryNotifications(), { wrapper: Wrapper });

    await waitFor(() => expect(result.current.isError).toBe(true));
  });
});
