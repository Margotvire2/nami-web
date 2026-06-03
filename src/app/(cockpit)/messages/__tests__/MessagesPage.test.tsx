import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import MessagesPage from "../page";
import * as apiModule from "@/lib/api";
import type { ProConversation, CockpitDmInboxThread } from "@/lib/api";

const routerReplace = vi.fn();
let currentSearch = "";

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
  useRouter: () => ({ replace: routerReplace, push: vi.fn() }),
  useSearchParams: () => new URLSearchParams(currentSearch),
  usePathname: () => "/messages",
}));

vi.mock("@/lib/store", () => ({
  useAuthStore: () => ({
    accessToken: "test-token",
    user: { id: "u1", firstName: "Margot", lastName: "Vire", roleType: "PRO" },
  }),
}));

vi.mock("@/lib/socket", () => ({
  getProMessagesSocket: () => ({
    on: vi.fn(),
    off: vi.fn(),
    emit: vi.fn(),
  }),
  disconnectProMessagesSocket: vi.fn(),
}));

// Sous-composants 3 tabs : neutralisés pour cibler la logique page (tabs +
// URL state). Chaque tab restitue son data-testid pour vérifier le bon panel.
vi.mock("../_components/CockpitCareCaseChannelsTab", () => ({
  CockpitCareCaseChannelsTab: () => (
    <div data-testid="panel-content-carecase">CareCase Channels</div>
  ),
}));
vi.mock("../_components/CockpitDmInboxTab", () => ({
  CockpitDmInboxTab: () => (
    <div data-testid="panel-content-dm">DM Inbox</div>
  ),
}));
vi.mock("../_components/CockpitProConversationsTab", () => ({
  CockpitProConversationsTab: ({
    activeConvId,
  }: {
    activeConvId: string | null;
    onSelectConv: (id: string | null) => void;
  }) => (
    <div data-testid="panel-content-pro">
      Pro Conversations — threadId={activeConvId ?? "null"}
    </div>
  ),
}));

function makePro(unreadCount: number, id = "c1"): ProConversation {
  return {
    id,
    type: "DIRECT",
    name: null,
    description: null,
    isPrivate: false,
    members: [],
    lastMessage: null,
    unreadCount,
    updatedAt: "2026-05-31T10:00:00Z",
  };
}

function makeDm(unreadCount: number, p = "p1"): CockpitDmInboxThread {
  return {
    patientPersonId: p,
    patient: { personId: p, firstName: "L", lastName: "R", avatarUrl: null },
    lastMessage: null,
    unreadCount,
    totalCount: unreadCount,
  };
}

function mockApi({
  pro = [],
  dm = [],
}: {
  pro?: ProConversation[];
  dm?: CockpitDmInboxThread[];
} = {}) {
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

describe("MessagesPage — 3 tabs URL-persistants (F-CROSS-GAP-Message-INBOX-COCKPIT)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    routerReplace.mockClear();
    currentSearch = "";
    mockApi();
  });

  it("sans ?tab → onglet par défaut 'Dossiers patients' (carecase)", () => {
    currentSearch = "";
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <MessagesPage />
      </Wrapper>,
    );
    expect(screen.getByTestId("panel-content-carecase")).toBeInTheDocument();
    expect(screen.queryByTestId("panel-content-dm")).toBeNull();
    expect(screen.queryByTestId("panel-content-pro")).toBeNull();
  });

  it("?tab=dm → rend le panel Messages directs", () => {
    currentSearch = "tab=dm";
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <MessagesPage />
      </Wrapper>,
    );
    expect(screen.getByTestId("panel-content-dm")).toBeInTheDocument();
    expect(screen.queryByTestId("panel-content-carecase")).toBeNull();
  });

  it("?tab=pro → rend le panel Réseau pro", () => {
    currentSearch = "tab=pro";
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <MessagesPage />
      </Wrapper>,
    );
    expect(screen.getByTestId("panel-content-pro")).toBeInTheDocument();
  });

  it("?tab=invalide → fallback carecase (validation stricte)", () => {
    currentSearch = "tab=foobar";
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <MessagesPage />
      </Wrapper>,
    );
    expect(screen.getByTestId("panel-content-carecase")).toBeInTheDocument();
  });

  it("?tab=pro&threadId=conv-42 → passe threadId au Pro tab (deep-link)", () => {
    currentSearch = "tab=pro&threadId=conv-42";
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <MessagesPage />
      </Wrapper>,
    );
    expect(screen.getByTestId("panel-content-pro").textContent).toContain(
      "threadId=conv-42",
    );
  });

  it("clic sur tab Pro → router.replace('/messages?tab=pro') + drop threadId", async () => {
    currentSearch = "tab=carecase&threadId=should-be-dropped";
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <MessagesPage />
      </Wrapper>,
    );

    await userEvent.click(
      screen.getByRole("tab", { name: /Réseau pro/ }),
    );

    expect(routerReplace).toHaveBeenCalled();
    const [target] = routerReplace.mock.calls[0];
    expect(target).toContain("tab=pro");
    expect(target).not.toContain("should-be-dropped");
  });

  it("badge DM affiche somme unread des threads DM", async () => {
    currentSearch = "tab=carecase";
    mockApi({ dm: [makeDm(2, "p1"), makeDm(3, "p2")] });
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <MessagesPage />
      </Wrapper>,
    );
    await waitFor(() => {
      const badge = screen.getByTestId("tab-badge-tab-dm");
      expect(badge.textContent).toBe("5");
    });
  });

  it("badge Pro affiche somme unread des conversations Pro", async () => {
    currentSearch = "tab=carecase";
    mockApi({ pro: [makePro(4, "c1"), makePro(7, "c2")] });
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <MessagesPage />
      </Wrapper>,
    );
    await waitFor(() => {
      const badge = screen.getByTestId("tab-badge-tab-pro");
      expect(badge.textContent).toBe("11");
    });
  });

  it("bannière légale urgence 15/112 visible sur tous les tabs", () => {
    currentSearch = "tab=pro";
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <MessagesPage />
      </Wrapper>,
    );
    expect(screen.getByText(/coordination non urgente/i)).toBeInTheDocument();
    expect(screen.getByText(/15 \(SAMU\)/)).toBeInTheDocument();
  });

  it("conservation : les 3 tabs existent dans le DOM (rôle tab) avec aria-selected propre", () => {
    currentSearch = "tab=dm";
    const Wrapper = makeWrapper();
    render(
      <Wrapper>
        <MessagesPage />
      </Wrapper>,
    );
    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    const selected = tabs.filter(
      (t) => t.getAttribute("aria-selected") === "true",
    );
    expect(selected).toHaveLength(1);
    expect(selected[0].id).toBe("tab-dm");
  });
});
