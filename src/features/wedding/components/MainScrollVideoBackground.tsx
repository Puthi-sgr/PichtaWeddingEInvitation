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
      className={`hero-image wedding-animated pointer-events-none fixed inset-0 z-0 h-[100lvh] min-h-[100dvh] w-screen overflow-hidden bg-stone-950 ${className}`}
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
            <source media="(max-width: 767px)" {...mobileBackgroundVideo.sourceProps} />
            <source media="(min-width: 768px)" {...desktopBackgroundVideo.sourceProps} />
          </video>
        )}
      </div>
      <div className="absolute inset-0 bg-black/20" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/18 via-black/12 to-black/24" />
      <div
        ref={reverseScrubCoverRef}
        className={`absolute inset-0 overflow-hidden transition-opacity duration-500 ease-out ${
          initialReverseCoverVisible ? "opacity-100" : "opacity-0"
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
