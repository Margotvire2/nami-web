import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import CockpitCommunicationsPage from "@/app/(cockpit)/communications/page";
import type { ReceivedBroadcastItem } from "@/hooks/useMyReceivedBroadcasts";

// Mocks hooks — on n'a pas besoin d'un vrai backend pour tester la page
const mutateMock = vi.fn();

vi.mock("@/hooks/useMyReceivedBroadcasts", () => ({
  useMyReceivedBroadcasts: vi.fn(),
  myReceivedBroadcastsQueryKey: () => ["me-received-broadcasts"],
}));

vi.mock("@/hooks/useMarkBroadcastOpened", () => ({
  useMarkBroadcastOpened: () => ({ mutate: mutateMock }),
}));

import { useMyReceivedBroadcasts } from "@/hooks/useMyReceivedBroadcasts";

// IntersectionObserver minimal pour ne pas crasher
beforeEach(() => {
  mutateMock.mockClear();
  // @ts-expect-error stub
  global.IntersectionObserver = class {
    observe() {}
    disconnect() {}
  };
});

function makeItem(
  overrides: Partial<ReceivedBroadcastItem> & {
    recipientId: string;
    orgName: string;
    sentAt: string | null;
    openedAt?: string | null;
  },
): ReceivedBroadcastItem {
  return {
    recipientId: overrides.recipientId,
    openedAt: overrides.openedAt ?? null,
    optedOut: overrides.optedOut ?? false,
    emailSent: overrides.emailSent ?? true,
    broadcast: {
      id: `bc-${overrides.recipientId}`,
      subject: `Annonce ${overrides.orgName}`,
      body: "<p>contenu</p>",
      sentAt: overrides.sentAt,
      sender: { firstName: "Margot", lastName: "Vire" },
      organization: {
        id: `org-${overrides.orgName}`,
        name: overrides.orgName,
        type: "CPTS",
      },
    },
  };
}

describe("CockpitCommunicationsPage", () => {
  it("loading → message Chargement…", () => {
    (useMyReceivedBroadcasts as ReturnType<typeof vi.fn>).mockReturnValue({
      broadcasts: [],
      isLoading: true,
      isError: false,
    });
    render(<CockpitCommunicationsPage />);
    expect(screen.getByText(/chargement/i)).toBeInTheDocument();
  });

  it("erreur → message d'erreur", () => {
    (useMyReceivedBroadcasts as ReturnType<typeof vi.fn>).mockReturnValue({
      broadcasts: [],
      isLoading: false,
      isError: true,
    });
    render(<CockpitCommunicationsPage />);
    expect(
      screen.getByText(/impossible de charger vos communications/i),
    ).toBeInTheDocument();
  });

  it("aucun broadcast → empty state 'Aucune communication'", () => {
    (useMyReceivedBroadcasts as ReturnType<typeof vi.fn>).mockReturnValue({
      broadcasts: [],
      isLoading: false,
      isError: false,
    });
    render(<CockpitCommunicationsPage />);
    expect(screen.getByText(/aucune communication/i)).toBeInTheDocument();
  });

  it("rend multi-org chrono (CPTS A et MSP B agrégés)", () => {
    const items = [
      makeItem({
        recipientId: "r1",
        orgName: "CPTS Paris 14",
        sentAt: "2026-06-02T12:00:00Z",
      }),
      makeItem({
        recipientId: "r2",
        orgName: "MSP Lyon Centre",
        sentAt: "2026-06-02T11:00:00Z",
      }),
    ];
    (useMyReceivedBroadcasts as ReturnType<typeof vi.fn>).mockReturnValue({
      broadcasts: items,
      isLoading: false,
      isError: false,
    });
    render(<CockpitCommunicationsPage />);
    expect(screen.getByTestId("received-broadcast-card-r1")).toBeInTheDocument();
    expect(screen.getByTestId("received-broadcast-card-r2")).toBeInTheDocument();
    expect(screen.getAllByText(/cpts paris 14/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/msp lyon centre/i).length).toBeGreaterThan(0);
  });

  it("filtre 'Non lues' → ne montre que les non lus", () => {
    const items = [
      makeItem({
        recipientId: "r1",
        orgName: "AlphaCabinet",
        sentAt: "2026-06-02T12:00:00Z",
        openedAt: null,
      }),
      makeItem({
        recipientId: "r2",
        orgName: "BetaCabinet",
        sentAt: "2026-06-02T11:00:00Z",
        openedAt: "2026-06-02T11:30:00Z",
      }),
    ];
    (useMyReceivedBroadcasts as ReturnType<typeof vi.fn>).mockReturnValue({
      broadcasts: items,
      isLoading: false,
      isError: false,
    });
    render(<CockpitCommunicationsPage />);

    // Onglet par défaut "Toutes (2)" et pill "Non lues (1)"
    const tabAll = screen.getByRole("tab", { name: /toutes \(2\)/i });
    const tabUnread = screen.getByRole("tab", { name: /non lues \(1\)/i });
    expect(tabAll).toBeInTheDocument();
    expect(tabUnread).toBeInTheDocument();

    // Les 2 cards sont rendues
    expect(screen.getByTestId("received-broadcast-card-r1")).toBeInTheDocument();
    expect(screen.getByTestId("received-broadcast-card-r2")).toBeInTheDocument();

    // Switch sur 'Non lues' → seule la card "r1" (unread) reste
    fireEvent.click(tabUnread);
    expect(screen.getByTestId("received-broadcast-card-r1")).toBeInTheDocument();
    expect(
      screen.queryByTestId("received-broadcast-card-r2"),
    ).not.toBeInTheDocument();
  });

  it("filtre 'Non lues' avec 0 non lu → empty state 'Tout est à jour'", () => {
    const items = [
      makeItem({
        recipientId: "r1",
        orgName: "AlphaCabinet",
        sentAt: "2026-06-02T12:00:00Z",
        openedAt: "2026-06-02T13:00:00Z",
      }),
    ];
    (useMyReceivedBroadcasts as ReturnType<typeof vi.fn>).mockReturnValue({
      broadcasts: items,
      isLoading: false,
      isError: false,
    });
    render(<CockpitCommunicationsPage />);

    fireEvent.click(screen.getByRole("tab", { name: /non lues \(0\)/i }));
    expect(screen.getByText(/tout est à jour/i)).toBeInTheDocument();
  });
});
