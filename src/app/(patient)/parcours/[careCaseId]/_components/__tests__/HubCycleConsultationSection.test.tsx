import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { HubCycleConsultationSection } from "../HubCycleConsultationSection";
import type {
  PatientCareCaseHubPastConsultation,
} from "@/lib/api";

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...rest
  }: {
    href: string;
    children: ReactNode;
  } & React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={href} {...rest}>
      {children}
    </a>
  ),
}));

vi.mock("@/lib/store", () => ({
  useAuthStore: () => "test-token",
}));

// Le composant RdvCycleCard fetch des disponibilités → on neutralise
// (cas couverts par sa propre suite de tests).
vi.mock("../RdvCycleCard", () => ({
  RdvCycleCard: () => <div data-testid="rdv-cycle-card-mock" />,
}));

// useEntityHubControls : on mock pour intercepter openEntityHub et vérifier
// le paramètre transmis sur click d'une consultation passée.
const openEntityHub = vi.fn();
vi.mock("@/contexts/EntityHubContext", () => ({
  useEntityHubControls: () => ({
    current: null,
    openEntityHub,
    closeEntityHub: vi.fn(),
    backEntityHub: vi.fn(),
    canGoBack: false,
  }),
}));

// ── Fixtures ─────────────────────────────────────────────────────────────────

function makePast(
  overrides?: Partial<PatientCareCaseHubPastConsultation>,
): PatientCareCaseHubPastConsultation {
  return {
    id: "consult-1",
    dateISO: "2026-05-15T09:30:00.000Z",
    providerName: "Claire Dupont",
    hasClinicalNote: true,
    hasDocuments: true,
    ...overrides,
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

function renderSection(
  pastConsultations: PatientCareCaseHubPastConsultation[] | undefined,
) {
  const Wrapper = makeWrapper();
  return render(
    <Wrapper>
      <HubCycleConsultationSection
        upcoming={[]}
        toBook={[]}
        pastConsultations={pastConsultations}
        careCaseId="cc-1"
        patientId="patient-1"
      />
    </Wrapper>,
  );
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe("HubCycleConsultationSection — Consultations passées (V1.0c-B)", () => {
  beforeEach(() => {
    openEntityHub.mockReset();
  });

  it("rend 3 consultations passées → 3 items dans la liste", () => {
    renderSection([
      makePast({ id: "c-1", providerName: "Anne Dupont" }),
      makePast({
        id: "c-2",
        providerName: "Marie Lefebvre",
        dateISO: "2026-04-20T14:00:00.000Z",
      }),
      makePast({
        id: "c-3",
        providerName: "Paul Martin",
        dateISO: "2026-03-10T09:00:00.000Z",
      }),
    ]);

    const heading = screen.getByRole("heading", {
      name: /Consultations passées/i,
    });
    const group = heading.closest('[role="group"]') as HTMLElement;
    expect(group).not.toBeNull();
    const items = within(group).getAllByRole("listitem");
    expect(items).toHaveLength(3);

    expect(within(group).getByText("Anne Dupont")).toBeInTheDocument();
    expect(within(group).getByText("Marie Lefebvre")).toBeInTheDocument();
    expect(within(group).getByText("Paul Martin")).toBeInTheDocument();
  });

  it("click sur item → openEntityHub appelé avec { type, careCaseId, entityId }", async () => {
    const user = userEvent.setup();
    renderSection([
      makePast({ id: "consult-XYZ", providerName: "Claire Dupont" }),
    ]);

    const button = screen.getByRole("button", {
      name: /Voir la fiche de la consultation/i,
    });
    await user.click(button);

    expect(openEntityHub).toHaveBeenCalledTimes(1);
    expect(openEntityHub).toHaveBeenCalledWith({
      type: "consultation",
      careCaseId: "cc-1",
      entityId: "consult-XYZ",
    });
  });

  it("hasClinicalNote=false → badge 'Compte-rendu' absent", () => {
    renderSection([
      makePast({ id: "c-1", hasClinicalNote: false, hasDocuments: true }),
    ]);
    const heading = screen.getByRole("heading", {
      name: /Consultations passées/i,
    });
    const group = heading.closest('[role="group"]') as HTMLElement;

    expect(within(group).queryByText("Compte-rendu")).toBeNull();
    expect(within(group).getByText("Documents")).toBeInTheDocument();
  });

  it("hasDocuments=false → badge 'Documents' absent", () => {
    renderSection([
      makePast({ id: "c-1", hasClinicalNote: true, hasDocuments: false }),
    ]);
    const heading = screen.getByRole("heading", {
      name: /Consultations passées/i,
    });
    const group = heading.closest('[role="group"]') as HTMLElement;

    expect(within(group).getByText("Compte-rendu")).toBeInTheDocument();
    expect(within(group).queryByText("Documents")).toBeNull();
  });

  it("pastConsultations=[] → message 'Aucune consultation passée' visible", () => {
    renderSection([]);
    expect(
      screen.getByText(/Aucune consultation passée/i),
    ).toBeInTheDocument();
    expect(
      screen.queryByTestId("past-consultations-skeleton"),
    ).toBeNull();
  });

  it("pastConsultations=undefined → skeleton loading visible", () => {
    renderSection(undefined);
    expect(
      screen.getByTestId("past-consultations-skeleton"),
    ).toBeInTheDocument();
    expect(
      screen.queryByText(/Aucune consultation passée/i),
    ).toBeNull();
  });

  it("date formatée en fr-FR long (ex: '15 mai 2026')", () => {
    renderSection([
      makePast({
        id: "c-fr",
        dateISO: "2026-05-15T09:30:00.000Z",
        providerName: "Claire Dupont",
      }),
    ]);
    const heading = screen.getByRole("heading", {
      name: /Consultations passées/i,
    });
    const group = heading.closest('[role="group"]') as HTMLElement;
    // mois en toutes lettres
    expect(within(group).getByText(/15 mai 2026/i)).toBeInTheDocument();
  });

  it("wording MDR : titre 'Consultations passées' (pas 'Historique médical')", () => {
    renderSection([makePast()]);
    expect(
      screen.getByRole("heading", { name: /Consultations passées/i }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: /Historique médical/i }),
    ).toBeNull();
  });
});
