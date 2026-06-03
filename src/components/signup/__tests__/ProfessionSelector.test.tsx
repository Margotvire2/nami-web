import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ProfessionSelector } from "../ProfessionSelector"
import { PROFESSIONS } from "../professions"

describe("ProfessionSelector", () => {
  it("affiche les 12 professions soignantes", () => {
    render(<ProfessionSelector value="" onChange={() => {}} />)
    expect(PROFESSIONS).toHaveLength(12)
    for (const p of PROFESSIONS) {
      expect(screen.getByText(p.label)).toBeInTheDocument()
    }
  })

  it("appelle onChange avec la valeur enum sélectionnée", () => {
    const onChange = vi.fn()
    render(<ProfessionSelector value="" onChange={onChange} />)
    fireEvent.click(screen.getByText("Médecin"))
    expect(onChange).toHaveBeenCalledWith("MEDECIN")
  })

  it("marque le bouton sélectionné avec aria-checked=true", () => {
    render(<ProfessionSelector value="DIETICIEN" onChange={() => {}} />)
    const button = screen.getByText("Diététicien·ne").closest("button")
    expect(button).toHaveAttribute("aria-checked", "true")
  })

  it("expose tous les autres comme aria-checked=false", () => {
    render(<ProfessionSelector value="PSY" onChange={() => {}} />)
    const medecin = screen.getByText("Médecin").closest("button")
    expect(medecin).toHaveAttribute("aria-checked", "false")
  })

  it("ouvre un radiogroup accessible", () => {
    render(<ProfessionSelector value="" onChange={() => {}} />)
    expect(screen.getByRole("radiogroup", { name: /profession/i })).toBeInTheDocument()
  })
})
