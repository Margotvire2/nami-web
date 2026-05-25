import { CONTACT_POINTS } from "./contact-data";
import { ContactCard } from "./ContactCard";

export function ContactGrid() {
  return (
    <section
      role="region"
      aria-labelledby="contact-grid-title"
      className="bg-[#FAFAF8]"
    >
      <div className="mx-auto max-w-5xl px-6 py-16 sm:py-20">
        <h2
          id="contact-grid-title"
          className="sr-only"
        >
          Points de contact par audience
        </h2>

        <ul
          role="list"
          className="grid grid-cols-1 gap-4 md:grid-cols-2"
        >
          {CONTACT_POINTS.map((point) => (
            <ContactCard key={point.id} point={point} />
          ))}
        </ul>
      </div>
    </section>
  );
}
