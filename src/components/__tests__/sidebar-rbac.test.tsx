import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { Sidebar } from "../sidebar";
import * as apiModule from "@/lib/api";
import * as storeModule from "@/lib/store";
import type { OrganizationMembership, User } from "@/lib/api";

// F-BUG-SIDEBAR-EVENTS-RBAC-PROVIDER-NO-ORG
//
// Le bug exposé en prod le 2026-06-04 : un provider libéral SANS adhésion
// à une OrganizationMember active voyait quand même "Événements" dans la
// sidebar — clic → page vide (le backend filtre déjà sur memberships ACTIVE).
//
// Ces tests verrouillent la règle : Événements ne doit apparaître que si
// l'utilisateur a au moins 1 OrganizationMember actif, OU si c'est un
// admin plateforme (ADMIN / PLATFORM_ADMIN / ORG_ADMIN, voir User.roleType).

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

vi.mock("@/components/cockpit/notifications/NotificationBell", () => ({
  NotificationBell: () => <div data-testid="notification-bell-mock" />,
}));

// On neutralise le compteur Messages — non pertinent ici et il appellerait
// apiWithToken().messages.dmInbox.list / proMessages.getConversations sinon.
vi.mock("@/hooks/useUnifiedInboxTotal", () => ({
  useUnifiedInboxTotal: () => 0,
}));

function mockAuth(user: Partial<User> | null) {
  vi.spyOn(storeModule, "useAuthStore").mockImplementation(((selector?: unknown) => {
    const state = {
      accessToken: user ? "test-token" : null,
      user: user
        ? ({
            id: "u1",
            firstName: "Margot",
            lastName: "Vire",
            email: "margot@nami.health",
            roleType: "PROVIDER",
            ...user,
          } as User)
        : null,
    };
    return typeof selector === "function"
      ? (selector as (s: typeof state) => unknown)(state)
      : state;
  }) as unknown as typeof storeModule.useAuthStore);
}

function mockMine(memberships: OrganizationMembership[]) {
  vi.spyOn(apiModule.organizationsApi, "mine").mockResolvedValue(memberships);
}

function makeMembership(id: string): OrganizationMembership {
  return {
    id,
    name: `Org ${id}`,
    type: "NETWORK",
    memberCount: 1,
    myRole: "MEMBER",
  };
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

describe("Sidebar — RBAC Événements (F-BUG-SIDEBAR-EVENTS-RBAC-PROVIDER-NO-ORG)", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("provider sans OrganizationMember actif → 'Événements' masqué", async () => {
    mockAuth({ roleType: "PROVIDER" });
    mockMine([]);

    render(
      <Sidebar />,
      { wrapper: makeWrapper() },
    );

    // Tous les autres items du bloc Réseau restent visibles
    expect(screen.getByText("Messages")).toBeInTheDocument();
    expect(screen.getByText("Adressages")).toBeInTheDocument();
    expect(screen.getByText("Vue réseau")).toBeInTheDocument();
    expect(screen.getByText("Équipe")).toBeInTheDocument();
    expect(screen.getByText("Annuaire")).toBeInTheDocument();

    // Et Événements est absent — y compris après que la query "mine" se soit
    // résolue à [].
    await waitFor(() => {
      expect(apiModule.organizationsApi.mine).toHaveBeenCalled();
    });
    expect(screen.queryByText("Événements")).toBeNull();
  });

  it("provider avec au moins 1 OrganizationMember actif → 'Événements' visible", async () => {
    mockAuth({ roleType: "PROVIDER" });
    mockMine([makeMembership("org-1")]);

    render(
      <Sidebar />,
      { wrapper: makeWrapper() },
    );

    await waitFor(() => {
      expect(screen.getByText("Événements")).toBeInTheDocument();
    });
  });

  it("admin plateforme (roleType ADMIN) → 'Événements' visible sans appeler /organizations/mine", () => {
    mockAuth({ roleType: "ADMIN" });
    const mineSpy = vi
      .spyOn(apiModule.organizationsApi, "mine")
      .mockResolvedValue([]);

    render(
      <Sidebar />,
      { wrapper: makeWrapper() },
    );

    expect(screen.getByText("Événements")).toBeInTheDocument();
    // L'admin court-circuite la query (enabled: false).
    expect(mineSpy).not.toHaveBeenCalled();
  });

  it("PLATFORM_ADMIN (renaming en cours) → 'Événements' visible", () => {
    mockAuth({ roleType: "PLATFORM_ADMIN" });
    vi.spyOn(apiModule.organizationsApi, "mine").mockResolvedValue([]);

    render(
      <Sidebar />,
      { wrapper: makeWrapper() },
    );

    expect(screen.getByText("Événements")).toBeInTheDocument();
  });
});
