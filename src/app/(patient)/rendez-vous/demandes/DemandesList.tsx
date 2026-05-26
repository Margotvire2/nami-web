import { DemandeCard } from "./DemandeCard";
import type { MockAppointmentRequest } from "./mock-data";

interface DemandesListProps {
  requests: MockAppointmentRequest[];
}

export function DemandesList({ requests }: DemandesListProps) {
  return (
    <section role="region" aria-label="Liste des demandes de rendez-vous">
      <ul
        role="list"
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          listStyle: "none",
          padding: 0,
          margin: 0,
        }}
      >
        {requests.map((request) => (
          <li key={request.id}>
            <DemandeCard request={request} />
          </li>
        ))}
      </ul>
    </section>
  );
}
