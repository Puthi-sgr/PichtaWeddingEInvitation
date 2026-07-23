import { getRegisteredCldImage } from "../../../shared/utils/cld";

const desktopSideScenery = getRegisteredCldImage("wedding.reverse-cover", {
  width: 1920,
  autoFormat: true,
  autoQuality: true,
});

/** Decorative desktop-only surround for the centered mobile invitation. */
export function DesktopInvitationSideScenery() {
  return (
    <div className="wedding-desktop-side-scenery" aria-hidden="true">
      <img
        src={desktopSideScenery.url}
        alt=""
        className="h-full w-full object-cover object-center"
        decoding="async"
      />
    </div>
  );
}
