import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QuickActionButton } from "../QuickActionButton";

describe("QuickActionButton", () => {
  it("comingSoon → disabled + tooltip Disponible en V2", () => {
    render(<QuickActionButton label="Publier une actu" comingSoon />);
    const btn = screen.getByRole("button", { name: /publier une actu/i });
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("title", "Disponible en V2");
    expect(screen.getByText(/bientôt/i)).toBeInTheDocument();
  });

  it("appelle onClick quand actif", () => {
    const onClick = vi.fn();
    render(<QuickActionButton label="Action" onClick={onClick} />);
    const btn = screen.getByRole("button", { name: /action/i });
    expect(btn).not.toBeDisabled();
    fireEvent.click(btn);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("disabled si pas de onClick et pas comingSoon", () => {
    render(<QuickActionButton label="Sans handler" />);
    const btn = screen.getByRole("button", { name: /sans handler/i });
    expect(btn).toBeDisabled();
  });
});
