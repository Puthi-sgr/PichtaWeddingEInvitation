import { RefObject, useEffect } from "react";

type UseCrossfadeVideoLoopParams = {
  videoARef: RefObject<HTMLVideoElement | null>;
  videoBRef: RefObject<HTMLVideoElement | null>;
  enabled: boolean;
  // Length of the cross-dissolve at the loop seam, in seconds.
  crossfadeSeconds?: number;
  // Playback speed applied to both copies. 1 = normal, 0.5 = half speed, etc.
  playbackRate?: number;
};

// Seamless crossfade loop for a video that has NO baked-in crossfade. Two stacked
// copies of the same clip alternate: while one plays to its end, the other starts
// from frame 0 and dissolves in over it. Each copy's hard loop-snap therefore
// happens while it is invisible, so only the smooth dissolve is ever seen.
//
// Only the INCOMING copy fades (0 -> 1), stacked on top; the outgoing copy stays
// fully opaque underneath until the dissolve completes. This keeps the stack 100%
// opaque throughout, so the dark background never bleeds through mid-crossfade (a
// symmetric fade-out + fade-in would dip to ~75% opacity and briefly darken).
//
// Reads `duration` at runtime, so no timecodes are hardcoded. Both decoders are
// warmed up front to avoid a cold first handoff; at steady state only one copy
// plays, both play only during the crossfade window.
export function useCrossfadeVideoLoop({
  videoARef,
  videoBRef,
  enabled,
  crossfadeSeconds = 1,
  playbackRate = 1,
}: UseCrossfadeVideoLoopParams) {
  useEffect(() => {
    const a = videoARef.current;
    const b = videoBRef.current;
    if (!a || !b || !enabled || !(crossfadeSeconds > 0)) return;

    let cancelled = false;
    let rafId = 0;
    let handoffTimer = 0;
    let active = a;
    let incoming = b;
    let handingOff = false;

    const setOpacityInstant = (video: HTMLVideoElement, opacity: number) => {
      video.style.transitionDuration = "0s";
      video.style.opacity = String(opacity);
    };

    const fadeIn = (video: HTMLVideoElement) => {
      video.style.transitionProperty = "opacity";
      video.style.transitionTimingFunction = "linear";
      video.style.transitionDuration = `${crossfadeSeconds}s`;
      video.style.opacity = "1";
    };

    const safePlay = (video: HTMLVideoElement) => {
      video.muted = true;
      video.playbackRate = playbackRate;
      const result = video.play();
      if (result && typeof result.then === "function") result.catch(() => {});
    };

    // Steady state: active opaque underneath, incoming hidden.
    active.style.zIndex = "1";
    incoming.style.zIndex = "0";
    setOpacityInstant(active, 1);
    setOpacityInstant(incoming, 0);
    safePlay(active);
    safePlay(incoming);

    // Warm the incoming decoder, then hold it paused at frame 0.
    const holdIncoming = () => {
      if (cancelled) return;
      incoming.pause();
      incoming.currentTime = 0;
    };
    if (incoming.readyState >= 2) holdIncoming();
    else incoming.addEventListener("loadeddata", holdIncoming, { once: true });

    const startCrossfade = () => {
      handingOff = true;
      const outgoing = active;

      incoming.currentTime = 0;
      safePlay(incoming);
      // Incoming fades in on top; outgoing stays fully opaque underneath.
      incoming.style.zIndex = "2";
      outgoing.style.zIndex = "1";
      setOpacityInstant(incoming, 0);
      // Force the 0 to commit before starting the transition to 1.
      void incoming.offsetWidth;
      fadeIn(incoming);

      handoffTimer = window.setTimeout(() => {
        if (cancelled) return;
        // Incoming is now fully opaque on top; hide + rewind the outgoing behind it.
        setOpacityInstant(outgoing, 0);
        outgoing.pause();
        outgoing.currentTime = 0;
        incoming.style.zIndex = "1";
        outgoing.style.zIndex = "0";
        // Swap roles.
        active = incoming;
        incoming = outgoing;
        handingOff = false;
      }, crossfadeSeconds * 1000);
    };

    const tick = () => {
      if (cancelled) return;
      const duration = active.duration;
      if (
        !handingOff &&
        Number.isFinite(duration) &&
        duration > 0 &&
        active.currentTime >= duration - crossfadeSeconds
      ) {
        startCrossfade();
      }
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => {
      cancelled = true;
      if (rafId) cancelAnimationFrame(rafId);
      if (handoffTimer) window.clearTimeout(handoffTimer);
      incoming.removeEventListener("loadeddata", holdIncoming);
    };
  }, [videoARef, videoBRef, enabled, crossfadeSeconds, playbackRate]);
}
