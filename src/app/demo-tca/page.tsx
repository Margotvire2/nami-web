import type { Metadata } from "next"
import { DemoWalkthroughTCAClient } from "./DemoWalkthroughTCAClient"

export const metadata: Metadata = {
  title: "Nami — Une journée sur Nami · Parcours TCA",
  description:
    "Découvrez comment une équipe TCA utilise Nami au quotidien : dashboard, enregistrement consultation, parcours de soins, coordination pluridisciplinaire.",
  robots: { index: false, follow: false },
}

export default function DemoTCAPage() {
  return <DemoWalkthroughTCAClient />
}
