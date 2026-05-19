import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { CancelAppointmentModal } from "../CancelAppointmentModal";

describe("CancelAppointmentModal (F-G4-WIRING-FRONTEND)", () => {
  it("bouton 'Annuler le RDV' disabled tant qu'aucun motif sélectionné", () => {
    render(
      <CancelAppointmentModal
        open={true}
        onOpenChange={() => {}}
        onConfirm={vi.fn()}
        isPending={false}
      />,
    );
    const confirmBtn = screen.getByRole("button", { name: /Annuler le RDV/i });
    expect(confirmBtn).toBeDisabled();
  });

  it("active 'Annuler le RDV' dès qu'un motif est sélectionné", () => {
    render(
      <CancelAppointmentModal
        open={true}
        onOpenChange={() => {}}
        onConfirm={vi.fn()}
        isPending={false}
      />,
    );
    const select = screen.getByLabelText("Motif") as HTMLSelectElement;
    fireEvent.change(select, { target: { value: "PROVIDER_EMERGENCY" } });
    expect(select.value).toBe("PROVIDER_EMERGENCY");
    const confirmBtn = screen.getByRole("button", { name: /Annuler le RDV/i });
    expect(confirmBtn).not.toBeDisabled();
  });

  it("appelle onConfirm avec reason + note quand validé", async () => {
    const onConfirm = vi.fn(() => Promise.resolve());
    render(
      <CancelAppointmentModal
        open={true}
        onOpenChange={() => {}}
        onConfirm={onConfirm}
        isPending={false}
      />,
    );
    fireEvent.change(screen.getByLabelText("Motif"), {
      target: { value: "PATIENT_UNAVAILABLE" },
    });
    fireEvent.change(screen.getByLabelText(/Note/i), {
      target: { value: "Empêchement perso" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Annuler le RDV/i }));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith({
        reason: "PATIENT_UNAVAILABLE",
        note: "Empêchement perso",
      });
    });
  });

  it("appelle onConfirm sans note quand la note est vide (note=undefined)", async () => {
    const onConfirm = vi.fn(() => Promise.resolve());
    render(
      <CancelAppointmentModal
        open={true}
        onOpenChange={() => {}}
        onConfirm={onConfirm}
        isPending={false}
      />,
    );
    fireEvent.change(screen.getByLabelText("Motif"), {
      target: { value: "OTHER" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Annuler le RDV/i }));
    await waitFor(() => {
      expect(onConfirm).toHaveBeenCalledWith({ reason: "OTHER", note: undefined });
    });
  });

  it("bouton 'Retour' appelle onOpenChange(false)", () => {
    const onOpenChange = vi.fn();
    render(
      <CancelAppointmentModal
        open={true}
        onOpenChange={onOpenChange}
        onConfirm={vi.fn()}
        isPending={false}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /Retour/i }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("affiche 'Annulation...' et désactive les boutons quand isPending=true", () => {
    render(
      <CancelAppointmentModal
        open={true}
        onOpenChange={() => {}}
        onConfirm={vi.fn()}
        isPending={true}
      />,
    );
    // Le bouton confirm doit afficher 'Annulation...' + être disabled
    const confirmBtn = screen.getByRole("button", { name: /Annulation\.\.\./ });
    expect(confirmBtn).toBeDisabled();
    // Le bouton Retour est aussi disabled pendant l'opération
    expect(screen.getByRole("button", { name: /Retour/i })).toBeDisabled();
  });
});
