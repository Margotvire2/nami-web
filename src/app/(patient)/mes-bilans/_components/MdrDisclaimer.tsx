/**
 * Disclaimer contextuel "interprétation médecin" pour les vues bilans.
 * Le footer global (PatientLegalFooter) couvre déjà "Non dispositif médical" —
 * on ajoute ici uniquement la mention spécifique à l'interprétation.
 */
export function MdrDisclaimer() {
  return (
    <p
      style={{
        marginTop: 32,
        fontSize: 12,
        color: "#6B7280",
        textAlign: "center",
        lineHeight: 1.5,
        padding: "0 16px",
      }}
    >
      Pour interpréter ces résultats, parlez-en à votre médecin.
    </p>
  );
}
