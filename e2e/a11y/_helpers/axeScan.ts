import type { Page, TestInfo } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import fs from "node:fs";
import path from "node:path";

// Baseline a11y — on cible WCAG 2.0/2.1 A + AA. Les règles "best-practice"
// remontent du bruit subjectif, on les laisse hors baseline (peut être
// activé plus tard). Voir https://github.com/dequelabs/axe-core/blob/develop/doc/API.md#axe-core-tags.
const WCAG_TAGS = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
];

export type Severity = "critical" | "serious" | "moderate" | "minor";

export interface AxeViolationSummary {
  id: string;
  impact: Severity | null;
  help: string;
  helpUrl: string;
  nodes: number;
  tags: string[];
}

export interface AxeReport {
  page: string;
  url: string;
  scannedAt: string;
  violations: AxeViolationSummary[];
  counts: Record<Severity | "total", number>;
}

/**
 * Lance un scan axe-core sur la page, sérialise un rapport JSON par spec
 * dans `playwright-report/a11y/<slug>.json`, et l'attache au test pour le
 * reporter. Ne fait PAS échouer le test sur violations — c'est un baseline
 * pre-launch, l'objectif est l'inventaire, pas le blocage.
 */
export async function runAxeScan(
  page: Page,
  testInfo: TestInfo,
  label: string,
): Promise<AxeReport> {
  const results = await new AxeBuilder({ page }).withTags(WCAG_TAGS).analyze();

  const violations: AxeViolationSummary[] = results.violations.map((v) => ({
    id: v.id,
    impact: (v.impact as Severity | null) ?? null,
    help: v.help,
    helpUrl: v.helpUrl,
    nodes: v.nodes.length,
    tags: v.tags,
  }));

  const counts: Record<Severity | "total", number> = {
    critical: 0,
    serious: 0,
    moderate: 0,
    minor: 0,
    total: 0,
  };
  for (const v of violations) {
    counts.total += 1;
    if (v.impact) counts[v.impact] += 1;
  }

  const report: AxeReport = {
    page: label,
    url: page.url(),
    scannedAt: new Date().toISOString(),
    violations,
    counts,
  };

  const slug = label.replace(/[^a-z0-9-]/gi, "-").toLowerCase();
  const outDir = path.join(testInfo.config.rootDir, "playwright-report", "a11y");
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${slug}.json`);
  fs.writeFileSync(outFile, JSON.stringify(report, null, 2), "utf-8");

  await testInfo.attach(`axe-${slug}`, {
    body: JSON.stringify(report, null, 2),
    contentType: "application/json",
  });

  return report;
}
