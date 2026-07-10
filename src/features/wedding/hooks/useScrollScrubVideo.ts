import { RefObject, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { debugEntryLog, getVideoDebugSnapshot } from "../utils/entryDebug";
import { WeddingScrollVisualMode } from "../types";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

const forwardScrubEase = 0.5;
const backwardScrubEase = 0.5;
const forwardVideoSeekDeltaSeconds = 0.01;
const backwardVideoSeekDeltaSeconds = 0.01;
const forwardSeekCooldownMs = 0;
const backwardSeekCooldownMs = 100;
const reverseCoverScrollThresholdPx = 40;
const temporarilyEnableReverseScrub = false;

type ScrubDirection = "forward" | "backward";

type UseScrollScrubVideoParams = {
  videoRef: RefObject<HTMLVideoElement | null>;
  containerRef: RefObject<HTMLDivElement | null>;
  reverseCoverRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  initialReverseCoverVisible?: boolean;
  onFallback: () => void;
  onVisualModeChange?: (mode: WeddingScrollVisualMode) => void;
};

export function useScrollScrubVideo({
  videoRef,
  containerRef,
  reverseCoverRef,
  enabled,
  initialReverseCoverVisible = false,
  onFallback,
  onVisualModeChange,
}: UseScrollScrubVideoParams) {
  useEffect(() => {
    const video = videoRef.current;
    const container = containerRef.current;

    if (!video || !container || !enabled) {
      debugEntryLog("scrollScrub:inactive", {
        enabled,
        hasContainer: Boolean(container),
        video: getVideoDebugSnapshot(video),
      });
      return;
    }

    debugEntryLog("scrollScrub:init", {
      enabled,
      initialReverseCoverVisible,
      video: getVideoDebugSnapshot(video),
    });

    let trigger: ScrollTrigger | undefined;
    let hasCreatedScrubTrigger = false;
    let hasReportedFallback = false;
    let cancelled = false;
    let targetTime = 0;
    let easedTime = 0;
    let lastCommittedTime = 0;
    let isSeeking = false;
    let lastSeekAt = 0;
    let lastDirection: ScrubDirection = "forward";
    let skippedSeekCount = 0;
    let activeScrollDirection: ScrubDirection = "forward";
    let lastScrollY = typeof window !== "undefined" ? window.scrollY : 0;
    let reverseScrollDistance = 0;
    let isReverseCoverLatched = false;
    let lastReportedVisualMode: WeddingScrollVisualMode | undefined;

    const setReverseCoverOpacity = (opacity: "0" | "1") => {
      if (reverseCoverRef.current) {
        reverseCoverRef.current.style.opacity = opacity;
      }
    };

    const reportVisualMode = (mode: WeddingScrollVisualMode) => {
      if (lastReportedVisualMode === mode) {
        return;
      }

      lastReportedVisualMode = mode;
      onVisualModeChange?.(mode);
    };

    const updateReverseCover = () => {
      if (temporarilyEnableReverseScrub) {
        setReverseCoverOpacity("0");
        reportVisualMode("forwardScrub");
        return;
      }

      setReverseCoverOpacity(isReverseCoverLatched ? "1" : "0");
      reportVisualMode(isReverseCoverLatched ? "reverseCover" : "forwardScrub");
    };

    const updateEngineDebugState = () => {
      const lastSeekAge = lastSeekAt > 0 ? performance.now() - lastSeekAt : 0;

      video.dataset.scrollVideoDirection = lastDirection;
      video.dataset.scrollVideoSeeking = String(isSeeking);
      video.dataset.scrollVideoTargetTime = targetTime.toFixed(3);
      video.dataset.scrollVideoEasedTime = easedTime.toFixed(3);
      video.dataset.scrollVideoLastCommittedTime = lastCommittedTime.toFixed(3);
      video.dataset.scrollVideoSkippedSeeks = String(skippedSeekCount);
      video.dataset.scrollVideoLastSeekAge = lastSeekAge.toFixed(0);
    };

    const clampTime = (time: number) => {
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return 0;
      return Math.min(Math.max(time, 0), duration);
    };

    const reportFallback = () => {
      if (hasReportedFallback) {
        return;
      }

      hasReportedFallback = true;
      onFallback();
    };

    const updateVideoTime = () => {
      if (cancelled || !enabled) {
        return;
      }

      const direction: ScrubDirection = targetTime >= easedTime ? "forward" : "backward";
      const ease = direction === "forward" ? forwardScrubEase : backwardScrubEase;
      easedTime += (targetTime - easedTime) * ease;
      lastDirection = direction;

      updateReverseCover();

      if (!temporarilyEnableReverseScrub && activeScrollDirection === "backward" && isReverseCoverLatched) {
        updateEngineDebugState();
        return;
      }

      const nextTime = clampTime(easedTime);
      const seekDelta = direction === "forward" ? forwardVideoSeekDeltaSeconds : backwardVideoSeekDeltaSeconds;
      const cooldownMs = direction === "forward" ? forwardSeekCooldownMs : backwardSeekCooldownMs;
      const distanceFromLastCommit = Math.abs(lastCommittedTime - nextTime);
      const now = performance.now();

      if (distanceFromLastCommit <= seekDelta) {
        updateEngineDebugState();
        return;
      }

      if (isSeeking) {
        skippedSeekCount += 1;
        updateEngineDebugState();
        return;
      }

      if (now - lastSeekAt < cooldownMs) {
        skippedSeekCount += 1;
        updateEngineDebugState();
        return;
      }

      video.currentTime = nextTime;
      lastCommittedTime = nextTime;
      lastSeekAt = now;
      isSeeking = true;
      updateEngineDebugState();
    };

    const createScrubTrigger = () => {
      if (hasCreatedScrubTrigger) {
        return;
      }

      trigger?.kill();

      if (cancelled || !Number.isFinite(video.duration) || video.duration <= 0) {
        debugEntryLog("scrollScrub:fallback-invalid-duration", {
          cancelled,
          video: getVideoDebugSnapshot(video),
        });
        reportFallback();
        return;
      }

      video.pause();
      video.currentTime = 0;
      targetTime = 0;
      easedTime = 0;
      lastCommittedTime = 0;
      isSeeking = false;
      lastSeekAt = 0;
      lastDirection = "forward";
      skippedSeekCount = 0;
      activeScrollDirection = "forward";
      lastScrollY = window.scrollY;
      reverseScrollDistance = 0;
      isReverseCoverLatched = initialReverseCoverVisible;
      setReverseCoverOpacity(initialReverseCoverVisible ? "1" : "0");
      reportVisualMode(initialReverseCoverVisible ? "initialCover" : "forwardScrub");
      updateEngineDebugState();
      hasCreatedScrubTrigger = true;

      debugEntryLog("scrollScrub:createTrigger", {
        video: getVideoDebugSnapshot(video),
      });

      trigger = ScrollTrigger.create({
        trigger: container,
        start: "top top",
        end: "bottom bottom",
        onUpdate: (self) => {
          targetTime = clampTime(self.progress * video.duration);
          const currentScrollY = window.scrollY;
          const scrollDelta = currentScrollY - lastScrollY;

          activeScrollDirection = self.direction === -1 ? "backward" : "forward";

          if (activeScrollDirection === "backward") {
            reverseScrollDistance += Math.max(Math.abs(scrollDelta), 0);
            if (reverseScrollDistance >= reverseCoverScrollThresholdPx) {
              isReverseCoverLatched = true;
            }
          } else {
            reverseScrollDistance = 0;
            isReverseCoverLatched = false;
          }

          lastScrollY = currentScrollY;
        },
      });

      gsap.ticker.remove(updateVideoTime);
      gsap.ticker.add(updateVideoTime);
    };

    const onLoadedMetadata = () => {
      debugEntryLog("scrollScrub:loadedmetadata", {
        video: getVideoDebugSnapshot(video),
      });
      createScrubTrigger();
    };
    const onError = () => {
      debugEntryLog("scrollScrub:error", {
        video: getVideoDebugSnapshot(video),
      });
      reportFallback();
    };
    const onSeeking = () => {
      isSeeking = true;
      updateEngineDebugState();
    };
    const onSeeked = () => {
      isSeeking = false;
      updateEngineDebugState();
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("error", onError);
    video.addEventListener("seeking", onSeeking);
    video.addEventListener("seeked", onSeeked);

    if (video.readyState >= 1) {
      createScrubTrigger();
    } else {
      debugEntryLog("scrollScrub:load", {
        video: getVideoDebugSnapshot(video),
      });
      video.load();
    }

    return () => {
      debugEntryLog("scrollScrub:cleanup", {
        video: getVideoDebugSnapshot(video),
      });
      cancelled = true;
      trigger?.kill();
      gsap.ticker.remove(updateVideoTime);
      setReverseCoverOpacity("0");
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      video.removeEventListener("error", onError);
      video.removeEventListener("seeking", onSeeking);
      video.removeEventListener("seeked", onSeeked);
    };
  }, [containerRef, enabled, initialReverseCoverVisible, onFallback, onVisualModeChange, reverseCoverRef, videoRef]);
}
