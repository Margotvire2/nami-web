import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ExerciseModeSelector } from "../ExerciseModeSelector"

describe("ExerciseModeSelector", () => {
  it("affiche les 3 modes d'exercice V1", () => {
    render(<ExerciseModeSelector value="" onChange={() => {}} />)
    expect(screen.getByText(/libéral·e/i)).toBeInTheDocument()
    expect(screen.getByText(/salarié·e d'une structure/i)).toBeInTheDocument()
    expect(screen.getByText(/exercice mixte/i)).toBeInTheDocument()
  })

  it("appelle onChange avec LIBERAL", () => {
    const onChange = vi.fn()
    render(<ExerciseModeSelector value="" onChange={onChange} />)
    fireEvent.click(screen.getByText(/libéral·e/i))
    expect(onChange).toHaveBeenCalledWith("LIBERAL")
  })

  it("appelle onChange avec SALARIED (label = 'salarié·e d'une structure')", () => {
    const onChange = vi.fn()
    render(<ExerciseModeSelector value="" onChange={onChange} />)
    fireEvent.click(screen.getByText(/salarié·e d'une structure/i))
    expect(onChange).toHaveBeenCalledWith("SALARIED")
  })

  it("appelle onChange avec MIXED", () => {
    const onChange = vi.fn()
    render(<ExerciseModeSelector value="" onChange={onChange} />)
    fireEvent.click(screen.getByText(/exercice mixte/i))
    expect(onChange).toHaveBeenCalledWith("MIXED")
  })

  it("expose un radiogroup", () => {
    render(<ExerciseModeSelector value="" onChange={() => {}} />)
    expect(screen.getByRole("radiogroup", { name: /mode d'exercice/i })).toBeInTheDocument()
  })

  it("marque le sélectionné avec aria-checked", () => {
    render(<ExerciseModeSelector value="LIBERAL" onChange={() => {}} />)
    const button = screen.getByText(/libéral·e/i).closest("button")
    expect(button).toHaveAttribute("aria-checked", "true")
  })
})
