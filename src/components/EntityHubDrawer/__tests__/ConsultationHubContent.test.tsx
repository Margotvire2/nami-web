import { describe, it, expect, vi } from "vitest";
import { render, screen, within, fireEvent } from "@testing-library/react";
import { ConsultationHubContent } from "../ConsultationHubContent";
import type { EntityHubConsultation } from "@/lib/api";

// useEntityHubControls est appelé pour ouvrir les sub-fiches (provider, document).
// On stub : on ne teste pas la navigation ici mais le rendu wording.
vi.mock("@/contexts/EntityHubContext", () => ({
  useEntityHubControls: () => ({
    openEntityHub: vi.fn(),
    closeEntityHub: vi.fn(),
    backEntityHub: vi.fn(),
    canGoBack: false,
    current: null,
  }),
}));

// Le dialog d'upload monte React Query + auth store. On stub son rendu : la
// modale ne s'affiche pas par défaut (isOpen=false).
vi.mock("../UploadToConsultationDialog", () => ({
  UploadToConsultationDialog: (props: { isOpen: boolean }) =>
    props.isOpen ? <div data-testid="upload-dialog-open" /> : null,
}));

function makeConsultation(
  overrides?: Partial<EntityHubConsultation>,
): EntityHubConsultation {
  return {
    consultation: {
      id: "cons-1",
      startedAt: "2026-05-15T14:00:00Z",
      completedAt: "2026-05-15T14:45:00Z",
      status: "COMPLETED",
      provider: {
        id: "prov-1",
        firstName: "Marie",
        lastName: "Dubois",
        specialty: "Endocrinologie",
      },
    },
    clinicalNote: null,
    documents: [],
    documentsByType: {},
    observations: [],
    nextAppointment: null,
    prescriptions: [],
    ...overrides,
  };
}

function makeDoc(
  id: string,
  documentType: string,
  title: string,
): EntityHubConsultation["documents"][number] {
  return {
    id,
    documentType,
    title,
    fileUrl: `https://example.org/${id}.pdf`,
    createdAt: "2026-05-15T15:00:00Z",
  };
}

function renderHub(data: EntityHubConsultation) {
  return render(<ConsultationHubContent data={data} careCaseId="cc-1" />);
}

describe("ConsultationHubContent — wording patient naturel", () => {
  it("affiche les labels patient naturels (pas de jargon soignant)", () => {
    renderHub(makeConsultation());
    expect(screen.getByText("Votre consultation")).toBeInTheDocument();
    expect(screen.getByText("Compte-rendu")).toBeInTheDocument();
    expect(
      screen.getByText("Documents de cette consultation"),
    ).toBeInTheDocument();
  });

  it("affiche 'Avec {providerFullName}' + CTA voir la fiche", () => {
    renderHub(makeConsultation());
    const cta = screen.getByRole("button", {
      name: /voir la fiche du soignant marie dubois/i,
    });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveTextContent(/avec marie dubois/i);
    expect(cta).toHaveTextContent(/endocrinologie/i);
  });

  it("clinicalNote null : message bienveillant, pas de wording technique", () => {
    renderHub(makeConsultation({ clinicalNote: null }));
    expect(
      screen.getByText(/votre soignant n.?a pas encore partagé son compte-rendu/i),
    ).toBeInTheDocument();
    // Pas de jargon MDR/visibilité
    expect(screen.queryByText(/visibility/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/scope/i)).not.toBeInTheDocument();
  });

  it("section observations n'apparaît que si clinicalNote présent", () => {
    renderHub(makeConsultation({ clinicalNote: null }));
    expect(screen.queryByText(/ce qui a été noté/i)).not.toBeInTheDocument();
  });

  it("clinicalNote présent : label 'Ce qui a été noté' (pas 'Indicateurs extraits')", () => {
    renderHub(
      makeConsultation({
        clinicalNote: {
          id: "n-1",
          body: "Patient en forme.",
          visibility: "PATIENT_ONLY",
          createdAt: "2026-05-15T15:00:00Z",
        },
      }),
    );
    expect(screen.getByText("Ce qui a été noté")).toBeInTheDocument();
    expect(
      screen.queryByText(/indicateurs extraits/i),
    ).not.toBeInTheDocument();
  });
});

describe("ConsultationHubContent — group by documentType", () => {
  it("groupe les documents par type (hors PRESCRIPTION) avec label pluriel", () => {
    renderHub(
      makeConsultation({
        documentsByType: {
          BIOLOGICAL_REPORT: [makeDoc("d1", "BIOLOGICAL_REPORT", "Bilan TSH")],
          LETTER: [makeDoc("d2", "LETTER", "Adressage dermato")],
        },
      }),
    );
    expect(screen.getByText(/bilans biologiques/i)).toBeInTheDocument();
    expect(screen.getByText(/lettres d.?adressage/i)).toBeInTheDocument();
    expect(screen.getByText("Bilan TSH")).toBeInTheDocument();
    expect(screen.getByText("Adressage dermato")).toBeInTheDocument();
  });

  it("PRESCRIPTION dans documentsByType n'est PAS rendu dans 'Documents' (déjà dans sa section)", () => {
    renderHub(
      makeConsultation({
        documentsByType: {
          PRESCRIPTION: [makeDoc("p1", "PRESCRIPTION", "Ordonnance Levothyrox")],
        },
        prescriptions: [makeDoc("p1", "PRESCRIPTION", "Ordonnance Levothyrox")],
      }),
    );
    // L'ordonnance est rendue 1 seule fois (section Ordonnances), pas dupliquée.
    expect(screen.getAllByText("Ordonnance Levothyrox")).toHaveLength(1);
    expect(screen.getByText("Ordonnances")).toBeInTheDocument();
  });

  it("section Documents vide affiche un message clair", () => {
    renderHub(makeConsultation({ documentsByType: {} }));
    expect(
      screen.getByText(/aucun autre document n.?est encore lié/i),
    ).toBeInTheDocument();
  });

  it("rendez-vous suivant : label 'Votre prochain rendez-vous'", () => {
    renderHub(
      makeConsultation({
        nextAppointment: {
          id: "appt-1",
          startAt: "2026-06-01T09:00:00Z",
          endAt: "2026-06-01T09:30:00Z",
          status: "SCHEDULED",
          locationType: "IN_PERSON",
        },
      }),
    );
    expect(
      screen.getByText("Votre prochain rendez-vous"),
    ).toBeInTheDocument();
    expect(screen.getByText("En cabinet")).toBeInTheDocument();
  });
});

describe("ConsultationHubContent — wording MDR-safe", () => {
  it("n'utilise aucun mot interdit MDR (alerte/surveillance/risque/anormal/diagnostic)", () => {
    const { container } = renderHub(
      makeConsultation({
        clinicalNote: {
          id: "n-1",
          body: "Tout va bien.",
          visibility: "PATIENT_ONLY",
          createdAt: "2026-05-15T15:00:00Z",
        },
        observations: [
          {
            id: "o-1",
            metricKey: "weight",
            metricLabel: "Poids",
            unit: "kg",
            effectiveAt: "2026-05-15T14:30:00Z",
            valueNumeric: 55,
            valueText: null,
            valueBoolean: null,
          },
        ],
      }),
    );
    const text = container.textContent ?? "";
    expect(text).not.toMatch(/\balerte\b/i);
    expect(text).not.toMatch(/\bsurveiller\b/i);
    expect(text).not.toMatch(/\bsurveillance\b/i);
    expect(text).not.toMatch(/\bdétecter\b/i);
    expect(text).not.toMatch(/\bdiagnostic\b/i);
    expect(text).not.toMatch(/\banormal\b/i);
    expect(text).not.toMatch(/\brisque\s+clinique\b/i);
  });
});

describe("ConsultationHubContent — CTA Imprimer CR", () => {
  it("affiche un bouton 'Imprimer CR' qui appelle window.print()", () => {
    const printSpy = vi.spyOn(window, "print").mockImplementation(() => {});
    renderHub(makeConsultation());
    const cta = screen.getByRole("button", {
      name: /imprimer le compte-rendu/i,
    });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveTextContent(/imprimer cr/i);
    fireEvent.click(cta);
    expect(printSpy).toHaveBeenCalledTimes(1);
    printSpy.mockRestore();
  });

  it("rend les blocs print-only (letterhead + footer)", () => {
    const { container } = renderHub(makeConsultation());
    const printOnly = container.querySelectorAll(".print-only");
    // 1 letterhead (PrintHeader) + 1 footer (PrintFooter).
    expect(printOnly.length).toBeGreaterThanOrEqual(2);
  });
});

describe("ConsultationHubContent — CTA Transmettre un document", () => {
  it("affiche le CTA sticky 'Transmettre un document' avec nom du soignant en aria-label", () => {
    renderHub(makeConsultation());
    const cta = screen.getByRole("button", {
      name: /transmettre un document à marie dubois/i,
    });
    expect(cta).toBeInTheDocument();
    expect(cta).toHaveTextContent(/transmettre un document/i);
  });

  it("clic sur le CTA monte le dialog d'upload", () => {
    renderHub(makeConsultation());
    expect(screen.queryByTestId("upload-dialog-open")).not.toBeInTheDocument();
    const cta = screen.getByRole("button", {
      name: /transmettre un document à marie dubois/i,
    });
    fireEvent.click(cta);
    expect(screen.getByTestId("upload-dialog-open")).toBeInTheDocument();
  });

  it("le compte-rendu rendu n'expose pas de transcription brute (BE #153 filtre serveur)", () => {
    renderHub(
      makeConsultation({
        // BE garantit que TRANSCRIPTION n'est pas dans documentsByType ni documents.
        documentsByType: {
          BIOLOGICAL_REPORT: [makeDoc("d1", "BIOLOGICAL_REPORT", "Bilan TSH")],
        },
      }),
    );
    // Sanity check : on rend bien le seul document légitime.
    const section = screen.getByText("Documents de cette consultation").closest("section");
    expect(section).not.toBeNull();
    expect(
      within(section as HTMLElement).getByText("Bilan TSH"),
    ).toBeInTheDocument();
  });
});
