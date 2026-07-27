import { weddingContent } from "../content/weddingContent";
import { ShareButton } from "./ShareButton";

export function VenueMap() {
  const venue = weddingContent.venue;

  return (
    <section
      data-wedding-section="ទីតាំង"
      className="venue-section wedding-section wedding-text-primary mx-auto flex min-h-[100svh] w-full max-w-5xl items-center px-5 py-28 text-center md:px-8 md:py-36"
    >
      <div className="mx-auto max-w-3xl">
        <div className="text-radial-backdrop text-radial-backdrop--block mb-5">
          <p className="venue-kicker wedding-animated wedding-text-kicker text-2xl leading-[1.8] opacity-0 md:text-3xl">
            {venue.hallLabel}
          </p>
        </div>
        <div className="text-radial-backdrop text-radial-backdrop--block mb-8">
          <h2 className="venue-title wedding-animated text-4xl leading-[1.75] opacity-0 md:text-6xl">
            {venue.title}
          </h2>
        </div>
        <div className="wedding-text-secondary space-y-4 text-2xl leading-[2] md:text-4xl">
          <div className="text-radial-backdrop text-radial-backdrop--block">
            <p className="venue-word wedding-animated opacity-0">{venue.name}</p>
          </div>
          <div className="text-radial-backdrop text-radial-backdrop--block">
            <p className="venue-word wedding-animated crown-gold-leaf-text opacity-0">{venue.building}</p>
          </div>
        </div>
        <div className="text-radial-backdrop text-radial-backdrop--block mt-12">
          <p className="venue-map-label wedding-animated wedding-text-kicker text-xl leading-[1.8] opacity-0 md:text-2xl">
            {venue.mapLabel}
          </p>
        </div>
        <ShareButton
          href={venue.mapUrl}
          target="_blank"
          rel="noreferrer"
          className="venue-map-action wedding-animated mt-6 opacity-0 transition-opacity hover:opacity-75 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
          labelClassName="text-xl"
        >
          {venue.mapButton}
        </ShareButton>
      </div>
    </section>
  );
}
