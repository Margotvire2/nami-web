import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useMarkNotificationAsRead } from "../usePatientNotifications";
import * as apiModule from "@/lib/api";

// Mock useAuthStore : token fixe pour tous les tests
vi.mock("@/lib/store", () => ({
  useAuthStore: (selector: (s: { accessToken: string }) => unknown) =>
    selector({ accessToken: "test-token" }),
}));

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
      mutations: { retry: false },
    },
  });
  const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return { Wrapper, invalidateSpy };
}

describe("useMarkNotificationAsRead", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("calls markRead API with notification id and invalidates patient-notifications", async () => {
    const markReadFn = vi.fn().mockResolvedValue({ success: true });
    vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
      patient: {
        notifications: {
          markRead: markReadFn,
        },
      },
    } as never);

    const { Wrapper, invalidateSpy } = makeWrapper();
    const { result } = renderHook(() => useMarkNotificationAsRead(), {
      wrapper: Wrapper,
    });

    await act(async () => {
      await result.current.mutateAsync("notif-123");
    });

    expect(markReadFn).toHaveBeenCalledWith("notif-123");
    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["patient-notifications"],
      }),
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it("logs and surfaces error when API rejects, without throwing through .mutate", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    const markReadFn = vi.fn().mockRejectedValue(new Error("403 forbidden"));
    vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
      patient: {
        notifications: {
          markRead: markReadFn,
        },
      },
    } as never);

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useMarkNotificationAsRead(), {
      wrapper: Wrapper,
    });

    act(() => {
      result.current.mutate("notif-456");
    });

    await waitFor(() => expect(result.current.isError).toBe(true));
    expect(markReadFn).toHaveBeenCalledWith("notif-456");
    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });
});
