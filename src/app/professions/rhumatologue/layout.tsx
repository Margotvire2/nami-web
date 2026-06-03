import type { Metadata } from "next"
import { PROFESSIONS_META } from "@/lib/seo-professions"
import { buildPageMetadata, buildServiceJsonLd, jsonLdScript, SITE_URL } from "@/lib/seo"

const SLUG = "rhumatologue" as const
const meta = PROFESSIONS_META[SLUG]
const path = `/professions/${SLUG}`

export const metadata: Metadata = buildPageMetadata({
  title: meta.metaTitle,
  description: meta.metaDescription,
  path,
  keywords: meta.keywords,
})

const serviceJsonLd = buildServiceJsonLd({
  name: `Coordination pluridisciplinaire — ${meta.label}`,
  description: meta.metaDescription,
  url: `${SITE_URL}${path}`,
  serviceType: meta.serviceType,
})

export default function ProfessionLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={jsonLdScript(serviceJsonLd)} />
      {children}
    </>
  )
}
