import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { AppointmentsCareCaseSection } from "../AppointmentsCareCaseSection";
import type { PatientAppointment, PatientCareCaseSummary } from "@/lib/api";

const careCase: PatientCareCaseSummary = {
  id: "cc-1",
  caseTitle: "Parcours coordonné",
  caseType: "TCA",
  status: "ACTIVE",
  startDate: "2026-01-15T00:00:00.000Z",
  organizationId: null,
  organizationName: null,
};

function makeAppt(
  overrides: Partial<PatientAppointment> & { id: string },
): PatientAppointment {
  return {
    id: overrides.id,
    startAt: overrides.startAt ?? "2026-06-10T14:30:00.000Z",
    endAt: overrides.endAt ?? "2026-06-10T15:00:00.000Z",
    status: overrides.status ?? "CONFIRMED",
    locationType: overrides.locationType ?? "IN_PERSON",
    notes: overrides.notes ?? null,
    careCaseId: overrides.careCaseId ?? "cc-1",
    provider: overrides.provider ?? {
      person: { firstName: "Margot", lastName: "Vire" },
    },
    consultationType: overrides.consultationType ?? null,
    location: overrides.location ?? null,
  };
}

describe("AppointmentsCareCaseSection (V1-RENDEZ-VOUS-CARECASE-GROUPING)", () => {
  it("affiche le titre du parcours et le HubLinkButton vers /parcours/[id]#rendez-vous", () => {
    render(
      <AppointmentsCareCaseSection
        careCase={careCase}
        appointments={[makeAppt({ id: "a1" })]}
        upcoming={[makeAppt({ id: "a1" })]}
        past={[]}
        cancelled={[]}
      />,
    );
    expect(screen.getByText("Parcours coordonné")).toBeInTheDocument();
    const hubLink = screen.getByRole("link", {
      name: /Ouvrir le parcours Parcours coordonné/i,
    });
    expect(hubLink).toHaveAttribute(
      "href",
      "/parcours/cc-1#rendez-vous",
    );
  });

  it("affiche les 3 sous-blocs quand chaque liste a au moins un item", () => {
    render(
      <AppointmentsCareCaseSection
        careCase={careCase}
        appointments={[
          makeAppt({ id: "u1" }),
          makeAppt({ id: "p1", status: "COMPLETED" }),
          makeAppt({ id: "c1", status: "CANCELLED_BY_PATIENT" }),
        ]}
        upcoming={[makeAppt({ id: "u1" })]}
        past={[makeAppt({ id: "p1", status: "COMPLETED" })]}
        cancelled={[makeAppt({ id: "c1", status: "CANCELLED_BY_PATIENT" })]}
      />,
    );
    expect(screen.getByText("À venir")).toBeInTheDocument();
    expect(screen.getByText("Passés")).toBeInTheDocument();
    expect(screen.getByText("Annulés")).toBeInTheDocument();
    expect(screen.getByText("3 rendez-vous")).toBeInTheDocument();
  });

  it("n'affiche que les sous-blocs non vides", () => {
    render(
      <AppointmentsCareCaseSection
        careCase={careCase}
        appointments={[makeAppt({ id: "u1" })]}
        upcoming={[makeAppt({ id: "u1" })]}
        past={[]}
        cancelled={[]}
      />,
    );
    expect(screen.getByText("À venir")).toBeInTheDocument();
    expect(screen.queryByText("Passés")).not.toBeInTheDocument();
    expect(screen.queryByText("Annulés")).not.toBeInTheDocument();
  });

  it("affiche l'empty state interne MDR-safe si 0 RDV", () => {
    render(
      <AppointmentsCareCaseSection
        careCase={careCase}
        appointments={[]}
        upcoming={[]}
        past={[]}
        cancelled={[]}
      />,
    );
    expect(
      screen.getByText("Aucun rendez-vous pour ce parcours."),
    ).toBeInTheDocument();
    expect(screen.getByText("Aucun rendez-vous")).toBeInTheDocument();
  });

  it("wording MDR-safe : aucun terme clinique interdit dans le rendu", () => {
    const { container } = render(
      <AppointmentsCareCaseSection
        careCase={careCase}
        appointments={[makeAppt({ id: "u1" })]}
        upcoming={[makeAppt({ id: "u1" })]}
        past={[]}
        cancelled={[]}
      />,
    );
    const text = container.textContent ?? "";
    const forbidden = [
      "suspicion",
      "diagnostic",
      "pathologie",
      "anorexie",
      "boulimie",
      "ARFID",
      "hyperphagie",
      "alerte",
      "surveillance",
      "vigilance",
      "prise en charge",
    ];
    for (const word of forbidden) {
      expect(text.toLowerCase()).not.toContain(word.toLowerCase());
    }
  });
});
