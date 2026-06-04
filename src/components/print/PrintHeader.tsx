/**
 * PrintHeader — letterhead Nami pour impression de comptes-rendus
 * et d'ordonnances.
 *
 * Invariants :
 *  - Le composant est rendu en permanence dans le DOM mais reste invisible à
 *    l'écran (classe `print-only` → `display: none` hors @media print).
 *  - Aucune PHI patient/soignant n'est rendue ici : le letterhead reste
 *    générique (nom Nami, URL publique, mention DM, type de document).
 *  - Le titre du document (ex. "Compte-rendu de consultation") est passé en
 *    prop pour que la page indique clairement la nature de l'impression
 *    sans révéler le nom du patient.
 */
interface PrintHeaderProps {
  /** Type de document imprimé — ex. "Compte-rendu de consultation". */
  documentLabel: string;
  /** Référence interne courte non identifiante (ex. ID consultation). */
  reference?: string;
}

export function PrintHeader({ documentLabel, reference }: PrintHeaderProps) {
  return (
    <div
      className="print-only print-letterhead"
      role="presentation"
      aria-hidden="true"
    >
      <div>
        <div className="print-letterhead-brand">Nami</div>
        <div className="print-letterhead-tagline">
          Coordination des parcours de soins
        </div>
      </div>
      <div className="print-letterhead-meta">
        <div>{documentLabel}</div>
        {reference ? <div>Réf. {reference}</div> : null}
        <div>namipourlavie.com</div>
      </div>
    </div>
  );
}
