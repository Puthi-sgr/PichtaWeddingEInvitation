import { RefObject, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const sectionStart = "top 84%";

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
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".invitation-hero-section",
        start: "top 88%",
        once: true,
      },
    })
    .set(".invitation-hero-section .wedding-animated", { willChange: "opacity, transform" })
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
    )
    .fromTo(
      ".invitation-hero-section .guest-letter",
      {
        opacity: 0,
        y: 24,
        rotation: (index) => (index % 2 === 0 ? -8 : 8),
        scale: 0.82,
      },
      {
        opacity: 1,
        y: 0,
        rotation: 0,
        scale: 1,
        duration: 0.85,
        stagger: {
          each: 0.045,
          from: "center",
        },
        ease: "back.out(1.9)",
      },
      "-=0.2",
    )
    .set(".invitation-hero-section .wedding-animated", { clearProps: "willChange" });
}

function animateLineage() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".lineage-section",
        start: sectionStart,
        once: true,
      },
    })
    .set(".lineage-section .wedding-animated", { willChange: "opacity, transform" })
    .fromTo(
      ".lineage-card",
      { opacity: 0, y: 24, scale: 0.98 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.65,
        stagger: 0.12,
        ease: "power3.out",
      },
    )
    .fromTo(
      ".lineage-copy",
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.58,
        ease: "power3.out",
      },
      "-=0.2",
    )
    .fromTo(
      ".couple-names",
      { opacity: 0, y: 22, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.7,
        ease: "back.out(1.45)",
      },
      "-=0.12",
    )
    .set(".lineage-section .wedding-animated", { clearProps: "willChange" });
}

function animateAgenda() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".agenda-section",
        start: sectionStart,
        once: true,
      },
    })
    .set(".agenda-section .wedding-animated", { willChange: "opacity, transform" })
    .fromTo(
      ".agenda-heading",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.62,
        ease: "power3.out",
      },
    )
    .fromTo(
      ".agenda-group-title",
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.52,
        stagger: 0.1,
        ease: "power3.out",
      },
      "-=0.2",
    )
    .fromTo(
      ".agenda-item",
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.5,
        stagger: 0.075,
        ease: "power3.out",
      },
      "-=0.12",
    )
    .set(".agenda-section .wedding-animated", { clearProps: "willChange" });
}

function animateVenue() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".venue-section",
        start: sectionStart,
        once: true,
      },
    })
    .set(".venue-section .wedding-animated", { willChange: "opacity, transform" })
    .fromTo(
      ".venue-kicker, .venue-title",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.62,
        stagger: 0.12,
        ease: "power3.out",
      },
    )
    .fromTo(
      ".venue-word",
      { opacity: 0, y: 18, rotation: -2 },
      {
        opacity: 1,
        y: 0,
        rotation: 0,
        duration: 0.56,
        stagger: 0.09,
        ease: "power3.out",
      },
      "-=0.18",
    )
    .fromTo(
      ".venue-map-label, .venue-map-action",
      { opacity: 0, y: 18, scale: 0.96 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.52,
        stagger: 0.1,
        ease: "back.out(1.55)",
      },
      "-=0.1",
    )
    .set(".venue-section .wedding-animated", { clearProps: "willChange" });
}

function animateGallery() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".gallery-section",
        start: sectionStart,
        once: true,
      },
    })
    .set(".gallery-section .wedding-animated", { willChange: "opacity, transform" })
    .fromTo(
      ".gallery-heading, .gallery-subtitle",
      { opacity: 0, y: 20 },
      {
        opacity: 1,
        y: 0,
        duration: 0.58,
        stagger: 0.12,
        ease: "power3.out",
      },
    )
    .fromTo(
      ".gallery-frame",
      { opacity: 0, y: 24, scale: 0.985 },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.78,
        ease: "power3.out",
      },
      "-=0.08",
    )
    .fromTo(
      ".gallery-more",
      { opacity: 0, y: 16 },
      {
        opacity: 1,
        y: 0,
        duration: 0.48,
        ease: "power3.out",
      },
      "-=0.1",
    )
    .set(".gallery-section .wedding-animated", { clearProps: "willChange" });
}

function animateFooter() {
  gsap
    .timeline({
      scrollTrigger: {
        trigger: ".footer-section",
        start: "top 88%",
        once: true,
      },
    })
    .set(".footer-section .wedding-animated", { willChange: "opacity, transform" })
    .fromTo(
      ".footer-heading, .footer-line, .footer-credit",
      { opacity: 0, y: 18 },
      {
        opacity: 1,
        y: 0,
        duration: 0.56,
        stagger: 0.1,
        ease: "power3.out",
      },
    )
    .set(".footer-section .wedding-animated", { clearProps: "willChange" });
}

export function useWeddingAnimations(containerRef: RefObject<HTMLDivElement | null>, enabled = true) {
  useEffect(() => {
    const root = containerRef.current;
    if (!root || !enabled) return;

    const ctx = gsap.context(() => {
      if (prefersReducedMotion()) {
        gsap.set(".invitation-foreground, .wedding-animated", {
          opacity: 1,
          x: 0,
          y: 0,
          scale: 1,
          rotation: 0,
          clearProps: "willChange",
        });
        return;
      }

      gsap.set(".invitation-foreground", { willChange: "opacity, transform" });
      animateForegroundHandoff();
      animateInvitationHero();
      animateLineage();
      animateAgenda();
      animateVenue();
      animateGallery();
      animateFooter();
    }, root);

    return () => ctx.revert();
  }, [containerRef, enabled]);
}
