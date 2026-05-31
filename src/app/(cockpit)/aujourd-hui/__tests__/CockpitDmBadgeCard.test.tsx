import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import CockpitDmBadgeCard from "../CockpitDmBadgeCard";
import * as apiModule from "@/lib/api";
import type { CockpitDmInboxThread } from "@/lib/api";

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
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return Wrapper;
}

function mockDmInbox(threads: CockpitDmInboxThread[]) {
  vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
    messages: {
      dmInbox: {
        list: vi.fn().mockResolvedValue({ threads }),
        thread: vi.fn(),
        send: vi.fn(),
      },
    },
  } as never);
}

function makeThread(over: Partial<CockpitDmInboxThread> = {}): CockpitDmInboxThread {
  return {
    patientPersonId: over.patientPersonId ?? "p-1",
    patient: over.patient ?? {
      personId: over.patientPersonId ?? "p-1",
      firstName: "Léa",
      lastName: "Rousseau",
      avatarUrl: null,
    },
    lastMessage: over.lastMessage ?? {
      id: "m-1",
      body: "Bonjour, j'ai une question sur mon rendez-vous.",
      createdAt: new Date(Date.now() - 5 * 60_000).toISOString(),
      senderId: "p-1",
      senderName: "Léa Rousseau",
    },
    unreadCount: over.unreadCount ?? 0,
    totalCount: over.totalCount ?? 1,
  };
}

describe("CockpitDmBadgeCard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    cleanup();
  });

  it("renders nothing when there are zero threads", async () => {
    mockDmInbox([]);
    const { container } = render(<CockpitDmBadgeCard />, { wrapper: makeWrapper() });
    // Wait a tick for the query to resolve
    await waitFor(() => {
      expect(container.firstChild).toBeNull();
    });
    // Ne doit apparaître dans aucune région
    expect(screen.queryByRole("region", { name: /messages privés patients/i })).toBeNull();
  });

  it("renders the small secondary card when there are threads but zero unread", async () => {
    mockDmInbox([
      makeThread({ patientPersonId: "p-1", unreadCount: 0 }),
      makeThread({
        patientPersonId: "p-2",
        unreadCount: 0,
        patient: {
          personId: "p-2",
          firstName: "Marc",
          lastName: "Dupuis",
          avatarUrl: null,
        },
      }),
    ]);

    render(<CockpitDmBadgeCard />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: /messages privés patients/i }),
      ).toBeInTheDocument();
    });
    expect(
      screen.getByText(/2 conversations privées en cours/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/aucun message non lu/i)).toBeInTheDocument();
    // Pas de badge non lu
    expect(screen.queryByTestId("dm-unread-badge")).toBeNull();
    // Lien vers /messages?tab=dm
    const link = screen.getByRole("link");
    expect(link.getAttribute("href")).toBe("/messages?tab=dm");
  });

  it("renders the primary card with unread count badge when there are unread DMs", async () => {
    mockDmInbox([
      makeThread({ patientPersonId: "p-1", unreadCount: 2 }),
      makeThread({
        patientPersonId: "p-2",
        unreadCount: 1,
        patient: {
          personId: "p-2",
          firstName: "Marc",
          lastName: "Dupuis",
          avatarUrl: null,
        },
      }),
    ]);

    render(<CockpitDmBadgeCard />, { wrapper: makeWrapper() });

    await waitFor(() => {
      expect(
        screen.getByRole("region", { name: /messages privés patients/i }),
      ).toBeInTheDocument();
    });

    // Header avec section title
    expect(
      screen.getByText(/MESSAGES PRIVÉS PATIENTS/i),
    ).toBeInTheDocument();

    // Badge count = somme unread (2+1 = 3)
    const badge = screen.getByTestId("dm-unread-badge");
    expect(badge.textContent).toMatch(/3 non lus?/);

    // Preview des deux patients
    expect(screen.getByText(/Léa Rousseau/)).toBeInTheDocument();
    expect(screen.getByText(/Marc Dupuis/)).toBeInTheDocument();

    // CTA bas de carte
    expect(
      screen.getByText(/Voir tous mes messages privés/i),
    ).toBeInTheDocument();
  });

  it("contains no MDR-forbidden clinical wording in source", async () => {
    const fs = await import("node:fs/promises");
    const path = await import("node:path");
    const file = path.resolve(
      process.cwd(),
      "src/app/(cockpit)/aujourd-hui/CockpitDmBadgeCard.tsx",
    );
    const source = await fs.readFile(file, "utf-8");
    const forbidden = [
      "suspicion",
      "diagnostic",
      "pathologie",
      "anorexie",
      "boulimie",
      "ARFID",
      "hyperphagie",
      "alerte clinique",
      "surveillance",
      "monitoring",
    ];
    for (const word of forbidden) {
      expect(source.toLowerCase()).not.toContain(word.toLowerCase());
    }
  });
});
