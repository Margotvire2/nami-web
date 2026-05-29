import type { Metadata } from "next";
import { MesBilansClient } from "./page-client";

export const metadata: Metadata = {
  title: "Mes bilans — Nami",
};

export default function MesBilansPage() {
  return <MesBilansClient />;
}
