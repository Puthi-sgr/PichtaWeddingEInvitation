import gsap from "gsap";
import { AnimationSettings } from "./types";

export function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function getMotionSettings(settings: AnimationSettings) {
  const reduce = prefersReducedMotion();

  return {
    distance: reduce ? 0 : settings.intensity,
    duration: reduce ? 0 : settings.duration,
    reduce,
    stagger: reduce ? 0 : settings.stagger,
  };
}

export function resetLabAnimationState(root: HTMLDivElement) {
  gsap.killTweensOf(root.querySelectorAll("*"));
  gsap.set(root.querySelectorAll(".lab-animated"), {
    clearProps: "all",
  });
  gsap.set(root.querySelectorAll(".lab-photo-frame"), {
    clearProps: "clipPath,opacity,scale",
  });
  gsap.set(root.querySelectorAll(".lab-shine-sweep"), {
    clearProps: "x,opacity",
  });
}
