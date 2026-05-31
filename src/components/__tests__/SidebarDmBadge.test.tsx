import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { Sidebar, formatSidebarBadgeCount } from "../sidebar";
import * as apiModule from "@/lib/api";
import type { ProConversation } from "@/lib/api";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("next/navigation", () => ({
  usePathname: () => "/aujourd-hui",
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

vi.mock("@/lib/store", () => ({
  useAuthStore: () => ({
    accessToken: "test-token",
    user: {
      id: "u1",
      firstName: "Margot",
      lastName: "Vire",
      email: "margot@nami.health",
      roleType: "PRO",
    },
  }),
}));

// NotificationBell fait des appels réseau au montage : on neutralise.
vi.mock("@/components/cockpit/notifications/NotificationBell", () => ({
  NotificationBell: () => <div data-testid="notification-bell-mock" />,
}));

function makeConv(unreadCount: number, id = "c1"): ProConversation {
  return {
    id,
    type: "DIRECT",
    name: null,
    description: null,
    isPrivate: false,
    members: [
      { id: "u1", firstName: "Margot", lastName: "Vire", role: "PRO" },
      { id: "u2", firstName: "Léa", lastName: "Rousseau", role: "PATIENT" },
    ],
    lastMessage: { content: "Bonjour", senderId: "u2", createdAt: "2026-05-31T10:00:00Z" },
    unreadCount,
    updatedAt: "2026-05-31T10:00:00Z",
  };
}

function makeWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0, staleTime: 0 },
    },
  });
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  Wrapper.displayName = "QueryWrapper";
  return Wrapper;
}

function mockGetConversations(convs: ProConversation[]) {
  return vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
    proMessages: {
      getConversations: vi.fn().mockResolvedValue(convs),
    },
    // Le reste du retour de apiWithToken n'est pas utilisé dans la Sidebar.
  } as unknown as ReturnType<typeof apiModule.apiWithToken>);
}

describe("formatSidebarBadgeCount (V1-COCKPIT-SIDEBAR-DM-BADGE)", () => {
  it("0 → '0'", () => {
    expect(formatSidebarBadgeCount(0)).toBe("0");
  });

  it("1..9 → string nombre", () => {
    expect(formatSidebarBadgeCount(1)).toBe("1");
    expect(formatSidebarBadgeCount(9)).toBe("9");
  });

  it(">9 → '9+'", () => {
    expect(formatSidebarBadgeCount(10)).toBe("9+");
    expect(formatSidebarBadgeCount(127)).toBe("9+");
  });
});

describe("Sidebar — badge unread Messages (V1-COCKPIT-SIDEBAR-DM-BADGE)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("0 unread → pas de badge sur item Messages", async () => {
    mockGetConversations([makeConv(0, "c1"), makeConv(0, "c2")]);
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <Sidebar />
      </Wrapper>,
    );

    // L'item Messages reste affiché mais sans badge.
    expect(screen.getByText("Messages")).toBeInTheDocument();

    // Attente : le hook React Query peut résoudre, mais la somme reste 0.
    await waitFor(() => {
      expect(screen.queryByTestId("sidebar-badge-messages")).toBeNull();
    });
  });

  it("1-9 unread cumulés → badge avec nombre exact", async () => {
    mockGetConversations([
      makeConv(2, "c1"),
      makeConv(3, "c2"),
      makeConv(0, "c3"),
    ]);
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <Sidebar />
      </Wrapper>,
    );

    await waitFor(() => {
      const badge = screen.getByTestId("sidebar-badge-messages");
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).toBe("5");
    });
  });

  it(">9 unread cumulés → badge '9+'", async () => {
    mockGetConversations([makeConv(7, "c1"), makeConv(8, "c2")]);
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <Sidebar />
      </Wrapper>,
    );

    await waitFor(() => {
      const badge = screen.getByTestId("sidebar-badge-messages");
      expect(badge).toBeInTheDocument();
      expect(badge.textContent).toBe("9+");
    });
  });

  it("badge a aria-live='polite' pour l'accessibilité", async () => {
    mockGetConversations([makeConv(3, "c1")]);
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <Sidebar />
      </Wrapper>,
    );

    await waitFor(() => {
      const badge = screen.getByTestId("sidebar-badge-messages");
      expect(badge).toHaveAttribute("aria-live", "polite");
    });
  });
});
