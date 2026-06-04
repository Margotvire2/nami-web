import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FAQSection } from "@/components/faq/FAQSection";
import { AccordionItem, renderFaqMarkdown } from "@/components/faq/AccordionItem";
import type { FAQSectionData } from "@/data/faq-items";

const FIXTURE: FAQSectionData = {
  id: "test-section",
  title: "Section test",
  iconName: "compass",
  description: "Description de test",
  items: [
    {
      id: "q1",
      question: "Comment créer mon compte ?",
      answerMarkdown:
        "Allez sur **créer un compte** et renseignez votre email.",
      keywords: ["compte", "créer"],
    },
    {
      id: "q2",
      question: "Mes données sont-elles vendues ?",
      answerMarkdown: "**Non.** Vos données ne sont jamais vendues.",
      keywords: ["données", "vendues"],
    },
  ],
};

describe("FAQSection", () => {
  it("rend le titre, la description et tous les items", () => {
    render(<FAQSection section={FIXTURE} />);
    expect(screen.getByText("Section test")).toBeInTheDocument();
    expect(screen.getByText("Description de test")).toBeInTheDocument();
    expect(
      screen.getByText("Comment créer mon compte ?"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Mes données sont-elles vendues ?"),
    ).toBeInTheDocument();
  });

  it("expose un rôle region nommé par le titre (accessibilité)", () => {
    render(<FAQSection section={FIXTURE} />);
    const region = screen.getByRole("region", { name: /Section test/i });
    expect(region).toBeInTheDocument();
  });

  it("génère un id stable pour chaque accordion", () => {
    const { container } = render(<FAQSection section={FIXTURE} />);
    expect(container.querySelector("#faq-test-section-q1")).toBeTruthy();
    expect(container.querySelector("#faq-test-section-q2")).toBeTruthy();
  });
});

describe("AccordionItem markdown renderer", () => {
  it("rend **gras** en <strong>", () => {
    const html = renderFaqMarkdown("Texte **important** ici");
    expect(html).toContain("<strong");
    expect(html).toContain("important");
  });

  it("rend les liens internes sans target=_blank", () => {
    const html = renderFaqMarkdown("Voir la [page](/confidentialite)");
    expect(html).toContain('href="/confidentialite"');
    expect(html).not.toContain("target=");
  });

  it("rend les liens externes avec rel noopener", () => {
    const html = renderFaqMarkdown("Voir [site](https://example.com)");
    expect(html).toContain('rel="noopener noreferrer"');
    expect(html).toContain('target="_blank"');
  });

  it("échappe les balises HTML brutes (anti-XSS)", () => {
    const html = renderFaqMarkdown("<script>alert(1)</script>");
    expect(html).not.toContain("<script>");
    expect(html).toContain("&lt;script&gt;");
  });

  it("rend un accordion <details> fermé par défaut", () => {
    const { container } = render(
      <AccordionItem item={FIXTURE.items[0]} sectionId="test" />,
    );
    const details = container.querySelector("details");
    expect(details).toBeTruthy();
    expect(details?.hasAttribute("open")).toBe(false);
  });
});
