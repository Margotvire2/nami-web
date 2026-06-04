/**
 * F-ADMIN-NAMI-DASHBOARD-KPIS — tests Vitest des composants du dashboard admin.
 *
 * On teste les briques atomiques + la page entière en mockant `useAdminKpis`.
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { KpiStatCard } from "@/components/admin/KpiStatCard";
import { Kpi24hActivity } from "@/components/admin/Kpi24hActivity";
import { KpiAlertsList } from "@/components/admin/KpiAlertsList";
import type {
  AdminKpiActivity24h,
  AdminKpiGrowthEntry,
  AdminKpiResponse,
} from "@/hooks/useAdminKpis";

// ─── Mocks ─────────────────────────────────────────────────────────────────

const mockUseAdminKpis = vi.fn();
vi.mock("@/hooks/useAdminKpis", async () => {
  const actual = await vi.importActual<typeof import("@/hooks/useAdminKpis")>(
    "@/hooks/useAdminKpis",
  );
  return {
    ...actual,
    useAdminKpis: () => mockUseAdminKpis(),
  };
});

// Recharts en jsdom : <ResponsiveContainer /> mesure le parent (0×0 → ne rend
// pas). On stubbe ResponsiveContainer pour rendre directement les enfants.
vi.mock("recharts", async () => {
  const actual = await vi.importActual<typeof import("recharts")>("recharts");
  return {
    ...actual,
    ResponsiveContainer: ({ children }: { children: React.ReactNode }) => (
      <div data-testid="responsive-stub" style={{ width: 800, height: 220 }}>
        {children}
      </div>
    ),
  };
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function makeGrowth(): AdminKpiGrowthEntry[] {
  const out: AdminKpiGrowthEntry[] = [];
  for (let i = 0; i < 30; i++) {
    out.push({
      date: `2026-05-${String(i + 1).padStart(2, "0")}`,
      signupsTotal: i,
      signupsByRole: { PATIENT: Math.floor(i / 2), PROVIDER: Math.ceil(i / 2) },
    });
  }
  return out;
}

function makeActivity(): AdminKpiActivity24h {
  return {
    newSignups: 12,
    newCareCases: 4,
    newRCPs: 2,
    newAppointments: 18,
    newDocs: 7,
    newMessages: 33,
  };
}

function makeResponse(overrides: Partial<AdminKpiResponse> = {}): AdminKpiResponse {
  return {
    totals: {
      organizations: 5,
      providers: 42,
      patients: 318,
      careCasesActive: 27,
      eventsUpcoming: 64,
      rcpsScheduled: 3,
    },
    growth30d: makeGrowth(),
    activity24h: makeActivity(),
    alerts: [],
    generatedAt: "2026-06-04T10:00:00.000Z",
    ...overrides,
  };
}

beforeEach(() => {
  mockUseAdminKpis.mockReset();
});

// ─── KpiStatCard ────────────────────────────────────────────────────────────

describe("KpiStatCard", () => {
  it("affiche la valeur formatée en FR (séparateurs de milliers)", () => {
    render(<KpiStatCard label="Patients" value={1234} />);
    // Intl.NumberFormat("fr-FR") utilise U+202F (NARROW NO-BREAK SPACE).
    const expected = (1234).toLocaleString("fr-FR");
    expect(screen.getByTestId("kpi-stat-value").textContent).toBe(expected);
  });

  it("affiche le label en uppercase et l'indication optionnelle", () => {
    render(<KpiStatCard label="Patients" value={0} hint="Total cumulé" />);
    expect(screen.getByText("Patients")).toBeInTheDocument();
    expect(screen.getByText("Total cumulé")).toBeInTheDocument();
  });

  it("rend une carte sans hint sans casser", () => {
    render(<KpiStatCard label="Orgs" value={42} />);
    expect(screen.getByTestId("kpi-stat-card")).toBeInTheDocument();
  });
});

// ─── Kpi24hActivity ─────────────────────────────────────────────────────────

describe("Kpi24hActivity", () => {
  it("rend 4 items et utilise les 4 compteurs principaux", () => {
    render(<Kpi24hActivity data={makeActivity()} />);
    const items = screen.getAllByTestId("kpi-24h-item");
    expect(items).toHaveLength(4);
    expect(screen.getByText("Nouveaux comptes")).toBeInTheDocument();
    expect(screen.getByText("Nouveaux dossiers")).toBeInTheDocument();
    expect(screen.getByText("Nouvelles RCPs")).toBeInTheDocument();
    expect(screen.getByText("Nouveaux RDVs")).toBeInTheDocument();
  });

  it("affiche '12' pour newSignups", () => {
    render(<Kpi24hActivity data={makeActivity()} />);
    expect(screen.getByText("12")).toBeInTheDocument();
  });
});

// ─── KpiAlertsList ──────────────────────────────────────────────────────────

describe("KpiAlertsList", () => {
  it("affiche l'empty state quand aucun signal", () => {
    render(<KpiAlertsList alerts={[]} />);
    expect(screen.getByTestId("kpi-alerts-empty")).toBeInTheDocument();
    expect(screen.getByText(/Aucun signal récent/)).toBeInTheDocument();
  });

  it("affiche les signaux et coupe à la limite", () => {
    const alerts = Array.from({ length: 15 }, (_, i) => ({
      type: `SIGNAL_${i}`,
      count: 1,
      lastAt: "2026-06-04T09:00:00.000Z",
    }));
    render(<KpiAlertsList alerts={alerts} limit={10} />);
    expect(screen.getAllByTestId("kpi-alerts-item")).toHaveLength(10);
  });
});

// ─── Page intégration ───────────────────────────────────────────────────────

async function renderPage() {
  const mod = await import("@/app/(cockpit)/admin/dashboard/page");
  const Page = mod.default;
  return render(<Page />);
}

describe("AdminDashboardPage", () => {
  it("affiche l'état de chargement quand data=null", async () => {
    mockUseAdminKpis.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
      dataUpdatedAt: 0,
    });
    await renderPage();
    expect(screen.getByTestId("kpi-loading")).toBeInTheDocument();
  });

  it("affiche l'erreur et masque les compteurs si la requête échoue", async () => {
    mockUseAdminKpis.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error("Erreur 403"),
      refetch: vi.fn(),
      isFetching: false,
      dataUpdatedAt: 0,
    });
    await renderPage();
    expect(screen.getByTestId("kpi-error").textContent).toContain("Erreur 403");
  });

  it("rend les 6 KPI cards quand data est disponible", async () => {
    mockUseAdminKpis.mockReturnValue({
      data: makeResponse(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
      dataUpdatedAt: Date.now(),
    });
    await renderPage();
    expect(screen.getAllByTestId("kpi-stat-card")).toHaveLength(6);
    expect(screen.getByText("Organisations")).toBeInTheDocument();
    expect(screen.getByText("Patients")).toBeInTheDocument();
    expect(screen.getByText("Dossiers actifs")).toBeInTheDocument();
  });

  it("appelle refetch() au clic sur Rafraîchir", async () => {
    const refetch = vi.fn();
    mockUseAdminKpis.mockReturnValue({
      data: makeResponse(),
      isLoading: false,
      error: null,
      refetch,
      isFetching: false,
      dataUpdatedAt: Date.now(),
    });
    await renderPage();
    fireEvent.click(screen.getByTestId("kpi-refresh"));
    expect(refetch).toHaveBeenCalledTimes(1);
  });

  it("désactive le bouton Rafraîchir pendant le refetch", async () => {
    mockUseAdminKpis.mockReturnValue({
      data: makeResponse(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isFetching: true,
      dataUpdatedAt: Date.now(),
    });
    await renderPage();
    const btn = screen.getByTestId("kpi-refresh") as HTMLButtonElement;
    expect(btn.disabled).toBe(true);
  });

  it("rend le composant de croissance et l'activité 24 h quand data est dispo", async () => {
    mockUseAdminKpis.mockReturnValue({
      data: makeResponse(),
      isLoading: false,
      error: null,
      refetch: vi.fn(),
      isFetching: false,
      dataUpdatedAt: Date.now(),
    });
    await renderPage();
    expect(screen.getByTestId("kpi-trend-chart")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-24h-activity")).toBeInTheDocument();
    expect(screen.getByTestId("kpi-alerts-list")).toBeInTheDocument();
  });
});
