import { RefObject, useEffect } from "react";
import { WeddingScrollVisualMode } from "../types";

const reverseCoverScrollThresholdPx = 40;

type UseReverseCoverModeParams = {
  reverseCoverRef: RefObject<HTMLDivElement | null>;
  enabled: boolean;
  initialReverseCoverVisible?: boolean;
  onVisualModeChange?: (mode: WeddingScrollVisualMode) => void;
};

// Drives the reverse-scroll cover image and the WeddingScrollVisualMode contract
// without any video seeking. The background video now autoplays and loops, so
// this hook only watches scroll direction: scrolling up past a small threshold
// latches the reverse cover on (lighter background + reverse text colors);
// scrolling down clears it. See .agents/scrub-engine-archive.md for the removed
// scroll-scrub engine this replaces.
export function useReverseCoverMode({
  reverseCoverRef,
  enabled,
  initialReverseCoverVisible = false,
  onVisualModeChange,
}: UseReverseCoverModeParams) {
  useEffect(() => {
    if (!enabled) return;

    let lastScrollY = window.scrollY;
    let reverseScrollDistance = 0;
    let isReverseCoverLatched = initialReverseCoverVisible;
    let lastReportedMode: WeddingScrollVisualMode | undefined;

    const setReverseCoverOpacity = (opacity: "0" | "1") => {
      if (reverseCoverRef.current) reverseCoverRef.current.style.opacity = opacity;
    };

    const reportMode = (mode: WeddingScrollVisualMode) => {
      if (lastReportedMode === mode) return;
      lastReportedMode = mode;
      onVisualModeChange?.(mode);
    };

    setReverseCoverOpacity(initialReverseCoverVisible ? "1" : "0");
    reportMode(initialReverseCoverVisible ? "initialCover" : "forwardScrub");

    const onScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY;
      lastScrollY = currentScrollY;

      if (delta < 0) {
        reverseScrollDistance += Math.abs(delta);
        if (reverseScrollDistance >= reverseCoverScrollThresholdPx) {
          isReverseCoverLatched = true;
        }
      } else if (delta > 0) {
        reverseScrollDistance = 0;
        isReverseCoverLatched = false;
      }

      setReverseCoverOpacity(isReverseCoverLatched ? "1" : "0");
      reportMode(isReverseCoverLatched ? "reverseCover" : "forwardScrub");
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      setReverseCoverOpacity("0");
    };
  }, [enabled, initialReverseCoverVisible, onVisualModeChange, reverseCoverRef]);
}
