import type { Metadata } from "next"
import Link from "next/link"
import { Search, MapPin, Users } from "lucide-react"

export const metadata: Metadata = {
  title: "Annuaire des professionnels de santé en France — 564 000+ praticiens",
  description:
    "Trouvez un médecin, pédiatre, diététicien, psychologue, kinésithérapeute, orthophoniste parmi 564 000+ professionnels de santé en France. Convention, secteur, téléphone, adresse.",
  keywords: [
    "annuaire médecin", "trouver médecin", "pédiatre", "diététicien",
    "psychologue", "orthophoniste", "kinésithérapeute", "professionnel de santé",
    "secteur 1", "secteur 2", "annuaire santé", "ameli",
  ],
  openGraph: {
    title: "Annuaire Santé France — 564 000+ professionnels | Nami",
    description: "Recherchez n'importe quel professionnel de santé en France. Convention, adresse, téléphone.",
  },
  alternates: { canonical: "/annuaire-public" },
}

const TOP_SPECIALTIES = [
  { slug: "medecin-generaliste", label: "Médecin généraliste", count: "66 000" },
  { slug: "pediatre", label: "Pédiatre", count: "6 700" },
  { slug: "cardiologue", label: "Cardiologue", count: "10 500" },
  { slug: "psychiatre", label: "Psychiatre", count: "7 600" },
  { slug: "dieteticien", label: "Diététicien", count: "4 200" },
  { slug: "orthophoniste", label: "Orthophoniste", count: "24 400" },
  { slug: "masseur-kinesitherapeute", label: "Kinésithérapeute", count: "88 600" },
  { slug: "infirmier", label: "Infirmier", count: "107 000" },
  { slug: "ophtalmologiste", label: "Ophtalmologiste", count: "10 800" },
  { slug: "gynecologiste", label: "Gynécologue", count: "7 400" },
  { slug: "dermatologue", label: "Dermatologue", count: "4 100" },
  { slug: "gastro-enterologue", label: "Gastro-entérologue", count: "3 500" },
  { slug: "endocrinologue", label: "Endocrinologue", count: "2 800" },
  { slug: "pneumologue", label: "Pneumologue", count: "3 200" },
  { slug: "radiologue", label: "Radiologue", count: "32 800" },
  { slug: "sage-femme", label: "Sage-femme", count: "10 300" },
]

const TOP_CITIES = [
  "Paris", "Lyon", "Marseille", "Toulouse", "Bordeaux", "Lille",
  "Nantes", "Strasbourg", "Montpellier", "Nice", "Rennes", "Grenoble",
]

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Annuaire des professionnels de santé en France",
  description: "564 000+ professionnels de santé. Médecins, paramédicaux, centres de santé.",
  url: "https://namipourlavie.com/annuaire-public",
  isPartOf: { "@type": "WebSite", name: "Nami", url: "https://namipourlavie.com" },
  about: { "@type": "MedicalBusiness", name: "Professionnels de santé en France" },
}

const jsonLdSpecialties = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: "Spécialités médicales — Annuaire Nami",
  description: "Liste des spécialités médicales disponibles dans l'annuaire Nami.",
  itemListElement: TOP_SPECIALTIES.map((s, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: s.label,
    url: `https://namipourlavie.com/annuaire-public/${s.slug}`,
  })),
}

export default function AnnuairePublicPage() {
  return (
    <div className="min-h-screen bg-[#F0F2FA]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLdSpecialties) }} />

      {/* Navbar */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-[#4F46E5]">nami</Link>
          <div className="flex items-center gap-4">
            <Link href="/pathologies" className="hidden sm:block text-sm text-gray-500 hover:text-gray-700">Pathologies</Link>
            <Link href="/soignants" className="hidden sm:block text-sm text-gray-500 hover:text-gray-700">Soignants Nami</Link>
            <Link href="/login" className="rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white hover:opacity-90">
              Se connecter
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-5xl px-4 py-10">
        {/* Hero */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Annuaire des professionnels de sant&eacute; en France
          </h1>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
            564 000+ m&eacute;decins, param&eacute;dicaux et centres de sant&eacute;.
            Trouvez un praticien par sp&eacute;cialit&eacute; et par ville.
          </p>
          <p className="text-xs text-gray-400 mt-2">
            Source : Annuaire Sant&eacute; Ameli (CNAM) — data.gouv.fr — Licence Ouverte 2.0
          </p>
        </div>

        {/* Search by specialty */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Search size={18} /> Par sp&eacute;cialit&eacute;
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {TOP_SPECIALTIES.map((s) => (
              <Link
                key={s.slug}
                href={`/annuaire-public/${s.slug}`}
                className="rounded-xl border bg-white p-4 hover:shadow-md hover:border-[#4F46E5]/20 transition-all group"
              >
                <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#4F46E5]">{s.label}</h3>
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <Users size={10} /> {s.count} praticiens
                </p>
              </Link>
            ))}
          </div>
        </section>

        {/* Search by city */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MapPin size={18} /> Par ville
          </h2>
          <div className="flex flex-wrap gap-2">
            {TOP_CITIES.map((city) => (
              <Link
                key={city}
                href={`/annuaire-public/medecin-generaliste-${city.toLowerCase().replace(/\s+/g, "-")}`}
                className="px-4 py-2 rounded-full bg-white border text-sm text-gray-700 hover:border-[#4F46E5]/30 hover:text-[#4F46E5] transition-all"
              >
                {city}
              </Link>
            ))}
          </div>
        </section>

        {/* Cross-links speciality × city for SEO */}
        <section className="mb-10">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Recherches fr&eacute;quentes</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
            {[
              "Pédiatre Paris", "Diététicien Lyon", "Psychologue Bordeaux",
              "Cardiologue Marseille", "Orthophoniste Toulouse", "Endocrinologue Nantes",
              "Psychiatre Lille", "Gastro-entérologue Paris", "Dermatologue Lyon",
              "Kinésithérapeute Strasbourg", "Sage-femme Montpellier", "Pédiatre Lyon",
              "Diététicien Paris", "Psychologue Paris", "Pneumologue Marseille",
            ].map((q) => {
              const slug = q.toLowerCase().replace(/\s+/g, "-").replace(/é/g, "e").replace(/è/g, "e")
              return (
                <Link
                  key={q}
                  href={`/annuaire-public/${slug}`}
                  className="text-gray-600 hover:text-[#4F46E5] hover:underline"
                >
                  {q}
                </Link>
              )
            })}
          </div>
        </section>

        {/* CTA */}
        <div className="rounded-xl border bg-white p-8 text-center shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Vous &ecirc;tes professionnel de sant&eacute; ?</h2>
          <p className="text-sm text-gray-500 mt-1">
            Cr&eacute;ez votre profil v&eacute;rifi&eacute; sur Nami et rejoignez un r&eacute;seau de coordination clinique.
          </p>
          <div className="flex justify-center gap-3 mt-4">
            <Link href="/signup" className="rounded-lg bg-[#4F46E5] px-5 py-2.5 text-sm font-medium text-white hover:opacity-90">
              Cr&eacute;er mon profil
            </Link>
          </div>
        </div>

        {/* Legal */}
        <p className="text-[10px] text-gray-400 text-center mt-8">
          Donn&eacute;es issues de l&apos;Annuaire Sant&eacute; Ameli (CNAM), publi&eacute;es sur data.gouv.fr sous Licence Ouverte 2.0.
          Derni&egrave;re mise &agrave; jour : avril 2026. Pour signaler une erreur ou demander la suppression de vos donn&eacute;es, contactez-nous.
        </p>
      </div>
    </div>
  )
}
