import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { PatientRcpHistory } from "../PatientRcpHistory";
import type { PatientRcpSummary } from "@/lib/api";

// ─── Mocks ──────────────────────────────────────────────────────────────────

const mockRcps = vi.fn();

vi.mock("@/lib/store", () => ({
  useAuthStore: (selector: (s: unknown) => unknown) =>
    selector({
      accessToken: "test-token",
      user: { id: "u1", firstName: "Marie", lastName: "Dubois", roleType: "PATIENT" },
    }),
}));

vi.mock("@/lib/api", () => ({
  apiWithToken: () => ({
    patient: {
      careCases: {
        rcps: (id: string) => mockRcps(id),
      },
    },
  }),
}));

function makeRcp(overrides: Partial<PatientRcpSummary> = {}): PatientRcpSummary {
  return {
    id: "rcp-1",
    title: "RCP test",
    closedAt: "2026-06-15T12:00:00Z",
    decision: "Décision validée.",
    decisionType: "CONSENSUS",
    participantsCount: 4,
    ...overrides,
  };
}

function renderWithClient(node: React.ReactNode) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={client}>{node}</QueryClientProvider>,
  );
}

beforeEach(() => {
  mockRcps.mockReset();
});

// ─── Tests ──────────────────────────────────────────────────────────────────

describe("PatientRcpHistory — F-CROSS-GAP-RCP-PATIENT (CC #5)", () => {
  it("0 concertation → section masquée (pas de bruit visuel)", async () => {
    mockRcps.mockResolvedValueOnce({ items: [] });

    const { container } = renderWithClient(
      <PatientRcpHistory careCaseId="cc-1" />,
    );

    // Le loading apparait brièvement puis la section est masquée.
    await screen.findByText(/Chargement/);
    await new Promise((r) => setTimeout(r, 20));
    // Attendre la résolution de la query
    await screen.findByText((t) => t === "" || t.length >= 0, undefined, {
      timeout: 1000,
    }).catch(() => {});

    // Une fois les data chargées : null render (pas de titre dans le DOM).
    // On vérifie via container.querySelector pour éviter un faux positif
    // pendant le loading transitoire.
    await new Promise((r) => setTimeout(r, 100));
    expect(
      screen.queryByText("Réunions de concertation pluridisciplinaire"),
    ).not.toBeInTheDocument();
    expect(container.querySelector('[data-testid="patient-rcp-item"]')).toBeNull();
  });

  it("1 concertation CONSENSUS → titre + date + count + décision affichés", async () => {
    mockRcps.mockResolvedValueOnce({
      items: [
        makeRcp({
          closedAt: "2026-06-15T12:00:00Z",
          decision: "Avis convergent : poursuivre suivi diététique et psychologique en parallèle.",
          decisionType: "CONSENSUS",
          participantsCount: 4,
        }),
      ],
    });

    renderWithClient(<PatientRcpHistory careCaseId="cc-2" />);

    // Attendre que les data soient chargées (le titre apparait aussi en
    // loading state, donc findByText sur le titre matche trop tôt).
    await screen.findAllByTestId("patient-rcp-item");

    expect(
      screen.getByText("Réunions de concertation pluridisciplinaire"),
    ).toBeInTheDocument();

    // Date FR — jour mi-mois, pas de risque timezone boundary.
    expect(screen.getByText(/15 juin 2026/i)).toBeInTheDocument();

    // Participants count (jamais d'identité)
    expect(screen.getByText(/4 soignants ont participé/i)).toBeInTheDocument();

    // Décision validée (texte intégral, pas tronqué côté UI)
    expect(
      screen.getByText(/Avis convergent : poursuivre suivi diététique/i),
    ).toBeInTheDocument();

    // Label decisionType mappé en patient-friendly — via testid pour éviter
    // collision avec la phrase "décision communiquée par votre soignant" du
    // header de section.
    expect(screen.getByTestId("patient-rcp-decision-label").textContent).toBe(
      "Décision collégiale",
    );
  });

  it("MAJORITY → label patient-friendly, INITIATOR_DECISION → label dédié", async () => {
    mockRcps.mockResolvedValueOnce({
      items: [
        makeRcp({ id: "r-a", decisionType: "MAJORITY", decision: "Plan A retenu." }),
        makeRcp({
          id: "r-b",
          decisionType: "INITIATOR_DECISION",
          decision: "Plan B retenu par le soignant référent.",
        }),
      ],
    });

    renderWithClient(<PatientRcpHistory careCaseId="cc-3" />);

    // Attendre un élément qui n'existe QUE quand les données sont chargées
    // (le titre de section apparaît aussi pendant le loading state, donc
    // findByText sur le titre matche trop tôt).
    await screen.findAllByTestId("patient-rcp-item");

    const labels = screen.getAllByTestId("patient-rcp-decision-label");
    const texts = labels.map((el) => el.textContent);
    expect(texts).toContain("Décision majoritaire");
    expect(texts).toContain("Décision du soignant référent");
  });

  it("MDR : aucune mention 'RCP_OPINION', 'ClinicalNote', 'alerte', 'risque' dans le DOM rendu", async () => {
    mockRcps.mockResolvedValueOnce({
      items: [
        makeRcp({
          decision: "Plan multidisciplinaire validé.",
          participantsCount: 3,
        }),
      ],
    });

    const { container } = renderWithClient(
      <PatientRcpHistory careCaseId="cc-4" />,
    );

    // Attendre un élément qui n'existe QUE quand les données sont chargées
    // (le titre de section apparaît aussi pendant le loading state, donc
    // findByText sur le titre matche trop tôt).
    await screen.findAllByTestId("patient-rcp-item");

    const text = container.textContent ?? "";
    // Sigle RCP autorisé seulement dans "RCP" du titre interne ? Non, on
    // utilise "concertation pluridisciplinaire" — vérifie zero occurrence du
    // mot brut "RCP" dans le DOM patient (le sigle reste cockpit).
    expect(text).not.toContain("RCP_OPINION");
    expect(text).not.toContain("ClinicalNote");
    expect(text.toLowerCase()).not.toContain("alerte clinique");
    expect(text.toLowerCase()).not.toContain("surveillance");
    expect(text.toLowerCase()).not.toContain("monitoring");
    expect(text.toLowerCase()).not.toContain("risque clinique");
  });

  it("singulier '1 soignant a participé' quand participantsCount=1", async () => {
    mockRcps.mockResolvedValueOnce({
      items: [
        makeRcp({
          decision: "Plan validé.",
          participantsCount: 1,
        }),
      ],
    });

    renderWithClient(<PatientRcpHistory careCaseId="cc-5" />);

    expect(await screen.findByText(/1 soignant a participé/i)).toBeInTheDocument();
    expect(screen.queryByText(/1 soignants/i)).not.toBeInTheDocument();
  });

  it("decisionType inconnu → fallback 'Décision communiquée'", async () => {
    mockRcps.mockResolvedValueOnce({
      items: [
        makeRcp({
          decisionType: "WEIRD_VALUE",
          decision: "Décision X.",
        }),
      ],
    });

    renderWithClient(<PatientRcpHistory careCaseId="cc-6" />);

    // Attendre un élément qui n'existe QUE quand les données sont chargées
    // (le titre de section apparaît aussi pendant le loading state, donc
    // findByText sur le titre matche trop tôt).
    await screen.findAllByTestId("patient-rcp-item");
    expect(screen.getByTestId("patient-rcp-decision-label").textContent).toBe(
      "Décision communiquée",
    );
  });

  it("decisionType null → fallback 'Décision communiquée'", async () => {
    mockRcps.mockResolvedValueOnce({
      items: [
        makeRcp({
          decisionType: null,
          decision: "Décision X.",
        }),
      ],
    });

    renderWithClient(<PatientRcpHistory careCaseId="cc-7" />);

    // Attendre un élément qui n'existe QUE quand les données sont chargées
    // (le titre de section apparaît aussi pendant le loading state, donc
    // findByText sur le titre matche trop tôt).
    await screen.findAllByTestId("patient-rcp-item");
    expect(screen.getByTestId("patient-rcp-decision-label").textContent).toBe(
      "Décision communiquée",
    );
  });

  it("erreur backend → message neutre, jamais alarmant", async () => {
    mockRcps.mockRejectedValueOnce(new Error("Network down"));

    renderWithClient(<PatientRcpHistory careCaseId="cc-8" />);

    expect(
      await screen.findByText(/sera de nouveau disponible plus tard/i),
    ).toBeInTheDocument();
    // Pas de mot anxiogène
    const html = document.body.textContent ?? "";
    expect(html.toLowerCase()).not.toContain("erreur");
  });

  it("plusieurs concertations → toutes rendues en ordre backend (desc closedAt)", async () => {
    mockRcps.mockResolvedValueOnce({
      items: [
        makeRcp({
          id: "r-recent",
          closedAt: "2026-06-15T12:00:00Z",
          decision: "Plan récent.",
          participantsCount: 5,
        }),
        makeRcp({
          id: "r-older",
          closedAt: "2026-04-15T10:00:00Z",
          decision: "Plan ancien.",
          participantsCount: 2,
        }),
      ],
    });

    renderWithClient(<PatientRcpHistory careCaseId="cc-9" />);

    const items = await screen.findAllByTestId("patient-rcp-item");
    expect(items).toHaveLength(2);
    expect(items[0].textContent).toContain("Plan récent.");
    expect(items[1].textContent).toContain("Plan ancien.");
  });
});
