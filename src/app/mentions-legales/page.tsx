import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales — Nami",
  description: "Mentions légales et informations éditoriales du service Nami.",
  robots: { index: true, follow: true },
};

export default function MentionsLegalesPage() {
  return (
    <main className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-[#1A1A2E]">
      <h1 className="text-3xl md:text-4xl font-bold mb-2 tracking-tight">
        Mentions légales
      </h1>
      <p className="text-sm text-[#6B7280] mb-8">
        Dernière mise à jour : 25 mai 2026
      </p>

      <div
        role="note"
        className="bg-[rgba(91,78,196,0.06)] border border-[rgba(91,78,196,0.16)] rounded-xl p-4 mb-8 text-sm"
      >
        ⚠️ Cette page est en cours de validation avec notre conseil juridique.
        Pour toute question, contactez{" "}
        <a
          href="mailto:contact@namipourlavie.com"
          className="underline text-[#5B4EC4]"
        >
          contact@namipourlavie.com
        </a>
        .
      </div>

      <section className="space-y-8">
        <div>
          <h2 className="text-xl font-semibold mb-3">1. Éditeur du site</h2>
          <p className="text-sm leading-relaxed">
            <strong>Nami</strong> — Société par actions simplifiée unipersonnelle (SASU)
            <br />
            Capital social : à compléter
            <br />
            Siège social : à compléter
            <br />
            SIRET : à compléter
            <br />
            RCS : à compléter
            <br />
            Présidente : Margot Vire
            <br />
            E-mail :{" "}
            <a href="mailto:contact@namipourlavie.com" className="underline">
              contact@namipourlavie.com
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">2. Directeur de la publication</h2>
          <p className="text-sm leading-relaxed">
            Margot Vire, en qualité de présidente de la société Nami.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">3. Hébergement</h2>
          <p className="text-sm leading-relaxed">
            <strong>Vercel Inc.</strong> (hébergement application web)
            <br />
            340 S Lemon Ave #4133, Walnut, CA 91789, USA
            <br />
            Site :{" "}
            <a
              href="https://vercel.com"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              vercel.com
            </a>
          </p>
          <p className="text-sm leading-relaxed mt-3">
            <strong>Supabase Inc.</strong> (hébergement des données, région eu-west-3 Paris)
            <br />
            970 Toa Payoh North #07-04, Singapore 318992
            <br />
            Site :{" "}
            <a
              href="https://supabase.com"
              className="underline"
              target="_blank"
              rel="noopener noreferrer"
            >
              supabase.com
            </a>
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">4. Propriété intellectuelle</h2>
          <p className="text-sm leading-relaxed">
            L&apos;ensemble des éléments présents sur le site Nami (textes, images,
            logos, marques, structures, bases de données) est protégé par les
            législations française et internationale relatives à la propriété
            intellectuelle. Toute reproduction, représentation, modification ou
            adaptation, totale ou partielle, par quelque procédé que ce soit, est
            interdite sans l&apos;autorisation préalable écrite de Nami.
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">5. Nature du service</h2>
          <p className="text-sm leading-relaxed">
            Nami est un <strong>outil de coordination des soins de santé</strong>.
            Nami n&apos;est <strong>pas un dispositif médical</strong> au sens du
            Règlement (UE) 2017/745. Le service ne fournit pas d&apos;aide à la
            décision médicale.
          </p>
          <p className="text-sm leading-relaxed mt-3">
            En cas d&apos;urgence médicale, contacter le <strong>15</strong> (SAMU)
            ou le <strong>112</strong> (numéro européen d&apos;urgence).
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">6. Contact</h2>
          <p className="text-sm leading-relaxed">
            Pour toute question relative aux présentes mentions légales :{" "}
            <a href="mailto:contact@namipourlavie.com" className="underline">
              contact@namipourlavie.com
            </a>
          </p>
        </div>
      </section>

      <footer className="mt-12 pt-6 border-t border-[#E5E7EB] text-xs text-[#6B7280] text-center">
        Outil de coordination · Nami n&apos;est pas un dispositif médical · Conforme RGPD
      </footer>
    </main>
  );
}
