import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { SecretaryNotificationBell } from "../SecretaryNotificationBell";
import * as hookModule from "@/hooks/useSecretaryNotifications";

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

function mockFeed(over: { unread?: number; total?: number; items?: unknown[] } = {}) {
  const data = {
    items: over.items ?? [],
    counts: { unread: over.unread ?? 0, total: over.total ?? 0 },
  };
  vi.spyOn(hookModule, "useSecretaryNotifications").mockReturnValue({
    data,
    isLoading: false,
    isError: false,
    isSuccess: true,
    error: null,
    refetch: vi.fn(),
  } as never);
}

describe("SecretaryNotificationBell", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });
  afterEach(() => {
    cleanup();
  });

  it("renders the bell button without a badge when unread=0", () => {
    mockFeed({ unread: 0 });
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <SecretaryNotificationBell />
      </Wrapper>,
    );

    expect(screen.getByRole("button", { name: "Notifications" })).toBeInTheDocument();
    // No badge text "1+" since no unread.
    expect(screen.queryByText(/^[0-9]+\+?$/)).not.toBeInTheDocument();
  });

  it("shows the unread count badge and uses pluralized aria-label", () => {
    mockFeed({ unread: 3 });
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <SecretaryNotificationBell />
      </Wrapper>,
    );

    expect(screen.getByRole("button", { name: "Notifications (3 non lues)" })).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("opens the dialog popover on click and renders SECRETARIAT_LINK title (MDR-safe wording)", () => {
    mockFeed({
      unread: 1,
      total: 1,
      items: [
        {
          id: "notif-1",
          recipientId: "sec-1",
          type: "SECRETARIAT_LINK_ACCEPTED",
          title: "Dr Martin a accepté votre rattachement",
          body: "Vous gérez désormais les RDV de ce soignant.",
          appointmentId: null,
          messageId: null,
          documentId: null,
          careCaseId: null,
          createdAt: new Date().toISOString(),
          readAt: null,
          archivedAt: null,
          deliveries: [],
        },
      ],
    });

    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <SecretaryNotificationBell />
      </Wrapper>,
    );

    const button = screen.getByRole("button", { name: /Notifications/ });
    fireEvent.click(button);

    expect(screen.getByRole("dialog", { name: "Notifications secrétariat" })).toBeInTheDocument();
    expect(screen.getByText("Dr Martin a accepté votre rattachement")).toBeInTheDocument();
    // Wording check : aucun mot interdit MDR dans le rendu.
    const dialog = screen.getByRole("dialog");
    expect(dialog.textContent ?? "").not.toMatch(/alerte|surveiller|détecter|urgence|anormal/i);
  });
});
