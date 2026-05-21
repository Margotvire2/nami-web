import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PatientSidebar } from "../PatientSidebar";
import { PatientHeader } from "../PatientHeader";
import { PatientBottomNav } from "../PatientBottomNav";

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockReplace = vi.fn();
const mockRouter = { replace: mockReplace, push: vi.fn(), refresh: vi.fn() };
const mockPathname = "/accueil";
let mockSearchParamsString = "";

vi.mock("next/navigation", () => ({
  useRouter: () => mockRouter,
  usePathname: () => mockPathname,
  useSearchParams: () => new URLSearchParams(mockSearchParamsString),
}));

vi.mock("@/lib/store", () => ({
  useAuthStore: (selector: (s: unknown) => unknown) =>
    selector({
      accessToken: "test-token",
      user: { id: "u1", firstName: "Marie", lastName: "Dubois", roleType: "PATIENT" },
      logout: vi.fn(),
    }),
}));

const mockSwitchableProfiles = vi.fn();

vi.mock("@/lib/api", () => ({
  apiWithToken: () => ({
    patient: {
      switchableProfiles: mockSwitchableProfiles,
    },
  }),
}));

// ─── Helpers ────────────────────────────────────────────────────────────────

function renderWithClient(ui: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: 0 } },
  });
  return render(<QueryClientProvider client={client}>{ui}</QueryClientProvider>);
}

const PROFILES_WITH_DELEGATION = [
  {
    personId: "marie",
    firstName: "Marie",
    lastName: "Dubois",
    birthDate: null,
    isSelf: true,
    delegationScopes: null,
  },
  {
    personId: "lea",
    firstName: "Léa",
    lastName: "Dubois",
    birthDate: "2016-03-15",
    isSelf: false,
    delegationScopes: ["VIEW_APPOINTMENTS"],
  },
];

beforeEach(() => {
  mockReplace.mockReset();
  mockSwitchableProfiles.mockReset();
  mockSearchParamsString = "";
});

// ═══════════════════════════════════════════════════════════════════════════
// Test 1 — PatientSidebar rend 7 entrées avec bons labels
// ═══════════════════════════════════════════════════════════════════════════

describe("PatientSidebar", () => {
  it("1. rend 7 entrées avec les bons libellés", () => {
    render(<PatientSidebar />);

    expect(screen.getByText("Accueil")).toBeInTheDocument();
    expect(screen.getByText("Trouver un soignant")).toBeInTheDocument();
    expect(screen.getByText("Mes rendez-vous")).toBeInTheDocument();
    expect(screen.getByText("Mon parcours")).toBeInTheDocument();
    expect(screen.getByText("Mon suivi")).toBeInTheDocument();
    expect(screen.getByText("Mes messages")).toBeInTheDocument();
    expect(screen.getByText("Mes documents")).toBeInTheDocument();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Test 2 — Entries disabled (3) avec attribut title "Bientôt disponible"
  // ═════════════════════════════════════════════════════════════════════════
  it("2. les 3 entries disabled (Trouver soignant / Parcours / Suivi) sont non-cliquables + title 'Bientôt disponible'", () => {
    render(<PatientSidebar />);

    const disabledLabels = ["Trouver un soignant", "Mon parcours", "Mon suivi"];
    for (const label of disabledLabels) {
      const node = screen.getByText(label).closest('[aria-disabled="true"]');
      expect(node).not.toBeNull();
      expect(node).toHaveAttribute("title", "Bientôt disponible");
      // .closest div n'a pas de role link → pas de Link Next.js (non-cliquable)
      expect(node?.tagName).toBe("DIV");
    }

    // Les 4 entries actives sont en <a> Link
    const activeLabels = ["Accueil", "Mes rendez-vous", "Mes messages", "Mes documents"];
    for (const label of activeLabels) {
      const node = screen.getByText(label).closest("a");
      expect(node).not.toBeNull();
    }
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Test 3 — PatientHeader : mascotte + logo + Bell + ProfileSwitcher + Avatar
// ═══════════════════════════════════════════════════════════════════════════

describe("PatientHeader", () => {
  it("3. contient mascotte + logo Nami + Bell placeholder + ProfileSwitcher + Avatar menu", async () => {
    mockSwitchableProfiles.mockResolvedValue(PROFILES_WITH_DELEGATION);
    renderWithClient(<PatientHeader />);

    // Mascotte
    const mascotte = screen.getByAltText("Mascotte Nami");
    expect(mascotte).toBeInTheDocument();
    expect(mascotte).toHaveAttribute("src", expect.stringContaining("nami-mascot"));

    // Logo texte "Nami"
    expect(screen.getByText("Nami")).toBeInTheDocument();

    // Bell placeholder (disabled, opacity-60)
    const bellBtn = screen.getByRole("button", { name: /Notifications/i });
    expect(bellBtn).toBeDisabled();

    // Avatar menu — initiales MD
    const avatarBtn = screen.getByRole("button", { name: /Menu utilisateur/i });
    expect(avatarBtn).toBeInTheDocument();
    expect(avatarBtn.textContent).toContain("MD");

    // ProfileSwitcher visible car 2 profils — attendre que la query résolve
    await waitFor(() => {
      expect(screen.getByText(/Au nom de Léa|Vous/i)).toBeInTheDocument();
    });
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Test 4 — Banner contextuel si ?profile=<personId non-self>
  // ═════════════════════════════════════════════════════════════════════════
  it("4. affiche le banner 'Vous consultez l'espace de Léa' si ?profile=lea (non-self)", async () => {
    mockSwitchableProfiles.mockResolvedValue(PROFILES_WITH_DELEGATION);
    mockSearchParamsString = "profile=lea";

    renderWithClient(<PatientHeader />);

    await waitFor(() => {
      const banner = screen.getByRole("status");
      expect(banner.textContent).toMatch(/Vous consultez l'espace de/);
      expect(banner.textContent).toContain("Léa");
    });
  });

  it("4-bis. n'affiche PAS le banner si profil actif = self (pas de ?profile dans l'URL)", async () => {
    mockSwitchableProfiles.mockResolvedValue(PROFILES_WITH_DELEGATION);
    mockSearchParamsString = ""; // pas de ?profile

    renderWithClient(<PatientHeader />);

    await waitFor(() => {
      expect(screen.getByText(/Au nom de Léa|Vous/i)).toBeInTheDocument();
    });
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});

// ═══════════════════════════════════════════════════════════════════════════
// Test 5 — PatientBottomNav : 4 entrées primaires + bouton Plus⋯ + 4 items secondary
// ═══════════════════════════════════════════════════════════════════════════

describe("PatientBottomNav", () => {
  it("5. rend 4 entrées primaires + bouton 'Plus' qui ouvre un drawer avec 4 items secondaires", () => {
    render(<PatientBottomNav />);

    // 4 entrées primaires : Accueil, RDV, Parcours (disabled), Messages
    expect(screen.getByText("Accueil")).toBeInTheDocument();
    expect(screen.getByText("RDV")).toBeInTheDocument();
    expect(screen.getByText("Parcours")).toBeInTheDocument();
    expect(screen.getByText("Messages")).toBeInTheDocument();

    // Bouton "Plus" présent
    const moreBtn = screen.getByRole("button", { name: /Plus d'options/i });
    expect(moreBtn).toBeInTheDocument();

    // Drawer fermé par défaut → "Trouver un soignant" PAS visible
    expect(screen.queryByText("Trouver un soignant")).not.toBeInTheDocument();

    // Ouvrir le drawer
    fireEvent.click(moreBtn);

    // 4 items secondaires visibles : Trouver soignant (disabled), Suivi (disabled), Documents, Mon compte
    expect(screen.getByText("Trouver un soignant")).toBeInTheDocument();
    expect(screen.getByText("Mon suivi")).toBeInTheDocument();
    expect(screen.getByText("Mes documents")).toBeInTheDocument();
    expect(screen.getByText("Mon compte")).toBeInTheDocument();
  });
});
