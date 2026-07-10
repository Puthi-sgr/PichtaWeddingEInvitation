type EntryDebugPayload = Record<string, unknown>;
type EntryDebugPayloadInput = EntryDebugPayload | (() => EntryDebugPayload);

export function isEntryDebugEnabled() {
  if (typeof window === "undefined") return false;

  const params = new URLSearchParams(window.location.search);
  return params.get("debugEntry") === "1" || window.localStorage.getItem("debugEntry") === "1";
}

export function getVideoDebugSnapshot(video: HTMLVideoElement | null | undefined) {
  if (!video) {
    return { mounted: false };
  }

  return {
    mounted: true,
    currentTime: Number.isFinite(video.currentTime) ? Number(video.currentTime.toFixed(3)) : null,
    duration: Number.isFinite(video.duration) ? Number(video.duration.toFixed(3)) : null,
    paused: video.paused,
    ended: video.ended,
    readyState: video.readyState,
    networkState: video.networkState,
    currentSrc: video.currentSrc || null,
    hasSrcAttribute: video.hasAttribute("src"),
    sourceCount: video.querySelectorAll("source").length,
    activeSourceCount: Array.from(video.querySelectorAll("source")).filter((source) => source.hasAttribute("src"))
      .length,
  };
}

export function getEntryGateDebugSnapshot() {
  if (typeof document === "undefined") {
    return { mounted: false };
  }

  const gate = document.querySelector<HTMLElement>("[data-entry-video-gate]");
  if (!gate) {
    return { mounted: false };
  }

  const style = window.getComputedStyle(gate);
  const rect = gate.getBoundingClientRect();

  return {
    mounted: true,
    backgroundColor: style.backgroundColor,
    display: style.display,
    opacity: style.opacity,
    visibility: style.visibility,
    zIndex: style.zIndex,
    rect: {
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    },
  };
}

function resolvePayload(payload: EntryDebugPayloadInput) {
  return typeof payload === "function" ? payload() : payload;
}

export function debugEntryLog(label: string, payload: EntryDebugPayloadInput = {}) {
  if (!isEntryDebugEnabled()) return;

  const now = typeof performance !== "undefined" ? performance.now().toFixed(1) : "0.0";
  const resolvedPayload = resolvePayload(payload);

  console.log(`[entry-debug ${now}ms] ${label}`, {
    ...resolvedPayload,
    gate: resolvedPayload.gate ?? getEntryGateDebugSnapshot(),
  });
}
