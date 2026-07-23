import { KeyboardEvent, RefObject, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { debugEntryLog, getVideoDebugSnapshot } from "../utils/entryDebug";

const defaultStorageKey = "wedding-entry-video-dismissed";

type UseEntryVideoGateParams = {
  videoRef: RefObject<HTMLVideoElement | null>;
  enabled?: boolean;
  playOnInteraction?: boolean;
  allowDismissOnInteraction?: boolean;
  keepVisibleAfterDismiss?: boolean;
  persistDismissal?: boolean;
  storageKey?: string;
  onDismiss?: () => void;
  onFallback?: () => void;
  onBuffered?: () => void;
};

export function useEntryVideoGate({
  videoRef,
  enabled = true,
  playOnInteraction = false,
  allowDismissOnInteraction = true,
  keepVisibleAfterDismiss = false,
  persistDismissal = false,
  storageKey = defaultStorageKey,
  onDismiss,
  onFallback,
  onBuffered,
}: UseEntryVideoGateParams) {
  const lastVideoElementRef = useRef<HTMLVideoElement | null>(null);
  const shouldReleaseOnCleanupRef = useRef(false);
  const hasReportedBufferedRef = useRef(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    if (!persistDismissal || typeof window === "undefined") return false;
    return window.sessionStorage.getItem(storageKey) === "true";
  });
  const [hasPlaybackStarted, setHasPlaybackStarted] = useState(false);
  const [hasError, setHasError] = useState(false);
  const isVisible = enabled && !hasError && (!isDismissed || keepVisibleAfterDismiss);

  const getVideoElement = useCallback(() => {
    if (videoRef.current) {
      lastVideoElementRef.current = videoRef.current;
    }

    return videoRef.current ?? lastVideoElementRef.current;
  }, [videoRef]);

  const releaseVideo = useCallback(() => {
    const video = getVideoElement();
    if (!video) return;

    debugEntryLog("releaseVideo:start", () => ({
      video: getVideoDebugSnapshot(video),
    }));

    video.pause();
    video.removeAttribute("src");
    video.querySelectorAll("source").forEach((source) => {
      source.removeAttribute("src");
    });
    video.load();
    lastVideoElementRef.current = null;

    debugEntryLog("releaseVideo:after-load", () => ({
      video: getVideoDebugSnapshot(video),
    }));
  }, [getVideoElement]);

  const dismiss = useCallback(() => {
    if (isDismissed) return;

    shouldReleaseOnCleanupRef.current = true;

    if (videoRef.current) {
      lastVideoElementRef.current = videoRef.current;
    }

    debugEntryLog("dismiss:start", () => ({
      video: getVideoDebugSnapshot(videoRef.current),
      keepVisibleAfterDismiss,
      persistDismissal,
    }));

    setIsDismissed(true);

    if (persistDismissal && typeof window !== "undefined") {
      window.sessionStorage.setItem(storageKey, "true");
    }

    debugEntryLog("dismiss:before-onDismiss", () => ({
      video: getVideoDebugSnapshot(videoRef.current),
    }));
    onDismiss?.();
    debugEntryLog("dismiss:after-onDismiss", () => ({
      video: getVideoDebugSnapshot(videoRef.current),
    }));
  }, [isDismissed, keepVisibleAfterDismiss, onDismiss, persistDismissal, storageKey, videoRef]);

  const tryPlay = useCallback(async () => {
    const video = videoRef.current;
    if (!video || !isVisible) return;

    debugEntryLog("tryPlay:start", () => ({
      video: getVideoDebugSnapshot(video),
    }));

    video.muted = true;
    video.playsInline = true;
    video.loop = false;

    try {
      await video.play();
      setHasPlaybackStarted(true);
      debugEntryLog("tryPlay:resolved", () => ({
        video: getVideoDebugSnapshot(video),
      }));
    } catch {
      setHasPlaybackStarted(false);
      debugEntryLog("tryPlay:rejected", () => ({
        video: getVideoDebugSnapshot(video),
      }));
    }
  }, [isVisible, videoRef]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !isVisible || isDismissed) return;

    lastVideoElementRef.current = video;

    const handleCanPlay = () => {
      debugEntryLog("video:canplay", () => ({
        video: getVideoDebugSnapshot(video),
        playOnInteraction,
      }));
      if (!playOnInteraction) {
        void tryPlay();
      }
    };
    const handleEnded = () => {
      debugEntryLog("video:ended", () => ({
        video: getVideoDebugSnapshot(video),
      }));
      dismiss();
    };
    const handleError = () => {
      debugEntryLog("video:error", () => ({
        video: getVideoDebugSnapshot(video),
      }));
      setHasError(true);
      releaseVideo();
      onFallback?.();
    };
    const handleCanPlayThrough = () => {
      if (hasReportedBufferedRef.current) return;
      hasReportedBufferedRef.current = true;

      debugEntryLog("video:canplaythrough", () => ({
        video: getVideoDebugSnapshot(video),
      }));
      onBuffered?.();
    };

    video.addEventListener("canplay", handleCanPlay);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("error", handleError);
    video.addEventListener("canplaythrough", handleCanPlayThrough);

    if (video.readyState >= 3 && !playOnInteraction) {
      debugEntryLog("video:ready-autoplay", () => ({
        video: getVideoDebugSnapshot(video),
      }));
      void tryPlay();
    } else {
      debugEntryLog("video:load", () => ({
        video: getVideoDebugSnapshot(video),
        playOnInteraction,
      }));
      video.load();
    }

    if (video.readyState >= 4) {
      handleCanPlayThrough();
    }

    return () => {
      video.removeEventListener("canplay", handleCanPlay);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("error", handleError);
      video.removeEventListener("canplaythrough", handleCanPlayThrough);
    };
  }, [dismiss, isDismissed, isVisible, onBuffered, onFallback, playOnInteraction, releaseVideo, tryPlay, videoRef]);

  useEffect(() => {
    if (!enabled || (isDismissed && !keepVisibleAfterDismiss)) {
      releaseVideo();
    }
  }, [enabled, isDismissed, keepVisibleAfterDismiss, releaseVideo]);

  useEffect(() => {
    return () => {
      if (shouldReleaseOnCleanupRef.current) {
        releaseVideo();
      }
    };
  }, [releaseVideo]);

  const handleInteraction = useCallback(() => {
    debugEntryLog("interaction", () => ({
      allowDismissOnInteraction,
      hasPlaybackStarted,
      playOnInteraction,
      video: getVideoDebugSnapshot(videoRef.current),
    }));

    // Unlock the main scroll-scrub video within this same user gesture. iOS
    // Safari only grants a <video> the frame-rendering rights needed for
    // currentTime scrubbing from inside a real tap — MainScrollVideoBackground
    // listens for this and primes its video synchronously.
    if (typeof window !== "undefined") {
      window.dispatchEvent(new Event("wedding:entry-tap"));
    }

    if (playOnInteraction && !hasPlaybackStarted) {
      void tryPlay();
      return;
    }

    if (allowDismissOnInteraction) {
      dismiss();
    }
  }, [allowDismissOnInteraction, dismiss, hasPlaybackStarted, playOnInteraction, tryPlay, videoRef]);

  const gateProps = useMemo(
    () => ({
      role: "button",
      tabIndex: 0,
      onClick: handleInteraction,
      onKeyDown: (event: KeyboardEvent) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          handleInteraction();
        }
      },
    }),
    [handleInteraction],
  );

  const videoProps = useMemo(
    () => ({
      muted: true,
      playsInline: true,
      loop: false,
      preload: "auto" as const,
    }),
    [],
  );

  return {
    isVisible,
    isDismissed,
    hasPlaybackStarted,
    hasError,
    dismiss,
    releaseVideo,
    tryPlay,
    gateProps,
    videoProps,
  };
}
