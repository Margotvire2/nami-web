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
      notifications: {
        // Mock graceful : retourne feed vide → unreadCount = 0 dans les
        // composants sidebar / bottom-nav / header (post PR #43 + #61).
        feed: vi.fn().mockResolvedValue({ items: [], unreadCount: 0 }),
        markRead: vi.fn().mockResolvedValue({ success: true }),
      },
    },
  }),
}));

// Mock du hook usePatientCareCases utilisé par <PatientNavParcoursItem/>
// inséré dans la sidebar (PR V1-NAV-PATIENT-MULTI-CARECASE).
// Par défaut : 0 CareCase → branche "disabled + Bientôt — démarrez..."
vi.mock("@/hooks/usePatientCareCases", () => ({
  usePatientCareCases: () => ({ data: [], isLoading: false }),
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
// Test 1 — PatientSidebar rend les 8 entrées (Notifications + Parcours adaptatif)
// ═══════════════════════════════════════════════════════════════════════════

describe("PatientSidebar", () => {
  it("1. rend 8 entrées avec les bons libellés (Notifications + Parcours adaptatif)", () => {
    renderWithClient(<PatientSidebar />);

    expect(screen.getByText("Accueil")).toBeInTheDocument();
    expect(screen.getByText("Trouver un soignant")).toBeInTheDocument();
    expect(screen.getByText("Mes rendez-vous")).toBeInTheDocument();
    expect(screen.getByText("Notifications")).toBeInTheDocument();
    // "Mon parcours" provient désormais de <PatientNavParcoursItem/> —
    // branche 0 CareCase = item disabled avec ce libellé.
    expect(screen.getByText("Mon parcours")).toBeInTheDocument();
    expect(screen.getByText("Mon suivi")).toBeInTheDocument();
    expect(screen.getByText("Mes messages")).toBeInTheDocument();
    expect(screen.getByText("Mes documents")).toBeInTheDocument();
  });

  // ═════════════════════════════════════════════════════════════════════════
  // Test 2 — "Trouver un soignant" actif (route publique branchée, INIT-689)
  //          + "Mon parcours" disabled via PatientNavParcoursItem (branche 0)
  // ═════════════════════════════════════════════════════════════════════════
  it("2. 'Trouver un soignant' actif (Link) + 'Mon parcours' disabled (branche 0 CareCase)", () => {
    renderWithClient(<PatientSidebar />);

    // Item "Trouver un soignant" → désormais Link actif vers la route publique
    const trouver = screen.getByText("Trouver un soignant").closest("a");
    expect(trouver).not.toBeNull();
    expect(trouver).toHaveAttribute("href", "/trouver-un-soignant");

    // Item "Mon parcours" via PatientNavParcoursItem (branche 0 CareCase)
    // → disabled avec tooltip dédié "Bientôt — démarrez avec un soignant"
    const parcours = screen.getByText("Mon parcours").closest('[aria-disabled="true"]');
    expect(parcours).not.toBeNull();
    expect(parcours).toHaveAttribute("title", "Bientôt — démarrez avec un soignant");
    expect(parcours?.tagName).toBe("DIV");

    // Les autres entries actives sont en <a> Link
    const activeLabels = [
      "Accueil",
      "Trouver un soignant",
      "Mes rendez-vous",
      "Notifications",
      "Mon suivi",
      "Mes messages",
      "Mes documents",
    ];
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

    // Bell fonctionnel (PR #43) : button cliquable avec aria-haspopup="dialog"
    const bellBtn = screen.getByRole("button", { name: /Notifications/i });
    expect(bellBtn).not.toBeDisabled();
    expect(bellBtn).toHaveAttribute("aria-haspopup", "dialog");

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
// Test 5 — PatientBottomNav : 5 entrées primaires + bouton Plus⋯ + items secondary
// ═══════════════════════════════════════════════════════════════════════════

describe("PatientBottomNav", () => {
  it("5. rend 5 entrées primaires (Notifs inséré) + bouton 'Plus' qui ouvre un drawer avec 4 items secondaires", () => {
    renderWithClient(<PatientBottomNav />);

    // 5 entrées primaires : Accueil, RDV, Notifs, Parcours, Messages
    expect(screen.getByText("Accueil")).toBeInTheDocument();
    expect(screen.getByText("RDV")).toBeInTheDocument();
    expect(screen.getByText("Notifs")).toBeInTheDocument();
    expect(screen.getByText("Parcours")).toBeInTheDocument();
    expect(screen.getByText("Messages")).toBeInTheDocument();

    // Bouton "Plus" présent
    const moreBtn = screen.getByRole("button", { name: /Plus d'options/i });
    expect(moreBtn).toBeInTheDocument();

    // Drawer fermé par défaut → "Trouver un soignant" PAS visible
    expect(screen.queryByText("Trouver un soignant")).not.toBeInTheDocument();

    // Ouvrir le drawer
    fireEvent.click(moreBtn);

    // 4 items secondaires visibles : Trouver soignant (disabled), Suivi, Documents, Mon compte
    expect(screen.getByText("Trouver un soignant")).toBeInTheDocument();
    expect(screen.getByText("Mon suivi")).toBeInTheDocument();
    expect(screen.getByText("Mes documents")).toBeInTheDocument();
    expect(screen.getByText("Mon compte")).toBeInTheDocument();
  });
});
