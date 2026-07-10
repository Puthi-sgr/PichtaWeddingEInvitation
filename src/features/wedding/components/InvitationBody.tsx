import { weddingContent } from "../content/weddingContent";
import { Guest } from "../types";

type InvitationBodyProps = {
  guest?: Guest | null;
};

function splitLetters(value: string) {
  return Array.from(value);
}

export function InvitationBody({ guest }: InvitationBodyProps) {
  const guestName = guest?.displayName || weddingContent.guestFallbackName;
  const invitation = weddingContent.invitation;

  return (
    <>
      <section
        data-wedding-section="សេចក្តីអញ្ជើញ"
        aria-label={`${invitation.invitePrefix} ${guestName}`}
        className="invitation-hero-section wedding-section relative mx-auto flex min-h-[100svh] w-full max-w-4xl flex-col items-center justify-center px-5 py-28 text-center md:px-8 md:py-36"
      >
        <div className="wedding-text-primary max-w-3xl">
          <p className="hero-detail wedding-animated wedding-text-kicker mb-8 text-2xl leading-[1.9] opacity-0 md:text-4xl">
            {invitation.auspiciousTitle}
          </p>
          <h1 className="guest-name wedding-animated text-4xl leading-[1.85] opacity-100 md:text-6xl">
            <span className="hero-detail wedding-animated antique-cream-text block opacity-0">
              {invitation.invitePrefix}
            </span>
            <span className="block">
              {splitLetters(guestName).map((letter, index) => (
                <span
                  key={`${letter}-${index}`}
                  className="guest-letter wedding-animated antique-cream-text inline-block opacity-0"
                >
                  {letter === " " ? "\u00A0" : letter}
                </span>
              ))}
            </span>
          </h1>
        </div>
      </section>

      <section
        data-wedding-section="ក្រុមគ្រួសារ"
        className="lineage-section wedding-section relative mx-auto flex min-h-[100svh] w-full max-w-5xl flex-col items-center justify-center px-5 py-28 text-center md:px-8 md:py-36"
      >
        <div className="wedding-text-primary max-w-4xl">
          <div className="grid gap-5 text-lg leading-[2] md:grid-cols-2 md:text-2xl">
            <div className="lineage-card wedding-animated opacity-0">
              <p className="wedding-text-kicker mb-3">{invitation.groomSide}</p>
              <p>{invitation.fatherTitle}</p>
              <p className="wedding-text-secondary">{invitation.groomFatherName}</p>
              <p>{invitation.motherTitle}</p>
              <p className="wedding-text-secondary">{invitation.groomMotherName}</p>
            </div>
            <div className="lineage-card wedding-animated opacity-0">
              <p className="wedding-text-kicker mb-3">{invitation.brideSide}</p>
              <p>{invitation.fatherTitle}</p>
              <p className="wedding-text-secondary">{invitation.brideFatherName}</p>
              <p>{invitation.motherTitle}</p>
              <p className="wedding-text-secondary">{invitation.brideMotherName}</p>
            </div>
          </div>

          <div className="lineage-copy wedding-animated wedding-text-secondary mx-auto mt-12 max-w-3xl text-lg leading-[2.1] opacity-0 md:text-2xl">
            <p>{invitation.formalLine}</p>
            <p>{invitation.witnessLine}</p>
            <p>{invitation.banquetLine}</p>
          </div>

          <div className="couple-names wedding-animated wedding-text-primary mt-12 text-4xl leading-[1.8] opacity-0 md:text-6xl">
            <p>{invitation.groomName}</p>
            <p className="wedding-text-accent text-2xl md:text-4xl">{invitation.unionText}</p>
            <p>{invitation.brideName}</p>
          </div>
        </div>
      </section>
    </>
  );
}
