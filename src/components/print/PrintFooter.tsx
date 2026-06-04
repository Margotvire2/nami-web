/**
 * PrintFooter — pied de page imprimable : date d'édition + zone de
 * signature manuscrite + mention légale Nami.
 *
 * Invariants :
 *  - Le composant est rendu en permanence mais reste invisible à l'écran
 *    (classe `print-only`).
 *  - La date est formatée en fr-FR pour un usage métropolitain.
 *  - Aucune signature numérique n'est apposée ici : c'est une zone
 *    manuscrite, conforme à un usage papier traditionnel.
 *  - La mention "Nami n'est pas un dispositif médical" est obligatoire
 *    (CLAUDE.md §wording légal).
 */
interface PrintFooterProps {
  /** Label de la signature attendue (ex. "Signature du soignant"). */
  signatureLabel?: string;
  /** Date d'édition. Par défaut, la date actuelle. */
  date?: Date;
}

function formatDate(d: Date): string {
  return d.toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export function PrintFooter({
  signatureLabel = "Signature",
  date,
}: PrintFooterProps) {
  const editedAt = date ?? new Date();

  return (
    <div
      className="print-only print-footer"
      role="presentation"
      aria-hidden="true"
    >
      <div className="print-footer-row">
        <div className="print-footer-date">
          Édité le {formatDate(editedAt)}
        </div>
        <div className="print-footer-signature">
          <div className="print-footer-signature-line" />
          <div>{signatureLabel}</div>
        </div>
      </div>
      <div className="print-footer-mentions">
        Document généré depuis Nami — coordination des parcours de soins.
        Nami n&apos;est pas un dispositif médical.
      </div>
    </div>
  );
}
