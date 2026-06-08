import type { ProtocolContent, PathwayTemplateStep, PathwayNode } from "@/lib/api";

export type BriefCardType = "EVALUATION" | "SUIVI" | "RCP";

export function deriveCardType(
  step: { clinicalActType: string; protocolContent: ProtocolContent | null }
): BriefCardType {
  if (step.protocolContent?.cardType) return step.protocolContent.cardType;
  if (step.clinicalActType === "RCP") return "RCP";
  if (step.clinicalActType === "SUIVI") return "SUIVI";
  return "EVALUATION";
}

export type StepState = "done" | "current" | "upcoming" | "conditional";

export function deriveStepState(
  node: PathwayNode | null,
  stepIndex: number,
  totalNodes: number
): StepState {
  if (!node) {
    return stepIndex === 0 ? "current" : "upcoming";
  }
  if (node.status === "COMPLETED") return "done";
  if (node.status === "IN_WINDOW" || node.status === "APPROACHING" || node.status === "OVERDUE") return "current";
  if (!node.isRequired) return "conditional";
  return "upcoming";
}

export interface UnifiedStep {
  id: string;
  stepIndex: number;
  clinicalActType: string;
  specialty: string | null;
  actLabel: string;
  isRequired: boolean;
  phaseLabel: string | null;
  sourceRef: string | null;
  protocolContent: ProtocolContent | null;
  // node présent uniquement si instancié
  node?: PathwayNode;
  state: StepState;
}

export function buildUnifiedSteps(
  templateSteps: PathwayTemplateStep[],
  nodes: PathwayNode[]
): UnifiedStep[] {
  const nodeByTemplateId = new Map<string, PathwayNode>();
  for (const n of nodes) {
    if (n.templateStepId) nodeByTemplateId.set(n.templateStepId, n);
  }

  return templateSteps.map((step, idx) => {
    const node = nodeByTemplateId.get(step.id);
    const protocolContent =
      node?.PathwayTemplateStep?.protocolContent ?? step.protocolContent;
    const state = deriveStepState(node ?? null, idx, templateSteps.length);
    return {
      id: step.id,
      stepIndex: step.stepIndex,
      clinicalActType: step.clinicalActType,
      specialty: step.specialty,
      actLabel: step.actLabel,
      isRequired: step.isRequired,
      phaseLabel: step.phaseLabel,
      sourceRef: step.sourceRef,
      protocolContent,
      node,
      state,
    };
  });
}

export interface PhaseGroup {
  label: string;
  steps: UnifiedStep[];
}

export function groupStepsByPhase(steps: UnifiedStep[]): PhaseGroup[] {
  const groups: PhaseGroup[] = [];
  const seen = new Map<string, PhaseGroup>();
  for (const step of steps) {
    const key = step.phaseLabel ?? "—";
    if (!seen.has(key)) {
      const g: PhaseGroup = { label: key, steps: [] };
      seen.set(key, g);
      groups.push(g);
    }
    seen.get(key)!.steps.push(step);
  }
  return groups;
}

const ROMAN: [number, string][] = [
  [4, "IV"], [1, "I"], [9, "IX"], [5, "V"], [40, "XL"], [10, "X"],
  [90, "XC"], [50, "L"], [400, "CD"], [100, "C"],
];

export function toRoman(n: number): string {
  if (n < 1) return "";
  let result = "";
  let rem = n;
  for (const [val, sym] of ROMAN.sort((a, b) => b[0] - a[0])) {
    while (rem >= val) { result += sym; rem -= val; }
  }
  return result;
}
