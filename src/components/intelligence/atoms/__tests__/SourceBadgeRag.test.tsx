import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SourceBadgeRag from "../SourceBadgeRag";
import type { RagSourceKind } from "../_tokens";

describe("SourceBadgeRag", () => {
  it("renders label for HAS kind (uppercase styling)", () => {
    render(<SourceBadgeRag kind="HAS" label="HAS" />);
    expect(screen.getByText("HAS")).toBeInTheDocument();
  });

  it("renders label for FFAB kind", () => {
    render(<SourceBadgeRag kind="FFAB" label="FFAB" />);
    expect(screen.getByText("FFAB")).toBeInTheDocument();
  });

  it("renders italic label for NAMI_ALGO kind", () => {
    render(<SourceBadgeRag kind="NAMI_ALGO" label="Nami algo" />);
    const el = screen.getByText("Nami algo");
    expect(el).toBeInTheDocument();
    expect(el).toHaveStyle({ fontStyle: "italic" });
  });

  it("renders italic label for NAMI_EXTRACT kind", () => {
    render(<SourceBadgeRag kind="NAMI_EXTRACT" label="Nami extrait" />);
    const el = screen.getByText("Nami extrait");
    expect(el).toBeInTheDocument();
    expect(el).toHaveStyle({ fontStyle: "italic" });
  });

  it.each<RagSourceKind>(["HAS", "FFAB", "NAMI_ALGO", "NAMI_EXTRACT"])(
    "applies pill rounded shape (border-radius 999) for kind %s",
    (kind) => {
      render(<SourceBadgeRag kind={kind} label={`label-${kind}`} />);
      const el = screen.getByText(`label-${kind}`);
      expect(el).toHaveStyle({ borderRadius: "999px" });
    },
  );
});
