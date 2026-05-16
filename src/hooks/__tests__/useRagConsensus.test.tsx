import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { useRagConsensus } from "../useRagConsensus";
import * as apiModule from "@/lib/api";

// Mock useAuthStore : on retourne un token fixe pour tous les tests
vi.mock("@/lib/store", () => ({
  useAuthStore: () => ({ accessToken: "test-token" }),
}));

const mockConsensusResponse: apiModule.ConsensusResponse = {
  query: "q",
  totalResults: 5,
  consensusBlocks: [
    {
      kind: "IMC",
      consensusValue: 13,
      unit: "kg/m²",
      occurrences: 3,
      sources: [],
      severityDistribution: {
        CRITICAL: 1,
        WARNING: 2,
        NORMAL: 0,
        UNKNOWN: 0,
      },
      dominantSeverity: "WARNING",
    },
  ],
  uniqueSources: ["HAS", "FFAB", "DSM-5"],
  cached: false,
  generatedAt: "2026-05-13T00:00:00.000Z",
};

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return Wrapper;
}

describe("useRagConsensus", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("fetches consensus when query.length >= 3", async () => {
    const spy = vi
      .spyOn(apiModule, "apiWithToken")
      .mockReturnValue({
        intelligence: {
          consensus: vi.fn().mockResolvedValue(mockConsensusResponse),
        },
      } as never);

    const { result } = renderHook(
      () => useRagConsensus("critères hospitalisation"),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.consensusBlocks).toHaveLength(1);
    expect(result.current.data?.consensusBlocks[0].kind).toBe("IMC");
    expect(spy).toHaveBeenCalled();
  });

  it("does not fetch when query is empty", async () => {
    const consensusFn = vi.fn().mockResolvedValue(mockConsensusResponse);
    vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
      intelligence: { consensus: consensusFn },
    } as never);

    const { result } = renderHook(() => useRagConsensus(""), {
      wrapper: makeWrapper(),
    });

    // Donne le temps à React Query de NE PAS lancer la requête
    await new Promise((r) => setTimeout(r, 50));
    expect(result.current.isFetching).toBe(false);
    expect(consensusFn).not.toHaveBeenCalled();
  });

  it("does not fetch when query.length < 3", async () => {
    const consensusFn = vi.fn().mockResolvedValue(mockConsensusResponse);
    vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
      intelligence: { consensus: consensusFn },
    } as never);

    const { result } = renderHook(() => useRagConsensus("ab"), {
      wrapper: makeWrapper(),
    });

    await new Promise((r) => setTimeout(r, 50));
    expect(result.current.isFetching).toBe(false);
    expect(consensusFn).not.toHaveBeenCalled();
  });

  it("respects enabled: false even with valid query", async () => {
    const consensusFn = vi.fn().mockResolvedValue(mockConsensusResponse);
    vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
      intelligence: { consensus: consensusFn },
    } as never);

    const { result } = renderHook(
      () => useRagConsensus("critères hospitalisation", { enabled: false }),
      { wrapper: makeWrapper() },
    );

    await new Promise((r) => setTimeout(r, 50));
    expect(result.current.isFetching).toBe(false);
    expect(consensusFn).not.toHaveBeenCalled();
  });

  it("propagates fetch error to result.error", async () => {
    const consensusFn = vi.fn().mockRejectedValue(new Error("boom"));
    vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
      intelligence: { consensus: consensusFn },
    } as never);

    const { result } = renderHook(
      () => useRagConsensus("critères hospitalisation"),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isError).toBe(true), {
      timeout: 5000,
    });
    expect(result.current.error?.message).toBe("boom");
  });

  it("passes limit option to the API call", async () => {
    const consensusFn = vi.fn().mockResolvedValue(mockConsensusResponse);
    vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
      intelligence: { consensus: consensusFn },
    } as never);

    renderHook(
      () => useRagConsensus("critères hospitalisation", { limit: 25 }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(consensusFn).toHaveBeenCalled());
    expect(consensusFn).toHaveBeenCalledWith(
      "critères hospitalisation",
      25,
    );
  });
});
