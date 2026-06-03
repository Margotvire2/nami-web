import { describe, it, expect, vi } from "vitest"
import { render, screen, fireEvent } from "@testing-library/react"
import { ProIdentifierInput } from "../ProIdentifierInput"

describe("ProIdentifierInput", () => {
  it("invite à choisir une profession si vide", () => {
    render(<ProIdentifierInput profession="" value="" onChange={() => {}} />)
    expect(screen.getByText(/sélectionnez d'abord/i)).toBeInTheDocument()
  })

  it("affiche le label RPPS pour MEDECIN", () => {
    render(<ProIdentifierInput profession="MEDECIN" value="" onChange={() => {}} />)
    expect(screen.getByText(/identifiant rpps/i)).toBeInTheDocument()
    expect(screen.getByText(/11 chiffres/i)).toBeInTheDocument()
  })

  it("affiche le label ADELI pour DIETICIEN", () => {
    render(<ProIdentifierInput profession="DIETICIEN" value="" onChange={() => {}} />)
    expect(screen.getByText(/identifiant adeli/i)).toBeInTheDocument()
    expect(screen.getByText(/9 chiffres/i)).toBeInTheDocument()
  })

  it("affiche le label DEAS + notice manuelle pour AIDE_SOIGNANT", () => {
    render(<ProIdentifierInput profession="AIDE_SOIGNANT" value="" onChange={() => {}} />)
    expect(screen.getByText(/identifiant deas/i)).toBeInTheDocument()
    expect(screen.getByText(/manuellement par l'équipe nami/i)).toBeInTheDocument()
  })

  it("relaie les changements de saisie", () => {
    const onChange = vi.fn()
    render(<ProIdentifierInput profession="MEDECIN" value="" onChange={onChange} />)
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "10112345678" } })
    expect(onChange).toHaveBeenCalledWith("10112345678")
  })

  it("affiche un message d'erreur sur RPPS au mauvais format", () => {
    render(<ProIdentifierInput profession="MEDECIN" value="12345" onChange={() => {}} />)
    expect(screen.getByText(/format rpps invalide/i)).toBeInTheDocument()
  })

  it("aria-invalid=true sur input invalide", () => {
    render(<ProIdentifierInput profession="DIETICIEN" value="abc" onChange={() => {}} />)
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "true")
  })

  it("aria-invalid=false sur input valide RPPS 11 chiffres", () => {
    render(<ProIdentifierInput profession="MEDECIN" value="10112345678" onChange={() => {}} />)
    expect(screen.getByRole("textbox")).toHaveAttribute("aria-invalid", "false")
  })

  it("inputMode=numeric pour RPPS/ADELI, text pour DEAS", () => {
    const { rerender } = render(<ProIdentifierInput profession="MEDECIN" value="" onChange={() => {}} />)
    expect(screen.getByRole("textbox")).toHaveAttribute("inputmode", "numeric")
    rerender(<ProIdentifierInput profession="AIDE_SOIGNANT" value="" onChange={() => {}} />)
    expect(screen.getByRole("textbox")).toHaveAttribute("inputmode", "text")
  })
})
