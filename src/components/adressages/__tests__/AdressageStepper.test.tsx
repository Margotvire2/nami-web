import { describe, it, expect } from "vitest";
import { render } from "@testing-library/react";
import { AdressageStepper } from "../AdressageStepper";
import type { Referral, ReferralStatus } from "@/lib/api";

function buildReferral(overrides: Partial<Referral> & { status: ReferralStatus }): Referral {
  const { status, ...rest } = overrides;
  return {
    id: "r1",
    careCaseId: "c1",
    mode: "DIRECT",
    priority: "ROUTINE",
    clinicalReason: "Motif test",
    personalMessage: null,
    urgencyNote: null,
    preferredSpecialty: null,
    preferredZone: null,
    desiredAppointmentDate: null,
    autoAddToTeam: false,
    respondedAt: null,
    declineReason: null,
    responseNote: null,
    expiresAt: null,
    createdAt: "2026-05-10T10:00:00Z",
    updatedAt: "2026-05-10T10:00:00Z",
    sender: { id: "s1", firstName: "Marie", lastName: "Dupont" },
    targetProvider: null,
    careCase: { id: "c1", caseTitle: "Case", caseType: "TCA", patient: null },
    status,
    ...rest,
  };
}

const TEAL = ".bg-\\[\\#2BA89C\\]";
const VIOLET_CURRENT = ".bg-\\[\\#5B4EC4\\]";
const GRAY_INTERRUPTED = ".bg-\\[\\#A1A1AA\\]";

function getListitems(container: HTMLElement): NodeListOf<Element> {
  return container.querySelectorAll('[role="listitem"]');
}

/**
 * Compte les discs (pas les connecteurs) ayant une classe bg donnée,
 * en scopant la recherche à l'intérieur de chaque [role="listitem"].
 */
function countDiscs(container: HTMLElement, bgSelector: string): number {
  return Array.from(getListitems(container)).filter((item) =>
    item.querySelector(bgSelector),
  ).length;
}

describe("AdressageStepper", () => {
  it("SENT → 1 done (Envoyé), Reçu current", () => {
    const r = buildReferral({ status: "SENT" });
    const { container } = render(<AdressageStepper referral={r} />);
    const items = getListitems(container);
    expect(items.length).toBe(5);
    expect(countDiscs(container, TEAL)).toBe(1);
    expect(countDiscs(container, VIOLET_CURRENT)).toBe(1);
    expect(items[1].getAttribute("aria-current")).toBe("step");
    expect(items[0].getAttribute("aria-current")).toBeNull();
    expect(items[2].getAttribute("aria-current")).toBeNull();
    expect(countDiscs(container, GRAY_INTERRUPTED)).toBe(0);
  });

  it("RECEIVED → 2 done, Accepté current", () => {
    const r = buildReferral({ status: "RECEIVED" });
    const { container } = render(<AdressageStepper referral={r} />);
    const items = getListitems(container);
    expect(countDiscs(container, TEAL)).toBe(2);
    expect(items[2].getAttribute("aria-current")).toBe("step");
    expect(items[1].getAttribute("aria-current")).toBeNull();
  });

  it("ACCEPTED → 3 done, RDV pris current, date respondedAt sous Accepté", () => {
    const r = buildReferral({
      status: "ACCEPTED",
      respondedAt: "2026-05-12T14:30:00Z",
    });
    const { container } = render(<AdressageStepper referral={r} />);
    const items = getListitems(container);
    expect(countDiscs(container, TEAL)).toBe(3);
    expect(items[3].getAttribute("aria-current")).toBe("step");
    expect(items[2].textContent).toContain("12/05");
  });

  it("APPOINTMENT_BOOKED → 4 done, 1re consultation current, date desiredAppointmentDate sous RDV pris", () => {
    const r = buildReferral({
      status: "APPOINTMENT_BOOKED",
      respondedAt: "2026-05-12T14:30:00Z",
      desiredAppointmentDate: "2026-05-25T09:00:00Z",
    });
    const { container } = render(<AdressageStepper referral={r} />);
    const items = getListitems(container);
    expect(countDiscs(container, TEAL)).toBe(4);
    expect(items[4].getAttribute("aria-current")).toBe("step");
    expect(items[3].textContent).toContain("25/05");
  });

  it("FIRST_VISIT_COMPLETED → 5/5 done, pas d'aria-current", () => {
    const r = buildReferral({
      status: "FIRST_VISIT_COMPLETED",
      respondedAt: "2026-05-12T14:30:00Z",
      desiredAppointmentDate: "2026-05-25T09:00:00Z",
    });
    const { container } = render(<AdressageStepper referral={r} />);
    const items = getListitems(container);
    expect(countDiscs(container, TEAL)).toBe(5);
    expect(countDiscs(container, VIOLET_CURRENT)).toBe(0);
    items.forEach((item) => {
      expect(item.getAttribute("aria-current")).toBeNull();
    });
  });

  it("DECLINED → 1 done teal + 1 done gris (interruption sur Reçu), pas d'aria-current", () => {
    const r = buildReferral({ status: "DECLINED" });
    const { container } = render(<AdressageStepper referral={r} />);
    const items = getListitems(container);
    expect(countDiscs(container, TEAL)).toBe(1);
    expect(countDiscs(container, GRAY_INTERRUPTED)).toBe(1);
    expect(countDiscs(container, VIOLET_CURRENT)).toBe(0);
    items.forEach((item) => {
      expect(item.getAttribute("aria-current")).toBeNull();
    });
    const list = container.querySelector('[role="list"]');
    expect(list?.getAttribute("aria-label")).toContain("Parcours interrompu");
  });

  it("EXPIRED → disc gris sur Envoyé (jamais reçu), interrompu, pas d'aria-current", () => {
    const r = buildReferral({ status: "EXPIRED" });
    const { container } = render(<AdressageStepper referral={r} />);
    const items = getListitems(container);
    expect(countDiscs(container, TEAL)).toBe(0);
    expect(countDiscs(container, GRAY_INTERRUPTED)).toBe(1);
    expect(countDiscs(container, VIOLET_CURRENT)).toBe(0);
    items.forEach((item) => {
      expect(item.getAttribute("aria-current")).toBeNull();
    });
    const list = container.querySelector('[role="list"]');
    expect(list?.getAttribute("aria-label")).toContain("Parcours interrompu");
  });

  it("DRAFT → composant retourne null (pas de stepper rendu)", () => {
    const r = buildReferral({ status: "DRAFT" });
    const { container } = render(<AdressageStepper referral={r} />);
    expect(container.firstChild).toBeNull();
    expect(container.querySelector('[role="list"]')).toBeNull();
  });

  it("PATIENT_CONTACTED sans desiredAppointmentDate → currentStep=2, RDV pris current", () => {
    const r = buildReferral({
      status: "PATIENT_CONTACTED",
      respondedAt: "2026-05-12T14:30:00Z",
      desiredAppointmentDate: null,
    });
    const { container } = render(<AdressageStepper referral={r} />);
    const items = getListitems(container);
    expect(countDiscs(container, TEAL)).toBe(3);
    expect(items[3].getAttribute("aria-current")).toBe("step");
  });

  it("PATIENT_CONTACTED avec desiredAppointmentDate → currentStep=3 (la donnée prime)", () => {
    const r = buildReferral({
      status: "PATIENT_CONTACTED",
      respondedAt: "2026-05-12T14:30:00Z",
      desiredAppointmentDate: "2026-05-25T09:00:00Z",
    });
    const { container } = render(<AdressageStepper referral={r} />);
    const items = getListitems(container);
    expect(countDiscs(container, TEAL)).toBe(4);
    expect(items[4].getAttribute("aria-current")).toBe("step");
  });

  it("CANCELLED tôt (pas de respondedAt) → currentStep=0, gris sur Envoyé, interrompu", () => {
    const r = buildReferral({
      status: "CANCELLED",
      respondedAt: null,
      desiredAppointmentDate: null,
    });
    const { container } = render(<AdressageStepper referral={r} />);
    const items = getListitems(container);
    expect(countDiscs(container, TEAL)).toBe(0);
    expect(countDiscs(container, GRAY_INTERRUPTED)).toBe(1);
    expect(countDiscs(container, VIOLET_CURRENT)).toBe(0);
    // Disc gris est bien sur Envoyé (index 0)
    expect(items[0].querySelector(GRAY_INTERRUPTED)).toBeTruthy();
    items.forEach((item) => {
      expect(item.getAttribute("aria-current")).toBeNull();
    });
    const list = container.querySelector('[role="list"]');
    expect(list?.getAttribute("aria-label")).toContain("Parcours interrompu");
  });

  it("CANCELLED après respondedAt → currentStep=2, gris sur Accepté", () => {
    const r = buildReferral({
      status: "CANCELLED",
      respondedAt: "2026-05-12T14:30:00Z",
      desiredAppointmentDate: null,
    });
    const { container } = render(<AdressageStepper referral={r} />);
    const items = getListitems(container);
    // Envoyé + Reçu en done teal, Accepté en gris interrompu
    expect(countDiscs(container, TEAL)).toBe(2);
    expect(countDiscs(container, GRAY_INTERRUPTED)).toBe(1);
    expect(items[2].querySelector(GRAY_INTERRUPTED)).toBeTruthy();
    items.forEach((item) => {
      expect(item.getAttribute("aria-current")).toBeNull();
    });
    const list = container.querySelector('[role="list"]');
    expect(list?.getAttribute("aria-label")).toContain("Parcours interrompu");
  });

  it("CANCELLED après RDV proposé → currentStep=3, gris sur RDV pris", () => {
    const r = buildReferral({
      status: "CANCELLED",
      respondedAt: "2026-05-12T14:30:00Z",
      desiredAppointmentDate: "2026-05-25T09:00:00Z",
    });
    const { container } = render(<AdressageStepper referral={r} />);
    const items = getListitems(container);
    // Envoyé + Reçu + Accepté en done teal, RDV pris en gris interrompu
    expect(countDiscs(container, TEAL)).toBe(3);
    expect(countDiscs(container, GRAY_INTERRUPTED)).toBe(1);
    expect(items[3].querySelector(GRAY_INTERRUPTED)).toBeTruthy();
    items.forEach((item) => {
      expect(item.getAttribute("aria-current")).toBeNull();
    });
    const list = container.querySelector('[role="list"]');
    expect(list?.getAttribute("aria-label")).toContain("Parcours interrompu");
  });

  it("UNDER_REVIEW → currentStep=1 (Reçu done, Accepté current)", () => {
    const r = buildReferral({ status: "UNDER_REVIEW" });
    const { container } = render(<AdressageStepper referral={r} />);
    const items = getListitems(container);
    expect(countDiscs(container, TEAL)).toBe(2);
    expect(countDiscs(container, VIOLET_CURRENT)).toBe(1);
    expect(countDiscs(container, GRAY_INTERRUPTED)).toBe(0);
    expect(items[2].getAttribute("aria-current")).toBe("step");
    expect(items[1].getAttribute("aria-current")).toBeNull();
  });

  it("createdAt invalide ne crashe pas et n'affiche pas 'Invalid Date'", () => {
    const r = buildReferral({
      status: "SENT",
      createdAt: "not-a-valid-date",
    });
    // Le render ne doit pas throw
    const { container } = render(<AdressageStepper referral={r} />);
    expect(container.querySelector('[role="list"]')).toBeTruthy();
    // Aucune occurrence "Invalid Date" dans le DOM
    expect(container.textContent).not.toContain("Invalid Date");
    // Stepper toujours fonctionnel : 1 done (Envoyé), Reçu current
    expect(countDiscs(container, TEAL)).toBe(1);
    expect(countDiscs(container, VIOLET_CURRENT)).toBe(1);
  });
});
