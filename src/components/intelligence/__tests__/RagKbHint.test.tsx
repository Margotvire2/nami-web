import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RagKbHint from "../RagKbHint";

describe("RagKbHint", () => {
  it("renders the keyboard hint text aligned with implemented hooks (J/K + ↵ + Esc)", () => {
    render(<RagKbHint visible={true} onDismiss={() => {}} />);
    // Le texte est segmenté avec <Kbd> ; on cherche les morceaux clés
    expect(screen.getByText(/naviguer/i)).toBeInTheDocument();
    expect(screen.getByText(/ouvrir/i)).toBeInTheDocument();
    expect(screen.getByText(/fermer/i)).toBeInTheDocument();
    // J / K / ↵ / Esc présents en éléments kbd
    expect(screen.getByText("J")).toBeInTheDocument();
    expect(screen.getByText("K")).toBeInTheDocument();
    expect(screen.getByText("↵")).toBeInTheDocument();
    expect(screen.getByText("Esc")).toBeInTheDocument();
  });

  it("invokes onDismiss when user clicks 'compris'", () => {
    const onDismiss = vi.fn();
    render(<RagKbHint visible={true} onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole("button", { name: /compris/i }));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it("renders with opacity 1 when visible=true", () => {
    const { container } = render(<RagKbHint visible={true} onDismiss={() => {}} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.opacity).toBe("1");
  });

  it("renders with opacity 0 + pointer-events none when visible=false (auto-hide state)", () => {
    const { container } = render(<RagKbHint visible={false} onDismiss={() => {}} />);
    const wrapper = container.firstChild as HTMLElement;
    expect(wrapper.style.opacity).toBe("0");
    expect(wrapper.style.pointerEvents).toBe("none");
  });
});
