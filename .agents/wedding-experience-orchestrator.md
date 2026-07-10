# Wedding Experience Orchestrator

## Purpose

`useWeddingExperienceOrchestrator` controls when the entry video, main invitation, foreground entrance animation, scroll background video, section animations, and later preload work are allowed to run.

This orchestrator keeps the entry-to-invitation handoff intentionally small: a final-frame opacity fade, then media cleanup after the gate is gone. Do not add a separate veil/page overlay unless the user explicitly asks for a new transition pass.

Relevant files:

```txt
src/features/wedding/components/WeddingFrameOverlay.tsx
src/features/wedding/hooks/useWeddingExperienceOrchestrator.ts
src/features/wedding/hooks/useEntryVideoGate.ts
src/features/wedding/hooks/useScrollScrubVideo.ts
src/features/wedding/hooks/useWeddingAnimations.ts
src/features/wedding/hooks/useCriticalAssetPreload.ts
```

For scroll-direction-aware text readability and color theming over the forward scrub video vs reverse scroll cover, read:

```txt
.agents/scroll-aware-text-color-architecture.md
```

## Current Flow

```txt
entry
  -> entry video waits for click/tap
  -> entry video plays once
  -> entry video ends
  -> entryExiting
  -> invitation mounts behind the final video frame
  -> entry gate fades out
  -> entry video releases its media source after fade/unmount
  -> criticalLoading (skipped by default when delay is 0)
  -> invitationEntering
  -> invitationReady
  -> idlePreload
```

There is no active GSAP entry fade, white veil, page fade, or separate transition overlay. The intentional handoff effects are the CSS opacity fade on the entry video gate and a compositor-friendly GSAP foreground entrance that starts behind the fading gate.

## Phases

```ts
type WeddingLoadPhase =
  | "entry"
  | "entryExiting"
  | "criticalLoading"
  | "invitationEntering"
  | "invitationReady"
  | "idlePreload";
```

### `entry`

Only `EntryVideoGate` should be active. The main scroll video, section animations, and heavy decorative assets should not run.

### `entryExiting`

`EntryVideoGate` remains mounted with the final video frame and fades out. The invitation mounts underneath. Foreground/text GSAP animation may start here so content is already arriving when the gate disappears, but the main scroll video scrub engine must stay disabled.

### `criticalLoading`

The invitation is mounted. Critical first-view assets can load. The orchestrator automatically advances to `invitationEntering` after the configured critical-load delay. With the default `criticalLoadDelayMs: 0`, the orchestrator goes directly from `entryExiting` to `invitationEntering` to avoid a visible foreground/text buffer after the entry fade.

### `invitationEntering`

The invitation foreground entrance animation runs. The main scroll video scrub engine is **not** gated by this phase — see "Scroll video scrub engine gating" below. It may already be active here if the video finished downloading quickly (e.g. thanks to `useCriticalAssetPreload` warming the cache during `entry`).

### `invitationReady`

The invitation is visible and interactive. Section animations may run (scroll video is gated independently — see below).

### `idlePreload`

Idle/later assets may preload.

## Hook API

```ts
const experience = useWeddingExperienceOrchestrator({
  hasEntryVideo: true,
  persistEntryDismissal: false,
  entryStorageKey: "wedding-entry-video-dismissed",
  entryExitDurationMs: 600,
  invitationEntranceDelayMs: 100,
  criticalLoadDelayMs: 0,
  idlePreloadDelayMs: 700,
});
```

Returned values:

```ts
{
  phase,
  showEntryVideo,
  showInvitation,
  enableSectionAnimations,
  canPreloadCriticalAssets,
  canPreloadIdleAssets,
  isEntryExiting,
  isInvitationEntering,
  entryExitDurationMs,
  invitationEntranceDelayMs,
  completeEntry,
  skipEntry,
  reportCriticalReady,
}
```

## Page Wiring Pattern

```tsx
const containerRef = useRef<HTMLDivElement>(null);
const experience = useWeddingExperienceOrchestrator();

useWeddingAnimations(containerRef, experience.enableSectionAnimations);

const [hasEntryBuffered, setHasEntryBuffered] = useState(false);
useCriticalAssetPreload({ enabled: hasEntryBuffered || !experience.showEntryVideo });

{experience.showEntryVideo && (
  <EntryVideoGate
    isExiting={experience.isEntryExiting}
    exitDurationMs={experience.entryExitDurationMs}
    onComplete={experience.completeEntry}
    onFallback={experience.skipEntry}
    onBuffered={() => setHasEntryBuffered(true)}
  />
)}

{experience.showInvitation && (
  <>
    <MainScrollVideoBackground
      containerRef={containerRef}
    />
    <InvitationContent />
  </>
)}
```

## Responsibilities

### `useEntryVideoGate`

Owns entry video playback, click/tap-to-play, ended/error events, and source cleanup.

When the entry video ends, it should call `completeEntry`; media source cleanup happens after the exit fade or unmount.

On successful completion, do not clear the entry video source while the entry gate is still visibly opaque. Keep the final frame available through `entryExiting`, then release the source from the gate's fade/unmount cleanup. Error/fallback cleanup may still release immediately.

It also reports `onBuffered` once, on `canplaythrough` (or immediately if `readyState >= 4` when the listener attaches). This is a separate signal from `onDismiss`/`ended` — it fires while the entry video is still playing, as soon as the browser has the entry video's bytes and would otherwise sit idle for the rest of playback.

### `useCriticalAssetPreload`

Warms the browser cache for the frame overlay image, the reverse-scroll cover image, and the viewport-matched main background video, triggered by `onBuffered` from `useEntryVideoGate` (or immediately if there is no entry video to wait on). It runs in two stages: first the two images via `new Image()`, then — once both resolve or a ~1.5s safety timeout elapses — the background video via a **detached** `<video preload="auto">` element that is never attached to the DOM.

This hook only prefetches bytes into cache. It does not mount `MainScrollVideoBackground`/`WeddingFrameOverlay`, does not touch `enableScrollVideo`/`enableSectionAnimations`, and does not initialize `ScrollTrigger`. All of that still happens exactly per the phase rules above — the goal is only that by the time those phases ask for the real assets, they are already cached. Reuse the exact Cloudinary asset consts exported from `MainScrollVideoBackground.tsx`/`WeddingFrameOverlay.tsx` (`mobileBackgroundVideo`, `desktopBackgroundVideo`, `reverseScrollCoverImage`, `frameImage`) rather than recomputing URLs, so the prefetch URL and the real render URL are byte-identical and the browser cache actually hits.

### `useScrollScrubVideo`

Owns the GSAP ScrollTrigger seek engine for the main background video. It initializes when its `enabled` param is true and the video has finite metadata.

### Scroll video scrub engine gating

`ScrollTrigger` creation is **not** gated by `WeddingLoadPhase` at all (there is no `enableScrollVideo` on the orchestrator). Instead, `MainScrollVideoBackground` tracks its own `isVideoBuffered` state locally:

* Set on the real `<video>`'s `canplaythrough` event, or immediately if `readyState >= 4` when the mount effect runs (common case: `useCriticalAssetPreload` already warmed this exact URL into cache during `entry`).
* Fail-open on the video's `error` event too — `useScrollScrubVideo`'s existing duration-validity check in `createScrubTrigger()` already calls the fallback path for a broken video, so this just lets that run instead of hanging.
* Fail-open on a ~4s safety timeout if `canplaythrough` never fires (stalled connection).

`useScrollScrubVideo` is called with `enabled: enabled && isVideoBuffered && !usePosterFallback` (the `enabled` prop itself defaults to `true` and is only a manual override — the real timing gate is `isVideoBuffered`). `preload` on the `<video>` is always `"auto"`.

This means `ScrollTrigger` can now be created as early as `entryExiting` if the video buffers that fast — potentially on the same frames as the fading entry gate or the letter/hero-detail GSAP entrance. This is a deliberate trade-off: it prioritizes "start scrubbing the instant it's safe to download-wise" over the old fixed-delay approach, at the cost of the CPU/GPU-contention-avoidance the phase-based gate used to guarantee on weak mobile devices. If jank appears here in testing, prefer adding a small explicit delay inside `MainScrollVideoBackground`'s buffered-check rather than reintroducing a phase dependency.

### `useWeddingAnimations`

Owns the invitation foreground entrance and section/hero animations. It should only run when `enableSectionAnimations` is true. The foreground entrance intentionally starts during `entryExiting` to avoid a post-gate text buffer. It must stay compositor-friendly: opacity and transform only; no blur/filter, layout-property animation, or `transition: all`.

Current production structure:

* `useWeddingAnimations` is the single public animation orchestration hook.
* Components expose semantic class hooks such as `invitation-hero-section`, `lineage-section`, `agenda-section`, `venue-section`, `gallery-section`, and `footer-section`.
* The hook may be split internally into small preset helper functions, but those helpers should create only section-level one-shot launchers.
* Use `ScrollTrigger` as an intersection launcher with `once: true`; do not create scrubbed text timelines.
* Keep one trigger per major section where practical. Do not create one trigger per letter, row, or text node.
* Section animations should use opacity and transform only, and clear temporary `will-change` after the timeline.
* The existing scroll scrub tracker remains dedicated to background video seeking, reverse cover state, and coarse visual mode reporting.

### `WeddingFrameOverlay`

Owns the always-visible green/gold frame. It is a separate fixed top-level overlay above content, not part of `MainScrollVideoBackground`.

Keep it `pointer-events-none` and above normal content so text scrolls under the border while remaining visible through the transparent center. Do not move this frame back into the `z-0` scrub background layer.

The frame overlay intentionally uses `will-change-transform` and `translateZ(0)` on both the wrapper and image. This promotes the static frame into a composited layer, which reduces partial repaint/snap artifacts when mobile browser chrome such as Safari, Chrome, or Telegram address bars collapse.

## Rules For Future Agents

* Do not mount main scroll video during `entry`; it may mount behind the gate during `entryExiting` but must remain disabled.
* Do not run foreground/section GSAP animations during `entry` or `criticalLoading`. They may run during `entryExiting` behind the fading gate.
* When `criticalLoadDelayMs` is `0`, skip the visible `criticalLoading` phase transition and go straight from `entryExiting` to `invitationEntering`; do not toggle section animations off between those phases.
* Do not gate the main scroll video scrub engine by `WeddingLoadPhase`. Its only gate is `MainScrollVideoBackground`'s own `isVideoBuffered` state (see "Scroll video scrub engine gating" above) — it may legitimately become active during `entryExiting`/`invitationEntering` if the video buffers fast.
* Keep the static reverse cover hidden on initial forward entry; show it only when reverse/up scroll activates it.
* Do not release the entry video media source until the entry gate has faded out or unmounted.
* If a separate transition overlay is introduced later, keep it separate from video cleanup and document it here.
* Always keep entry video source cleanup in `useEntryVideoGate`.
* Keep the decorative frame overlay separate from the scrub video background so it can cover text/content without affecting GSAP scroll progress.
* Preserve the frame overlay compositor hints unless testing proves they are no longer needed on mobile browsers.
* Do not reintroduce the content mask approach unless specifically requested; it did not solve the Telegram toolbar leak reliably.
* Keep asset *prefetching* (`useCriticalAssetPreload`) separate from asset *mounting/enabling* (phase-driven flags above). Prefetching may start earlier than a phase would otherwise allow (e.g. while still in `entry`), as long as it only warms the cache via detached elements and never mounts the real component or initializes `ScrollTrigger` ahead of its phase.
* When adding new critical first-view assets (images or video), export their Cloudinary asset const from the owning component and add them to `useCriticalAssetPreload` rather than hardcoding a second copy of the URL/transform options.
