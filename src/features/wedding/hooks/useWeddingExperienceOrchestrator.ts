import { useCallback, useEffect, useMemo, useState } from "react";
import { debugEntryLog } from "../utils/entryDebug";

export type WeddingLoadPhase =
  | "entry"
  | "entryExiting"
  | "criticalLoading"
  | "invitationEntering"
  | "invitationReady"
  | "idlePreload";

type UseWeddingExperienceOrchestratorParams = {
  hasEntryVideo?: boolean;
  persistEntryDismissal?: boolean;
  entryStorageKey?: string;
  entryExitDurationMs?: number;
  invitationEntranceDelayMs?: number;
  criticalLoadDelayMs?: number;
  idlePreloadDelayMs?: number;
};

const defaultEntryStorageKey = "wedding-entry-video-dismissed";

type WindowWithIdleCallback = Window & {
  requestIdleCallback?: (callback: IdleRequestCallback, options?: IdleRequestOptions) => number;
  cancelIdleCallback?: (handle: number) => void;
};

const getInitialPhase = (hasEntryVideo: boolean, persistEntryDismissal: boolean, entryStorageKey: string) => {
  if (!hasEntryVideo) return "criticalLoading";

  if (persistEntryDismissal && typeof window !== "undefined") {
    return window.sessionStorage.getItem(entryStorageKey) === "true" ? "criticalLoading" : "entry";
  }

  return "entry";
};

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useWeddingExperienceOrchestrator({
  hasEntryVideo = true,
  persistEntryDismissal = false,
  entryStorageKey = defaultEntryStorageKey,
  entryExitDurationMs = 3500,
  invitationEntranceDelayMs = 50,
  criticalLoadDelayMs = 0,
  idlePreloadDelayMs = 700,
}: UseWeddingExperienceOrchestratorParams = {}) {
  const [phase, setPhase] = useState<WeddingLoadPhase>(() =>
    getInitialPhase(hasEntryVideo, persistEntryDismissal, entryStorageKey),
  );
  const [criticalReady, setCriticalReady] = useState(false);
  const resolvedEntryExitDurationMs = prefersReducedMotion() ? 0 : Math.max(entryExitDurationMs, 0);
  const resolvedInvitationEntranceDelayMs = prefersReducedMotion() ? 0 : Math.max(invitationEntranceDelayMs, 0);
  const resolvedCriticalLoadDelayMs = Math.max(criticalLoadDelayMs, 0);

  const completeEntry = useCallback(() => {
    debugEntryLog("orchestrator:completeEntry", {
      phase,
      persistEntryDismissal,
    });

    if (persistEntryDismissal && typeof window !== "undefined") {
      window.sessionStorage.setItem(entryStorageKey, "true");
    }

    setPhase((currentPhase) => (currentPhase === "entry" ? "entryExiting" : currentPhase));
  }, [entryStorageKey, persistEntryDismissal, phase]);

  const skipEntry = useCallback(() => {
    debugEntryLog("orchestrator:skipEntry", {
      phase,
      persistEntryDismissal,
    });

    if (persistEntryDismissal && typeof window !== "undefined") {
      window.sessionStorage.setItem(entryStorageKey, "true");
    }

    setPhase((currentPhase) => (currentPhase === "entry" ? "criticalLoading" : currentPhase));
  }, [entryStorageKey, persistEntryDismissal, phase]);

  const reportCriticalReady = useCallback(() => {
    debugEntryLog("orchestrator:reportCriticalReady", {
      phase,
    });

    setCriticalReady(true);
    setPhase((currentPhase) => (currentPhase === "criticalLoading" ? "invitationEntering" : currentPhase));
  }, [phase]);

  useEffect(() => {
    debugEntryLog("orchestrator:phase", {
      criticalReady,
      enableSectionAnimations:
        phase === "entryExiting" ||
        phase === "invitationEntering" ||
        phase === "invitationReady" ||
        phase === "idlePreload",
      criticalLoadDelayMs: resolvedCriticalLoadDelayMs,
      entryExitDurationMs: resolvedEntryExitDurationMs,
      invitationEntranceDelayMs: resolvedInvitationEntranceDelayMs,
      phase,
      showEntryVideo: phase === "entry" || phase === "entryExiting",
      showInvitation: phase !== "entry",
    });
  }, [criticalReady, phase, resolvedCriticalLoadDelayMs, resolvedEntryExitDurationMs, resolvedInvitationEntranceDelayMs]);

  useEffect(() => {
    if (phase !== "entryExiting") return;

    const timer = window.setTimeout(() => {
      if (resolvedCriticalLoadDelayMs === 0) {
        setCriticalReady(true);
        setPhase((currentPhase) => (currentPhase === "entryExiting" ? "invitationEntering" : currentPhase));
        return;
      }

      setPhase((currentPhase) => (currentPhase === "entryExiting" ? "criticalLoading" : currentPhase));
    }, resolvedEntryExitDurationMs);

    return () => window.clearTimeout(timer);
  }, [phase, resolvedCriticalLoadDelayMs, resolvedEntryExitDurationMs]);

  useEffect(() => {
    if (phase !== "criticalLoading" || criticalReady) return;

    if (resolvedCriticalLoadDelayMs === 0) {
      reportCriticalReady();
      return;
    }

    const timer = window.setTimeout(() => {
      reportCriticalReady();
    }, resolvedCriticalLoadDelayMs);

    return () => window.clearTimeout(timer);
  }, [criticalReady, phase, reportCriticalReady, resolvedCriticalLoadDelayMs]);

  useEffect(() => {
    if (phase !== "invitationEntering") return;

    const timer = window.setTimeout(() => {
      setPhase((currentPhase) => (currentPhase === "invitationEntering" ? "invitationReady" : currentPhase));
    }, resolvedInvitationEntranceDelayMs);

    return () => window.clearTimeout(timer);
  }, [phase, resolvedInvitationEntranceDelayMs]);

  useEffect(() => {
    if (phase !== "invitationReady") return;

    const preloadOnIdle = () => {
      setPhase((currentPhase) => (currentPhase === "invitationReady" ? "idlePreload" : currentPhase));
    };

    const idleWindow = window as WindowWithIdleCallback;

    if (idleWindow.requestIdleCallback && idleWindow.cancelIdleCallback) {
      const idleId = idleWindow.requestIdleCallback(preloadOnIdle, { timeout: idlePreloadDelayMs });
      return () => idleWindow.cancelIdleCallback?.(idleId);
    }

    const timer = globalThis.setTimeout(preloadOnIdle, idlePreloadDelayMs);
    return () => globalThis.clearTimeout(timer);
  }, [idlePreloadDelayMs, phase]);

  return useMemo(() => {
    const showEntryVideo = phase === "entry" || phase === "entryExiting";
    const showInvitation = phase !== "entry";
    const enableSectionAnimations =
      phase === "entryExiting" ||
      phase === "invitationEntering" ||
      phase === "invitationReady" ||
      phase === "idlePreload";
    const canPreloadCriticalAssets = phase === "criticalLoading" || showInvitation;
    const canPreloadIdleAssets = phase === "idlePreload";

    return {
      phase,
      showEntryVideo,
      showInvitation,
      enableSectionAnimations,
      canPreloadCriticalAssets,
      canPreloadIdleAssets,
      isEntryExiting: phase === "entryExiting",
      isInvitationEntering: phase === "invitationEntering",
      entryExitDurationMs: resolvedEntryExitDurationMs,
      invitationEntranceDelayMs: resolvedInvitationEntranceDelayMs,
      completeEntry,
      skipEntry,
      reportCriticalReady,
    };
  }, [
    completeEntry,
    phase,
    reportCriticalReady,
    resolvedEntryExitDurationMs,
    resolvedInvitationEntranceDelayMs,
    skipEntry,
  ]);
}
