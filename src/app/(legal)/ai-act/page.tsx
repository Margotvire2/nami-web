import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Transparence IA — Nami",
  description:
    "Information sur l'utilisation de l'intelligence artificielle au sein de Nami : modèles, finalités, données traitées, sous-traitants, vos droits.",
};

export default function AiActPage() {
  return (
    <article className="prose prose-sm max-w-none">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Transparence sur l&apos;intelligence artificielle</h1>
      <p className="text-sm text-gray-400 mb-2">Dernière mise à jour : juin 2026</p>
      <p className="text-sm text-gray-500 mb-8">
        Cette page est publiée en application de l&apos;article 50 du règlement européen 2024/1689
        (« AI Act ») et de l&apos;article 13 du RGPD. Elle décrit, en langage clair, à quoi servent
        les fonctions d&apos;assistance par intelligence artificielle (IA) intégrées à Nami,
        et les choix qui vous sont laissés.
      </p>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">1. À quoi sert l&apos;IA dans Nami</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Nami met à disposition des soignants des fonctions d&apos;assistance qui s&apos;appuient sur
          des modèles d&apos;IA générative. Ces fonctions produisent uniquement des <strong>brouillons à usage interne</strong>,
          systématiquement signalés comme tels et soumis à la validation du professionnel de santé
          responsable.
        </p>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li>
            <strong>Transcription d&apos;une consultation enregistrée</strong> — conversion d&apos;une piste audio
            en texte, à la demande du soignant et après accord exprès du patient.
          </li>
          <li>
            <strong>Brouillon de compte-rendu</strong> — proposition de synthèse structurée à partir des
            notes saisies et de la transcription, à relire et à valider avant intégration au dossier.
          </li>
          <li>
            <strong>Aide à la recherche dans la base documentaire</strong> — restitution de passages
            issus de sources publiques référencées (HAS, Orphanet, DSM-5, BDPM…).
          </li>
        </ul>
        <p className="text-sm text-gray-600 leading-relaxed mt-3">
          Aucune fonction n&apos;établit de diagnostic, ne pose d&apos;indication thérapeutique, ni ne
          décide à la place du professionnel de santé. La responsabilité clinique reste intégralement
          celle du soignant.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">2. Quels modèles d&apos;IA Nami utilise</h2>
        <div className="rounded-lg border border-gray-200 bg-white p-4 mb-3 text-sm text-gray-700 space-y-3">
          <div>
            <p className="font-medium text-gray-900">Anthropic Claude (famille Sonnet / Haiku)</p>
            <p className="text-gray-600">
              Génération des brouillons de compte-rendu et des synthèses structurées.
              Hébergement Europe (région européenne du fournisseur), traitement transitoire en mémoire
              uniquement, aucune utilisation des données pour entraîner le modèle (DPA Zero Data Retention).
            </p>
          </div>
          <div>
            <p className="font-medium text-gray-900">OpenAI Whisper / équivalent</p>
            <p className="text-gray-600">
              Transcription de la piste audio. Traitement transitoire, fichier audio supprimé après
              transcription. Aucune réutilisation pour l&apos;entraînement.
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Les contrats de sous-traitance (DPA — <em>Data Processing Agreement</em>) signés avec ces
          fournisseurs encadrent strictement la finalité, la durée de traitement, la confidentialité et
          la suppression des données.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">3. Quelles données sont transmises</h2>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li>
            Pour la transcription : la piste audio de la consultation enregistrée, le temps du
            traitement (quelques secondes à quelques minutes).
          </li>
          <li>
            Pour la génération de brouillon : les notes saisies par le soignant et la transcription
            associée — pseudonymisées (prénom, nom, identifiants directs masqués) avant envoi à
            Anthropic.
          </li>
          <li>
            Pour la recherche dans la base documentaire : votre requête textuelle. Aucune donnée
            personnelle de patient n&apos;est transmise à ce titre.
          </li>
        </ul>
        <p className="text-sm text-gray-600 leading-relaxed mt-3">
          Les données circulent en transit chiffré (TLS 1.2+) et ne sont pas conservées par les
          sous-traitants au-delà du temps strictement nécessaire au traitement.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">4. Votre consentement</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Aucune consultation n&apos;est enregistrée sans votre accord exprès. Avant le premier
          enregistrement, un bandeau d&apos;information vous demande explicitement si vous acceptez
          que la consultation soit enregistrée et transcrite. Vous pouvez refuser : la consultation
          se déroule alors sans enregistrement audio.
        </p>
        <p className="text-sm text-gray-600 leading-relaxed">
          Votre choix est consigné dans un journal de consentement immuable (RGPD Art. 7).
          Vous pouvez à tout moment le modifier depuis la page&nbsp;
          <Link href="/mon-compte/confidentialite" className="text-[#5B4EC4] underline">
            Mon compte &rsaquo; Confidentialité
          </Link>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">5. Vos droits</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          Conformément au RGPD et à l&apos;AI Act, vous disposez à tout moment des droits suivants :
        </p>
        <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
          <li><strong>Droit d&apos;opposition</strong> au traitement de vos données par les fonctions d&apos;IA.</li>
          <li><strong>Droit de retrait</strong> du consentement, sans avoir à le justifier.</li>
          <li><strong>Droit à l&apos;information</strong> : connaître à tout moment quels modèles ont été utilisés.</li>
          <li><strong>Droit à la portabilité</strong> de vos données (export depuis Mon compte).</li>
          <li><strong>Droit à l&apos;effacement</strong> de vos données (Art. 17 RGPD).</li>
          <li><strong>Droit de ne pas être soumis à une décision fondée exclusivement sur un traitement automatisé</strong> (RGPD Art. 22) — toute synthèse IA reste un brouillon validé par un soignant humain.</li>
        </ul>
        <p className="text-sm text-gray-600 leading-relaxed mt-3">
          Pour exercer ces droits : <strong>contact@namipourlavie.com</strong>.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">6. Limites et garanties</h2>
        <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 mb-3">
          <p className="text-sm text-amber-800 font-medium">
            Aucun contenu généré par l&apos;IA ne constitue un avis médical, un diagnostic ou une
            recommandation thérapeutique. Tout brouillon est relu et validé par le professionnel de
            santé responsable avant intégration au dossier de coordination.
          </p>
        </div>
        <p className="text-sm text-gray-600 leading-relaxed">
          Nami mesure en continu la qualité des sorties produites par ses fonctions d&apos;IA
          (couverture des sources, taux d&apos;hallucination, complétude). Les indicateurs internes
          sont auditables sur demande des autorités compétentes.
        </p>
      </section>

      <section className="mb-8">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">7. Voir le détail de mes consentements</h2>
        <p className="text-sm text-gray-600 leading-relaxed mb-3">
          La liste complète des consentements que vous avez accordés ou refusés, leur date et leur
          portée, est consultable et modifiable à tout moment :
        </p>
        <Link
          href="/mon-compte/confidentialite"
          className="inline-flex items-center px-4 py-2 rounded-lg bg-[#5B4EC4] text-white text-sm font-medium hover:bg-[#4A3EAA] transition-colors"
        >
          Voir le détail de mes consentements
        </Link>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-gray-800 mb-3">8. Contact</h2>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Responsable de traitement :</strong> Margot Vire (Nami)</p>
          <p><strong>Délégué à la protection des données :</strong> contact@namipourlavie.com</p>
          <p><strong>Autorité de contrôle :</strong> CNIL — <span className="text-gray-500">www.cnil.fr</span></p>
        </div>
      </section>
    </article>
  );
}
