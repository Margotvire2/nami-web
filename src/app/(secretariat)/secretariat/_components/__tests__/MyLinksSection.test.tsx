import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import MyLinksSection from "../MyLinksSection";
import * as apiModule from "@/lib/api";
import type { SecretariatLink, SecretariatLinkStatus, SecretariatLinksResponse } from "@/lib/api";

vi.mock("@/lib/store", () => ({
  useAuthStore: () => ({
    accessToken: "test-token",
    user: { id: "sec-1", firstName: "Aline", lastName: "Dubois", email: "aline@cab.fr", roleType: "SECRETARY" },
  }),
}));

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
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

function makeLink(over: Partial<SecretariatLink> = {}): SecretariatLink {
  return {
    id:                "l-active",
    secretaryPersonId: "sec-1",
    providerPersonId:  "prov-1",
    status:            "ACTIVE",
    scope:             ["APPOINTMENTS", "DOCUMENTS", "MESSAGES"],
    requestedAt:       new Date(Date.now() - 86_400_000).toISOString(),
    acceptedAt:        new Date(Date.now() - 3600_000).toISOString(),
    revokedAt:         null,
    requestMessage:    null,
    counterpart: {
      id:        "prov-1",
      firstName: "Dr Pierre",
      lastName:  "Martin",
      email:     "pierre@hopital.fr",
      phone:     null,
    },
    ...over,
  };
}

function mockByStatus(byStatus: Partial<Record<SecretariatLinkStatus, SecretariatLink[]>>) {
  vi.spyOn(apiModule.secretariatApi, "listMyLinks").mockImplementation(
    (_token, params) => {
      const s = params?.status;
      const links = (s ? byStatus[s] : undefined) ?? [];
      return Promise.resolve({
        asRole: "SECRETARY",
        links,
      } as SecretariatLinksResponse);
    },
  );
}

describe("MyLinksSection", () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  afterEach(() => { cleanup(); });

  it("renders the 3 sections (ACTIVE / PENDING / HISTORY)", async () => {
    mockByStatus({
      ACTIVE:   [makeLink({ id: "l-a", status: "ACTIVE" })],
      PENDING:  [makeLink({ id: "l-p", status: "PENDING" })],
      REJECTED: [makeLink({ id: "l-r", status: "REJECTED", acceptedAt: null, revokedAt: new Date().toISOString() })],
      REVOKED:  [makeLink({ id: "l-v", status: "REVOKED", acceptedAt: null, revokedAt: new Date().toISOString() })],
    });

    render(<MyLinksSection />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId("my-section-active")).toBeInTheDocument();
    });
    expect(screen.getByTestId("my-section-pending")).toBeInTheDocument();
    expect(screen.getByTestId("my-section-history")).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByTestId("my-link-l-a")).toBeInTheDocument();
    });
    expect(screen.getByTestId("my-link-l-p")).toBeInTheDocument();
    expect(screen.getByTestId("my-link-l-r")).toBeInTheDocument();
    expect(screen.getByTestId("my-link-l-v")).toBeInTheDocument();
  });

  it("shows empty-state message when ACTIVE is empty", async () => {
    mockByStatus({ ACTIVE: [] });
    render(<MyLinksSection />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(
        screen.getByText(/Votre accès au secrétariat sera disponible/i),
      ).toBeInTheDocument();
    });
  });

  it("revoke flow: clicking Révoquer opens modal, confirming calls revokeLink", async () => {
    mockByStatus({
      ACTIVE: [makeLink({ id: "l-a", status: "ACTIVE" })],
    });
    const delSpy = vi
      .spyOn(apiModule.secretariatApi, "revokeLink")
      .mockResolvedValue({ link: makeLink({ id: "l-a", status: "REVOKED" }) });

    render(<MyLinksSection />, { wrapper: makeWrapper() });

    const btn = await screen.findByTestId("revoke-button-l-a");
    fireEvent.click(btn);

    // Modal opens
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByText(/Révoquer ce rattachement/i)).toBeInTheDocument();

    // Confirm
    const confirmBtn = screen.getAllByRole("button", { name: /Révoquer/i }).pop()!;
    fireEvent.click(confirmBtn);

    await waitFor(() => expect(delSpy).toHaveBeenCalled());
    expect(delSpy).toHaveBeenCalledWith("test-token", "l-a");
  });
});
