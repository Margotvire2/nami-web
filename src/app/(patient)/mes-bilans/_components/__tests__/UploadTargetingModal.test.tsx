/**
 * Tests CC #UPLOAD-MODAL-CARECASE-PICKER (Phase 3, Sprint V1.1).
 *
 * 5 scénarios + wording MDR-safe :
 *  1. 0 CareCase + 0 soignant → "Aucune destination disponible" + bouton disabled
 *  2. 1 CareCase → checkbox pré-cochée + message contextuel
 *  3. N CareCases → checkboxes décochées + message sélection
 *  4. Switch radio DM → mode "En privé à un soignant" actif
 *  5. Validation XOR : bouton "Envoyer" enabled SEULEMENT si destination valide
 *  6. Wording strict : aucun mot interdit MDR/DM
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { UploadTargetingModal, type UploadTargetingPayload } from "../UploadTargetingModal";
import type { PatientAuthorizedProvider, PatientCareCaseSummary } from "@/lib/api";

// ─── Mocks hooks (les overrides DI sont utilisés directement) ──────────────
vi.mock("@/hooks/usePatientCareCases", () => ({
  usePatientCareCases: () => ({ data: [], isLoading: false }),
}));
vi.mock("@/hooks/usePatientCareTeamByCareCases", () => ({
  usePatientCareTeamByCareCases: () => [],
}));

// ─── Helpers fixtures ──────────────────────────────────────────────────────
function makeCareCase(
  id: string,
  caseTitle: string,
): PatientCareCaseSummary {
  return {
    id,
    caseTitle,
    caseType: "OBESITY",
    status: "ACTIVE",
    startDate: "2026-01-01T00:00:00.000Z",
    organizationId: null,
    organizationName: null,
  };
}

function makeProvider(
  id: string,
  firstName: string,
  lastName: string,
  specialty: string,
): PatientAuthorizedProvider {
  return {
    id,
    firstName,
    lastName,
    specialty,
    avatarUrl: null,
    authorizedSince: "2026-01-01T00:00:00.000Z",
    lastAppointmentAt: null,
    totalAppointments: 0,
    slug: `${firstName.toLowerCase()}-${lastName.toLowerCase()}`,
  };
}

describe("UploadTargetingModal", () => {
  let onConfirm: (payload: UploadTargetingPayload) => void;
  let onClose: () => void;
  let onConfirmSpy: ReturnType<typeof vi.fn>;
  let onCloseSpy: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onConfirmSpy = vi.fn();
    onCloseSpy = vi.fn();
    onConfirm = onConfirmSpy as unknown as (payload: UploadTargetingPayload) => void;
    onClose = onCloseSpy as unknown as () => void;
  });

  // ─── 1. 0 CareCase + 0 soignant ──────────────────────────────────────────
  it("affiche 'Aucune destination disponible' + bouton Envoyer disabled quand 0 CareCase & 0 soignant", () => {
    render(
      <UploadTargetingModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        __testOverrides={{ careCases: [], providersByCareCase: [], isLoading: false }}
      />,
    );

    expect(screen.getByText(/aucune destination disponible/i)).toBeInTheDocument();

    const submit = screen.getByRole("button", { name: /envoyer/i });
    expect(submit).toBeDisabled();
  });

  // ─── 2. 1 CareCase → pré-coché + message contextuel ──────────────────────
  it("pré-coche le seul CareCase + affiche message contextuel", () => {
    const careCases = [makeCareCase("cc1", "Mon parcours coordination")];
    const providers = [[makeProvider("p1", "Marie", "Dubois", "Médecin")]];

    render(
      <UploadTargetingModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        __testOverrides={{ careCases, providersByCareCase: providers, isLoading: false }}
      />,
    );

    expect(
      screen.getByText(/ce bilan sera envoyé aux soignants de ce parcours/i),
    ).toBeInTheDocument();

    const checkbox = screen.getByRole("checkbox", {
      name: /parcours mon parcours coordination/i,
    }) as HTMLInputElement;
    expect(checkbox.checked).toBe(true);

    const submit = screen.getByRole("button", { name: /envoyer/i });
    expect(submit).not.toBeDisabled();

    fireEvent.click(submit);
    expect(onConfirmSpy).toHaveBeenCalledWith({ careCaseIds: ["cc1"] });
  });

  // ─── 3. N CareCases → décochés + message sélection ───────────────────────
  it("affiche checkboxes décochées + message sélection quand N CareCases", () => {
    const careCases = [
      makeCareCase("cc1", "Parcours nutrition"),
      makeCareCase("cc2", "Parcours endocrinologie"),
    ];
    const providers = [
      [makeProvider("p1", "Marie", "Dubois", "Diététicienne")],
      [makeProvider("p2", "Jean", "Durand", "Endocrinologue")],
    ];

    render(
      <UploadTargetingModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        __testOverrides={{ careCases, providersByCareCase: providers, isLoading: false }}
      />,
    );

    expect(screen.getByText(/sélectionnez le.s. parcours concerné/i)).toBeInTheDocument();

    const cb1 = screen.getByRole("checkbox", {
      name: /parcours nutrition/i,
    }) as HTMLInputElement;
    const cb2 = screen.getByRole("checkbox", {
      name: /parcours endocrinologie/i,
    }) as HTMLInputElement;
    expect(cb1.checked).toBe(false);
    expect(cb2.checked).toBe(false);

    const submit = screen.getByRole("button", { name: /envoyer/i });
    expect(submit).toBeDisabled();

    // Coche un parcours → enabled
    fireEvent.click(cb1);
    expect(submit).not.toBeDisabled();

    fireEvent.click(submit);
    expect(onConfirmSpy).toHaveBeenCalledWith({ careCaseIds: ["cc1"] });
  });

  // ─── 4. Switch radio DM → mode soignant DM ───────────────────────────────
  it("permet de basculer en mode DM et sélectionner 1 soignant", () => {
    const careCases = [makeCareCase("cc1", "Parcours")];
    const providers = [
      [
        makeProvider("p1", "Marie", "Dubois", "Diététicienne"),
        makeProvider("p2", "Jean", "Durand", "Médecin"),
      ],
    ];

    render(
      <UploadTargetingModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        __testOverrides={{ careCases, providersByCareCase: providers, isLoading: false }}
      />,
    );

    const dmRadio = screen.getByRole("radio", {
      name: /en privé à un soignant/i,
    });
    fireEvent.click(dmRadio);

    // Le select des soignants apparaît
    const select = screen.getByLabelText(/choisissez le soignant destinataire/i) as HTMLSelectElement;
    expect(select).toBeInTheDocument();

    // Bouton encore disabled tant que pas de choix
    const submit = screen.getByRole("button", { name: /envoyer/i });
    expect(submit).toBeDisabled();

    fireEvent.change(select, { target: { value: "p2" } });
    expect(submit).not.toBeDisabled();

    fireEvent.click(submit);
    expect(onConfirmSpy).toHaveBeenCalledWith({ directRecipientPersonId: "p2" });
  });

  // ─── 5. Validation XOR : bouton Envoyer ──────────────────────────────────
  it("validation XOR : disabled si aucune destination, enabled dès qu'une cible est valide", () => {
    const careCases = [
      makeCareCase("cc1", "Parcours 1"),
      makeCareCase("cc2", "Parcours 2"),
    ];
    const providers = [
      [makeProvider("p1", "Marie", "Dubois", "Diététicienne")],
      [makeProvider("p1", "Marie", "Dubois", "Diététicienne")], // même soignant 2 parcours → dédup
    ];

    render(
      <UploadTargetingModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        __testOverrides={{ careCases, providersByCareCase: providers, isLoading: false }}
      />,
    );

    const submit = screen.getByRole("button", { name: /envoyer/i });
    expect(submit).toBeDisabled();

    // Coche 1 parcours → enabled
    const cb1 = screen.getByRole("checkbox", {
      name: /parcours parcours 1/i,
    });
    fireEvent.click(cb1);
    expect(submit).not.toBeDisabled();

    // Décoche → re-disabled
    fireEvent.click(cb1);
    expect(submit).toBeDisabled();
  });

  // ─── 6. Wording strict MDR-safe ──────────────────────────────────────────
  it("ne contient AUCUN mot interdit MDR/DM", () => {
    const careCases = [makeCareCase("cc1", "Parcours")];
    const providers = [[makeProvider("p1", "Marie", "Dubois", "Médecin")]];

    const { container } = render(
      <UploadTargetingModal
        isOpen
        onClose={onClose}
        onConfirm={onConfirm}
        __testOverrides={{ careCases, providersByCareCase: providers, isLoading: false }}
      />,
    );

    const text = container.textContent?.toLowerCase() ?? "";
    const forbidden = [
      "suspicion",
      "diagnostic",
      "pathologie",
      "anorexie",
      "boulimie",
      "arfid",
      "hyperphagie",
      "orthorexie",
      "alerte",
      "surveillance",
      "monitoring",
    ];
    for (const word of forbidden) {
      expect(text).not.toContain(word);
    }
  });
});
