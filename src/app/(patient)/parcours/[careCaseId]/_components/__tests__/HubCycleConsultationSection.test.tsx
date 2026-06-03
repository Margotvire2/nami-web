import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";

import { HubCycleConsultationSection } from "../HubCycleConsultationSection";
import type {
  PatientCareCaseHubAppointment,
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

// Note : depuis le cleanup Wave 2C (PR /parcours), la section n'affiche plus
// le sous-bloc dépliable "Cycle de consultation" avec RdvCycleCard — un hero
// "Mon prochain RDV" inline le remplace. Pas de mock RdvCycleCard nécessaire.

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
  upcoming: PatientCareCaseHubAppointment[] = [],
) {
  const Wrapper = makeWrapper();
  return render(
    <Wrapper>
      <HubCycleConsultationSection
        upcoming={upcoming}
        pastConsultations={pastConsultations}
        careCaseId="cc-1"
      />
    </Wrapper>,
  );
}

function makeUpcoming(
  overrides?: Partial<PatientCareCaseHubAppointment>,
): PatientCareCaseHubAppointment {
  return {
    id: "appt-1",
    startAt: "2026-06-10T14:30:00.000Z",
    endAt: "2026-06-10T15:00:00.000Z",
    status: "CONFIRMED",
    locationType: "IN_PERSON",
    consultationTypeName: "Suivi diététique",
    provider: {
      id: "prov-1",
      firstName: "Claire",
      lastName: "Dupont",
      specialties: ["diététique"],
    },
    ...overrides,
  };
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

  // ── Wave 2C cleanup : hero "Mon prochain RDV" ──────────────────────────────

  it("upcoming=[] → hero 'Mon prochain rendez-vous' absent", () => {
    renderSection([makePast()], []);
    expect(
      screen.queryByLabelText("Mon prochain rendez-vous"),
    ).toBeNull();
  });

  it("upcoming[0] présent → hero affiché avec date FR longue + provider + lieu", () => {
    renderSection(
      [makePast()],
      [makeUpcoming({ startAt: "2026-06-10T14:30:00.000Z" })],
    );
    const hero = screen.getByLabelText("Mon prochain rendez-vous");
    // libellé eyebrow
    expect(within(hero).getByText(/Mon prochain rendez-vous/i)).toBeInTheDocument();
    // date longue FR : "Mercredi 10 juin" (jour de semaine + jour + mois)
    expect(within(hero).getByText(/Mercredi 10 juin/i)).toBeInTheDocument();
    // format heure "XXhXX" (TZ-agnostique, environnement de test = Europe/Paris)
    expect(hero.textContent ?? "").toMatch(/\d{1,2}h\d{2}/);
    // provider name
    expect(within(hero).getByText("Claire Dupont")).toBeInTheDocument();
    // consultation type name affiché
    expect(within(hero).getByText("Suivi diététique")).toBeInTheDocument();
    // CTA "Voir le détail" pointant vers /rendez-vous/[id]
    const cta = within(hero).getByRole("link", { name: /Voir le détail/i });
    expect(cta).toHaveAttribute("href", "/rendez-vous/appt-1");
  });

  it("Hero locationType=REMOTE → libellé 'Téléconsultation'", () => {
    renderSection(
      [],
      [makeUpcoming({ locationType: "REMOTE" })],
    );
    const hero = screen.getByLabelText("Mon prochain rendez-vous");
    expect(within(hero).getByText(/Téléconsultation/)).toBeInTheDocument();
  });

  it("plusieurs upcoming → seul upcoming[0] est promu (les autres restent dans /rendez-vous)", () => {
    renderSection(
      [],
      [
        makeUpcoming({ id: "appt-first", startAt: "2026-06-10T14:30:00.000Z" }),
        makeUpcoming({ id: "appt-later", startAt: "2026-07-15T09:00:00.000Z" }),
      ],
    );
    const hero = screen.getByLabelText("Mon prochain rendez-vous");
    const cta = within(hero).getByRole("link", { name: /Voir le détail/i });
    expect(cta).toHaveAttribute("href", "/rendez-vous/appt-first");
    expect(within(hero).queryByText(/15 juillet/i)).toBeNull();
  });

  it("wording MDR : aucun mot 'signaux'/'alerte'/'surveillance'/'risque' dans la section", () => {
    const { container } = renderSection(
      [makePast()],
      [makeUpcoming()],
    );
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/signaux/i);
    expect(text).not.toMatch(/alerte/i);
    expect(text).not.toMatch(/surveillance/i);
    expect(text).not.toMatch(/risque/i);
    expect(text).not.toMatch(/anormal/i);
  });
});
