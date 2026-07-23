import { RefObject, useCallback, useEffect, useRef, useState } from "react";
import { getCldFetchUrl, getRegisteredCldImage, getRegisteredCldVideo } from "../../../shared/utils/cld";
import { useScrollScrubVideo } from "../hooks/useScrollScrubVideo";
import { WeddingScrollVisualMode } from "../types";
import { debugEntryLog, getVideoDebugSnapshot } from "../utils/entryDebug";

export const mobileBackgroundVideo = getRegisteredCldVideo("wedding.hero-main", {
  width: 720,
  height: 1280,
  crop: "fill",
  gravity: "auto",
  quality: "auto",
  format: "mp4",
});
export const desktopBackgroundVideo = getRegisteredCldVideo("wedding.hero-main", {
  width: 1280,
  height: 720,
  crop: "fill",
  gravity: "auto",
  quality: "auto",
  format: "mp4",
});
const fallbackPosterUrl = getCldFetchUrl(
  "https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=2000",
  { width: 2000 },
);
const posterUrl = mobileBackgroundVideo.posterUrl ?? desktopBackgroundVideo.posterUrl ?? fallbackPosterUrl;
export const reverseScrollCoverImage = getRegisteredCldImage("wedding.reverse-scroll-cover", {
  width: 1280,
  autoFormat: true,
  autoQuality: true,
});
const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const mainScrubMediaPositionClass = "object-center";
const reverseScrollCoverPositionClass = "object-[25%_45%]";
const videoBufferedSafetyTimeoutMs = 4000;

type MainScrollVideoBackgroundProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  className?: string;
  enabled?: boolean;
  initialReverseCoverVisible?: boolean;
  onVisualModeChange?: (mode: WeddingScrollVisualMode) => void;
};

export function MainScrollVideoBackground({
  containerRef,
  className = "",
  enabled = true,
  initialReverseCoverVisible = false,
  onVisualModeChange,
}: MainScrollVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const reverseScrubCoverRef = useRef<HTMLDivElement>(null);
  const primeStateRef = useRef<"idle" | "done">("idle");
  const [usePosterFallback, setUsePosterFallback] = useState(prefersReducedMotion);
  const [isVideoBuffered, setIsVideoBuffered] = useState(false);

  const handleFallback = useCallback(() => {
    debugEntryLog("MainScrollVideoBackground:fallback", () => ({
      video: getVideoDebugSnapshot(videoRef.current),
    }));
    onVisualModeChange?.("posterFallback");
    setUsePosterFallback(true);
  }, [onVisualModeChange]);

  const handleVideoBuffered = useCallback((reason: string) => {
    debugEntryLog(`mainBackgroundVideo:buffered (${reason})`, () => ({
      video: getVideoDebugSnapshot(videoRef.current),
    }));
    setIsVideoBuffered(true);
  }, []);

  useEffect(() => {
    if (usePosterFallback) return;

    if (videoRef.current && videoRef.current.readyState >= 4) {
      handleVideoBuffered("already-ready");
      return;
    }

    const timeout = window.setTimeout(() => handleVideoBuffered("safety-timeout"), videoBufferedSafetyTimeoutMs);
    return () => window.clearTimeout(timeout);
  }, [handleVideoBuffered, usePosterFallback]);

  // Mobile browsers (iOS Safari most notably) will not paint any frame for a
  // <video> that has only been loaded but never played — so scrubbing its
  // currentTime shows a black rectangle. The scrub engine only ever pauses and
  // seeks, so we "unlock" the decoder with a muted play() → pause(). iOS grants
  // that unlock reliably only inside a real user gesture, so the primary path
  // is the entry-screen tap ("wedding:entry-tap"); the autoplay attempt is the
  // fallback that covers desktop and most Android.
  const primeVideo = useCallback(
    (reason: string) => {
      if (primeStateRef.current === "done") return;
      const video = videoRef.current;
      if (!video || usePosterFallback) return;

      video.muted = true;
      video.playsInline = true;

      const playResult = video.play();
      if (!playResult || typeof playResult.then !== "function") {
        primeStateRef.current = "done";
        return;
      }

      playResult
        .then(() => {
          if (primeStateRef.current === "done") return;
          primeStateRef.current = "done";
          // Let one frame decode and paint, then hand control to the scrub
          // engine, which pauses and seeks from here on.
          requestAnimationFrame(() => {
            const activeVideo = videoRef.current;
            if (!activeVideo) return;
            activeVideo.pause();
            handleVideoBuffered(`primed:${reason}`);
          });
        })
        .catch(() => {
          // Blocked (e.g. muted autoplay refused without a gesture). Leaving the
          // state idle lets a later user gesture retry the unlock; the poster
          // and reverse cover still render in the meantime.
          debugEntryLog("mainBackgroundVideo:prime-blocked", () => ({
            reason,
            video: getVideoDebugSnapshot(videoRef.current),
          }));
        });
    },
    [handleVideoBuffered, usePosterFallback],
  );

  // Primary unlock path: the tap on the entry screen is a real user gesture, so
  // priming the scrub video within it satisfies iOS Safari's activation rule.
  useEffect(() => {
    if (usePosterFallback) return;
    const onEntryTap = () => primeVideo("entry-tap");
    window.addEventListener("wedding:entry-tap", onEntryTap);
    return () => window.removeEventListener("wedding:entry-tap", onEntryTap);
  }, [primeVideo, usePosterFallback]);

  // Fallback: on platforms that allow muted autoplay (desktop, most Android),
  // prime as soon as the video has data without needing the tap.
  useEffect(() => {
    if (usePosterFallback) return;
    const video = videoRef.current;
    if (!video) return;

    const attempt = () => primeVideo("autoplay");
    if (video.readyState >= 2) {
      attempt();
      return;
    }

    video.addEventListener("loadeddata", attempt, { once: true });
    return () => video.removeEventListener("loadeddata", attempt);
  }, [primeVideo, usePosterFallback]);

  useScrollScrubVideo({
    videoRef,
    containerRef,
    reverseCoverRef: reverseScrubCoverRef,
    enabled: enabled && isVideoBuffered && !usePosterFallback,
    initialReverseCoverVisible,
    onFallback: handleFallback,
    onVisualModeChange,
  });

  return (
    <div
      className={`hero-image wedding-mobile-viewport wedding-animated pointer-events-none fixed inset-0 z-0 h-[100lvh] min-h-[100dvh] w-screen overflow-hidden bg-stone-950 ${className}`}
    >
      <div className="absolute inset-0 overflow-hidden" data-scroll-video-layer="main-scrub">
        {usePosterFallback ? (
          <img
            src={posterUrl}
            alt=""
            className={`h-full w-full object-cover ${mainScrubMediaPositionClass}`}
            aria-hidden="true"
          />
        ) : (
          <video
            ref={videoRef}
            data-scroll-video="main-background"
            muted
            playsInline
            preload="auto"
            poster={posterUrl}
            className={`h-full w-full object-cover ${mainScrubMediaPositionClass}`}
            aria-hidden="true"
            onLoadedMetadata={() => {
              debugEntryLog("mainBackgroundVideo:loadedmetadata", () => ({
                video: getVideoDebugSnapshot(videoRef.current),
              }));
            }}
            onLoadedData={() => {
              debugEntryLog("mainBackgroundVideo:loadeddata", () => ({
                video: getVideoDebugSnapshot(videoRef.current),
              }));
            }}
            onCanPlayThrough={() => handleVideoBuffered("canplaythrough")}
            onError={() => handleVideoBuffered("error")}
          >
            <source {...mobileBackgroundVideo.sourceProps} />
          </video>
        )}
      </div>
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/12 to-black/24" />
      <div
        ref={reverseScrubCoverRef}
        className={`absolute inset-0 overflow-hidden transition-opacity duration-500 ease-out ${initialReverseCoverVisible ? "opacity-100" : "opacity-0"
          }`}
        data-scroll-video-layer="reverse-cover"
        aria-hidden="true"
      >
        <img
          src={reverseScrollCoverImage.url}
          alt=""
          className={`h-full w-full object-cover ${reverseScrollCoverPositionClass}`}
          onLoad={() => {
            debugEntryLog("reverseCoverImage:load");
          }}
        />
      </div>
    </div>
  );
}
