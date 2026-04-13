import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — Nami",
  description: "Mentions légales de la plateforme Nami",
};

export default function MentionsLegalesPage() {
  return (
    <article className="prose prose-sm max-w-none">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Mentions légales</h1>
      <p className="text-sm text-gray-400 mb-8">Conformément à la loi n°2004-575 du 21 juin 2004 pour la confiance dans l&apos;économie numérique</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Éditeur</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Raison sociale :</strong> Nami</p>
          <p><strong>Forme juridique :</strong> SAS (en cours de constitution)</p>
          <p><strong>Directrice de publication :</strong> Margot Vire</p>
          <p><strong>Contact :</strong> contact@nami-sante.fr</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Hébergement</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Backend :</strong> Railway Technologies Inc. — San Francisco, CA, USA</p>
          <p><strong>Frontend :</strong> Vercel Inc. — San Francisco, CA, USA</p>
          <p><strong>Base de données :</strong> Supabase Inc. — région eu-west-3 (Paris)</p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Nature de la plateforme</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Nami est une plateforme d&apos;organisation et de coordination des parcours de soins pluridisciplinaires.
          Elle est destinée exclusivement aux professionnels de santé habilités.
        </p>
        <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
          <p className="text-sm text-gray-700">
            <strong>Nami n&apos;est pas un dispositif médical</strong> au sens du Règlement (UE) 2017/745 (MDR).
            Elle ne produit pas de diagnostic, ne formule pas de recommandations thérapeutiques et ne se substitue
            à aucune décision clinique. Toute synthèse générée est un brouillon soumis à la validation
            du professionnel de santé responsable.
          </p>
        </div>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Propriété intellectuelle</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          L&apos;ensemble des éléments constitutifs de la plateforme (code source, interface, bases de connaissances,
          marque Nami) est protégé par le droit de la propriété intellectuelle.
          Toute reproduction sans autorisation préalable est interdite.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Médiation et litiges</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          En cas de litige, et après tentative de résolution amiable, le droit français est applicable.
          Les juridictions compétentes sont celles du ressort de Paris.
        </p>
      </section>
    </article>
  );
}
