import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { BroadcastComposer } from "../BroadcastComposer";

describe("BroadcastComposer", () => {
  it("submit désactivé tant que subject ou body vide", () => {
    const onSubmit = vi.fn();
    render(<BroadcastComposer onSubmit={onSubmit} />);
    const btn = screen.getByRole("button", { name: /créer le brouillon/i });
    expect(btn).toBeDisabled();
  });

  it("appelle onSubmit avec subject + body trimmés", async () => {
    const onSubmit = vi.fn();
    render(<BroadcastComposer onSubmit={onSubmit} />);

    fireEvent.change(screen.getByLabelText(/objet de l'email/i), {
      target: { value: "  Sujet test  " },
    });
    fireEvent.change(screen.getByLabelText(/message/i), {
      target: { value: "  Bonjour à tous  " },
    });

    fireEvent.click(screen.getByRole("button", { name: /créer le brouillon/i }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        subject: "Sujet test",
        body: "Bonjour à tous",
      });
    });
  });

  it("toggle Édition / Aperçu rend le markdown", () => {
    render(<BroadcastComposer onSubmit={vi.fn()} initialBody="**Gras** et *italique*" />);
    fireEvent.click(screen.getByRole("tab", { name: /aperçu/i }));
    const preview = screen.getByRole("region", { name: /aperçu/i });
    expect(preview.innerHTML).toContain("<strong>Gras</strong>");
    expect(preview.innerHTML).toContain("<em>italique</em>");
  });

  it("affiche erreur quand errorMessage fourni", () => {
    render(
      <BroadcastComposer onSubmit={vi.fn()} errorMessage="Quota atteint" />,
    );
    expect(screen.getByRole("alert")).toHaveTextContent(/quota atteint/i);
  });

  it("isSubmitting désactive le bouton et change le label", () => {
    render(<BroadcastComposer onSubmit={vi.fn()} isSubmitting />);
    const btn = screen.getByRole("button", { name: /enregistrement/i });
    expect(btn).toBeDisabled();
  });

  it("compteurs caractères s'incrémentent", () => {
    render(<BroadcastComposer onSubmit={vi.fn()} />);
    fireEvent.change(screen.getByLabelText(/objet de l'email/i), {
      target: { value: "Hello" },
    });
    expect(screen.getByText(/5 \/ 200/)).toBeInTheDocument();
  });
});
