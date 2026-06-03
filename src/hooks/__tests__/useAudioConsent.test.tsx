import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useAudioConsent, AUDIO_CONSENT_SCOPE } from "../useAudioConsent";
import * as apiModule from "@/lib/api";

vi.mock("@/lib/store", () => ({
  useAuthStore: () => ({ accessToken: "test-token" }),
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

function mockApi(matrix: unknown, grantImpl?: (...args: unknown[]) => unknown) {
  const matrixFn = vi.fn().mockResolvedValue(matrix);
  const grantFn = vi.fn().mockImplementation(grantImpl ?? (async () => ({ id: "c1" })));
  vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
    persons: {
      consentsMatrix: matrixFn,
      grantConsent: grantFn,
    },
  } as never);
  return { matrixFn, grantFn };
}

describe("useAudioConsent", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns hasConsented=false when the matrix has no transcription_audio entry", async () => {
    const { matrixFn } = mockApi({
      AI_PROCESSING: { __global__: false },
      RGPD_PROCESSING: { __global__: true },
    });

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useAudioConsent("person-1"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(matrixFn).toHaveBeenCalledWith("person-1");
    expect(result.current.hasConsented).toBe(false);
  });

  it("returns hasConsented=true when transcription_audio is granted", async () => {
    mockApi({
      AI_PROCESSING: { transcription_audio: true, __global__: false },
    });

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useAudioConsent("person-1"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.hasConsented).toBe(true));
  });

  it("falls back to global AI_PROCESSING consent if scope is missing", async () => {
    mockApi({
      AI_PROCESSING: { __global__: true },
    });

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useAudioConsent("person-1"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.hasConsented).toBe(true));
  });

  it("grant() POSTs AI_PROCESSING + scope=transcription_audio + granted=true and invalidates", async () => {
    const { grantFn } = mockApi({ AI_PROCESSING: { __global__: false } });

    const { Wrapper, invalidateSpy } = makeWrapper();
    const { result } = renderHook(() => useAudioConsent("person-1"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    await act(async () => {
      await result.current.grant.mutateAsync({ source: "WEB" });
    });

    expect(grantFn).toHaveBeenCalledWith("person-1", expect.objectContaining({
      consentType: "AI_PROCESSING",
      granted: true,
      scope: AUDIO_CONSENT_SCOPE,
      source: "WEB",
    }));
    await waitFor(() =>
      expect(invalidateSpy).toHaveBeenCalledWith({
        queryKey: ["audio-consent", "person-1"],
      }),
    );
  });

  it("refuse() POSTs granted=false with same scope (event-sourced revocation)", async () => {
    const { grantFn } = mockApi({ AI_PROCESSING: { transcription_audio: true } });

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(() => useAudioConsent("person-1"), {
      wrapper: Wrapper,
    });

    await waitFor(() => expect(result.current.hasConsented).toBe(true));

    await act(async () => {
      await result.current.refuse.mutateAsync(undefined);
    });

    expect(grantFn).toHaveBeenCalledWith("person-1", expect.objectContaining({
      consentType: "AI_PROCESSING",
      granted: false,
      scope: AUDIO_CONSENT_SCOPE,
    }));
  });

  it("does not query if patientPersonId is null", async () => {
    const { matrixFn } = mockApi({ AI_PROCESSING: {} });

    const { Wrapper } = makeWrapper();
    renderHook(() => useAudioConsent(null), { wrapper: Wrapper });

    // Wait a tick — the query must remain disabled
    await new Promise((r) => setTimeout(r, 30));
    expect(matrixFn).not.toHaveBeenCalled();
  });
});
