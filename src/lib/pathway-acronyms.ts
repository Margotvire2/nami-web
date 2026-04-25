const ACRONYMS: Record<string, string> = {
  AOMI: "Artériopathie oblitérante des membres inférieurs",
  TCA: "Troubles du comportement alimentaire",
  PCR: "Parcours de coordination renforcée",
  HTA: "Hypertension artérielle",
  IRC: "Insuffisance rénale chronique",
  MICI: "Maladies inflammatoires chroniques de l'intestin",
  BPCO: "Bronchopneumopathie chronique obstructive",
  SOPK: "Syndrome des ovaires polykystiques",
};

export function expandPathwayLabel(label: string): string {
  const upper = label.toUpperCase().split(/\s+/)[0];
  const expansion = ACRONYMS[upper];
  if (!expansion) return label;
  return label.replace(new RegExp(`^${upper}`, "i"), `${upper} — ${expansion}`);
}
