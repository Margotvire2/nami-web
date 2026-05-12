import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import SourceBadgeRag from "../SourceBadgeRag";
import type { SourceLabel } from "@/lib/api";

describe("SourceBadgeRag (V2.1 — payload backend source)", () => {
  it("renders label for HAS", () => {
    render(<SourceBadgeRag source="HAS" />);
    expect(screen.getByText("HAS")).toBeInTheDocument();
  });

  it("renders label for FFAB", () => {
    render(<SourceBadgeRag source="FFAB" />);
    expect(screen.getByText("FFAB")).toBeInTheDocument();
  });

  it("renders nothing when source is null", () => {
    const { container } = render(<SourceBadgeRag source={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("applies aria-label for accessibility", () => {
    render(<SourceBadgeRag source="ANSM" />);
    expect(screen.getByLabelText("Source : ANSM")).toBeInTheDocument();
  });

  it("renders white text on solid background (uppercase letters)", () => {
    render(<SourceBadgeRag source="DSM-5" />);
    const el = screen.getByText("DSM-5");
    expect(el).toHaveStyle({ color: "#FFFFFF" });
    expect(el).toHaveStyle({ textTransform: "uppercase" });
  });

  it.each<SourceLabel>([
    "HAS",
    "FFAB",
    "ANSM",
    "DSM-5",
    "ESPGHAN",
    "INCA",
    "ORPHANET",
    "FICHE",
    "OTHER",
  ])("renders all 9 source labels — %s", (source) => {
    render(<SourceBadgeRag source={source} />);
    expect(screen.getByText(source)).toBeInTheDocument();
  });

  it("supports size prop md", () => {
    render(<SourceBadgeRag source="HAS" size="md" />);
    const el = screen.getByText("HAS");
    expect(el).toHaveStyle({ fontSize: "11px" });
  });

  it("default size is sm (10px font)", () => {
    render(<SourceBadgeRag source="HAS" />);
    const el = screen.getByText("HAS");
    expect(el).toHaveStyle({ fontSize: "10px" });
  });

  // HOTFIX P0 — sources hors enum backend (ex : 'DU' depuis KnowledgeEntry.source)
  it("renders OTHER badge for unknown source values (e.g. 'DU')", () => {
    render(<SourceBadgeRag source="DU" />);
    expect(screen.getByText("OTHER")).toBeInTheDocument();
    expect(screen.getByLabelText("Source : OTHER")).toBeInTheDocument();
  });

  it("renders nothing for empty string source (falsy guard)", () => {
    const { container } = render(<SourceBadgeRag source="" />);
    expect(container).toBeEmptyDOMElement();
  });
});
