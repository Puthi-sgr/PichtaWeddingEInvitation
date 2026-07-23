import { weddingContent } from "../content/weddingContent";
import { ShareButton } from "./ShareButton";
import { WeddingSectionDivider } from "./WeddingSectionDivider";

export function InvitationEnglishSummary() {
  const invitation = weddingContent.englishInvitation;

  return (
    <section
      data-wedding-section="English invitation"
      lang="en"
      className="english-invitation-section wedding-section relative mx-auto flex min-h-[100svh] w-full max-w-5xl items-center px-5 py-28 text-center md:px-8 md:py-36"
    >
      <div className="wedding-text-primary mx-auto w-full max-w-3xl font-english">
        <h2 className="gold-text text-3xl leading-tight md:text-5xl">{invitation.title}</h2>
        <p className="font-english-sub wedding-text-secondary crown-gold-leaf-text mx-auto mt-6 max-w-xl text-base leading-relaxed md:text-lg">
          {invitation.invitationLine}
        </p>

        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-4 md:gap-7">
          <div className="min-w-0">
            <p className="gold-text font-english-sub text-xl font-bold">{invitation.groomLabel}</p>
            <p className="wedding-text-secondary crown-gold-leaf-text mt-3 text-3xl leading-snug md:text-4xl">{invitation.groomName}</p>
          </div>
          <span className="gold-text text-3xl leading-none md:text-5xl" aria-hidden="true">{invitation.unionText}</span>
          <div className="min-w-0">
            <p className="gold-text font-english-sub text-xl font-bold">{invitation.brideLabel}</p>
            <p className="wedding-text-secondary crown-gold-leaf-text mt-3 text-3xl leading-snug md:text-4xl">{invitation.brideName}</p>
          </div>
        </div>

        <p className="font-english-sub wedding-text-secondary crown-gold-leaf-text mx-auto mt-9 max-w-xl text-base leading-relaxed md:text-lg">{invitation.formalLine}</p>

        <WeddingSectionDivider preset="radiant" size={0.72} length="14rem" className="mx-auto mt-7" />

        <dl className="font-english-sub mx-auto mt-8 max-w-2xl text-center text-sm leading-[1.75] md:text-base">
          <div className="grid grid-cols-1">
            <div className="min-w-0 px-4 py-5 sm:px-6">
              <dt className="gold-text text-xs font-bold">{invitation.dateLabel}</dt>
              <dd className="crown-gold-leaf-text mt-2 break-words">{invitation.date}</dd>
              <WeddingSectionDivider preset="tapered-rule" length="8rem" className="mx-auto mt-4" />
            </div>
            <div className="min-w-0 px-4 py-5 sm:px-6">
              <dt className="gold-text text-xs font-bold">{invitation.timeLabel}</dt>
              <dd className="wedding-text-secondary crown-gold-leaf-text mt-2 break-words">{invitation.time}</dd>
              <WeddingSectionDivider preset="tapered-rule" length="8rem" className="mx-auto mt-4" />
            </div>
          </div>
          <div className="px-4 py-5 text-center sm:px-6">
            <dt className="gold-text text-xs font-bold">{invitation.locationLabel}</dt>
            <dd className="wedding-text-secondary crown-gold-leaf-text mt-2 max-w-xl break-words">{invitation.location}</dd>
            <WeddingSectionDivider preset="tapered-rule" length="8rem" className="mx-auto mt-4" />
            <ShareButton
              href={invitation.mapUrl}
              target="_blank"
              rel="noreferrer"
              className="venue-map-action mt-4 transition-opacity  size-36  gold-text focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4"
            >
              {invitation.mapButton}
            </ShareButton>
          </div>
        </dl>
      </div>
    </section>
  );
}
