import type { Metadata } from "next"
import Link from "next/link"
import { PATHOLOGIES, CATEGORY_LABELS } from "@/lib/data/pathologies"

export const metadata: Metadata = {
  title: "Pathologies — Fiches cliniques et parcours de soins",
  description:
    "Fiches cliniques complètes : TCA (anorexie, boulimie, BED, ARFID), obésité, diabète, SOPK, NAFLD, dépression, anxiété. Critères diagnostiques, bilans, traitements. Sources HAS, FFAB, ESPGHAN.",
  openGraph: {
    title: "Pathologies — Fiches cliniques | Nami",
    description: "Fiches cliniques validées pour les parcours de soins complexes. TCA, obésité, métabolisme, pédiatrie, santé mentale.",
  },
}

export default function PathologiesPage() {
  const grouped = PATHOLOGIES.reduce((acc, p) => {
    if (!acc[p.category]) acc[p.category] = []
    acc[p.category].push(p)
    return acc
  }, {} as Record<string, typeof PATHOLOGIES>)

  const categoryOrder = ["tca", "metabolique", "psy", "cardio", "pediatrie"]

  return (
    <div className="min-h-screen bg-[#F0F2FA]">
      {/* Navbar */}
      <nav className="border-b bg-white">
        <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-4">
          <Link href="/" className="text-lg font-bold text-[#4F46E5]">nami</Link>
          <div className="flex items-center gap-4">
            <Link href="/soignants" className="text-sm text-gray-500 hover:text-gray-700">Annuaire</Link>
            <Link href="/login" className="rounded-lg bg-[#4F46E5] px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition-opacity">
              Se connecter
            </Link>
          </div>
        </div>
      </nav>

      <div className="mx-auto max-w-4xl px-4 py-10">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold text-gray-900">
            Fiches cliniques
          </h1>
          <p className="mt-3 text-gray-500 max-w-2xl mx-auto leading-relaxed">
            Informations cliniques valid&eacute;es par les soci&eacute;t&eacute;s savantes (HAS, FFAB, ESPGHAN, SFP).
            Crit&egrave;res diagnostiques, bilans, traitements et parcours de soins.
          </p>
        </div>

        {/* Categories */}
        <div className="space-y-8">
          {categoryOrder.map((cat) => {
            const items = grouped[cat]
            if (!items?.length) return null
            const meta = CATEGORY_LABELS[cat]
            return (
              <section key={cat}>
                <h2 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
                  {meta.label}
                </h2>
                <div className="grid gap-3 sm:grid-cols-2">
                  {items.map((p) => (
                    <Link
                      key={p.slug}
                      href={`/pathologies/${p.slug}`}
                      className="group rounded-xl border bg-white p-5 shadow-sm hover:shadow-md hover:border-[#4F46E5]/20 transition-all"
                    >
                      <div className="flex items-start gap-3">
                        <span className="text-2xl">{p.emoji}</span>
                        <div className="min-w-0">
                          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-[#4F46E5] transition-colors">
                            {p.shortTitle}
                          </h3>
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {p.description}
                          </p>
                          {p.cim11 && (
                            <span className="inline-block mt-2 text-[10px] font-mono text-gray-400 bg-gray-50 px-1.5 py-0.5 rounded">
                              CIM-11 : {p.cim11}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        {/* SEO footer text */}
        <div className="mt-16 border-t pt-8 text-center">
          <p className="text-xs text-gray-400 max-w-xl mx-auto leading-relaxed">
            Ces fiches cliniques sont destin&eacute;es aux professionnels de sant&eacute; et sont bas&eacute;es sur les recommandations
            de la Haute Autorit&eacute; de Sant&eacute; (HAS), la FFAB, l&apos;ESPGHAN, la SFP et les soci&eacute;t&eacute;s savantes.
            Elles ne remplacent pas une consultation m&eacute;dicale.
          </p>
          <p className="text-xs text-gray-300 mt-2">
            &copy; {new Date().getFullYear()} Nami — Coordination des parcours de soins complexes
          </p>
        </div>
      </div>
    </div>
  )
}
