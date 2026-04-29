import type { Metadata } from "next"
import { DemoWalkthroughClient } from "./DemoWalkthroughClient"

export const metadata: Metadata = {
  title: "Nami · Une journée sur Nami · Démo",
  description:
    "Découvrez comment un médecin utilise Nami au quotidien : dashboard, enregistrement consultation, parcours de soins, coordination d'équipe, base documentaire.",
  robots: { index: true, follow: true },
}

export default function DemoPage() {
  return <DemoWalkthroughClient />
}
