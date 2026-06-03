import { redirect } from "next/navigation";

/**
 * /mes-bilans fusionné dans /mes-documents (F-UX-PATIENT-V1-LAUNCH-4).
 * Cette page redirige les anciens deep-links vers la sous-vue grid
 * "Mes bilans" de /mes-documents. Les sous-routes /mes-bilans/[id]
 * et /mes-bilans/upload restent fonctionnelles pour les flux profonds.
 */
export default function MesBilansPage() {
  redirect("/mes-documents?cat=BILANS");
}
