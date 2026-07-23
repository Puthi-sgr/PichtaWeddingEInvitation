import { useEffect, useRef } from "react";
import { frameImage } from "../components/WeddingFrameOverlay";
import { mobileBackgroundVideo, reverseScrollCoverImage } from "../components/MainScrollVideoBackground";
import { debugEntryLog } from "../utils/entryDebug";

const imageStageSafetyTimeoutMs = 1500;
function preloadImage(url: string) {
  return new Promise<void>((resolve) => {
    if (!url) {
      resolve();
      return;
    }

    const image = new Image();
    image.onload = () => resolve();
    image.onerror = () => resolve();
    image.src = url;
  });
}

type UseCriticalAssetPreloadParams = {
  enabled: boolean;
};

export function useCriticalAssetPreload({ enabled }: UseCriticalAssetPreloadParams) {
  const hasStartedRef = useRef(false);
  const preloadVideoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    if (!enabled || hasStartedRef.current) return;
    hasStartedRef.current = true;

    let cancelled = false;

    debugEntryLog("criticalAssetPreload:stageA-start", () => ({
      frameImageUrl: frameImage.url,
      reverseScrollCoverImageUrl: reverseScrollCoverImage.url,
    }));

    const imagesReady = Promise.all([preloadImage(frameImage.url), preloadImage(reverseScrollCoverImage.url)]);
    const safetyTimeout = new Promise<void>((resolve) => {
      window.setTimeout(resolve, imageStageSafetyTimeoutMs);
    });

    Promise.race([imagesReady, safetyTimeout]).then(() => {
      if (cancelled) return;

      const targetVideo = mobileBackgroundVideo;

      debugEntryLog("criticalAssetPreload:stageB-start", () => ({
        videoUrl: targetVideo.url,
      }));

      if (!targetVideo.url) return;

      const video = document.createElement("video");
      video.muted = true;
      video.preload = "auto";
      video.src = targetVideo.url;
      video.load();
      preloadVideoRef.current = video;
    });

    return () => {
      cancelled = true;

      const video = preloadVideoRef.current;
      if (video) {
        video.removeAttribute("src");
        video.load();
        preloadVideoRef.current = null;
      }
    };
  }, [enabled]);
}
