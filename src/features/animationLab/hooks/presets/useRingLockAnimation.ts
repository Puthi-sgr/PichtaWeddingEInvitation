import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PresetHookOptions } from "./types";
import { getMotionSettings, resetLabAnimationState } from "./utils";

export function useRingLockAnimation({
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
      timelineRef.current = gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .fromTo(
          ".lab-ring-one",
          {
            opacity: 0,
            x: -distance * 0.75,
            rotation: -32,
            scale: 0.8,
          },
          {
            opacity: 1,
            x: 0,
            rotation: -12,
            scale: 1,
            duration: duration * 0.75,
          },
        )
        .fromTo(
          ".lab-ring-two",
          {
            opacity: 0,
            x: distance * 0.75,
            rotation: 32,
            scale: 0.8,
          },
          {
            opacity: 1,
            x: 0,
            rotation: 12,
            scale: 1,
            duration: duration * 0.75,
          },
          "-=0.62",
        )
        .to([".lab-ring-one", ".lab-ring-two"], {
          scale: 1.08,
          duration: duration * 0.25,
          yoyo: true,
          repeat: 1,
          ease: "sine.inOut",
        })
        .fromTo(
          ".lab-sparkle-dot",
          {
            opacity: 0,
            scale: 0,
          },
          {
            opacity: 1,
            scale: 1,
            duration: duration * 0.28,
            stagger: Math.max(stagger * 0.4, 0.02),
            ease: "back.out(2)",
          },
          "-=0.18",
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
