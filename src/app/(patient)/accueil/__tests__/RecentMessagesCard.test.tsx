import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { RecentMessagesCard } from "../RecentMessagesCard";
import type { PatientMessageThread } from "@/lib/api";

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockUseThreads = vi.fn();

vi.mock("@/hooks/usePatientMessageThreads", () => ({
  usePatientMessageThreads: () => mockUseThreads(),
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeThread(overrides: Partial<PatientMessageThread> = {}): PatientMessageThread {
  return {
    threadType: "CARECASE",
    threadId: "cc-1",
    title: "Équipe coordination Marie",
    participants: [],
    lastMessage: {
      id: "msg-1",
      body: "Bonjour, merci pour le bilan",
      createdAt: "2026-05-30T10:00:00.000Z",
      senderId: "p-1",
      senderName: "Dr Dupont",
    },
    unreadCount: 0,
    totalCount: 1,
    ...overrides,
  };
}

beforeEach(() => {
  mockUseThreads.mockReset();
});

// ═══════════════════════════════════════════════════════════════════════════
// Test 1 — empty state
// ═══════════════════════════════════════════════════════════════════════════

describe("RecentMessagesCard — V1-MIGRATE-RECENTMESSAGESCARD-PR94", () => {
  it("1. affiche 'Aucun message récent' si 0 thread", () => {
    mockUseThreads.mockReturnValue({ data: [], isLoading: false });
    render(<RecentMessagesCard />);
    expect(screen.getByText("Aucun message récent")).toBeInTheDocument();
    // Pas de lien "Voir tous mes messages" quand vide
    expect(
      screen.queryByRole("link", { name: /Voir tous mes messages/i }),
    ).not.toBeInTheDocument();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Test 2 — top 3 triés par lastMessage.createdAt desc
  // ═════════════════════════════════════════════════════════════════════════
  it("2. affiche les 3 threads les plus récents (tri par lastMessage.createdAt desc)", () => {
    const threads: PatientMessageThread[] = [
      makeThread({
        threadId: "old",
        title: "Ancien channel",
        lastMessage: {
          id: "m-old",
          body: "Vieux message",
          createdAt: "2026-05-01T08:00:00.000Z",
          senderId: "p1",
          senderName: "Dr A",
        },
      }),
      makeThread({
        threadId: "newest",
        title: "Channel récent",
        lastMessage: {
          id: "m-new",
          body: "Message récent",
          createdAt: "2026-05-31T14:00:00.000Z",
          senderId: "p2",
          senderName: "Dr B",
        },
      }),
      makeThread({
        threadId: "mid",
        title: "Channel moyen",
        lastMessage: {
          id: "m-mid",
          body: "Message moyen",
          createdAt: "2026-05-20T09:00:00.000Z",
          senderId: "p3",
          senderName: "Dr C",
        },
      }),
      makeThread({
        threadId: "tooold",
        title: "4e thread (doit être hors top 3)",
        lastMessage: {
          id: "m-too",
          body: "Hors top 3",
          createdAt: "2026-04-01T08:00:00.000Z",
          senderId: "p4",
          senderName: "Dr D",
        },
      }),
    ];
    mockUseThreads.mockReturnValue({ data: threads, isLoading: false });

    render(<RecentMessagesCard />);

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(3);
    // Ordre attendu : newest, mid, old
    expect(items[0].textContent).toContain("Channel récent");
    expect(items[1].textContent).toContain("Channel moyen");
    expect(items[2].textContent).toContain("Ancien channel");
    // Le 4e ne doit pas apparaître
    expect(screen.queryByText("4e thread (doit être hors top 3)")).not.toBeInTheDocument();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Test 3 — badge unreadCount
  // ═════════════════════════════════════════════════════════════════════════
  it("3. affiche le badge unreadCount si > 0 et l'omet si === 0", () => {
    const threads: PatientMessageThread[] = [
      makeThread({
        threadId: "unread-3",
        title: "Channel avec non lus",
        unreadCount: 3,
        lastMessage: {
          id: "m1",
          body: "Salut",
          createdAt: "2026-05-31T10:00:00.000Z",
          senderId: "p1",
          senderName: "Dr X",
        },
      }),
      makeThread({
        threadId: "read",
        title: "Channel lu",
        unreadCount: 0,
        lastMessage: {
          id: "m2",
          body: "RAS",
          createdAt: "2026-05-30T10:00:00.000Z",
          senderId: "p2",
          senderName: "Dr Y",
        },
      }),
    ];
    mockUseThreads.mockReturnValue({ data: threads, isLoading: false });

    render(<RecentMessagesCard />);

    // Badge visible pour 3 non lus
    expect(
      screen.getByLabelText(/3 messages non lus/i),
    ).toBeInTheDocument();
    // Pas de badge pour le thread "lu"
    expect(screen.queryByLabelText(/0 message/i)).not.toBeInTheDocument();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Test 4 — wording MDR-safe + icon DM/CARECASE
  // ═════════════════════════════════════════════════════════════════════════
  it("4. wording MDR-safe : pas de termes cliniques + icons DM/CARECASE distincts", () => {
    const threads: PatientMessageThread[] = [
      makeThread({
        threadType: "CARECASE",
        threadId: "cc-1",
        title: "Équipe coordination",
      }),
      makeThread({
        threadType: "DM",
        threadId: "dm-1",
        title: "Dr Martin",
        lastMessage: {
          id: "m-dm",
          body: "Bonjour",
          createdAt: "2026-05-30T11:00:00.000Z",
          senderId: "p1",
          senderName: "Dr Martin",
        },
      }),
    ];
    mockUseThreads.mockReturnValue({ data: threads, isLoading: false });

    const { container } = render(<RecentMessagesCard />);

    // Wording MDR-safe : aucun terme clinique interdit
    const html = container.innerHTML.toLowerCase();
    const forbidden = [
      "suspicion",
      "diagnostic",
      "pathologie",
      "anorexie",
      "boulimie",
      "arfid",
      "hyperphagie",
      "surveillance",
      "alerte clinique",
    ];
    for (const term of forbidden) {
      expect(html).not.toContain(term);
    }

    // Icons distincts via aria-label
    expect(screen.getByLabelText("Équipe de coordination")).toBeInTheDocument();
    expect(screen.getByLabelText("Échange direct")).toBeInTheDocument();

    // Lien CTA "Voir tous mes messages" présent
    const cta = screen.getByRole("link", { name: /Voir tous mes messages/i });
    expect(cta).toHaveAttribute("href", "/mes-messages");
  });
});
