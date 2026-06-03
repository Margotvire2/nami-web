import { permanentRedirect } from "next/navigation";

// /collaboration → /messages?tab=pro (permanent redirect, server-side).
// Next.js App Router émet 308 (équivalent moderne de 301, préserve méthode).
// Source canonique du silo Pro est désormais /messages?tab=pro.
export default function CollaborationPage() {
  permanentRedirect("/messages?tab=pro");
}
