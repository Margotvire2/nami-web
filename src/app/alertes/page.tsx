import { redirect } from 'next/navigation';

// Page /alertes archivée pour conformité MDR (session compliance 1er mai 2026)
// Les alertes automatiques présentent un risque de qualification DM Class IIa.
// Redirection vers /taches jusqu'au marquage CE.
// Pour réactiver : src/app/_archived/alertes-archived-mdr-20260501/
export default function AlertesPage() {
  redirect('/taches');
}
