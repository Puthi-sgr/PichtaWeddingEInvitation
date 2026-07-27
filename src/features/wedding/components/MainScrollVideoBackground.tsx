import { RefObject, useCallback, useRef, useState } from "react";
import { getCldFetchUrl, getRegisteredCldImage, getRegisteredCldVideo } from "../../../shared/utils/cld";
import { useReverseCoverMode } from "../hooks/useReverseCoverMode";
import { useCrossfadeVideoLoop } from "../hooks/useCrossfadeVideoLoop";
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

// The loop asset has no baked-in crossfade, so we crossfade it in the DOM instead:
// two stacked copies alternate, and one dissolves into the other at each loop seam
// (see useCrossfadeVideoLoop). TUNE the dissolve length and playback speed here.
const videoCrossfadeSeconds = 1;
// Playback speed: 1 = normal, 0.5 = half speed. Lower = slower/dreamier.
const videoPlaybackRate = 0.9;

type MainScrollVideoBackgroundProps = {
  containerRef: RefObject<HTMLDivElement | null>;
  className?: string;
  enabled?: boolean;
  initialReverseCoverVisible?: boolean;
  onVisualModeChange?: (mode: WeddingScrollVisualMode) => void;
};

// The background video autoplays and loops; it is no longer scroll-scrubbed. The
// removed seek engine (and its iOS decoder-priming workaround) is archived in
// .agents/scrub-engine-archive.md. `useReverseCoverMode` keeps the reverse-scroll
// cover image and the WeddingScrollVisualMode text-color contract alive.
export function MainScrollVideoBackground({
  className = "",
  enabled = true,
  initialReverseCoverVisible = false,
  onVisualModeChange,
}: MainScrollVideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const videoBRef = useRef<HTMLVideoElement>(null);
  const reverseScrubCoverRef = useRef<HTMLDivElement>(null);
  const [usePosterFallback, setUsePosterFallback] = useState(prefersReducedMotion);

  const handleFallback = useCallback(() => {
    debugEntryLog("MainScrollVideoBackground:fallback", () => ({
      video: getVideoDebugSnapshot(videoRef.current),
    }));
    onVisualModeChange?.("posterFallback");
    setUsePosterFallback(true);
  }, [onVisualModeChange]);

  useReverseCoverMode({
    reverseCoverRef: reverseScrubCoverRef,
    enabled: enabled && !usePosterFallback,
    initialReverseCoverVisible,
    onVisualModeChange,
  });

  useCrossfadeVideoLoop({
    videoARef: videoRef,
    videoBRef,
    enabled: !usePosterFallback,
    crossfadeSeconds: videoCrossfadeSeconds,
    playbackRate: videoPlaybackRate,
  });

  return (
    <div
      className={`hero-image wedding-mobile-viewport wedding-animated pointer-events-none fixed inset-0 z-0 h-[100lvh] min-h-[100dvh] w-screen overflow-hidden bg-stone-950 ${className}`}
    >
      <div className="absolute inset-0 isolate overflow-hidden" data-scroll-video-layer="main-scrub">
        {usePosterFallback ? (
          <img
            src={posterUrl}
            alt=""
            className={`h-full w-full object-cover ${mainScrubMediaPositionClass}`}
            aria-hidden="true"
          />
        ) : (
          <>
            <video
              ref={videoRef}
              data-scroll-video="main-background"
              autoPlay
              muted
              playsInline
              preload="auto"
              poster={posterUrl}
              style={{ opacity: 1 }}
              className={`absolute inset-0 h-full w-full object-cover ${mainScrubMediaPositionClass}`}
              aria-hidden="true"
              onLoadedData={() => {
                debugEntryLog("mainBackgroundVideo:loadeddata", () => ({
                  video: getVideoDebugSnapshot(videoRef.current),
                }));
              }}
              onError={handleFallback}
            >
              <source {...mobileBackgroundVideo.sourceProps} />
            </video>
            <video
              ref={videoBRef}
              data-scroll-video="main-background-b"
              autoPlay
              muted
              playsInline
              preload="auto"
              style={{ opacity: 0 }}
              className={`absolute inset-0 h-full w-full object-cover ${mainScrubMediaPositionClass}`}
              aria-hidden="true"
              onError={handleFallback}
            >
              <source {...mobileBackgroundVideo.sourceProps} />
            </video>
          </>
        )}
      </div>
      <div className="absolute inset-0" />
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
