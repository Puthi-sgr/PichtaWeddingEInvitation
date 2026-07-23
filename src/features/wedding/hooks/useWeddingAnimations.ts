import { RefObject, useEffect } from "react";
import gsap from "gsap";

function animateForegroundHandoff() {
  gsap.fromTo(
    ".invitation-foreground",
    {
      opacity: 0,
      y: 10,
    },
    {
      opacity: 1,
      y: 0,
      duration: 0.22,
      ease: "power3.out",
      clearProps: "transform,willChange",
    },
  );
}

function animateInvitationHero() {
  // Plays on mount rather than via a ScrollTrigger — the hero is always on
  // screen when the invitation enters, so it doesn't need one, and this keeps
  // the scroll-scrub video engine as the ONLY ScrollTrigger in the app (no
  // triggers competing with the scrub for the scroll listener).
  //
  // Reveal with opacity + transform only — these composite on the GPU. The
  // guest name uses background-clip:text + a multi-layer text-shadow, so
  // animating clip-path/scale over it would force a full repaint of that gold
  // text every frame (the old, janky path). The glint layer was retired with
  // the archived Royal Crown Inlay, so it is no longer animated here.
  gsap
    .timeline()
    .set(".invitation-hero-section .wedding-animated", { willChange: "opacity, transform" })
    .fromTo(
      ".invitation-hero-section .hero-badge",
      { opacity: 0, y: -12, scale: 0.9 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.55,
        ease: "power3.out",
      },
    )
    .fromTo(
      ".invitation-hero-section .hero-detail",
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.62,
        stagger: 0.14,
        ease: "power3.out",
      },
      "-=0.18",
    )
    .fromTo(
      ".invitation-hero-section [data-guest-name-reveal]",
      { opacity: 0, y: 22 },
      {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
      },
      "-=0.2",
    )
    .set(".invitation-hero-section .wedding-animated", { clearProps: "willChange" });
}

// Every below-the-fold section used to fade in on its own ScrollTrigger. Those
// triggers (and the ScrollTrigger.refresh that built them) competed with the
// scroll-scrub video engine and made scrubbing glitchy, so only the hero text
// animates now — the rest of the sections are revealed statically.
const belowFoldAnimatedSelector = [
  ".lineage-section .wedding-animated",
  ".agenda-section .wedding-animated",
  ".venue-section .wedding-animated",
  ".gallery-section .wedding-animated",
  ".footer-section .wedding-animated",
].join(", ");

export function useWeddingAnimations(containerRef: RefObject<HTMLDivElement | null>, enabled = true) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root || !enabled) return;

    const motionPreference = window.matchMedia("(prefers-reduced-motion: reduce)");
    let ctx: gsap.Context | null = null;

    const applyMotionPreference = () => {
      ctx?.revert();
      ctx = gsap.context(() => {
        // Below-the-fold sections carry an initial opacity-0 class; reveal them
        // immediately since they no longer have their own scroll animation.
        gsap.set(belowFoldAnimatedSelector, {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          clearProps: "willChange",
        });

        if (motionPreference.matches) {
          gsap.set(".invitation-foreground, .invitation-hero-section .wedding-animated", {
            opacity: 1,
            x: 0,
            y: 0,
            scale: 1,
            rotation: 0,
            clearProps: "willChange",
          });
          return;
        }

        // Above-the-fold work runs now; the hero is on screen immediately.
        gsap.set(".invitation-foreground", { willChange: "opacity, transform" });
        animateForegroundHandoff();
        animateInvitationHero();
      }, root);
    };

    applyMotionPreference();
    motionPreference.addEventListener("change", applyMotionPreference);

    return () => {
      motionPreference.removeEventListener("change", applyMotionPreference);
      ctx?.revert();
    };
  }, [containerRef, enabled]);
}
