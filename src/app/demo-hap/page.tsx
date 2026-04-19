import type { Metadata } from "next"
import { DemoWalkthroughHAPClient } from "./DemoWalkthroughHAPClient"

export const metadata: Metadata = {
  title: "Nami · Une journée sur Nami · Clinique Pédiatrique",
  description:
    "Découvrez comment une équipe pédiatrique utilise Nami au quotidien : dashboard, enregistrement consultation, parcours de soins, coordination pluridisciplinaire.",
  robots: { index: false, follow: false },
}

export default function DemoHAPPage() {
  return <DemoWalkthroughHAPClient />
}
