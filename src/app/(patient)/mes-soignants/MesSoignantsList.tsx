"use client";

import type { AuthorizedProvider } from "./mock-data";
import { MesSoignantsCard } from "./MesSoignantsCard";

interface MesSoignantsListProps {
  providers: AuthorizedProvider[];
  onRevoke: (provider: AuthorizedProvider) => void;
}

/**
 * Liste sémantique des soignants autorisés.
 *
 * role="list" explicite (sinon les UA ignorent la nature liste quand on stylise
 * sans ul/li) + aria-label pour annonce SR.
 */
export function MesSoignantsList({ providers, onRevoke }: MesSoignantsListProps) {
  return (
    <div
      role="list"
      aria-label="Soignants autorisés"
      className="space-y-4"
    >
      {providers.map((provider) => (
        <MesSoignantsCard
          key={provider.id}
          provider={provider}
          onRevoke={onRevoke}
        />
      ))}
    </div>
  );
}
