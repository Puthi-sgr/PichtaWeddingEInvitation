import { useEffect, useRef } from "react";
import gsap from "gsap";
import { PresetHookOptions } from "./types";
import { getMotionSettings, resetLabAnimationState } from "./utils";

export function useIrisRevealAnimation({
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
          clipPath: "circle(0% at 50% 50%)",
          opacity: 0.35,
          scale: 1.06,
        },
        {
          clipPath: "circle(78% at 50% 50%)",
          opacity: 1,
          scale: 1,
          duration: duration * 1.15,
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
