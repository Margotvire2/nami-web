import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import KnowledgeContentRenderer from "../KnowledgeContentRenderer";

/**
 * Tests d'invariants Action C — rendu différencié subkind=tableau_brut.
 *
 * Le contenu d'un chunk tableau_brut est du texte extrait du PDF source où
 * les cellules ont été aplaties en lignes verticales. Reconstruire un <table>
 * HTML à partir de ce texte est lossy et trompeur (Doctrine MDR D.2).
 * Le placeholder affiche un cartouche neutre + lien vers le PDF officiel HAS.
 */

describe("KnowledgeContentRenderer — subkind=tableau_brut", () => {
  it("rend le placeholder (PAS de <table> HTML) quand subkind=tableau_brut", () => {
    const { container } = render(
      <KnowledgeContentRenderer
        content="Cellule 1\nCellule 2\nCellule 3"
        source="HAS"
        subkind="tableau_brut"
        hasId="c_2872733"
        pageStart={12}
        pageEnd={15}
        sourceUrl="https://www.has-sante.fr/jcms/c_2872733"
      />,
    );
    expect(container.querySelector("table")).toBeNull();
    expect(screen.getByText(/Tableau brut/i)).toBeInTheDocument();
    expect(
      screen.getByText(/Ce contenu provient d'un tableau du PDF source/i),
    ).toBeInTheDocument();
  });

  it("rend un lien PDF HAS quand sourceUrl est fourni", () => {
    render(
      <KnowledgeContentRenderer
        content="…"
        source="HAS"
        subkind="tableau_brut"
        hasId="c_2872733"
        pageStart={1}
        pageEnd={1}
        sourceUrl="https://www.has-sante.fr/jcms/c_2872733"
      />,
    );
    const link = screen.getByRole("link", { name: /Ouvrir la source HAS/i });
    expect(link).toHaveAttribute("href", "https://www.has-sante.fr/jcms/c_2872733");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("fallback URL via hasId si sourceUrl null", () => {
    render(
      <KnowledgeContentRenderer
        content="…"
        source="HAS"
        subkind="tableau_brut"
        hasId="c_2872733"
        pageStart={null}
        pageEnd={null}
        sourceUrl={null}
      />,
    );
    const link = screen.getByRole("link", { name: /Ouvrir la source HAS/i });
    expect(link).toHaveAttribute("href", "https://www.has-sante.fr/jcms/c_2872733");
  });

  it("n'affiche aucun lien si ni sourceUrl ni hasId", () => {
    render(
      <KnowledgeContentRenderer
        content="…"
        source="HAS"
        subkind="tableau_brut"
        hasId={null}
        pageStart={null}
        pageEnd={null}
        sourceUrl={null}
      />,
    );
    expect(screen.queryByRole("link")).toBeNull();
  });

  it("affiche 'Pages X-Y' quand pageStart ≠ pageEnd", () => {
    render(
      <KnowledgeContentRenderer
        content="…"
        source="HAS"
        subkind="tableau_brut"
        hasId="c_2872733"
        pageStart={12}
        pageEnd={15}
        sourceUrl={null}
      />,
    );
    expect(screen.getByText(/Pages 12-15/)).toBeInTheDocument();
  });

  it("affiche 'Page X' (singulier) quand pageStart === pageEnd", () => {
    render(
      <KnowledgeContentRenderer
        content="…"
        source="HAS"
        subkind="tableau_brut"
        hasId="c_2872733"
        pageStart={9}
        pageEnd={9}
        sourceUrl={null}
      />,
    );
    expect(screen.getByText(/Page 9/)).toBeInTheDocument();
    expect(screen.queryByText(/Pages /)).toBeNull();
  });

  it("régression : subkind=corps continue à rendre via le pipeline markdown existant", () => {
    const { container } = render(
      <KnowledgeContentRenderer
        content="# Titre\n\nUn paragraphe explicatif."
        source="HAS"
        subkind="corps"
      />,
    );
    expect(screen.queryByText(/Tableau brut/i)).toBeNull();
    expect(screen.queryByText(/Ce contenu provient d'un tableau/i)).toBeNull();
    expect(container.querySelector("h1")).not.toBeNull();
    expect(screen.getByText(/Un paragraphe explicatif/i)).toBeInTheDocument();
  });

  it("régression : sans subkind, comportement inchangé (paragraphe)", () => {
    render(
      <KnowledgeContentRenderer
        content="Texte libre sans markdown."
        source="HAS"
      />,
    );
    expect(screen.queryByText(/Tableau brut/i)).toBeNull();
    expect(screen.getByText(/Texte libre sans markdown/i)).toBeInTheDocument();
  });
});
