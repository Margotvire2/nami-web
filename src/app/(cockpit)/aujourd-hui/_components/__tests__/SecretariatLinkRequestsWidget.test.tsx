import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import SecretariatLinkRequestsWidget from "../SecretariatLinkRequestsWidget";
import * as apiModule from "@/lib/api";
import type { SecretariatLink, SecretariatLinksResponse } from "@/lib/api";

vi.mock("@/lib/store", () => ({
  useAuthStore: () => ({
    accessToken: "test-token",
    user: { id: "prov-1", firstName: "Dr", lastName: "Test", email: "dr@test.fr", roleType: "PROVIDER" },
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error:   vi.fn(),
  },
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
    id:                "link-1",
    secretaryPersonId: "sec-1",
    providerPersonId:  "prov-1",
    status:            "PENDING",
    scope:             ["APPOINTMENTS", "DOCUMENTS", "MESSAGES"],
    requestedAt:       new Date(Date.now() - 30 * 60_000).toISOString(),
    acceptedAt:        null,
    revokedAt:         null,
    requestMessage:    "Bonjour, je gère le secrétariat.",
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

function mockList(links: SecretariatLink[]) {
  vi.spyOn(apiModule.secretariatApi, "listMyLinks").mockResolvedValue({
    asRole: "PROVIDER",
    links,
  } as SecretariatLinksResponse);
}

describe("SecretariatLinkRequestsWidget", () => {
  beforeEach(() => { vi.restoreAllMocks(); });
  afterEach(() => { cleanup(); });

  it("renders nothing when there are zero pending requests", async () => {
    mockList([]);
    const { container } = render(<SecretariatLinkRequestsWidget />, { wrapper: makeWrapper() });
    await waitFor(() => expect(container.firstChild).toBeNull());
    expect(screen.queryByRole("region", { name: /demandes de rattachement secrétariat/i })).toBeNull();
  });

  it("renders pending count badge and the requester name", async () => {
    mockList([
      makeLink({ id: "l-1" }),
      makeLink({
        id: "l-2",
        counterpart: { id: "sec-2", firstName: "Marc", lastName: "Petit", email: "marc@cab.fr", phone: null },
      }),
    ]);

    render(<SecretariatLinkRequestsWidget />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: /demandes de rattachement secrétariat/i }),
      ).toBeInTheDocument();
    });

    const badge = screen.getByTestId("secretariat-pending-badge");
    expect(badge.textContent).toMatch(/2 en attente/);
    expect(screen.getByText(/Aline Dubois/)).toBeInTheDocument();
    expect(screen.getByText(/Marc Petit/)).toBeInTheDocument();
  });

  it("clicking Accepter calls patchLink with ACCEPT", async () => {
    mockList([makeLink({ id: "l-1" })]);
    const patchSpy = vi
      .spyOn(apiModule.secretariatApi, "patchLink")
      .mockResolvedValue({ link: makeLink({ id: "l-1", status: "ACTIVE" }) });

    render(<SecretariatLinkRequestsWidget />, { wrapper: makeWrapper() });

    const acceptBtn = await screen.findByTestId("accept-l-1");
    fireEvent.click(acceptBtn);

    await waitFor(() => expect(patchSpy).toHaveBeenCalled());
    expect(patchSpy).toHaveBeenCalledWith("test-token", "l-1", "ACCEPT");
  });

  it("clicking Refuser calls patchLink with REJECT", async () => {
    mockList([makeLink({ id: "l-1" })]);
    const patchSpy = vi
      .spyOn(apiModule.secretariatApi, "patchLink")
      .mockResolvedValue({ link: makeLink({ id: "l-1", status: "REJECTED" }) });

    render(<SecretariatLinkRequestsWidget />, { wrapper: makeWrapper() });

    const rejectBtn = await screen.findByTestId("reject-l-1");
    fireEvent.click(rejectBtn);

    await waitFor(() => expect(patchSpy).toHaveBeenCalled());
    expect(patchSpy).toHaveBeenCalledWith("test-token", "l-1", "REJECT");
  });
});
