import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import DraftAIBadge from "../DraftAIBadge";

describe("DraftAIBadge", () => {
  it("renders the canonical Nami wording 'Brouillon IA — à vérifier'", () => {
    render(<DraftAIBadge />);
    expect(screen.getByText(/Brouillon IA — à vérifier/i)).toBeInTheDocument();
  });

  it("exposes AI Act Art. 50 tooltip via title attribute", () => {
    const { container } = render(<DraftAIBadge />);
    const span = container.querySelector("span[title]");
    expect(span).not.toBeNull();
    expect(span?.getAttribute("title")).toMatch(/AI Act Art\.\s*50/i);
  });

  it("renders a Sparkles icon (aria-hidden)", () => {
    const { container } = render(<DraftAIBadge />);
    // lucide-react renders an svg element
    const svg = container.querySelector("svg");
    expect(svg).not.toBeNull();
  });
});
