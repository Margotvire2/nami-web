import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { PatientSubmissionReviewModal } from "../PatientSubmissionReviewModal";

describe("PatientSubmissionReviewModal", () => {
  it("ne rend rien quand open=false", () => {
    const { container } = render(
      <PatientSubmissionReviewModal
        open={false}
        submissionId="s1"
        onClose={() => {}}
        onReview={() => {}}
      />,
    );
    expect(container.firstChild).toBeNull();
  });

  it("rend les 3 actions quand currentStatus=SUBMITTED", () => {
    render(
      <PatientSubmissionReviewModal
        open
        submissionId="s1"
        currentStatus="SUBMITTED"
        onClose={() => {}}
        onReview={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /refuser/i })).not.toBeDisabled();
    expect(screen.getByRole("button", { name: /accepter/i })).not.toBeDisabled();
    expect(
      screen.getByRole("button", { name: /marquer présenté/i }),
    ).toBeDisabled();
  });

  it("currentStatus=ACCEPTED → seule l'action PRESENTED est active", () => {
    render(
      <PatientSubmissionReviewModal
        open
        submissionId="s1"
        currentStatus="ACCEPTED"
        onClose={() => {}}
        onReview={() => {}}
      />,
    );
    expect(screen.getByRole("button", { name: /refuser/i })).toBeDisabled();
    expect(screen.getByRole("button", { name: /accepter/i })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: /marquer présenté/i }),
    ).not.toBeDisabled();
  });

  it("clic Accepter → appelle onReview avec status=ACCEPTED", () => {
    const onReview = vi.fn();
    render(
      <PatientSubmissionReviewModal
        open
        submissionId="s1"
        currentStatus="SUBMITTED"
        onClose={() => {}}
        onReview={onReview}
      />,
    );
    fireEvent.change(screen.getByLabelText(/notes/i), {
      target: { value: "Cas pertinent" },
    });
    fireEvent.click(screen.getByRole("button", { name: /accepter/i }));
    expect(onReview).toHaveBeenCalledWith({
      submissionId: "s1",
      status: "ACCEPTED",
      reviewNotes: "Cas pertinent",
    });
  });

  it("clic X → appelle onClose", () => {
    const onClose = vi.fn();
    render(
      <PatientSubmissionReviewModal
        open
        submissionId="s1"
        onClose={onClose}
        onReview={() => {}}
      />,
    );
    fireEvent.click(screen.getByRole("button", { name: /fermer/i }));
    expect(onClose).toHaveBeenCalled();
  });
});
