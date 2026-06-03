import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { MembershipRequestsList } from "../MembershipRequestsList";

vi.mock("@/lib/store", () => ({
  useAuthStore: (selector: (s: { accessToken: string }) => unknown) =>
    selector({ accessToken: "tok" }),
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

const ORG_ID = "org-list";

function mockFetch(rows: unknown[]) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ requests: rows }),
  }) as unknown as typeof fetch;
}

const personJeanne = {
  id: "p-1",
  firstName: "Jeanne",
  lastName: "Dubois",
  providerProfile: { specialties: ["NUTRITIONIST"] },
};
const personPaul = {
  id: "p-2",
  firstName: "Paul",
  lastName: "Martin",
  providerProfile: { specialties: ["PSYCHIATRIST"] },
};
const personLea = {
  id: "p-3",
  firstName: "Léa",
  lastName: "Rousseau",
  providerProfile: { specialties: ["DIETETICIAN"] },
};

const rows = [
  {
    id: "req-pending",
    organizationId: ORG_ID,
    personId: "p-1",
    status: "PENDING",
    motivationMessage: "À valider",
    createdAt: "2026-05-30T10:00:00Z",
    person: personJeanne,
  },
  {
    id: "req-accepted",
    organizationId: ORG_ID,
    personId: "p-2",
    status: "ACCEPTED",
    motivationMessage: "Approuvée",
    createdAt: "2026-05-20T10:00:00Z",
    reviewedAt: "2026-05-22T10:00:00Z",
    person: personPaul,
    reviewedBy: { id: "p-rev", firstName: "Sylvie", lastName: "B." },
  },
  {
    id: "req-rejected",
    organizationId: ORG_ID,
    personId: "p-3",
    status: "REJECTED",
    motivationMessage: "Refusée",
    createdAt: "2026-05-15T10:00:00Z",
    reviewedAt: "2026-05-16T10:00:00Z",
    person: personLea,
    reviewedBy: { id: "p-rev", firstName: "Sylvie", lastName: "B." },
  },
];

describe("MembershipRequestsList", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rend les 4 onglets avec compteurs PENDING/ACCEPTED/REJECTED/Total", async () => {
    mockFetch(rows);
    render(<MembershipRequestsList orgId={ORG_ID} />, { wrapper: makeWrapper() });

    // Attendre que la data soit chargée (compteur Toutes passe de 0 à 3).
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /toutes/i })).toHaveTextContent("3");
    });

    expect(screen.getByRole("tab", { name: /en attente/i })).toHaveTextContent("1");
    expect(screen.getByRole("tab", { name: /approuvées/i })).toHaveTextContent("1");
    expect(screen.getByRole("tab", { name: /refusées/i })).toHaveTextContent("1");
  });

  it("démarre sur l'onglet PENDING actif", async () => {
    mockFetch(rows);
    render(<MembershipRequestsList orgId={ORG_ID} />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /en attente/i })).toHaveAttribute(
        "aria-selected",
        "true",
      );
    });
  });

  it("PENDING par défaut → n'affiche que Jeanne (req-pending)", async () => {
    mockFetch(rows);
    render(<MembershipRequestsList orgId={ORG_ID} />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(screen.getByText(/jeanne dubois/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/paul martin/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/léa rousseau/i)).not.toBeInTheDocument();
  });

  it("click onglet APPROUVÉES → n'affiche que Paul (req-accepted)", async () => {
    mockFetch(rows);
    render(<MembershipRequestsList orgId={ORG_ID} />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(screen.getByText(/jeanne dubois/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("tab", { name: /approuvées/i }));
    await waitFor(() => {
      expect(screen.getByText(/paul martin/i)).toBeInTheDocument();
    });
    expect(screen.queryByText(/jeanne dubois/i)).not.toBeInTheDocument();
  });

  it("click onglet TOUTES → affiche les 3", async () => {
    mockFetch(rows);
    render(<MembershipRequestsList orgId={ORG_ID} />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(screen.getByText(/jeanne dubois/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("tab", { name: /toutes/i }));
    await waitFor(() => {
      expect(screen.getByText(/paul martin/i)).toBeInTheDocument();
    });
    expect(screen.getByText(/jeanne dubois/i)).toBeInTheDocument();
    expect(screen.getByText(/léa rousseau/i)).toBeInTheDocument();
  });

  it("empty state PENDING : message 'Aucune demande d'adhésion en attente'", async () => {
    mockFetch([]);
    render(<MembershipRequestsList orgId={ORG_ID} />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(
        screen.getByText(/aucune demande d'adhésion en attente/i),
      ).toBeInTheDocument();
    });
  });

  it("click 'Examiner' sur une row PENDING → ouvre la modal", async () => {
    mockFetch(rows);
    render(<MembershipRequestsList orgId={ORG_ID} />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(screen.getByText(/jeanne dubois/i)).toBeInTheDocument();
    });
    fireEvent.click(screen.getByRole("button", { name: /examiner/i }));
    expect(screen.getByTestId("membership-review-modal")).toBeInTheDocument();
  });

  it("erreur réseau → alerte 'Impossible de charger'", async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({}),
    }) as unknown as typeof fetch;

    render(<MembershipRequestsList orgId={ORG_ID} />, { wrapper: makeWrapper() });
    await waitFor(() => {
      expect(screen.getByRole("alert")).toHaveTextContent(/impossible de charger/i);
    });
  });
});
