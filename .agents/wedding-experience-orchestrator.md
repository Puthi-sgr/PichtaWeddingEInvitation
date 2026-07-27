# Wedding Experience Orchestrator

## Purpose

`useWeddingExperienceOrchestrator` controls when the entry video, main invitation, foreground entrance animation, scroll background video, section animations, and later preload work are allowed to run.

This orchestrator keeps the entry-to-invitation handoff intentionally small: a final-frame opacity fade, then media cleanup after the gate is gone. Do not add a separate veil/page overlay unless the user explicitly asks for a new transition pass.

Relevant files:

```txt
src/features/wedding/components/WeddingFrameOverlay.tsx
src/features/wedding/hooks/useWeddingExperienceOrchestrator.ts
src/features/wedding/hooks/useEntryVideoGate.ts
src/features/wedding/hooks/useReverseCoverMode.ts
src/features/wedding/hooks/useWeddingAnimations.ts
src/features/wedding/hooks/useCriticalAssetPreload.ts
```

> The main background video autoplays and loops; it is no longer scroll-scrubbed.
> The removed `useScrollScrubVideo` seek engine and its iOS decoder-priming
> workaround are archived in `.agents/scrub-engine-archive.md`.

For scroll-direction-aware text readability and color theming over the forward looping video vs reverse scroll cover, read:

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

Only `EntryVideoGate` should be visible. `useReverseCoverMode`, section animations, and heavy decorative assets should not run. The background `<video>` is mounted from page start and may autoplay muted behind the opaque gate — that is intentional (warm start), not scrub activity.

### `entryExiting`

`EntryVideoGate` remains mounted with the final video frame and fades out. The invitation mounts underneath. Foreground/text GSAP animation may start here so content is already arriving when the gate disappears, but `useReverseCoverMode` stays disabled (it is gated by `showInvitation`).

### `criticalLoading`

The invitation is mounted. Critical first-view assets can load. The orchestrator automatically advances to `invitationEntering` after the configured critical-load delay. With the default `criticalLoadDelayMs: 0`, the orchestrator goes directly from `entryExiting` to `invitationEntering` to avoid a visible foreground/text buffer after the entry fade.

### `invitationEntering`

The invitation foreground entrance animation runs. The background video already autoplays independently of this phase (see "Background video gating" below); `useReverseCoverMode` becomes active once `showInvitation` is true.

### `invitationReady`

The invitation is visible and interactive. Section animations may run (the background video and `useReverseCoverMode` are gated independently — see below).

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

### `useReverseCoverMode`

Owns the reverse-scroll cover image and the `WeddingScrollVisualMode` text-color contract. It watches `window.scrollY` direction only — no video seeking, no `ScrollTrigger`, no `gsap.ticker`. Scrolling up past a small threshold latches the reverse cover on; scrolling down clears it. See `.agents/scroll-aware-text-color-architecture.md` for how the reported mode drives text colors.

### Background video gating

The main background `<video>` is `autoPlay muted loop playsInline preload="auto"`. It is **not** gated by `WeddingLoadPhase`: it is mounted from page start (behind the entry gate) and autoplays as soon as it can. Muted inline autoplay is allowed on modern iOS/Android without a gesture, so no decoder-priming step is needed — the old cold-decoder "black rectangle" bug only affected the removed scrub engine, which seeked a *paused* video.

`useReverseCoverMode` is called with `enabled: enabled && !usePosterFallback` (the `enabled` prop is `experience.showInvitation`). If autoplay is refused (Low Power Mode, some in-app webviews) or the video errors, the `<video>`'s `onError` routes to `handleFallback`, which sets `usePosterFallback` and reports `"posterFallback"`; the poster image then renders in place of the video. Reduced motion initializes `usePosterFallback` to `true` from the start.

### Crossfade loop (`useCrossfadeVideoLoop`)

The current loop asset has **no baked-in crossfade**, so the smooth loop is produced in the DOM. `MainScrollVideoBackground` renders **two stacked `<video>` copies** of the same clip; `useCrossfadeVideoLoop` alternates them: while one plays to its end, the other starts from frame 0 and their opacity cross-dissolves (a CSS `opacity` transition of `videoCrossfadeSeconds`). Each copy's hard loop-snap therefore happens while it is invisible, so only the smooth dissolve is ever seen. It reads `duration` at runtime (no hardcoded timecodes), warms both decoders up front to avoid a cold first handoff, and at steady state only one copy plays — both play only during the crossfade window. Neither copy uses the native `loop` attribute; the hook owns the restart. Tune the dissolve length via `videoCrossfadeSeconds` in `MainScrollVideoBackground.tsx`.

> If you switch back to an asset that already has a baked crossfade, this DOM crossfade is redundant — prefer a single `<video loop>` trimmed so its end frame equals its start (Cloudinary `eo_`/`du_`), or the earlier `currentTime`-wrap approach (see git history for `useSeamlessVideoLoop`).

### `useWeddingAnimations`

Owns the invitation foreground entrance and section/hero animations. It should only run when `enableSectionAnimations` is true. The foreground entrance intentionally starts during `entryExiting` to avoid a post-gate text buffer. Routine entrances stay on opacity and transform. The bounded production exception is one center-out `clip-path` on `[data-guest-name-reveal]` and one polygon `clip-path` on `[data-crown-glint]`; both run once and clear temporary properties. Do not add blur/filter, layout-property animation, `transition: all`, or per-glyph clips.

Current production structure:

* `useWeddingAnimations` is the single public animation orchestration hook.
* Components expose semantic class hooks such as `invitation-hero-section`, `lineage-section`, `agenda-section`, `venue-section`, `gallery-section`, and `footer-section`.
* The hook may be split internally into small preset helper functions, but those helpers should create only section-level one-shot launchers.
* Use `ScrollTrigger` as an intersection launcher with `once: true`; do not create scrubbed text timelines.
* Keep one trigger per major section where practical. Do not create one trigger per letter, row, or text node.
* Keep the Khmer guest name as one shaping run. The semantic `.royal-crown-inlay-text` and all `aria-hidden` Crown copies contain the complete name; do not restore `.guest-letter` spans.
* Section animations should normally use opacity and transform. The Crown reveal clears temporary `clipPath`, `transform`, and `willChange`; the glint also clears its inline `opacity`. Keep the wrapper's final inline `opacity: 1` because its `opacity-0` utility is the pre-animation flash guard.
* Reduced-motion handling is reactive: `useWeddingAnimations` listens to its `MediaQueryList`, reverts the current root-scoped GSAP context, applies visible static states and hides the glint, then rebuilds normal timelines if motion becomes allowed again. Remove the listener and revert the context on cleanup.
* `useReverseCoverMode` is dedicated to reverse cover state and visual mode reporting only; there is no background video seeking anymore (the video loops).

### `WeddingFrameOverlay`

Owns the always-visible green/gold frame. It is a separate fixed top-level overlay above content, not part of `MainScrollVideoBackground`.

Keep it `pointer-events-none` and above normal content so text scrolls under the border while remaining visible through the transparent center. Do not move this frame back into the `z-0` scrub background layer.

The frame overlay intentionally uses `will-change-transform` and `translateZ(0)` on both the wrapper and image. This promotes the static frame into a composited layer, which reduces partial repaint/snap artifacts when mobile browser chrome such as Safari, Chrome, or Telegram address bars collapse.

## Rules For Future Agents

* The background video component is mounted from page start (behind the gate) so its `<video>` is warm; it autoplays muted and loops. Keep `useReverseCoverMode` disabled until `showInvitation`.
* Do not run foreground/section GSAP animations during `entry` or `criticalLoading`. They may run during `entryExiting` behind the fading gate.
* When `criticalLoadDelayMs` is `0`, skip the visible `criticalLoading` phase transition and go straight from `entryExiting` to `invitationEntering`; do not toggle section animations off between those phases.
* Do not scroll-scrub the background video or reintroduce a video seek engine unless explicitly asked; the video loops. If you do, first read `.agents/scrub-engine-archive.md` for the removed implementation and its iOS decoder-priming requirement.
* Keep the static reverse cover hidden on initial forward entry; show it only when reverse/up scroll activates it.
* Do not release the entry video media source until the entry gate has faded out or unmounted.
* If a separate transition overlay is introduced later, keep it separate from video cleanup and document it here.
* Never fragment a Khmer `displayName` for animation. Preserve `[data-guest-name-reveal]`, `[data-crown-glint]`, the intact semantic text run, and the reactive motion-preference cleanup.
* Always keep entry video source cleanup in `useEntryVideoGate`.
* Keep the decorative frame overlay separate from the background video layer so it can cover text/content without affecting GSAP scroll progress.
* Preserve the frame overlay compositor hints unless testing proves they are no longer needed on mobile browsers.
* Do not reintroduce the content mask approach unless specifically requested; it did not solve the Telegram toolbar leak reliably.
* Keep asset *prefetching* (`useCriticalAssetPreload`) separate from asset *mounting/enabling* (phase-driven flags above). Prefetching may start earlier than a phase would otherwise allow (e.g. while still in `entry`), as long as it only warms the cache via detached elements and never mounts the real component or initializes `ScrollTrigger` ahead of its phase.
* When adding new critical first-view assets (images or video), export their Cloudinary asset const from the owning component and add them to `useCriticalAssetPreload` rather than hardcoding a second copy of the URL/transform options.
