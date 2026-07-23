import { useEffect, useRef } from "react";
import gsap from "gsap";
import { getRegisteredCldImage } from "../../../shared/utils/cld";

export const frameImage = getRegisteredCldImage("wedding.reverse-cover", {
  width: 1280,
  autoFormat: true,
  autoQuality: true,
});

const frameRestScale = 1.04;
const frameEntranceStartScale = 1.2;
const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function WeddingFrameOverlay() {
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const image = imageRef.current;
    if (!image) return;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(image, { scale: frameRestScale, clearProps: "willChange" });
        return;
      }

      gsap.fromTo(
        image,
        { scale: frameEntranceStartScale },
        {
          scale: frameRestScale,
          duration: 1.3,
          ease: "power3.out",
          force3D: true,
          clearProps: "willChange",
        },
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <div
      className="wedding-mobile-viewport pointer-events-none fixed inset-0 z-[80] h-[100lvh] min-h-[100dvh] w-screen overflow-hidden will-change-transform [transform:translateZ(0)]"
      aria-hidden="true"
    >
      <img
        ref={imageRef}
        src={frameImage.url}
        alt=""
        loading="eager"
        decoding="async"
        fetchPriority="high"
        className="h-full w-full scale-[1.3] object-cover object-[35%_50%] will-change-transform [transform:translateZ(0)]"
      />
    </div>
  );
}
