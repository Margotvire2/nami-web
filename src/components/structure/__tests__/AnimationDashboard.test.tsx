import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnimationDashboard } from "../AnimationDashboard";
import * as orgHook from "@/hooks/useOrgDetail";
import * as pendingHook from "@/hooks/usePendingMembershipRequests";
import * as orgMembersHook from "@/hooks/useOrgMembers";
import type { OrganizationMembership } from "@/lib/api";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
  } & React.HTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@tanstack/react-query", () => ({
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
  useQuery: () => ({
    data: undefined,
    isLoading: false,
    isError: false,
    refetch: () => Promise.resolve(),
  }),
}));

vi.mock("@/lib/store", () => ({
  useAuthStore: (
    selector: (s: {
      user: { firstName: string; id: string } | null;
      accessToken: string | null;
    }) => unknown
  ) =>
    selector({
      user: { firstName: "Sylvie", id: "p-sylvie" },
      accessToken: "tok",
    }),
}));

function mockOrg(partial?: Partial<OrganizationMembership>) {
  const org: OrganizationMembership = {
    id: "org-rtf",
    name: "Réseau TCA Francilien",
    type: "NETWORK",
    memberCount: 42,
    myRole: "ADMIN",
    conversations: [],
    ...partial,
  };
  vi.spyOn(orgHook, "useOrgDetail").mockReturnValue({
    org,
    isLoading: false,
    isError: false,
  });
}

function mockPending(requests: pendingHook.PendingMembershipRequestRow[]) {
  vi.spyOn(pendingHook, "usePendingMembershipRequests").mockReturnValue({
    requests,
    isLoading: false,
    isError: false,
  });
}

function mockOrgMembers(suspendedCount = 0) {
  vi.spyOn(orgMembersHook, "useOrgMembers").mockReturnValue({
    members: Array.from({ length: suspendedCount }, (_, i) => ({
      personId: `s${i}`,
      memberRole: "PROVIDER",
      joinedAt: "2026-01-01T00:00:00Z",
      id: `s${i}`,
      firstName: `Susp${i}`,
      lastName: "Test",
      photoUrl: null,
      providerProfile: null,
    })),
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
  });
}

describe("AnimationDashboard", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("rend les 6 stat cards (Actifs / Adhésions / En sommeil / Suspendus / Événements / Actus)", () => {
    mockOrg();
    mockPending([]);
    mockOrgMembers();

    render(<AnimationDashboard orgId="org-rtf" />);

    expect(screen.getByText("Membres actifs")).toBeInTheDocument();
    expect(screen.getByText("Adhésions à valider")).toBeInTheDocument();
    expect(screen.getByText("Membres en sommeil")).toBeInTheDocument();
    expect(screen.getByText("Membres suspendus")).toBeInTheDocument();
    expect(screen.getByText("Événements à venir")).toBeInTheDocument();
    expect(screen.getByText("Actus publiées")).toBeInTheDocument();
  });

  it("Membres suspendus = nombre exact depuis useOrgMembers(SUSPENDED)", () => {
    mockOrg();
    mockPending([]);
    mockOrgMembers(3);

    render(<AnimationDashboard orgId="org-rtf" />);

    // 3 affiché dans la stat card Suspendus (memberCount par défaut = 42 sur autre card)
    expect(screen.getByText("Membres suspendus")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("affiche le nom de l'organisation + emoji + bonjour [firstName]", () => {
    mockOrg();
    mockPending([]);
    mockOrgMembers();

    render(<AnimationDashboard orgId="org-rtf" />);

    expect(screen.getByText(/Réseau TCA Francilien/)).toBeInTheDocument();
    expect(screen.getByText(/🌐/)).toBeInTheDocument();
    expect(screen.getByText(/Bonjour Sylvie/i)).toBeInTheDocument();
  });

  it("affiche le memberCount réel depuis l'organisation", () => {
    mockOrg({ memberCount: 42 });
    mockPending([]);

    render(<AnimationDashboard orgId="org-rtf" />);

    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("pipeline d'adhésion : empty state si 0 PENDING", () => {
    mockOrg();
    mockPending([]);
    mockOrgMembers();

    render(<AnimationDashboard orgId="org-rtf" />);

    expect(
      screen.getByText(/aucune demande d'adhésion en attente/i)
    ).toBeInTheDocument();
  });

  it("4 actions rapides en placeholders V2 (disabled)", () => {
    mockOrg();
    mockPending([]);
    mockOrgMembers();

    render(<AnimationDashboard orgId="org-rtf" />);

    for (const label of [
      /publier une actu/i,
      /planifier un événement/i,
      /inviter un soignant/i,
      /créer un groupe de travail/i,
    ]) {
      const btn = screen.getByRole("button", { name: label });
      expect(btn).toBeDisabled();
    }
  });

  it("section discussions vide → message dédié", () => {
    mockOrg({ conversations: [] });
    mockPending([]);

    render(<AnimationDashboard orgId="org-rtf" />);

    expect(
      screen.getByText(/aucune discussion pour le moment/i)
    ).toBeInTheDocument();
  });

  it("section discussions non vide → top 3 triées par dernier message desc", () => {
    mockOrg({
      conversations: [
        {
          id: "c-old",
          name: "Vieille discussion",
          _count: { messages: 4 },
          messages: [{ createdAt: "2026-04-01T00:00:00Z" }],
        },
        {
          id: "c-new",
          name: "Discussion récente",
          _count: { messages: 12 },
          messages: [{ createdAt: "2026-05-30T00:00:00Z" }],
        },
        {
          id: "c-mid",
          name: "Discussion intermédiaire",
          _count: { messages: 8 },
          messages: [{ createdAt: "2026-05-15T00:00:00Z" }],
        },
        {
          id: "c-oldest",
          name: "Quatrième",
          _count: { messages: 1 },
          messages: [{ createdAt: "2026-03-01T00:00:00Z" }],
        },
      ],
    });
    mockPending([]);

    render(<AnimationDashboard orgId="org-rtf" />);

    // Liens conversation uniquement (sidebar /messages exclu).
    const links = screen
      .getAllByRole("link")
      .filter((l) => /conversationId=/.test(l.getAttribute("href") ?? ""));
    // Top 3 → ordre desc : c-new puis c-mid puis c-old. La 4e n'apparaît pas.
    expect(links).toHaveLength(3);
    expect(links[0].textContent).toContain("Discussion récente");
    expect(links[1].textContent).toContain("Discussion intermédiaire");
    expect(links[2].textContent).toContain("Vieille discussion");
  });
});
