import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PresetHookOptions } from "./types";
import { getMotionSettings, resetLabAnimationState } from "./utils";

export function useVenueWaveAnimation({
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
    const { distance, duration, stagger } = getMotionSettings(settings);

    const ctx = gsap.context(() => {
      timelineRef.current = gsap.timeline().fromTo(
        ".lab-venue-word",
        {
          opacity: 0,
          y: distance * 0.25,
          rotation: -4,
        },
        {
          opacity: 1,
          y: 0,
          rotation: 0,
          duration: duration * 0.55,
          stagger: Math.max(stagger * 0.75, 0.02),
          ease: "power3.out",
        },
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
