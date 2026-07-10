import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PresetHookOptions } from "./types";
import { getMotionSettings, resetLabAnimationState } from "./utils";

export function useLocationPinAnimation({
  active,
  isPaused,
  previewRef,
  replayKey,
  resetOnStart = true,
  settings,
}: PresetHookOptions) {
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  useEffect(() => {
    const root = previewRef.current;
    if (!active || !root) return;

    if (resetOnStart) resetLabAnimationState(root);
    const { distance, duration } = getMotionSettings(settings);

    const ctx = gsap.context(() => {
      timelineRef.current = gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          ".lab-venue-pin",
          {
            opacity: 0,
            y: -distance * 0.58,
            scale: 0.65,
            rotation: -8,
          },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            rotation: 0,
            duration: duration * 0.65,
            ease: "bounce.out",
          },
        )
        .fromTo(
          ".lab-venue-card",
          { scale: 0.98 },
          {
            scale: 1,
            duration: duration * 0.35,
            ease: "back.out(1.8)",
          },
          "-=0.2",
        );
    }, root);

    return () => {
      timelineRef.current?.kill();
      timelineRef.current = null;
      ctx.revert();
    };
  }, [active, previewRef, replayKey, resetOnStart, settings]);

  useEffect(() => {
    if (!active || !timelineRef.current) return;
    if (isPaused) timelineRef.current.pause();
    else timelineRef.current.play();
  }, [active, isPaused]);
}
