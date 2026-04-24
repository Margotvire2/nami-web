import type { Metadata } from "next"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Méthode éditoriale — Nami",
  description: "Comment l'équipe Nami élabore ses contenus santé : sources, processus de relecture, mise à jour et engagements éditoriaux.",
  alternates: { canonical: "/methodologie-editoriale" },
}

const SOURCES = [
  { name: "Haute Autorité de Santé (HAS)", url: "https://www.has-sante.fr", role: "Recommandations cliniques françaises" },
  { name: "Fédération Française Anorexie Boulimie (FFAB)", url: "https://www.ffab.fr", role: "Référentiel TCA" },
  { name: "Société Française de Pédiatrie (SFP)", url: "https://www.sfpediatrie.com", role: "Pédiatrie et nutrition infantile" },
  { name: "Société Française de Nutrition (SFN)", url: "https://www.sf-nutrition.org", role: "Nutrition clinique" },
  { name: "Organisation Mondiale de la Santé (OMS)", url: "https://www.who.int/fr", role: "Références internationales" },
  { name: "PubMed / Cochrane", url: "https://pubmed.ncbi.nlm.nih.gov", role: "Études randomisées et méta-analyses" },
  { name: "CIM-11 / ICD-11 (OMS)", url: "https://icd.who.int/fr", role: "Classifications diagnostiques" },
  { name: "Agence Nationale de Sécurité du Médicament (ANSM)", url: "https://ansm.sante.fr", role: "Médicaments et thérapeutiques" },
]

export default function MethodologieEditoriale() {
  return (
    <article className="prose prose-sm max-w-none">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Méthode éditoriale</h1>
      <p className="text-sm text-gray-400 mb-8">
        Comment l&apos;équipe Nami produit et maintient ses contenus santé
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Qui écrit les contenus ?</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Les contenus publiés sur namipourlavie.com sont élaborés par l&apos;équipe Nami, composée
          de professionnels de santé — diététiciens-nutritionnistes, médecins et spécialistes des
          parcours de soins complexes. Nami est fondée par Margot Vire, diététicienne spécialisée
          dans les troubles du comportement alimentaire (TCA), inscrite au tableau de l&apos;Ordre
          des Diététiciens (RPPS 10007322976).
        </p>
        <p className="text-sm text-gray-600 leading-relaxed mt-3">
          Chaque article est produit à partir des recommandations officielles des sociétés savantes
          françaises et internationales, puis relu par un professionnel de santé avant publication.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Nos sources de référence</h2>
        <p className="text-sm text-gray-600 mb-4">
          Nous utilisons exclusivement des sources de rang 1 — autorités nationales, sociétés savantes
          et revues à comité de lecture. Wikipédia, forums et sites non médicaux sont exclus.
        </p>
        <div className="space-y-3">
          {SOURCES.map((s) => (
            <div key={s.name} className="flex items-start gap-3 text-sm">
              <span className="w-2 h-2 rounded-full bg-[#5B4EC4] flex-shrink-0 mt-1.5" />
              <div>
                <a href={s.url} target="_blank" rel="noopener noreferrer"
                  className="font-medium text-[#5B4EC4] hover:underline">{s.name}</a>
                <span className="text-gray-500"> — {s.role}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Processus de relecture</h2>
        <div className="space-y-3 text-sm text-gray-600">
          <p>Chaque contenu suit ce processus avant publication :</p>
          <ol className="list-decimal list-inside space-y-2 ml-2">
            <li>Rédaction initiale à partir des recommandations officielles référencées</li>
            <li>Relecture par un professionnel de santé compétent dans le domaine</li>
            <li>Vérification de la conformité au wording réglementaire (MDR, Loi Kouchner)</li>
            <li>Ajout des sources citées en bas d&apos;article</li>
          </ol>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Mise à jour des contenus</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Les fiches pathologies et articles de blog sont révisés dès qu&apos;une recommandation
          officielle évolue, et au minimum une fois par an. La date de dernière révision est
          indiquée sur chaque page. Les recommandations HAS sont consultées régulièrement pour
          détecter les mises à jour publiées.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Ce que Nami n&apos;est pas</h2>
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium mb-1">Nami n&apos;est pas un dispositif médical.</p>
          <p className="leading-relaxed">
            Les contenus publiés sur ce site sont à visée informative et ne constituent pas un
            diagnostic, une prescription ou un avis médical. En cas de symptômes ou de questions
            de santé, consultez un professionnel de santé qualifié. En cas d&apos;urgence : <strong>15 ou 112</strong>.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Signaler une erreur</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Vous avez identifié une information inexacte ou une source manquante ?
          Écrivez-nous à{" "}
          <a href="mailto:contact@namipourlavie.com" className="text-[#5B4EC4] hover:underline">
            contact@namipourlavie.com
          </a>
          {" "}avec le lien de la page concernée. Nous traitons chaque signalement sous 72h.
        </p>
      </section>

      <div className="pt-4 border-t border-gray-100 text-xs text-gray-400">
        <Link href="/mentions-legales" className="hover:underline">Mentions légales</Link>
        {" · "}
        <Link href="/confidentialite" className="hover:underline">Politique de confidentialité</Link>
        {" · "}
        <Link href="/cgu" className="hover:underline">CGU</Link>
      </div>
    </article>
  )
}
