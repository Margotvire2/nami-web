import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { BilanEditor } from "../BilanEditor";

const SAMPLE_BILAN = `> ⚠️ **Brouillon généré à partir de votre transcription audio. À vérifier et valider par le soignant avant tout partage.**

## 1. Anamnèse alimentaire
Rappel des 24h documenté.

## 2. Comportement alimentaire
Compulsions le soir mentionnées.

## 3. Plan
Axes définis.
`;

afterEach(() => cleanup());

describe("BilanEditor", () => {
  let onSave: ((markdown: string) => Promise<void>) & ReturnType<typeof vi.fn>;
  let onRegenerate: (() => Promise<void>) & ReturnType<typeof vi.fn>;

  beforeEach(() => {
    onSave = vi.fn().mockResolvedValue(undefined) as typeof onSave;
    onRegenerate = vi.fn().mockResolvedValue(undefined) as typeof onRegenerate;
  });

  it("affiche le bilan en preview avec le disclaimer", () => {
    render(
      <BilanEditor
        initialMarkdown={SAMPLE_BILAN}
        templateProfession="DIETICIEN"
        templateVersion={1}
        reviewedByProvider={false}
        onSave={onSave}
        onRegenerate={onRegenerate}
      />,
    );

    expect(screen.getByTestId("bilan-preview")).toBeTruthy();
    expect(screen.getByText(/Bilan · Diététicien/)).toBeTruthy();
    expect(screen.getByText("Brouillon")).toBeTruthy(); // badge exact match
    // Disclaimer texte split par <strong> — on cherche dans le DOM brut
    expect(document.body.textContent).toMatch(/À vérifier et valider/i);
    expect(screen.getByText("v1")).toBeTruthy();
  });

  it("affiche le badge 'Validé' quand reviewedByProvider=true", () => {
    render(
      <BilanEditor
        initialMarkdown={SAMPLE_BILAN}
        templateProfession="MEDECIN"
        templateVersion={1}
        reviewedByProvider={true}
        onSave={onSave}
        onRegenerate={onRegenerate}
      />,
    );

    expect(screen.getByText(/Validé/)).toBeTruthy();
    expect(screen.queryByText(/^Brouillon$/)).toBeNull();
  });

  it("permet de passer en mode édition puis de sauvegarder", async () => {
    render(
      <BilanEditor
        initialMarkdown={SAMPLE_BILAN}
        templateProfession="DIETICIEN"
        templateVersion={1}
        reviewedByProvider={false}
        onSave={onSave}
        onRegenerate={onRegenerate}
      />,
    );

    fireEvent.click(screen.getByTestId("bilan-edit"));
    const textarea = screen.getByTestId("bilan-editor-textarea") as HTMLTextAreaElement;
    expect(textarea.value).toContain("Anamnèse alimentaire");

    fireEvent.change(textarea, { target: { value: SAMPLE_BILAN + "\nNote ajoutée." } });
    fireEvent.click(screen.getByTestId("bilan-save"));

    await waitFor(() => {
      expect(onSave).toHaveBeenCalledWith(expect.stringContaining("Note ajoutée."));
    });
  });

  it("permet d'annuler l'édition et restaurer le markdown initial", () => {
    render(
      <BilanEditor
        initialMarkdown={SAMPLE_BILAN}
        templateProfession="DIETICIEN"
        templateVersion={1}
        reviewedByProvider={false}
        onSave={onSave}
        onRegenerate={onRegenerate}
      />,
    );

    fireEvent.click(screen.getByTestId("bilan-edit"));
    const textarea = screen.getByTestId("bilan-editor-textarea") as HTMLTextAreaElement;
    fireEvent.change(textarea, { target: { value: "Texte modifié" } });
    fireEvent.click(screen.getByTestId("bilan-cancel"));

    expect(screen.getByTestId("bilan-preview").textContent).toContain("Anamnèse alimentaire");
    expect(onSave).not.toHaveBeenCalled();
  });

  it("déclenche la régénération via le bouton 'Régénérer'", async () => {
    render(
      <BilanEditor
        initialMarkdown={SAMPLE_BILAN}
        templateProfession="DIETICIEN"
        templateVersion={1}
        reviewedByProvider={false}
        onSave={onSave}
        onRegenerate={onRegenerate}
      />,
    );

    fireEvent.click(screen.getByTestId("bilan-regenerate"));

    await waitFor(() => {
      expect(onRegenerate).toHaveBeenCalled();
    });
  });

  it("affiche le badge 'Bilan générique' quand templateProfession=null", () => {
    render(
      <BilanEditor
        initialMarkdown={SAMPLE_BILAN}
        templateProfession={null}
        templateVersion={1}
        reviewedByProvider={false}
        onSave={onSave}
        onRegenerate={onRegenerate}
      />,
    );

    expect(screen.getByText(/Bilan générique/)).toBeTruthy();
  });

  it("affiche un message d'erreur quand errorMessage est passé", () => {
    render(
      <BilanEditor
        initialMarkdown={SAMPLE_BILAN}
        templateProfession="KINE"
        templateVersion={1}
        reviewedByProvider={false}
        onSave={onSave}
        onRegenerate={onRegenerate}
        errorMessage="Erreur réseau"
      />,
    );

    expect(screen.getByTestId("bilan-error").textContent).toContain("Erreur réseau");
  });
});
