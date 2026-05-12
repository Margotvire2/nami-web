/**
 * Helpers partagés entre les sous-composants de `/intelligence`.
 *
 * Scope-local — utilisés uniquement par les fichiers de
 * `src/components/intelligence/` et la page parente
 * `src/app/(cockpit)/intelligence/page.tsx`.
 *
 * Note : d'autres fichiers (`KnowledgeSearch.tsx`, `BlogBrowser.tsx`,
 * `ActSelect.tsx`) définissent des homonymes locaux indépendants — ce ne
 * sont pas les mêmes valeurs sémantiques, intentionnellement non fusionnés.
 */

import { BookOpen, FileText, GitBranch, Database } from "lucide-react";

export function slugToCategory(slug: string): string {
  if (slug.startsWith("sem_"))  return "SEM";
  if (slug.startsWith("algo_")) return "ALGO";
  if (slug.startsWith("ke_"))   return "KE";
  if (slug.startsWith("pcr-"))  return "PCR";
  return "REF";
}

export const CATEGORY_META: Record<string, { label: string; color: string; bg: string; desc: string }> = {
  SEM:  { label: "Sémantique", color: "#5B4EC4", bg: "rgba(91,78,196,0.08)",    desc: "Fiches pathologies sémantiques" },
  ALGO: { label: "Algorithme", color: "#2BA89C", bg: "rgba(43,168,156,0.08)",   desc: "Arbres décisionnels cliniques" },
  KE:   { label: "Fiche",      color: "#6B7280", bg: "rgba(138,138,150,0.10)",  desc: "Fiches de référence" },
  PCR:  { label: "PCR",        color: "#7C3AED", bg: "rgba(124,58,237,0.08)",   desc: "Parcours de soins complexe" },
  REF:  { label: "Référence",  color: "#2563EB", bg: "rgba(37,99,235,0.08)",    desc: "Sources HAS / guidelines" },
};

export const SOURCE_ICON: Record<string, typeof BookOpen> = {
  SEM:  Database,
  ALGO: GitBranch,
  KE:   FileText,
  PCR:  BookOpen,
  REF:  FileText,
};
