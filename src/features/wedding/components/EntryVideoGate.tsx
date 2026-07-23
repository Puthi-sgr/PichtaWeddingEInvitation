import { useEffect, useRef } from "react";
import { getRegisteredCldVideo } from "../../../shared/utils/cld";
import { useEntryVideoGate } from "../hooks/useEntryVideoGate";
import { debugEntryLog, getVideoDebugSnapshot } from "../utils/entryDebug";

const entryVideo = getRegisteredCldVideo("wedding.entry", {
  width: 720,
  height: 1280,
  crop: "fill",
  gravity: "auto",
  quality: "auto",
  format: "mp4",
  posterOffset: 0.1,
});

type EntryVideoGateProps = {
  isExiting?: boolean;
  exitDurationMs?: number;
  onComplete: () => void;
  onFallback: () => void;
  onBuffered?: () => void;
};

export function EntryVideoGate({
  isExiting = false,
  exitDurationMs = 180,
  onComplete,
  onFallback,
  onBuffered,
}: EntryVideoGateProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const entryGate = useEntryVideoGate({
    videoRef,
    playOnInteraction: true,
    allowDismissOnInteraction: false,
    keepVisibleAfterDismiss: true,
    persistDismissal: false,
    onDismiss: onComplete,
    onFallback,
    onBuffered,
  });

  useEffect(() => {
    debugEntryLog("EntryVideoGate:mounted", () => ({
      isVisible: entryGate.isVisible,
      video: getVideoDebugSnapshot(videoRef.current),
    }));

    return () => {
      debugEntryLog("EntryVideoGate:unmounted", () => ({
        video: getVideoDebugSnapshot(videoRef.current),
      }));
    };
  }, []);

  useEffect(() => {
    debugEntryLog("EntryVideoGate:state", () => ({
      hasError: entryGate.hasError,
      hasPlaybackStarted: entryGate.hasPlaybackStarted,
      isDismissed: entryGate.isDismissed,
      isExiting,
      isVisible: entryGate.isVisible,
      video: getVideoDebugSnapshot(videoRef.current),
    }));
  }, [entryGate.hasError, entryGate.hasPlaybackStarted, entryGate.isDismissed, entryGate.isVisible, isExiting]);

  if (!entryGate.isVisible) return null;

  return (
    <div
      {...entryGate.gateProps}
      data-entry-video-gate
      tabIndex={isExiting ? -1 : 0}
      className={`wedding-mobile-viewport fixed inset-0 z-[9999] h-[100lvh] min-h-[100dvh] w-screen overflow-hidden bg-black ${
        isExiting ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{
        transitionDuration: `${exitDurationMs}ms`,
        transitionProperty: "opacity",
        transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        willChange: isExiting ? "opacity" : undefined,
      }}
      aria-hidden={isExiting ? true : undefined}
      aria-label="វីដេអូបើកធៀបអាពាហ៍ពិពាហ៍"
    >
      <video
        ref={videoRef}
        {...entryGate.videoProps}
        poster={entryVideo.posterUrl}
        className="h-full w-full object-cover"
      >
        <source {...entryVideo.sourceProps} />
      </video>
    </div>
  );
}
