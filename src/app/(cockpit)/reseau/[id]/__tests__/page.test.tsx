import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import OrgDetailPage from "../page";

// ─── Mocks ──────────────────────────────────────────────────────────────────

vi.mock("next/navigation", () => ({
  useParams: () => ({ id: "org-rtf" }),
}));

vi.mock("@/lib/store", () => ({
  useAuthStore: () => ({ accessToken: "test-token" }),
}));

// next/link → on rend une ancre simple pour pouvoir lire data-testid + href
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    [k: string]: unknown;
  }) => (
    <a href={typeof href === "string" ? href : "#"} {...rest}>
      {children}
    </a>
  ),
}));

// ─── Fixtures ───────────────────────────────────────────────────────────────

const baseOrg = {
  id: "org-rtf",
  name: "Réseau TCA Francilien",
  type: "NETWORK",
  description: "Réseau pluridisciplinaire de coordination TCA en Île-de-France.",
  city: "Paris",
  requiresApproval: true,
  memberCount: 12,
  myMembership: null,
  myPendingRequest: null,
  members: [
    { personId: "p1", firstName: "Alice", lastName: "Durand", memberRole: "MEMBER" },
    { personId: "p2", firstName: "Bob", lastName: "Martin", memberRole: "MEMBER" },
    { personId: "p3", firstName: "Chloé", lastName: "Petit", memberRole: "MEMBER" },
    { personId: "p4", firstName: "David", lastName: "Roux", memberRole: "ADMIN" },
  ],
  conversations: [],
};

function mockFetch(payload: unknown) {
  global.fetch = vi.fn().mockResolvedValue({
    ok: true,
    json: async () => payload,
  }) as unknown as typeof fetch;
}

function renderWithClient(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("OrgDetailPage — F-STRUCT-V1-PAGE-PUBLIQUE", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("Loading state → spinner visible avant data", () => {
    global.fetch = vi.fn(() => new Promise(() => {})) as unknown as typeof fetch;
    const { container } = renderWithClient(<OrgDetailPage />);
    // <Loader2> rend un svg avec animate-spin
    const spinner = container.querySelector(".animate-spin");
    expect(spinner).not.toBeNull();
  });

  it("Visiteur non-membre → header + CTA adhésion + placeholder Actualités, PAS Événements/Recherche/Ressources", async () => {
    mockFetch({ ...baseOrg, myMembership: null });
    renderWithClient(<OrgDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/Réseau TCA Francilien/)).toBeTruthy();
    });

    // Header CTA adhésion (org.requiresApproval=true)
    expect(screen.getAllByText(/Demander à rejoindre/i).length).toBeGreaterThan(0);

    // Section Actualités (placeholder) visible — on cible le heading pour éviter
    // les faux positifs avec le texte d'invite "..et aux ressources partagées".
    expect(screen.getByRole("heading", { name: /Actualités du réseau/i })).toBeTruthy();

    // Sections réservées aux membres → ABSENTES (heading only)
    expect(screen.queryByRole("heading", { name: /Événements à venir/i })).toBeNull();
    expect(screen.queryByRole("heading", { name: /Rechercher dans le réseau/i })).toBeNull();
    expect(screen.queryByRole("heading", { name: /Ressources partagées/i })).toBeNull();

    // Encart Annuaire visible (avec lien)
    const directoryLinks = screen
      .getAllByRole("link")
      .filter((a) => (a as HTMLAnchorElement).getAttribute("href")?.includes("/annuaire"));
    expect(directoryLinks.length).toBeGreaterThan(0);

    // PAS de bouton Console d'animation
    expect(screen.queryByTestId("admin-console-link")).toBeNull();
  });

  it("Membre (MEMBER ACTIVE) → toutes les sections placeholder visibles + badge ✓ Membre, pas de console", async () => {
    mockFetch({
      ...baseOrg,
      myMembership: { id: "mm-1", status: "ACTIVE", memberRole: "MEMBER" },
    });
    renderWithClient(<OrgDetailPage />);

    await waitFor(() => {
      expect(screen.getByText(/Réseau TCA Francilien/)).toBeTruthy();
    });

    // Badge ✓ Membre visible
    expect(screen.getByText(/✓ Membre/i)).toBeTruthy();

    // Toutes les sections placeholder visibles (headings)
    expect(screen.getByRole("heading", { name: /Actualités du réseau/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /Événements à venir/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /Rechercher dans le réseau/i })).toBeTruthy();
    expect(screen.getByRole("heading", { name: /Ressources partagées/i })).toBeTruthy();

    // PAS de bouton Console d'animation pour un simple MEMBER
    expect(screen.queryByTestId("admin-console-link")).toBeNull();
  });

  it("Admin (ADMIN ACTIVE) → bouton Console d'animation visible avec lien /structure/:id/admin, pas de badge", async () => {
    mockFetch({
      ...baseOrg,
      myMembership: { id: "mm-1", status: "ACTIVE", memberRole: "ADMIN" },
    });
    renderWithClient(<OrgDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId("admin-console-link")).toBeTruthy();
    });

    const link = screen.getByTestId("admin-console-link") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/structure/org-rtf/admin");
    expect(link.textContent).toMatch(/Console d'animation/i);

    // Le badge "✓ Membre" est remplacé → absent
    expect(screen.queryByText(/✓ Membre/i)).toBeNull();

    // Sections membre toujours visibles
    expect(screen.getByRole("heading", { name: /Événements à venir/i })).toBeTruthy();
  });

  it("Owner (OWNER ACTIVE) → traité comme admin, bouton Console d'animation visible", async () => {
    mockFetch({
      ...baseOrg,
      myMembership: { id: "mm-1", status: "ACTIVE", memberRole: "OWNER" },
    });
    renderWithClient(<OrgDetailPage />);

    await waitFor(() => {
      expect(screen.getByTestId("admin-console-link")).toBeTruthy();
    });

    const link = screen.getByTestId("admin-console-link") as HTMLAnchorElement;
    expect(link.getAttribute("href")).toBe("/structure/org-rtf/admin");
  });
});
