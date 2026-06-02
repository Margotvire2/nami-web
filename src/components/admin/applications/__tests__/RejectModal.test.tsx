import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RejectModal } from "../RejectModal";

const baseProps = {
  applicantEmail: "marie@cpts.fr",
  proposedName: "CPTS Paris-Sud",
};

describe("RejectModal", () => {
  it("affiche le nom de structure et l'email applicant dans la description", () => {
    render(
      <RejectModal
        {...baseProps}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
      />,
    );
    expect(screen.getByText(/CPTS Paris-Sud/)).toBeInTheDocument();
    expect(screen.getByText(/marie@cpts\.fr/)).toBeInTheDocument();
  });

  it("submit disabled tant que motif < 5 caractères ; erreur affichée au blur", () => {
    const onConfirm = vi.fn();
    render(<RejectModal {...baseProps} onConfirm={onConfirm} onCancel={vi.fn()} />);

    const textarea = screen.getByLabelText(/motif de rejet/i);
    const submitBtn = screen.getByRole("button", { name: /confirmer le rejet/i });

    // Vide → disabled
    expect(submitBtn).toBeDisabled();

    // 3 caractères → toujours disabled
    fireEvent.change(textarea, { target: { value: "abc" } });
    expect(submitBtn).toBeDisabled();

    // Au blur sur textarea trop court → message d'erreur affiché
    fireEvent.blur(textarea);
    expect(screen.getByText(/minimum 5 caractères/i)).toBeInTheDocument();

    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("submit appelle onConfirm avec la raison trimmée", () => {
    const onConfirm = vi.fn();
    render(<RejectModal {...baseProps} onConfirm={onConfirm} onCancel={vi.fn()} />);

    fireEvent.change(screen.getByLabelText(/motif de rejet/i), {
      target: { value: "  SIRET non vérifiable via INSEE  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /confirmer le rejet/i }));

    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onConfirm).toHaveBeenCalledWith("SIRET non vérifiable via INSEE");
  });

  it("click Annuler appelle onCancel", () => {
    const onCancel = vi.fn();
    render(<RejectModal {...baseProps} onConfirm={vi.fn()} onCancel={onCancel} />);

    fireEvent.click(screen.getByRole("button", { name: /^annuler$/i }));
    expect(onCancel).toHaveBeenCalledTimes(1);
  });

  it("isSubmitting=true → bouton submit disabled + bouton Annuler disabled", () => {
    render(
      <RejectModal
        {...baseProps}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting
      />,
    );
    expect(screen.getByRole("button", { name: /confirmer le rejet/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /^annuler$/i })).toBeDisabled();
  });

  it("errorMessage affiché en role=alert", () => {
    render(
      <RejectModal
        {...baseProps}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        errorMessage="Conflit : candidature déjà clôturée."
      />,
    );
    const alerts = screen.getAllByRole("alert");
    expect(alerts.some((a) => a.textContent?.includes("Conflit"))).toBe(true);
  });
});
