import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { Sidebar, formatSidebarBadgeCount } from "../sidebar";
import * as apiModule from "@/lib/api";
import type { ProConversation, CockpitDmInboxThread } from "@/lib/api";

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

vi.mock("@/components/cockpit/notifications/NotificationBell", () => ({
  NotificationBell: () => <div data-testid="notification-bell-mock" />,
}));

function makePro(unreadCount: number, id = "c1"): ProConversation {
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
    lastMessage: {
      content: "Bonjour",
      senderId: "u2",
      createdAt: "2026-05-31T10:00:00Z",
    },
    unreadCount,
    updatedAt: "2026-05-31T10:00:00Z",
  };
}

function makeDmThread(
  unreadCount: number,
  patientPersonId = "p1",
): CockpitDmInboxThread {
  return {
    patientPersonId,
    patient: {
      personId: patientPersonId,
      firstName: "Léa",
      lastName: "Rousseau",
      avatarUrl: null,
    },
    lastMessage: null,
    unreadCount,
    totalCount: unreadCount,
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

function mockApi({
  pro,
  dm,
}: {
  pro: ProConversation[];
  dm: CockpitDmInboxThread[];
}) {
  return vi.spyOn(apiModule, "apiWithToken").mockReturnValue({
    proMessages: {
      getConversations: vi.fn().mockResolvedValue(pro),
    },
    messages: {
      dmInbox: {
        list: vi.fn().mockResolvedValue({ threads: dm }),
      },
    },
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

describe("Sidebar — badge unread Messages (F-CROSS-GAP-Message-INBOX-COCKPIT — unifié 3 silos)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("0 unread Pro + 0 unread DM → pas de badge", async () => {
    mockApi({ pro: [makePro(0)], dm: [makeDmThread(0)] });
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <Sidebar />
      </Wrapper>,
    );

    expect(screen.getByText("Messages")).toBeInTheDocument();
    await waitFor(() => {
      expect(screen.queryByTestId("sidebar-badge-messages")).toBeNull();
    });
  });

  it("Pro 2 + DM 3 → badge '5' (somme des silos)", async () => {
    mockApi({
      pro: [makePro(2, "c1")],
      dm: [makeDmThread(3, "p1")],
    });
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <Sidebar />
      </Wrapper>,
    );

    await waitFor(() => {
      const badge = screen.getByTestId("sidebar-badge-messages");
      expect(badge.textContent).toBe("5");
    });
  });

  it("Pro 7 + DM 8 → badge '9+' (cap >9)", async () => {
    mockApi({
      pro: [makePro(7, "c1")],
      dm: [makeDmThread(8, "p1")],
    });
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <Sidebar />
      </Wrapper>,
    );

    await waitFor(() => {
      const badge = screen.getByTestId("sidebar-badge-messages");
      expect(badge.textContent).toBe("9+");
    });
  });

  it("badge a aria-live='polite' pour l'accessibilité", async () => {
    mockApi({ pro: [makePro(3)], dm: [] });
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

  it("Pro uniquement (DM=0) → badge compte Pro", async () => {
    mockApi({ pro: [makePro(4)], dm: [makeDmThread(0)] });
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <Sidebar />
      </Wrapper>,
    );

    await waitFor(() => {
      const badge = screen.getByTestId("sidebar-badge-messages");
      expect(badge.textContent).toBe("4");
    });
  });

  it("DM uniquement (Pro=0) → badge compte DM", async () => {
    mockApi({ pro: [makePro(0)], dm: [makeDmThread(6)] });
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <Sidebar />
      </Wrapper>,
    );

    await waitFor(() => {
      const badge = screen.getByTestId("sidebar-badge-messages");
      expect(badge.textContent).toBe("6");
    });
  });

  it("ne contient plus le lien sidebar '/collaboration' (redirect 308 vers /messages?tab=pro)", () => {
    mockApi({ pro: [], dm: [] });
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <Sidebar />
      </Wrapper>,
    );
    expect(screen.queryByText("Collaboration")).toBeNull();
  });
});
