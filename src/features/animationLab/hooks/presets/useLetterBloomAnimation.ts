import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PresetHookOptions } from "./types";
import { getMotionSettings, resetLabAnimationState } from "./utils";

export function useLetterBloomAnimation({
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
        ".lab-guest-letter",
        {
          opacity: 0,
          y: distance * 0.34,
          rotation: (index) => (index % 2 === 0 ? -8 : 8),
          scale: 0.82,
        },
        {
          opacity: 1,
          y: 0,
          rotation: 0,
          scale: 1,
          duration: duration * 0.72,
          stagger: {
            each: Math.max(stagger * 0.3, 0.01),
            from: "center",
          },
          ease: "back.out(1.9)",
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
