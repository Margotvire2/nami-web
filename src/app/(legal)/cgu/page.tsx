import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation — Nami",
  description: "Conditions Générales d'Utilisation de la plateforme Nami",
};

export default function CguPage() {
  return (
    <article className="prose prose-sm max-w-none">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Conditions Générales d&apos;Utilisation</h1>
      <p className="text-sm text-gray-400 mb-8">Dernière mise à jour : avril 2026</p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">1. Objet et champ d&apos;application</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Nami est une plateforme d&apos;organisation et de coordination des parcours de soins pluridisciplinaires,
          destinée exclusivement aux professionnels de santé habilités (ci-après « Utilisateurs »).
          Elle ne constitue pas un logiciel médical, un dispositif médical, ni un système d&apos;aide à la décision clinique.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation
          de la plateforme accessible à l&apos;adresse <strong>nami-web-orpin.vercel.app</strong>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">2. Accès au service</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          L&apos;accès à Nami est réservé aux professionnels de santé disposant d&apos;un numéro RPPS valide
          ou d&apos;un accès accordé par leur établissement. L&apos;Utilisateur est responsable
          de la confidentialité de ses identifiants de connexion.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Nami se réserve le droit de suspendre tout accès en cas de manquement aux présentes CGU.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">3. Nature du service et limites</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Nami fournit des outils d&apos;organisation, de centralisation documentaire et de coordination d&apos;équipe.
          Les fonctionnalités de synthèse assistée produisent des <strong>brouillons à usage interne</strong>,
          soumis à la validation obligatoire du professionnel de santé responsable.
        </p>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-3">
          <p className="text-sm text-amber-800 font-medium">
            Aucun contenu généré par Nami ne constitue un avis médical, un diagnostic ou une recommandation thérapeutique.
            La responsabilité clinique demeure intégralement celle du professionnel de santé.
          </p>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          L&apos;Utilisateur s&apos;engage à ne pas utiliser les synthèses assistées comme seul fondement
          d&apos;une décision médicale.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">4. Données de santé et hébergement</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Les données à caractère personnel de santé sont hébergées auprès d&apos;un hébergeur certifié
          Hébergeur de Données de Santé (HDS) conformément à l&apos;article L.1111-8 du Code de la santé publique.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          L&apos;Utilisateur est responsable du traitement des données des patients qu&apos;il intègre dans la plateforme
          et s&apos;engage à recueillir leur consentement conformément au RGPD et aux textes spécifiques applicables
          aux données de santé.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">5. Obligations de l&apos;Utilisateur</h2>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li>Utiliser la plateforme conformément à sa destination professionnelle</li>
          <li>Ne pas partager ses identifiants avec des tiers</li>
          <li>Valider tout contenu assisté avant toute utilisation clinique</li>
          <li>Obtenir le consentement des patients avant d&apos;intégrer leurs données</li>
          <li>Signaler tout incident de sécurité à l&apos;équipe Nami</li>
        </ul>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">6. Propriété intellectuelle</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          La plateforme Nami, son interface, ses algorithmes et ses bases de connaissances sont la propriété exclusive
          de la société éditrice. Toute reproduction ou exploitation non autorisée est interdite.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">7. Modification et résiliation</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Nami se réserve le droit de modifier les présentes CGU à tout moment. Les Utilisateurs seront notifiés
          par email de toute modification substantielle. La poursuite de l&apos;utilisation après notification
          vaut acceptation des nouvelles CGU.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">8. Droit applicable</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Les présentes CGU sont soumises au droit français. Tout litige sera porté devant les juridictions
          compétentes du ressort de Paris.
        </p>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">9. Contact</h2>
        <p className="text-sm text-gray-600 leading-relaxed">
          Pour toute question relative aux présentes CGU : <strong>contact@nami-sante.fr</strong>
        </p>
      </section>
    </article>
  );
}
