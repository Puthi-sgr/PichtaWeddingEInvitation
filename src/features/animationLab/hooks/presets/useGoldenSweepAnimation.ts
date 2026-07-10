import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PresetHookOptions } from "./types";
import { getMotionSettings, resetLabAnimationState } from "./utils";

export function useGoldenSweepAnimation({
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
    const { duration } = getMotionSettings(settings);

    const ctx = gsap.context(() => {
      timelineRef.current = gsap
        .timeline()
        .fromTo(
          ".lab-photo-frame",
          { scale: 0.985 },
          {
            scale: 1,
            duration: duration * 0.45,
            ease: "power2.out",
          },
        )
        .fromTo(
          ".lab-shine-sweep",
          {
            x: "-130%",
            opacity: 0,
          },
          {
            x: "130%",
            opacity: 0.7,
            duration: duration * 1.05,
            ease: "power3.inOut",
          },
          "-=0.15",
        )
        .to(
          ".lab-shine-sweep",
          {
            opacity: 0,
            duration: duration * 0.18,
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
