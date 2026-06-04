import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import {
  useSecretariatLinks,
  useAcceptSecretariatLink,
  useRejectSecretariatLink,
  useRevokeSecretariatLink,
} from "../useSecretariatLinks";
import * as apiModule from "@/lib/api";
import type {
  SecretariatLink,
  SecretariatLinksResponse,
} from "@/lib/api";

vi.mock("@/lib/store", () => ({
  useAuthStore: () => ({
    accessToken: "test-token",
    user: { id: "person-1", firstName: "P", lastName: "P", email: "p@p.fr", roleType: "PROVIDER" },
  }),
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
  return { Wrapper, queryClient };
}

function makeLink(over: Partial<SecretariatLink> = {}): SecretariatLink {
  return {
    id:                "link-1",
    secretaryPersonId: "sec-1",
    providerPersonId:  "prov-1",
    status:            "PENDING",
    scope:             ["APPOINTMENTS", "DOCUMENTS", "MESSAGES"],
    requestedAt:       new Date().toISOString(),
    acceptedAt:        null,
    revokedAt:         null,
    requestMessage:    "Bonjour, je gère le cabinet.",
    counterpart: {
      id:        "sec-1",
      firstName: "Aline",
      lastName:  "Dubois",
      email:     "aline@cabinet.fr",
      phone:     null,
    },
    ...over,
  };
}

describe("useSecretariatLinks hooks", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("useSecretariatLinks PROVIDER + PENDING → appelle listMyLinks avec status filter", async () => {
    const links = [makeLink({ id: "link-1", status: "PENDING" })];
    const listSpy = vi
      .spyOn(apiModule.secretariatApi, "listMyLinks")
      .mockResolvedValue({ asRole: "PROVIDER", links } as SecretariatLinksResponse);

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(
      () => useSecretariatLinks("PROVIDER", "PENDING"),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(listSpy).toHaveBeenCalledWith("test-token", { status: "PENDING" });
    expect(result.current.data?.links).toHaveLength(1);
    expect(result.current.data?.links[0].id).toBe("link-1");
  });

  it("useSecretariatLinks SECRETARY sans status → status undefined", async () => {
    const listSpy = vi
      .spyOn(apiModule.secretariatApi, "listMyLinks")
      .mockResolvedValue({ asRole: "SECRETARY", links: [] });

    const { Wrapper } = makeWrapper();
    const { result } = renderHook(
      () => useSecretariatLinks("SECRETARY"),
      { wrapper: Wrapper },
    );

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(listSpy).toHaveBeenCalledWith("test-token", { status: undefined });
  });

  it("useAcceptSecretariatLink → PATCH ACCEPT et invalide la cache", async () => {
    const link = makeLink({ status: "ACTIVE" });
    const patchSpy = vi
      .spyOn(apiModule.secretariatApi, "patchLink")
      .mockResolvedValue({ link });

    const { Wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useAcceptSecretariatLink(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync("link-1");
    });

    expect(patchSpy).toHaveBeenCalledWith("test-token", "link-1", "ACCEPT");
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["secretariat-links", "person-1"],
    });
  });

  it("useRejectSecretariatLink → PATCH REJECT et invalide la cache", async () => {
    const link = makeLink({ status: "REJECTED" });
    const patchSpy = vi
      .spyOn(apiModule.secretariatApi, "patchLink")
      .mockResolvedValue({ link });

    const { Wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useRejectSecretariatLink(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync("link-1");
    });

    expect(patchSpy).toHaveBeenCalledWith("test-token", "link-1", "REJECT");
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["secretariat-links", "person-1"],
    });
  });

  it("useRevokeSecretariatLink → DELETE et invalide la cache", async () => {
    const link = makeLink({ status: "REVOKED" });
    const delSpy = vi
      .spyOn(apiModule.secretariatApi, "revokeLink")
      .mockResolvedValue({ link });

    const { Wrapper, queryClient } = makeWrapper();
    const invalidateSpy = vi.spyOn(queryClient, "invalidateQueries");

    const { result } = renderHook(() => useRevokeSecretariatLink(), { wrapper: Wrapper });

    await act(async () => {
      await result.current.mutateAsync("link-1");
    });

    expect(delSpy).toHaveBeenCalledWith("test-token", "link-1");
    expect(invalidateSpy).toHaveBeenCalledWith({
      queryKey: ["secretariat-links", "person-1"],
    });
  });
});
