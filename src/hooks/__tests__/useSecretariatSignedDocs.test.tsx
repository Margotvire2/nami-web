import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { useSecretariatSignedDocs } from "../useSecretariatSignedDocs";

function makeWrapper() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0, staleTime: 0 } },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return Wrapper;
}

const fixtureItems = [
  {
    id: "doc-1",
    title: "Ordonnance - Léa Rousseau",
    signedAt: "2026-06-04T09:00:00Z",
    patient: { id: "p1", firstName: "Léa", lastName: "Rousseau" },
  },
  {
    id: "doc-2",
    title: "Ordonnance - Marc Dupont",
    signedAt: "2026-06-04T11:30:00Z",
    patient: { id: "p2", firstName: "Marc", lastName: "Dupont" },
  },
];

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("useSecretariatSignedDocs", () => {
  beforeEach(() => {
    vi.unstubAllGlobals();
  });

  it("retourne tableau vide gracieusement sur 404 (endpoint backend pas livré)", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Not Found", { status: 404 })),
    );

    const { result } = renderHook(
      () =>
        useSecretariatSignedDocs({
          accessToken: "t1",
          userId: "u1",
        }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("retourne tableau vide gracieusement sur 501 Not Implemented", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Not Implemented", { status: 501 })),
    );

    const { result } = renderHook(
      () =>
        useSecretariatSignedDocs({ accessToken: "t1", userId: "u1" }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("retourne tableau vide gracieusement sur 500", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => new Response("Boom", { status: 500 })),
    );

    const { result } = renderHook(
      () =>
        useSecretariatSignedDocs({ accessToken: "t1", userId: "u1" }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it("parse correctement une réponse 200 { items: [...] }", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(
        async () =>
          new Response(JSON.stringify({ items: fixtureItems }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }),
      ),
    );

    const { result } = renderHook(
      () =>
        useSecretariatSignedDocs({ accessToken: "t1", userId: "u1" }),
      { wrapper: makeWrapper() },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data[0]!.id).toBe("doc-1");
    expect(result.current.data[1]!.patient.lastName).toBe("Dupont");
  });

  it("ne fetch pas tant qu'il n'y a pas d'accessToken", async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const { result } = renderHook(
      () =>
        useSecretariatSignedDocs({ accessToken: null, userId: null }),
      { wrapper: makeWrapper() },
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(result.current.data).toEqual([]);
  });
});
