import type { Metadata } from "next"
import { GabrielleCaseStudy } from "@/components/pitch/GabrielleCaseStudy"

export const metadata: Metadata = {
  title: "Nami — Gabrielle, 10 ans · Case Study",
  description: "L'histoire d'un parcours de soins où la compétence était là. La volonté aussi. Mais pas l'infrastructure.",
  robots: { index: false, follow: false },
}

export default function GabriellePage() {
  return <GabrielleCaseStudy />
}
