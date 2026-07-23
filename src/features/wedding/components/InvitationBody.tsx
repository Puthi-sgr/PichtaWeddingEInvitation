import { cldCropUrlFactory } from "../../gallery/lib/cldAdapter";
import { weddingContent } from "../content/weddingContent";
import { ShareButton } from "./ShareButton";
import { WeddingSectionDivider } from "./WeddingSectionDivider";
import { Guest } from "../types";

type InvitationBodyProps = {
  guest?: Guest | null;
};

export function InvitationBody({ guest }: InvitationBodyProps) {
  const guestName = guest?.displayName || weddingContent.guestFallbackName;
  const invitation = weddingContent.invitation;
  const eventSummary = weddingContent.eventSummary;
  // The gallery's Cloudinary adapter provides an optimized, fixed-square
  // delivery for the crest while retaining automatic format and quality.
  const initialsUrl = cldCropUrlFactory("wedding.initials")(400, 400);

  return (
    <>
      <section
        data-wedding-section="សេចក្តីអញ្ជើញ"
        aria-label={`${invitation.invitePrefix} ${guestName}`}
        lang="km"
        className="invitation-hero-section wedding-section relative mx-auto flex min-h-[100svh] w-full max-w-4xl flex-col items-center justify-center px-9 py-28 text-center sm:px-12 md:px-16 md:py-36"
      >
        <div className="crown-hero-lockup wedding-text-primary w-full max-w-3xl">
          <span className="hero-badge initials-radiance wedding-animated mx-auto mb-6 block h-20 w-20 opacity-0">
            <img
              src={initialsUrl}
              alt=""
              aria-hidden="true"
              className="h-full w-full object-contain"
              width={80}
              height={80}
              loading="eager"
              decoding="async"
            />
          </span>
          <h1 className="guest-name text-4xl leading-[1.85] md:text-6xl">
            <span className="text-radial-backdrop">
              <span className="hero-detail wedding-animated gold-text block text-3xl leading-[1.9] opacity-0 md:text-4xl">
                {invitation.invitePrefix}
              </span>
            </span>
            {/*
              The auspicious title (សិរីសួស្តីអាពាហ៍ពិពាហ៍) moved down to the
              family/lineage section — the hero now only carries the invite
              line + guest name, in the auspicious title's gold-leaf treatment.
              The clip-path reveal (data-guest-name-reveal) is kept. The full
              Royal Crown Inlay version is archived below; swap the two blocks
              to restore it.
            */}
            <span className="text-radial-backdrop">
              <span
                className="guest-crown-reveal wedding-animated gold-text relative isolate mt-2 block opacity-0"
                data-guest-name-reveal
              >
                {guestName}
              </span>
            </span>
            {/* ARCHIVED — Royal Khmer Crown Inlay guest-name treatment (kept for later):
            <span
              className="guest-crown-reveal wedding-animated relative isolate mt-2 block opacity-0"
              data-guest-name-reveal
            >
              <span aria-hidden="true" className="royal-crown-inlay-underlay pointer-events-none absolute inset-0 block select-none">
                {guestName}
              </span>
              <span aria-hidden="true" className="royal-crown-inlay-gold pointer-events-none absolute inset-0 block select-none">
                {guestName}
              </span>
              <span className="royal-crown-inlay-text relative block">{guestName}</span>
              <span aria-hidden="true" className="royal-crown-inlay-glint pointer-events-none absolute inset-0 block select-none opacity-0" data-crown-glint>
                {guestName}
              </span>
            </span>
            */}
          </h1>
        </div>
      </section>

      <section
        data-wedding-section="ក្រុមគ្រួសារ"
        className="lineage-section wedding-section relative mx-auto flex min-h-[100svh] w-full max-w-5xl flex-col items-center justify-center px-5 py-28 text-center md:px-8 md:py-36"
      >
        <div className="wedding-text-primary max-w-4xl">
          <div className="text-radial-backdrop text-radial-backdrop--block mb-8">
            <p className="lineage-kicker wedding-animated gold-text text-2xl leading-[1.9] opacity-0 md:text-4xl">
              {invitation.auspiciousTitle}
            </p>
          </div>
          <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-3 text-sm leading-[1.75] sm:gap-5 sm:text-base md:text-2xl md:leading-loose">
            <div className="lineage-card wedding-animated opacity-0">
              <div className="text-radial-backdrop text-radial-backdrop--block mb-3">
                <p className="wedding-text-kicker">{invitation.groomSide}</p>
              </div>
              <div className="text-radial-backdrop text-radial-backdrop--block">
                <p className="wedding-text-secondary crown-gold-leaf-text">{invitation.groomName}</p>
              </div>
            </div>
            <span className="initials-radiance place-self-center block h-20 w-20">
              <img
                src={initialsUrl}
                alt=""
                aria-hidden="true"
                className="h-full w-full object-contain"
                width={80}
                height={80}
                loading="lazy"
                decoding="async"
              />
            </span>
            <div className="lineage-card wedding-animated opacity-0">
              <div className="text-radial-backdrop text-radial-backdrop--block mb-3">
                <p className="wedding-text-kicker">{invitation.brideSide}</p>
              </div>
              <div className="text-radial-backdrop text-radial-backdrop--block">
                <p className="wedding-text-secondary crown-gold-leaf-text">{invitation.brideName}</p>
              </div>
            </div>
          </div>

          <div className="lineage-copy wedding-animated mx-auto mt-12 max-w-3xl text-sm leading-[1.9] opacity-0 md:text-lg">
            <div className="text-radial-backdrop text-radial-backdrop--block">
              <p className="crown-gold-leaf-text">{invitation.formalLine}</p>
            </div>
            <div className="text-radial-backdrop text-radial-backdrop--block">
              <p className="crown-gold-leaf-text">{invitation.witnessLine}</p>
            </div>
            <div className="text-radial-backdrop text-radial-backdrop--block">
              <p className="crown-gold-leaf-text">{invitation.banquetLine}</p>
            </div>
          </div>

          <WeddingSectionDivider className="mx-auto mt-10" size={1.3} length="16rem" preset="radiant" />

          <dl className="mx-auto mt-10 max-w-2xl space-y-5 text-base leading-[1.85] md:text-xl">
            <div>
              <div className="text-radial-backdrop text-radial-backdrop--block">
                <dt className="gold-text">{eventSummary.dateLabel}</dt>
              </div>
              <dd className="crown-gold-leaf-text mt-1">{eventSummary.date}</dd>
              <WeddingSectionDivider className="mx-auto mt-4" preset="tapered-rule" length="8rem" />
            </div>
            <div>
              <div className="text-radial-backdrop text-radial-backdrop--block">
                <dt className="gold-text">{eventSummary.timeLabel}</dt>
              </div>
              <dd className="crown-gold-leaf-text mt-1">{eventSummary.time}</dd>
              <WeddingSectionDivider className="mx-auto mt-4" preset="tapered-rule" length="8rem" />
            </div>
            <div>
              <div className="text-radial-backdrop text-radial-backdrop--block">
                <dt className="gold-text">{eventSummary.locationLabel}</dt>
              </div>
              <dd className="crown-gold-leaf-text mt-1">{eventSummary.location}</dd>
              <ShareButton
                href={eventSummary.mapUrl}
                target="_blank"
                rel="noreferrer"
                className="venue-map-action mt-4 transition-opacity size-36 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
                labelClassName="gold-text md:text-lg"
              >
                {eventSummary.mapButton}
              </ShareButton>
              <WeddingSectionDivider className="mx-auto mt-4" preset="tapered-rule" length="8rem" />
            </div>
          </dl>
        </div>
      </section>
    </>
  );
}
