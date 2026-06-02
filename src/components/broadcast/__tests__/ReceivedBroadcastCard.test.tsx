import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReceivedBroadcastCard } from "../ReceivedBroadcastCard";
import type { ReceivedBroadcastItem } from "@/hooks/useMyReceivedBroadcasts";

// IntersectionObserver stub configurable par test
type ObserverCallback = (entries: { isIntersecting: boolean }[]) => void;
let lastCallback: ObserverCallback | null = null;
let disconnectMock = vi.fn();

beforeEach(() => {
  lastCallback = null;
  disconnectMock = vi.fn();
  // @ts-expect-error — minimal stub
  global.IntersectionObserver = class {
    constructor(cb: ObserverCallback) {
      lastCallback = cb;
    }
    observe() {}
    disconnect() {
      disconnectMock();
    }
  };
});

afterEach(() => {
  vi.restoreAllMocks();
});

const baseItem: ReceivedBroadcastItem = {
  recipientId: "rec-1",
  openedAt: null,
  optedOut: false,
  emailSent: true,
  broadcast: {
    id: "bc-1",
    subject: "Webinar TCA — 15 juin",
    body: "<p>Bonjour, voici notre annonce du mois.</p>",
    sentAt: "2026-06-02T10:00:00Z",
    sender: { firstName: "Margot", lastName: "Vire" },
    organization: { id: "org-1", name: "CPTS Paris 14", type: "CPTS" },
  },
};

describe("ReceivedBroadcastCard", () => {
  it("rend sujet, sender et org", () => {
    render(<ReceivedBroadcastCard item={baseItem} />);
    expect(screen.getByText(/webinar tca/i)).toBeInTheDocument();
    expect(screen.getByText(/margot vire/i)).toBeInTheDocument();
    expect(screen.getByText(/cpts paris 14/i)).toBeInTheDocument();
  });

  it("non lu → badge Non lu visible", () => {
    render(<ReceivedBroadcastCard item={baseItem} />);
    expect(screen.getByText(/non lu/i)).toBeInTheDocument();
  });

  it("lu → badge Non lu masqué", () => {
    render(
      <ReceivedBroadcastCard
        item={{ ...baseItem, openedAt: "2026-06-02T11:00:00Z" }}
      />,
    );
    expect(screen.queryByText(/non lu/i)).not.toBeInTheDocument();
  });

  it("opted-out → badge Email désactivé visible", () => {
    render(
      <ReceivedBroadcastCard
        item={{ ...baseItem, optedOut: true, emailSent: false }}
      />,
    );
    expect(screen.getByText(/email désactivé/i)).toBeInTheDocument();
  });

  it("non opted-out → pas de badge Email désactivé", () => {
    render(<ReceivedBroadcastCard item={baseItem} />);
    expect(screen.queryByText(/email désactivé/i)).not.toBeInTheDocument();
  });

  it("appelle onSeen avec recipientId quand la carte devient visible (non lu)", () => {
    const onSeen = vi.fn();
    render(<ReceivedBroadcastCard item={baseItem} onSeen={onSeen} />);

    // Simule l'intersection (>= seuil 0.5)
    lastCallback?.([{ isIntersecting: true }]);

    expect(onSeen).toHaveBeenCalledWith("rec-1");
    expect(onSeen).toHaveBeenCalledTimes(1);
  });

  it("idempotent client — n'appelle onSeen qu'une fois même si l'observer fire plusieurs fois", () => {
    const onSeen = vi.fn();
    render(<ReceivedBroadcastCard item={baseItem} onSeen={onSeen} />);

    lastCallback?.([{ isIntersecting: true }]);
    lastCallback?.([{ isIntersecting: true }]);
    lastCallback?.([{ isIntersecting: true }]);

    expect(onSeen).toHaveBeenCalledTimes(1);
  });

  it("déjà lu → onSeen JAMAIS appelé même si visible (économise PATCH inutile)", () => {
    const onSeen = vi.fn();
    render(
      <ReceivedBroadcastCard
        item={{ ...baseItem, openedAt: "2026-06-02T11:00:00Z" }}
        onSeen={onSeen}
      />,
    );

    lastCallback?.([{ isIntersecting: true }]);

    expect(onSeen).not.toHaveBeenCalled();
  });

  it("data-testid contient recipientId pour ciblage tests d'intégration", () => {
    render(<ReceivedBroadcastCard item={baseItem} />);
    expect(
      screen.getByTestId("received-broadcast-card-rec-1"),
    ).toBeInTheDocument();
  });

  it("data-unread reflète l'état lecture", () => {
    const { rerender } = render(<ReceivedBroadcastCard item={baseItem} />);
    expect(
      screen.getByTestId("received-broadcast-card-rec-1"),
    ).toHaveAttribute("data-unread", "true");

    rerender(
      <ReceivedBroadcastCard
        item={{ ...baseItem, openedAt: "2026-06-02T11:00:00Z" }}
      />,
    );
    expect(
      screen.getByTestId("received-broadcast-card-rec-1"),
    ).toHaveAttribute("data-unread", "false");
  });

  it("sender null → tiret", () => {
    render(
      <ReceivedBroadcastCard item={{ ...baseItem, broadcast: { ...baseItem.broadcast, sender: null } }} />,
    );
    expect(screen.getByText(/par —/i)).toBeInTheDocument();
  });
});
