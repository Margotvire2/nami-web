import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import RagConsensusBlock, { type ConsensusItem } from "../RagConsensusBlock";

const MOCK: ConsensusItem[] = [
  { key: "imc", label: "IMC < 14 kg/m²", sourceCount: 3, maxSources: 4 },
  { key: "fc", label: "FC < 40 /min", sourceCount: 3, maxSources: 4 },
];

describe("RagConsensusBlock", () => {
  it("renders the eyebrow 'Apparaît dans les sources'", () => {
    render(
      <RagConsensusBlock
        title="Seuils critères"
        items={MOCK}
        onSympathy={() => {}}
        onClickCrit={() => {}}
      />,
    );
    expect(screen.getByText(/Apparaît dans les sources/i)).toBeInTheDocument();
  });

  it("renders the provided title", () => {
    render(
      <RagConsensusBlock
        title="Seuils mentionnés hospitalisation"
        items={MOCK}
        onSympathy={() => {}}
        onClickCrit={() => {}}
      />,
    );
    expect(screen.getByText("Seuils mentionnés hospitalisation")).toBeInTheDocument();
  });

  it("renders one row per consensus item with label + source count", () => {
    render(
      <RagConsensusBlock
        title="Test"
        items={MOCK}
        onSympathy={() => {}}
        onClickCrit={() => {}}
      />,
    );
    expect(screen.getByText("IMC < 14 kg/m²")).toBeInTheDocument();
    expect(screen.getByText("FC < 40 /min")).toBeInTheDocument();
    // sourceCount "3" appears twice (once per item)
    const matches = screen.getAllByText(/3 sources/i);
    expect(matches.length).toBe(2);
  });

  it("invokes onClickCrit with the item when an item is clicked", () => {
    const onClickCrit = vi.fn();
    const { container } = render(
      <RagConsensusBlock
        title="Test"
        items={MOCK}
        onSympathy={() => {}}
        onClickCrit={onClickCrit}
      />,
    );
    const firstItem = container.querySelector("[data-crit-container='imc']") as HTMLElement;
    fireEvent.click(firstItem);
    expect(onClickCrit).toHaveBeenCalledWith(MOCK[0]);
  });

  it("returns null when items is empty", () => {
    const { container } = render(
      <RagConsensusBlock
        title="Empty"
        items={[]}
        onSympathy={() => {}}
        onClickCrit={() => {}}
      />,
    );
    expect(container.firstChild).toBeNull();
  });
});
