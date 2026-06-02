import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ApproveModal } from "../ApproveModal";

const baseProps = {
  applicantEmail: "marie@cpts.fr",
  proposedName: "CPTS Paris-Sud",
};

describe("ApproveModal", () => {
  it("affiche le nom de structure et l'email applicant", () => {
    render(<ApproveModal {...baseProps} onConfirm={vi.fn()} onCancel={vi.fn()} />);
    expect(screen.getByText(/CPTS Paris-Sud/)).toBeInTheDocument();
    expect(screen.getByText(/marie@cpts\.fr/)).toBeInTheDocument();
  });

  it("submit sans notes → onConfirm appelé avec null", () => {
    const onConfirm = vi.fn();
    render(<ApproveModal {...baseProps} onConfirm={onConfirm} onCancel={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /approuver et créer/i }));
    expect(onConfirm).toHaveBeenCalledWith(null);
  });

  it("submit avec notes → onConfirm appelé avec la string trimmée", () => {
    const onConfirm = vi.fn();
    render(<ApproveModal {...baseProps} onConfirm={onConfirm} onCancel={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/notes de review/i), {
      target: { value: "  Vérifié auprès de l'ARS  " },
    });
    fireEvent.click(screen.getByRole("button", { name: /approuver et créer/i }));
    expect(onConfirm).toHaveBeenCalledWith("Vérifié auprès de l'ARS");
  });

  it("isSubmitting=true → submit disabled", () => {
    render(
      <ApproveModal
        {...baseProps}
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        isSubmitting
      />,
    );
    expect(screen.getByRole("button", { name: /approuver et créer/i })).toBeDisabled();
  });
});
