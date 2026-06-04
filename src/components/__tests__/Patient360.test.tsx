/**
 * F-COCKPIT-PATIENT-360-REFONTE
 *
 * Tests unitaires Vitest + React Testing Library pour la refonte 360°
 * du cockpit patient. Ils ciblent les composants atomiques :
 *
 *   - PatientSidebar       (URL state, badges, aria-current, animation)
 *   - QuickActionsBar      (3 boutons, disabled + tooltip)
 *   - ViewOverview         (6 cards, "Voir tout", empty states)
 *
 * On ne monte PAS la page entière (page.tsx) — elle dépend de Next App Router
 * use(), du Auth store, de useCareSocket, etc. Tester les briques séparément
 * couvre tout le contract de la refonte sans flakiness.
 */

import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterEach,
} from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { LayoutDashboard, GitBranch } from "lucide-react";

import {
  PatientSidebar,
  type PatientSidebarTab,
} from "@/app/(cockpit)/patients/[id]/_components/PatientSidebar";
import { QuickActionsBar } from "@/app/(cockpit)/patients/[id]/_components/QuickActionsBar";
import { ViewOverview } from "@/app/(cockpit)/patients/[id]/views/ViewOverview";
import type { PatientDashboard } from "@/hooks/usePatientDashboard";
import type { CareCaseDetail } from "@/lib/api";
import {
  computePatient360Counts,
} from "@/hooks/usePatient360";

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockReplace = vi.fn();
let mockSearchParams = new URLSearchParams();

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    replace: mockReplace,
    push: vi.fn(),
    refresh: vi.fn(),
  }),
  useSearchParams: () => mockSearchParams,
}));

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    onClick,
    ...rest
  }: {
    href: string;
    children: React.ReactNode;
    onClick?: (e: React.MouseEvent<HTMLAnchorElement>) => void;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} onClick={onClick} {...rest}>
      {children}
    </a>
  ),
}));

let mockReducedMotion: boolean | null = false;
vi.mock("framer-motion", async () => {
  const React = await import("react");
  const MotionSpan = React.forwardRef<
    HTMLSpanElement,
    React.HTMLAttributes<HTMLSpanElement>
  >(({ children, ...rest }, ref) => (
    <span ref={ref} {...rest}>
      {children}
    </span>
  ));
  MotionSpan.displayName = "MotionSpan";
  return {
    motion: { span: MotionSpan },
    useReducedMotion: () => mockReducedMotion,
  };
});

// ─── Helpers ────────────────────────────────────────────────────────────────

function tabs(): PatientSidebarTab[] {
  return [
    { key: "overview", label: "Vue d'ensemble", icon: <LayoutDashboard size={14} /> },
    { key: "parcours", label: "Parcours", icon: <GitBranch size={14} /> },
    { key: "bilans", label: "Bilans & suivi", icon: <GitBranch size={14} /> },
    { key: "observations", label: "Observations", icon: <GitBranch size={14} /> },
    { key: "messages", label: "Coordination", icon: <GitBranch size={14} /> },
  ];
}

function makeCareCase(overrides: Partial<CareCaseDetail> = {}): CareCaseDetail {
  return {
    id: "cc1",
    caseTitle: "Suivi TCA",
    caseType: "TCA",
    status: "ACTIVE",
    riskLevel: "LOW",
    lastActivityAt: null,
    startDate: "2026-01-01T00:00:00Z",
    patient: {
      id: "p1",
      firstName: "Léa",
      lastName: "Rousseau",
      email: "lea@example.fr",
      phone: undefined,
      birthDate: "2010-04-15T00:00:00Z",
      sex: "F",
    },
    leadProvider: null,
    mainConcern: null,
    clinicalSummary: null,
    careStage: null,
    nextStepSummary: null,
    height: null,
    napValue: null,
    napDescription: null,
    pathwayTemplateId: null,
    patientFacingTitle: null,
    members: [],
    _count: {
      members: 2,
      activities: 17,
      notes: 5,
      documents: 3,
      tasks: 1,
      alerts: 0,
    },
    ...overrides,
  };
}

function makeDashboard(
  overrides: Partial<PatientDashboard> = {},
): PatientDashboard {
  return {
    patient: {
      id: "p1",
      firstName: "Léa",
      lastName: "Rousseau",
      age: 16,
      sex: "F",
    },
    pathway: null,
    alerts: [],
    screenings: [],
    indicators: [],
    questionnaires: [],
    actions: {
      urgentTasks: [],
      upcomingAppointments: [],
      pendingReferrals: [],
      suggestedReferrals: [],
    },
    recentActivity: [],
    ...overrides,
  };
}

// ────────────────────────────────────────────────────────────────────────────

describe("F-COCKPIT-PATIENT-360 — PatientSidebar", () => {
  beforeEach(() => {
    mockReplace.mockReset();
    mockSearchParams = new URLSearchParams();
    mockReducedMotion = false;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // 1
  it("renders all sidebar tabs from the tabs prop", () => {
    render(<PatientSidebar activeTab="overview" tabs={tabs()} />);
    expect(screen.getByText("Vue d'ensemble")).toBeInTheDocument();
    expect(screen.getByText("Parcours")).toBeInTheDocument();
    expect(screen.getByText("Bilans & suivi")).toBeInTheDocument();
    expect(screen.getByText("Observations")).toBeInTheDocument();
    expect(screen.getByText("Coordination")).toBeInTheDocument();
  });

  // 2
  it("active tab has aria-current='page'", () => {
    render(<PatientSidebar activeTab="parcours" tabs={tabs()} />);
    const activeBtn = screen.getByTestId("patient-sidebar-tab-parcours");
    expect(activeBtn).toHaveAttribute("aria-current", "page");
    const otherBtn = screen.getByTestId("patient-sidebar-tab-overview");
    expect(otherBtn).not.toHaveAttribute("aria-current");
  });

  // 3
  it("clicking a tab calls router.replace with ?tab=<key> and scroll:false", () => {
    render(<PatientSidebar activeTab="overview" tabs={tabs()} />);
    fireEvent.click(screen.getByTestId("patient-sidebar-tab-parcours"));
    expect(mockReplace).toHaveBeenCalledTimes(1);
    const [url, opts] = mockReplace.mock.calls[0];
    expect(url).toContain("tab=parcours");
    expect(opts).toEqual({ scroll: false });
  });

  // 4
  it("renders a count badge when count > 0", () => {
    render(
      <PatientSidebar
        activeTab="overview"
        tabs={tabs()}
        counts={{ bilans: 4 }}
      />,
    );
    const badge = screen.getByTestId("patient-sidebar-count-bilans");
    expect(badge.textContent).toBe("4");
  });

  // 5
  it("does NOT render a badge when count = 0", () => {
    render(
      <PatientSidebar
        activeTab="overview"
        tabs={tabs()}
        counts={{ bilans: 0 }}
      />,
    );
    expect(screen.queryByTestId("patient-sidebar-count-bilans")).toBeNull();
  });

  // 6
  it("caps badge at '99+' when count > 99", () => {
    render(
      <PatientSidebar
        activeTab="overview"
        tabs={tabs()}
        counts={{ observations: 245 }}
      />,
    );
    const badge = screen.getByTestId("patient-sidebar-count-observations");
    expect(badge.textContent).toBe("99+");
  });

  // 7
  it("with reduced-motion: uses the STATIC indicator (no framer animation)", () => {
    mockReducedMotion = true;
    render(<PatientSidebar activeTab="parcours" tabs={tabs()} />);
    expect(
      screen.getByTestId("patient-sidebar-active-indicator-static"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("patient-sidebar-active-indicator"),
    ).toBeNull();
  });

  // 8
  it("without reduced-motion: uses the animated indicator", () => {
    mockReducedMotion = false;
    render(<PatientSidebar activeTab="parcours" tabs={tabs()} />);
    expect(
      screen.getByTestId("patient-sidebar-active-indicator"),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("patient-sidebar-active-indicator-static"),
    ).toBeNull();
  });
});

// ────────────────────────────────────────────────────────────────────────────

describe("F-COCKPIT-PATIENT-360 — QuickActionsBar", () => {
  // 9
  it("renders the 3 quick action buttons", () => {
    render(
      <QuickActionsBar
        onScheduleAppointment={() => {}}
        onSendMessage={() => {}}
        onAddDocument={() => {}}
      />,
    );
    expect(screen.getByTestId("quick-action-appointment")).toBeInTheDocument();
    expect(screen.getByTestId("quick-action-message")).toBeInTheDocument();
    expect(screen.getByTestId("quick-action-document")).toBeInTheDocument();
  });

  // 10
  it("disables actions with 'Bientôt' tooltip when no handler", () => {
    render(<QuickActionsBar />);
    const btn = screen.getByTestId("quick-action-appointment");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("title", "Bientôt");
  });

  // 11
  it("invokes the handler when an action is clicked", () => {
    const onMsg = vi.fn();
    render(<QuickActionsBar onSendMessage={onMsg} />);
    fireEvent.click(screen.getByTestId("quick-action-message"));
    expect(onMsg).toHaveBeenCalledTimes(1);
  });
});

// ────────────────────────────────────────────────────────────────────────────

describe("F-COCKPIT-PATIENT-360 — ViewOverview", () => {
  // 12
  it("renders all 6 summary cards", () => {
    render(
      <ViewOverview
        patient={makeCareCase()}
        dashboard={makeDashboard()}
        onNavigateToTab={() => {}}
      />,
    );
    expect(screen.getByTestId("overview-card-next-appointment")).toBeInTheDocument();
    expect(screen.getByTestId("overview-card-last-consultation")).toBeInTheDocument();
    expect(screen.getByTestId("overview-card-bilans")).toBeInTheDocument();
    expect(screen.getByTestId("overview-card-tasks")).toBeInTheDocument();
    expect(screen.getByTestId("overview-card-rcps")).toBeInTheDocument();
    expect(screen.getByTestId("overview-card-documents")).toBeInTheDocument();
  });

  // 13
  it("shows warm-tone empty states when there's no data", () => {
    render(
      <ViewOverview
        patient={makeCareCase({
          _count: {
            members: 0,
            activities: 0,
            notes: 0,
            documents: 0,
            tasks: 0,
            alerts: 0,
          },
        })}
        dashboard={makeDashboard()}
        onNavigateToTab={() => {}}
      />,
    );
    expect(screen.getByText("Aucun RDV planifié")).toBeInTheDocument();
    expect(screen.getByText("Aucune consultation récente")).toBeInTheDocument();
    expect(screen.getByText("Tous les bilans sont à jour")).toBeInTheDocument();
    expect(screen.getByText("Aucune tâche en attente")).toBeInTheDocument();
    expect(screen.getByText("Aucune réunion récente")).toBeInTheDocument();
    expect(screen.getByText("Aucun document partagé")).toBeInTheDocument();
  });

  // 14
  it("Voir tout link switches tab via onNavigateToTab", () => {
    const onNav = vi.fn();
    render(
      <ViewOverview
        patient={makeCareCase()}
        dashboard={makeDashboard()}
        onNavigateToTab={onNav}
      />,
    );
    fireEvent.click(screen.getByText("Ouvrir les bilans →"));
    expect(onNav).toHaveBeenCalledWith("bilans");
  });
});

// ────────────────────────────────────────────────────────────────────────────

describe("F-COCKPIT-PATIENT-360 — computePatient360Counts", () => {
  // 15
  it("aggregates counts from careCase._count + dashboard", () => {
    const counts = computePatient360Counts(
      makeCareCase(),
      makeDashboard({
        indicators: [
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { required: true, timeStatus: "OVERDUE" } as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { required: true, timeStatus: "DUE_SOON" } as any,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          { required: false, timeStatus: "OVERDUE" } as any,
        ],
        actions: {
          urgentTasks: [
            { id: "t1", label: "todo", dueDate: null, assigneeName: null },
          ],
          upcomingAppointments: [
            { id: "a1", date: "2026-07-01", providerName: null, type: null },
          ],
          pendingReferrals: [],
          suggestedReferrals: [],
        },
      }),
    );
    expect(counts.observationsTotal).toBe(17);
    expect(counts.documentsRecent).toBe(3);
    expect(counts.bilansPending).toBe(2);
    expect(counts.agendaUpcoming).toBe(1);
    expect(counts.tasksOpen).toBe(1);
  });

  // 16 (bonus)
  it("returns zero counts when both inputs are undefined", () => {
    const counts = computePatient360Counts(undefined, undefined);
    expect(counts.observationsTotal).toBe(0);
    expect(counts.agendaUpcoming).toBe(0);
    expect(counts.bilansPending).toBe(0);
  });
});
