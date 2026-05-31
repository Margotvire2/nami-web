const PASTEL_BG = [
  "#EEEDFB", // violet pâle
  "#E0F2F1", // teal pâle
  "#FEF3C7", // amber pâle
  "#FCE7F3", // rose pâle
  "#DBEAFE", // blue pâle
  "#DCFCE7", // green pâle
];

function hashCode(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

export function avatarBg(seed: string): string {
  return PASTEL_BG[hashCode(seed) % PASTEL_BG.length];
}

export function initials(firstName: string, lastName: string): string {
  const f = (firstName ?? "").trim()[0] ?? "";
  const l = (lastName ?? "").trim()[0] ?? "";
  return `${f}${l}`.toUpperCase();
}
