import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { ArrowLeft, Phone, MapPin, CreditCard, Shield, Building2, Users } from "lucide-react"

export const revalidate = 86400 // 24h

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000"

// Parse slug : "pediatre-paris" → { specialty: "Pédiatre", city: "PARIS" }
function parseSlug(slug: string): { specialty: string; city: string | null; raw: string } {
  const decoded = decodeURIComponent(slug)
  const SPECIALTIES_MAP: Record<string, string> = {
    "medecin-generaliste": "Médecin généraliste",
    "pediatre": "Pédiatre",
    "cardiologue": "Cardiologue",
    "psychiatre": "Psychiatre",
    "dieteticien": "Diététicien",
    "orthophoniste": "Orthophoniste",
    "masseur-kinesitherapeute": "Masseur-kinésithérapeute",
    "kinesitherapeute": "Masseur-kinésithérapeute",
    "infirmier": "Infirmier",
    "ophtalmologiste": "Ophtalmologiste",
    "gynecologiste": "Gynécologue / Obstétricien",
    "gynecologue": "Gynécologue / Obstétricien",
    "dermatologue": "Dermatologue",
    "gastro-enterologue": "Gastro-entérologue",
    "endocrinologue": "Endocrinologue",
    "pneumologue": "Pneumologue",
    "radiologue": "Radiologue",
    "sage-femme": "Sage-femme",
    "psychologue": "Psychologue",
    "neurologue": "Neurologue",
    "rhumatologue": "Rhumatologue",
    "orl": "ORL",
    "chirurgien-dentiste": "Chirurgien-dentiste",
    "pharmacien": "Pharmacien",
  }

  // Try specialty-city pattern
  for (const [key, label] of Object.entries(SPECIALTIES_MAP)) {
    if (decoded.startsWith(key + "-")) {
      const cityPart = decoded.slice(key.length + 1)
      return { specialty: label, city: cityPart.toUpperCase().replace(/-/g, " "), raw: decoded }
    }
    if (decoded === key) {
      return { specialty: label, city: null, raw: decoded }
    }
  }

  // Fallback — try as free text
  return { specialty: decoded.replace(/-/g, " "), city: null, raw: decoded }
}

interface DirectoryEntry {
  id: string
  type: string
  name: string
  lastName: string
  firstName: string | null
  specialty: string
  specialtyCode: string
  convention: string | null
  conventionCode: string | null
  option: string | null
  carteVitale: boolean
  phone: string | null
  address: string
  postalCode: string
  city: string
}

async function searchDirectory(specialty: string, city: string | null): Promise<{ results: DirectoryEntry[]; total: number }> {
  try {
    const params = new URLSearchParams({ specialty, limit: "50" })
    if (city) params.set("city", city)
    const res = await fetch(`${API_URL}/annuaire/directory?${params}`, {
      next: { revalidate: 86400 },
      signal: AbortSignal.timeout(8000),
    })
    if (!res.ok) return { results: [], total: 0 }
    return res.json()
  } catch {
    return { results: [], total: 0 }
  }
}

export async function generateStaticParams() {
  const TOP_SLUGS = [
    "medecin-generaliste", "pediatre", "cardiologue", "psychiatre",
    "dieteticien", "orthophoniste", "masseur-kinesitherapeute", "infirmier",
    "ophtalmologiste", "gynecologiste", "dermatologue", "gastro-enterologue",
    "endocrinologue", "pneumologue", "radiologue", "sage-femme", "psychologue",
    "neurologue", "rhumatologue", "orl",
    "dieteticien-paris", "pediatre-paris", "psychiatre-paris", "psychologue-paris",
    "dieteticien-lyon", "pediatre-lyon", "medecin-generaliste-paris",
    "medecin-generaliste-lyon", "medecin-generaliste-marseille",
  ]
  return TOP_SLUGS.map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const { specialty, city } = parseSlug(slug)
  const locationStr = city ? ` \u00e0 ${city.charAt(0) + city.slice(1).toLowerCase()}` : " en France"
  const title = `${specialty}${locationStr} — Annuaire des professionnels de sant\u00e9`
  const description = `Trouvez un ${specialty.toLowerCase()}${locationStr}. Convention, secteur, t\u00e9l\u00e9phone, adresse. Annuaire de 564 000+ professionnels.`

  return {
    title,
    description,
    openGraph: { title: title + " | Nami", description },
    alternates: { canonical: `/annuaire-public/${slug}` },
  }
}

export default async function AnnuaireSlugPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { specialty, city } = parseSlug(slug)
  const { results, total } = await searchDirectory(specialty, city)

  const locationStr = city ? ` \u00e0 ${city.charAt(0) + city.slice(1).toLowerCase()}` : ""
  const titleStr = `${specialty}${locationStr}`

  // JSON-LD
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${specialty}${locationStr}`,
    description: `Liste des ${specialty.toLowerCase()}s${locationStr}. ${total} r\u00e9sultats.`,
    numberOfItems: total,
    itemListElement: results.slice(0, 20).map((r, i) => ({
      "@type": "ListItem",
      position: i + 1,
      item: {
        "@type": "Physician",
        name: r.name,
        medicalSpecialty: r.specialty,
        address: { "@type": "PostalAddress", addressLocality: r.city, postalCode: r.postalCode, addressCountry: "FR" },
        ...(r.phone ? { telephone: r.phone } : {}),
      },
    })),
  }

  return (
    <div className="min-h-screen bg-[#F0F2FA]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <nav className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-[#4F46E5]">nami</Link>
          <div className="flex items-center gap-4">
            <Link href="/annuaire-public" className="text-sm text-gray-500 hover:text-gray-700">Annuaire</Link>
            <Link href="/login" className="rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
              Se connecter
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-8">
        <Link href="/annuaire-public" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-4">
          <ArrowLeft className="size-4" /> Annuaire
        </Link>

        <h1 className="text-2xl font-bold text-gray-900">{titleStr}</h1>
        <p className="text-sm text-gray-500 mt-1 flex items-center gap-1">
          <Users size={14} /> {total.toLocaleString()} professionnel{total > 1 ? "s" : ""} trouv&eacute;{total > 1 ? "s" : ""}
        </p>

        {results.length === 0 ? (
          <div className="mt-10 text-center py-16">
            <p className="text-sm text-gray-500">Aucun r&eacute;sultat pour cette recherche.</p>
            <Link href="/annuaire-public" className="text-sm text-[#4F46E5] hover:underline mt-2 inline-block">
              Retour &agrave; l&apos;annuaire
            </Link>
          </div>
        ) : (
          <div className="mt-6 space-y-2">
            {results.map((r) => (
              <div key={r.id} className="rounded-xl border bg-white p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                    r.type === "CDS" ? "bg-emerald-50 text-emerald-700" : "bg-[#4F46E5]/5 text-[#4F46E5]"
                  }`}>
                    {r.type === "CDS" ? <Building2 size={14} /> : `${(r.firstName ?? "?")[0]}${r.lastName[0]}`.toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{r.name}</p>
                    <p className="text-[11px] text-gray-500">{r.specialty}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <span className="text-[10px] text-gray-400 flex items-center gap-0.5">
                        <MapPin size={9} /> {r.city} ({r.postalCode?.slice(0, 2)})
                      </span>
                      {r.convention && (
                        <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${
                          r.conventionCode === "1" ? "bg-emerald-50 text-emerald-700"
                            : r.conventionCode === "2" ? "bg-amber-50 text-amber-700"
                            : "bg-gray-100 text-gray-600"
                        }`}>{r.convention}</span>
                      )}
                      {r.option && (
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-50 text-blue-700">{r.option}</span>
                      )}
                      {r.carteVitale && (
                        <span className="text-[10px] text-gray-400 flex items-center gap-0.5"><CreditCard size={9} /> CV</span>
                      )}
                    </div>
                  </div>
                  {r.phone && (
                    <a href={`tel:${r.phone}`} className="hidden sm:flex items-center gap-1 text-xs text-gray-500 hover:text-[#4F46E5] shrink-0">
                      <Phone size={12} /> {r.phone.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, "$1 $2 $3 $4 $5")}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {total > 50 && (
          <p className="text-xs text-gray-400 text-center mt-6">
            {total.toLocaleString()} r&eacute;sultats au total. Affinez votre recherche pour voir plus de r&eacute;sultats.
          </p>
        )}

        {/* Related searches */}
        <div className="mt-10 rounded-xl border bg-white p-6">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">Recherches associ&eacute;es</h2>
          <div className="flex flex-wrap gap-2">
            {["Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux", "Lille"].map((c) => {
              if (city && c.toUpperCase() === city) return null
              const s = specialty.toLowerCase().replace(/\s+/g, "-").replace(/[éè]/g, "e").replace(/[/]/g, "-")
              return (
                <Link
                  key={c}
                  href={`/annuaire-public/${s}-${c.toLowerCase()}`}
                  className="px-3 py-1.5 rounded-full bg-gray-50 text-xs text-gray-600 hover:bg-[#4F46E5]/5 hover:text-[#4F46E5] transition-colors"
                >
                  {specialty} &agrave; {c}
                </Link>
              )
            })}
          </div>
        </div>

        <p className="text-[10px] text-gray-400 text-center mt-8">
          Source : Annuaire Sant&eacute; Ameli (CNAM), data.gouv.fr — Licence Ouverte 2.0.
          Pour signaler une erreur ou demander la suppression de vos donn&eacute;es, contactez-nous.
        </p>
      </div>
    </div>
  )
}
