import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PresetHookOptions } from "./types";
import { getMotionSettings, resetLabAnimationState } from "./utils";

export function usePhotoCurtainAnimation({
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
      timelineRef.current = gsap.timeline().fromTo(
        ".lab-photo-frame",
        {
          clipPath: "inset(0 50% 0 50% round 0.375rem)",
          opacity: 0.4,
          scale: 1.04,
        },
        {
          clipPath: "inset(0 0% 0 0% round 0.375rem)",
          opacity: 1,
          scale: 1,
          duration: duration * 1.1,
          ease: "expo.out",
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
