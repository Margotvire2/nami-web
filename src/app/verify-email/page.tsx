import type { Metadata } from "next";
import { Suspense } from "react";
import VerifyEmailClient from "./page-client";

// SEO : page utilitaire — non indexable, juste un title clair pour l'onglet navigateur.
export const metadata: Metadata = {
  title: "Vérification de votre email — Nami",
  description:
    "Confirmation de votre adresse email pour activer votre espace Nami.",
  robots: { index: false, follow: false },
};

// Page server component : lit le ?token via searchParams (Next 16 = Promise),
// puis délègue toute la logique (appel API, états, UI) au client component.
// Le server ne touche pas au backend → token traité côté client pour éviter
// de logger / cacher des tokens single-use dans les logs Vercel SSR.
export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const sp = await searchParams;
  const token = typeof sp.token === "string" ? sp.token : null;

  return (
    <Suspense fallback={null}>
      <VerifyEmailClient token={token} />
    </Suspense>
  );
}
