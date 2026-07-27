# Scroll-Scrub Background Video — Archive & Loop Refactor Plan

> **Status:** Archived on 2026-07-25, and the refactor in §7 has been **applied** —
> `useScrollScrubVideo.ts` is deleted, the background video autoplays + loops, and
> `useReverseCoverMode` now drives the reverse cover + visual mode. This document
> preserves the removed design so it can be understood or restored later (§8), and
> records the refactor that superseded it.
>
> **Read this if you are:** restoring scroll-driven video seeking, debugging the loop
> background, or wondering why the reverse cover / text-color theming looks the way it
> does after the scrub engine is gone.

Related docs:

```txt
.agents/wedding-experience-orchestrator.md          (entry -> invitation lifecycle)
.agents/scroll-aware-text-color-architecture.md     (WeddingScrollVisualMode -> text colors)
```

---

## 1. What the scrub engine was

The main background video did **not** play on its own. It was **paused**, and its
displayed frame was driven by scroll position: scrolling down advanced the video,
scrolling up rewound it. The page effectively "scrubbed" a video timeline like a
jog wheel.

```txt
scroll progress (0 -> 1 down the page)  ==>  video.currentTime (0 -> duration)
```

This produced a cinematic "the story unfolds as you scroll" background, at the cost
of significant machinery (a GSAP ticker seek loop, seek throttling, an iOS decoder
unlock, and scroll-direction latching for a reverse cover image).

### Why it was removed

* The seek engine is ~300 lines of throttling/lerp/state that only exists to fake
  playback from scroll.
* Seeking a **paused** video forces the iOS "black rectangle" cold-decoder bug,
  which required the whole `primeVideo` gesture-unlock apparatus (see §5).
* A looping autoplay video gives a lively background with none of that: the decoder
  is always warm, no `currentTime` seeking, no priming.

The looping version keeps the **reverse-scroll cover image** and the
**forward/reverse text-color theming** (product decision, 2026-07-25). Only the
scrub seeking itself is dropped. See §7 for the plan.

---

## 2. Files involved

```txt
src/features/wedding/hooks/useScrollScrubVideo.ts          DELETED  — the seek engine (full source in §4)
src/features/wedding/components/MainScrollVideoBackground.tsx  EDITED  — priming machinery removed, <video> now loops
src/features/wedding/types.ts                              KEPT     — WeddingScrollVisualMode stays
src/features/wedding/pages/HomePage.tsx                    ~UNCHANGED — still stores mode, writes data-scroll-visual-mode
src/index.css                                             KEPT     — data-scroll-visual-mode color variables
.agents/wedding-experience-orchestrator.md                UPDATED  — scrub gating section rewritten
.agents/scroll-aware-text-color-architecture.md           UPDATED  — mode source note updated
```

Coupled behavior that lived *inside* the deleted hook and had to be relocated:

```txt
reverse-cover latch (scroll up past threshold)  -> new standalone scroll watcher
WeddingScrollVisualMode reporting               -> new standalone scroll watcher
```

---

## 3. How the mechanism moved (detailed)

### 3.1 ScrollTrigger → target time

A single `ScrollTrigger` spanned the whole scroll container:

```ts
ScrollTrigger.create({
  trigger: container,
  start: "top top",
  end: "bottom bottom",
  onUpdate: (self) => {
    targetTime = clampTime(self.progress * video.duration);
    // ...direction tracking + reverse-cover latch...
  },
});
```

`onUpdate` set a `targetTime` (where the video *should* be) and tracked scroll
direction. It did **not** write `currentTime` directly — that happened in the ticker.

### 3.2 gsap.ticker → eased seek commit

On every frame, `updateVideoTime()` lerped a smoothed `easedTime` toward
`targetTime` and committed it as a seek:

```ts
easedTime += (targetTime - easedTime) * ease;   // ease = 0.82
const nextTime = clampTime(easedTime);
// ...skip if too close, if a seek is already in flight, or within cooldown...
video.currentTime = nextTime;                    // the actual scrub seek
```

The smoothing (`ease = 0.82`) removed jitter so the frame converged to the scroll
position over a few frames instead of snapping.

### 3.3 Seek throttling

Because a browser can only service one `currentTime` seek at a time, the engine
guarded against piling up seeks:

```txt
isSeeking          -> true between "seeking" and "seeked" events; skip new seeks while set
seekDelta (0.01s)  -> ignore sub-frame moves
cooldownMs (0)     -> optional per-direction rate limit (currently 0; isSeeking is the real throttle)
skippedSeekCount   -> diagnostics only
```

### 3.4 Seed-from-scroll on init

When the trigger was (re)created, it seeded `currentTime` from the user's *current*
scroll position, so a video that finished buffering mid-page didn't snap to frame 0
and then visibly chase back:

```ts
const seededTime = clampTime(trigger.progress * video.duration);
targetTime = easedTime = lastCommittedTime = seededTime;
video.currentTime = seededTime;
```

### 3.5 Buffering gate (in MainScrollVideoBackground)

`useScrollScrubVideo` was called with
`enabled = enabled && isVideoBuffered && !usePosterFallback`. `isVideoBuffered`
flipped true on `canplaythrough`, or `readyState >= 4`, or a ~4s safety timeout —
so the ScrollTrigger could come alive as early as `entryExiting` if the video
buffered fast. The scrub engine was **never** gated by `WeddingLoadPhase`.

---

## 4. Full source of `useScrollScrubVideo.ts` (as archived)

Complete file at time of removal. This is the canonical copy for restoration.

```ts
import { RefObject, useEffect } from "react";
import gsap from "gsap";
import ScrollTrigger from "gsap/ScrollTrigger";
import { debugEntryLog, getVideoDebugSnapshot } from "../utils/entryDebug";
import { WeddingScrollVisualMode } from "../types";

gsap.registerPlugin(ScrollTrigger);
ScrollTrigger.config({ ignoreMobileResize: true });

// Higher = the displayed frame converges to the scroll position in fewer
// frames (less trailing). Async video seeks already provide the visual
// smoothing, so we keep only a light lerp on top rather than the old 0.5 that
// closed just half the gap per frame.
const forwardScrubEase = 0.82;
const backwardScrubEase = 0.82;
const forwardVideoSeekDeltaSeconds = 0.01;
const backwardVideoSeekDeltaSeconds = 0.01;
const forwardSeekCooldownMs = 0;
// The one-seek-in-flight guard (isSeeking) is the real throttle now that the
// asset seeks cheaply, so the extra backward cooldown just added latency.
const backwardSeekCooldownMs = 0;
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

      // Seed the scrub position from wherever the user has already scrolled to.
      // Without this the video snaps to frame 0 the instant it finishes
      // buffering, then visibly chases the scroll position back to correct —
      // the startup lag you'd see when the video buffers after a fast scroll.
      const seededTime = trigger ? clampTime(trigger.progress * video.duration) : 0;
      targetTime = seededTime;
      easedTime = seededTime;
      lastCommittedTime = seededTime;
      video.currentTime = seededTime;
      updateEngineDebugState();

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
```

---

## 5. The iOS decoder priming (why it existed, and why the loop version drops it)

### The bug it solved: the "black rectangle"

Mobile browsers (iOS Safari most notably) will **not decode or paint a frame** for a
`<video>` that has been loaded but never played. The scrub engine only ever
`pause()`ed and seeked `currentTime`, so on iOS the background was a **black
rectangle** until the decoder was forced awake.

### The unlock

`primeVideo()` warmed the decoder with a momentary muted playback:

```txt
video.muted = true; video.playsInline = true;
video.play()  ->  wait one requestAnimationFrame (let a frame paint)  ->  video.pause()
```

Two rules made this awkward:

1. iOS grants `play()` reliably **only inside a real user gesture** — so the primary
   trigger was the entry-screen tap (`wedding:entry-tap`). This is why
   `MainScrollVideoBackground` was mounted from the very start, behind the entry
   gate: the `<video>` had to exist to receive that gesture.
2. Desktop/most Android allow muted autoplay without a gesture — covered by a
   fallback prime on `loadeddata`.

### Archived priming source (removed from `MainScrollVideoBackground.tsx`)

```tsx
const primeStateRef = useRef<"idle" | "done">("idle");

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
        requestAnimationFrame(() => {
          const activeVideo = videoRef.current;
          if (!activeVideo) return;
          activeVideo.pause();
          handleVideoBuffered(`primed:${reason}`);
        });
      })
      .catch(() => {
        debugEntryLog("mainBackgroundVideo:prime-blocked", () => ({
          reason,
          video: getVideoDebugSnapshot(videoRef.current),
        }));
      });
  },
  [handleVideoBuffered, usePosterFallback],
);

// Primary unlock path: entry-screen tap is a real user gesture.
useEffect(() => {
  if (usePosterFallback) return;
  const onEntryTap = () => primeVideo("entry-tap");
  window.addEventListener("wedding:entry-tap", onEntryTap);
  return () => window.removeEventListener("wedding:entry-tap", onEntryTap);
}, [primeVideo, usePosterFallback]);

// Fallback: platforms that allow muted autoplay (desktop, most Android).
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
```

### Why the loop version does not need any of this

A looping `autoPlay muted loop playsInline` video is **genuinely playing**, so the
decoder is warm by definition and frames are always painted. There is no
`currentTime` seeking, so there is no cold-decoder black rectangle. The entire
priming apparatus (`primeVideo`, `primeStateRef`, the entry-tap effect, the
autoplay-prime effect) is dead code and is deleted.

**Carry forward only:** keep `muted` + `playsInline` on the `<video>` — those are
still what make iOS autoplay legal. Autoplay can still be *refused* (Low Power Mode,
some in-app webviews); that is not the black-frame bug — playback just won't start,
and `usePosterFallback` + poster already handle it.

---

## 6. Reverse cover + visual-mode coupling (what must survive the deletion)

The reverse cover and text theming are **kept**, but they were driven from inside the
deleted hook, so their driver must be rebuilt. See
`.agents/scroll-aware-text-color-architecture.md` for the color side.

What the hook used to do that still needs an owner:

```txt
watch window.scrollY direction
scroll up past reverseCoverScrollThresholdPx (40)  -> latch reverse cover on, opacity 1
scroll down                                        -> clear reverse cover, opacity 0
emit WeddingScrollVisualMode changes:
    initialCover  (mount, before first forward scroll)
    forwardScrub  (video visible; scrolling down / not latched)
    reverseCover  (latched after scroll-up)
    posterFallback(reduced motion / video error)
```

`WeddingScrollVisualMode` (in `src/features/wedding/types.ts`) is **unchanged** — the
same four strings keep flowing to `HomePage` -> `data-scroll-visual-mode` -> CSS
variables. `"forwardScrub"` simply now means "the looping video is the visible
background" rather than "actively scrubbing forward"; the colors are identical, so no
CSS change is required.

---

## 7. Refactor plan (loop replaces scrub)

Product decisions locked 2026-07-25: **keep the reverse cover + two text-color modes;
drop scrub seeking only; video stays a full-page fixed background, now looping.**

### Step 1 — `MainScrollVideoBackground.tsx`

* Change the `<video>` to `autoPlay muted loop playsInline` (keep `muted`,
  `playsInline`; keep `poster`).
* Delete the priming machinery: `primeVideo`, `primeStateRef`, the `wedding:entry-tap`
  effect, and the autoplay-prime effect (archived in §5).
* Remove the `isVideoBuffered` gate that only existed to delay scrub start. Looping
  playback does not need a buffered gate; keep `usePosterFallback` for reduced
  motion / error.
* Stop calling `useScrollScrubVideo`. Call the new reverse-cover watcher instead
  (Step 3), passing `reverseScrubCoverRef`, `initialReverseCoverVisible`, and
  `onVisualModeChange`.
* Keep the poster fallback branch and the reverse-cover `<div>` markup as-is.
* Keep the `onError` -> `handleFallback` (`posterFallback`) path.

### Step 2 — Delete `useScrollScrubVideo.ts`

Remove the file (full source preserved in §4). Confirm no other importers:

```txt
grep for: useScrollScrubVideo   (expected: only MainScrollVideoBackground)
```

### Step 3 — Add a small `useReverseCoverMode` hook

A ~30-line replacement for the scroll-direction/latch/mode-reporting slice of the old
hook. Responsibilities only:

```txt
- passive scroll listener on window
- latch reverse cover on scroll-up past 40px (setReverseCoverOpacity via ref)
- clear on scroll-down
- notifyVisualMode(...) with dedupe (same guard as old reportVisualMode)
- honor initialReverseCoverVisible for the first mode
- honor prefers-reduced-motion / fallback -> "posterFallback"
- cleanup listener on unmount
```

It must **not** touch the video, `currentTime`, `gsap.ticker`, or `ScrollTrigger`.

### Step 4 — Docs

* `.agents/wedding-experience-orchestrator.md`: rewrite the "Scroll video scrub
  engine gating" section and the `useScrollScrubVideo` responsibility to describe a
  looping video + `useReverseCoverMode`. Note the priming removal.
* `.agents/scroll-aware-text-color-architecture.md`: update the "Data Flow" and
  "Public Interfaces" sections so the mode source is `useReverseCoverMode`, not the
  scrub engine. Colors/contract unchanged.

### Step 5 — Verify

```txt
npm run lint
npm run build
```

Manual (tell the user to run locally — do not launch the dev server):

```txt
- Background video autoplays and loops on load (desktop + mobile).
- Scroll down: video visible, forward text colors.
- Scroll up past ~40px: reverse cover appears, reverse text colors.
- Reduced motion / blocked autoplay: poster fallback, still readable.
- iOS Safari: no black rectangle (video is playing, not seeked).
```

### Out of scope / keep as-is

* `useCriticalAssetPreload` still prefetches the viewport-matched video — a good warm
  cache for autoplay too. No change.
* `WeddingFrameOverlay`, section animations (`useWeddingAnimations`), entry gate
  (`useEntryVideoGate`) are untouched.
* Do **not** change `WeddingScrollVisualMode` or the CSS variable contract.

---

## 8. How to restore the scrub engine later

1. Recreate `src/features/wedding/hooks/useScrollScrubVideo.ts` from §4.
2. Restore the priming machinery from §5 into `MainScrollVideoBackground.tsx`, and
   revert the `<video>` to `preload="auto"` **without** `autoPlay`/`loop`.
3. Reinstate the `isVideoBuffered` gate and call
   `useScrollScrubVideo({ ..., enabled: enabled && isVideoBuffered && !usePosterFallback })`.
4. Remove `useReverseCoverMode` (the scrub hook owns reverse cover + mode again).
5. Re-check `.agents/wedding-experience-orchestrator.md` and
   `.agents/scroll-aware-text-color-architecture.md` against the restored behavior.

Original source also lives in git history (pre-refactor commit on `main`).
