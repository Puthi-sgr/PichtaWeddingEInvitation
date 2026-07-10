import { weddingContent } from "../content/weddingContent";

export function VenueMap() {
  const venue = weddingContent.venue;

  return (
    <section
      data-wedding-section="ទីតាំង"
      className="venue-section wedding-section wedding-text-primary mx-auto flex min-h-[100svh] w-full max-w-5xl items-center px-5 py-28 text-center md:px-8 md:py-36"
    >
      <div className="mx-auto max-w-3xl">
        <p className="venue-kicker wedding-animated wedding-text-kicker mb-5 text-2xl leading-[1.8] opacity-0 md:text-3xl">
          {venue.hallLabel}
        </p>
        <h2 className="venue-title wedding-animated mb-8 text-4xl leading-[1.75] opacity-0 md:text-6xl">
          {venue.title}
        </h2>
        <div className="wedding-text-secondary space-y-4 text-2xl leading-[2] md:text-4xl">
          <p className="venue-word wedding-animated opacity-0">{venue.name}</p>
          <p className="venue-word wedding-animated opacity-0">{venue.building}</p>
        </div>
        <p className="venue-map-label wedding-animated wedding-text-kicker mt-12 text-xl leading-[1.8] opacity-0 md:text-2xl">
          {venue.mapLabel}
        </p>
        <a
          href={venue.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="venue-map-action wedding-animated mt-6 inline-flex min-h-12 items-center justify-center border border-current px-7 py-3 text-xl leading-[1.6] opacity-0 transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
        >
          {venue.mapButton}
        </a>
      </div>
    </section>
  );
}
