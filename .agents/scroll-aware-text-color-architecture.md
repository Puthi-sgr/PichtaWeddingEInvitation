# Scroll-Aware Text Color Architecture

## Purpose

The wedding page now has two different background schemes:

```txt
forward scroll/down    -> main scrub video visible
reverse scroll/up      -> reverse scroll cover image visible
initial post-entry     -> reverse scroll cover image visible first
fallback/reduced motion -> static poster/image state
```

Because these backgrounds can have different brightness and contrast, text colors should not be hard-coded per section forever. Text needs a stable visual-state contract so it can adapt when the active background mode changes.

## Current Implementation Notes

Relevant files:

```txt
src/features/wedding/pages/HomePage.tsx
src/features/wedding/components/MainScrollVideoBackground.tsx
src/features/wedding/hooks/useScrollScrubVideo.ts
src/features/wedding/components/InvitationBody.tsx
src/features/wedding/components/EventAgenda.tsx
src/features/wedding/components/VenueMap.tsx
src/features/wedding/components/PhotoGallery.tsx
src/features/wedding/components/WeddingFooter.tsx
src/index.css
```

`useScrollScrubVideo` already knows the important runtime state:

```txt
activeScrollDirection       -> "forward" | "backward"
isReverseCoverLatched       -> true when the reverse cover is visible
initialReverseCoverVisible  -> true after entry, before forward scroll clears it
usePosterFallback           -> true for reduced motion/video fallback
```

Today that state is trapped inside the video hook. It only changes the reverse cover opacity. Text colors are hard-coded with Tailwind classes such as:

```txt
text-white
text-stone-800
text-stone-600
text-gold-500
mix-blend-difference text-white
```

That means text cannot reliably adapt when the visible background changes.

## Current Visual Text Treatment

The production invitation is Khmer-only and uses `Moul` from Google Fonts. The current visual direction is dark green/gold wedding stationery:

```txt
Gold ceremonial text        -> metallic clipped-gradient treatment
Primary/secondary copy      -> antique cream / raised print treatment
Normal wrapper text classes -> plain semantic color only
```

Important CSS classes in `src/index.css`:

```txt
wedding-text-kicker   -> gold ceremonial labels; may use clipped gold gradient
wedding-text-accent   -> gold accent text; may use clipped gold gradient
gold-text             -> reusable gold text effect
gold-text-soft        -> lighter gold variant
gold-text-bright      -> brightest gold variant
gold-text-deep        -> deeper gold variant
antique-cream-text    -> selected main non-gold dimensional text treatment
```

`antique-cream-text` is the selected main non-gold style for the invite line and guest name. It uses `background-clip: text`, text stroke, and layered shadows to create a raised printed surface. Apply it to the actual text-bearing element or animated letter span, not to a broad wrapper.

### Wrapper vs Text Element Rule

Do **not** add `background-clip: text`, `color: transparent`, text-stroke, or gradient surface styles to wrapper classes such as:

```txt
wedding-text-primary
wedding-text-secondary
section wrappers
layout divs that contain animated child spans
```

Those classes are often used on containers around GSAP-animated children. If the wrapper owns a clipped gradient while the child spans animate opacity/transform, the browser can paint a ghost/empty text surface before the GSAP reveal completes.

Correct pattern:

```tsx
<h1 className="guest-name wedding-animated">
  <span className="hero-detail wedding-animated antique-cream-text opacity-0">
    សូមគោរពអញ្ជើញ
  </span>
  <span>
    {letters.map((letter) => (
      <span className="guest-letter wedding-animated antique-cream-text opacity-0">
        {letter}
      </span>
    ))}
  </span>
</h1>
```

Incorrect pattern:

```tsx
<div className="wedding-text-primary antique-cream-text">
  <span className="guest-letter opacity-0">...</span>
</div>
```

Semantic wrapper classes may still provide normal `color` and short color transitions, but dimensional gradient text effects must live on the text elements that animate.

## Recommended Model

Introduce a small scroll visual state contract:

```ts
export type WeddingScrollVisualMode =
  | "initialCover"
  | "forwardScrub"
  | "reverseCover"
  | "posterFallback";
```

Meaning:

```txt
initialCover   -> invitation just mounted after entry; reverse cover is visible
forwardScrub   -> user is scrolling down or the main video is the active visual
reverseCover   -> user scrolled upward past the reverse-cover threshold
posterFallback -> reduced motion, video error, or invalid duration fallback
```

This mode should be updated only when the mode changes, not on every GSAP ticker frame.

## Data Flow

Use this flow:

```txt
useScrollScrubVideo
  -> detects active visual mode
  -> calls onVisualModeChange(nextMode)

MainScrollVideoBackground
  -> receives onVisualModeChange prop
  -> reports "posterFallback" when fallback activates

HomePage
  -> owns current visual mode state
  -> writes data-scroll-visual-mode to the invitation shell

Sections / Navbar
  -> use semantic color classes
  -> CSS variables resolve the actual colors for each mode
```

Do not make every section inspect scroll direction directly. The scroll/video layer should be the only place that knows about reverse latch thresholds, seek skipping, and scrub fallback.

## Public Interfaces To Add

### `useScrollScrubVideo`

Add:

```ts
type UseScrollScrubVideoParams = {
  // existing props...
  onVisualModeChange?: (mode: WeddingScrollVisualMode) => void;
};
```

Call it only when mode changes:

```ts
notifyVisualMode("initialCover");
notifyVisualMode("forwardScrub");
notifyVisualMode("reverseCover");
```

Implementation detail:

```ts
let lastVisualMode: WeddingScrollVisualMode | null = null;

const notifyVisualMode = (mode: WeddingScrollVisualMode) => {
  if (lastVisualMode === mode) return;
  lastVisualMode = mode;
  onVisualModeChange?.(mode);
};
```

### `MainScrollVideoBackground`

Add:

```ts
type MainScrollVideoBackgroundProps = {
  // existing props...
  onVisualModeChange?: (mode: WeddingScrollVisualMode) => void;
};
```

Responsibilities:

```txt
initialReverseCoverVisible=true -> report "initialCover" before scrub starts
reverse cover latched          -> report "reverseCover"
forward scroll clears cover    -> report "forwardScrub"
poster fallback                -> report "posterFallback"
```

### `HomePage`

Own:

```ts
const [scrollVisualMode, setScrollVisualMode] =
  useState<WeddingScrollVisualMode>("initialCover");
```

Wire:

```tsx
<MainScrollVideoBackground
  containerRef={containerRef}
  enabled={experience.enableScrollVideo}
  initialReverseCoverVisible
  onVisualModeChange={setScrollVisualMode}
/>

<div
  className="relative z-10 wedding-copy-theme"
  data-scroll-visual-mode={scrollVisualMode}
>
  ...
</div>
```

If navbar should also adapt, put the data attribute on a shared invitation shell that wraps both navbar and content:

```tsx
<div data-scroll-visual-mode={scrollVisualMode}>
  <Navbar />
  <div className="relative z-10 wedding-copy-theme">...</div>
</div>
```

## Text Color Structure

Replace hard-coded content colors with semantic classes.

Recommended semantic classes:

```txt
wedding-text-primary    -> main headings
wedding-text-secondary  -> body copy
wedding-text-kicker     -> small uppercase labels
wedding-text-accent     -> ampersand / gold accents
wedding-text-inverse    -> hero/nav text that must stay light
```

Current production nuance:

```txt
wedding-text-primary / wedding-text-secondary
  -> wrapper-safe semantic color classes only

wedding-text-kicker / wedding-text-accent
  -> gold text effect is acceptable because these are normally applied directly to text nodes

antique-cream-text
  -> selected dimensional style for main invitation text; apply directly to the rendered text/span
```

Example section migration:

```tsx
<section className="... wedding-text-primary">
  <span className="wedding-text-kicker">Placeholder</span>
  <h2 className="...">Details Section</h2>
  <p className="wedding-text-secondary">...</p>
</section>
```

Do not keep mixing `text-stone-*`, `text-white`, and runtime visual modes in the same component. Once a component uses the semantic theme, let CSS variables decide the final color.

## CSS Variable Contract

Add a small CSS layer, likely in the main stylesheet:

```css
.wedding-copy-theme {
  --wedding-text-primary: rgb(41 37 36);
  --wedding-text-secondary: rgb(87 83 78);
  --wedding-text-kicker: rgb(180 133 44);
  --wedding-text-accent: rgb(212 175 55);
}

[data-scroll-visual-mode="forwardScrub"] .wedding-copy-theme,
[data-scroll-visual-mode="forwardScrub"].wedding-copy-theme {
  --wedding-text-primary: rgba(255, 255, 255, 0.94);
  --wedding-text-secondary: rgba(255, 255, 255, 0.78);
  --wedding-text-kicker: rgba(246, 215, 143, 0.92);
  --wedding-text-accent: rgb(212 175 55);
}

[data-scroll-visual-mode="reverseCover"] .wedding-copy-theme,
[data-scroll-visual-mode="initialCover"] .wedding-copy-theme,
[data-scroll-visual-mode="reverseCover"].wedding-copy-theme,
[data-scroll-visual-mode="initialCover"].wedding-copy-theme {
  --wedding-text-primary: rgb(41 37 36);
  --wedding-text-secondary: rgb(87 83 78);
  --wedding-text-kicker: rgb(180 133 44);
  --wedding-text-accent: rgb(180 133 44);
}

.wedding-text-primary {
  color: var(--wedding-text-primary);
  transition: color 180ms ease;
}

.wedding-text-secondary {
  color: var(--wedding-text-secondary);
  transition: color 180ms ease;
}

.wedding-text-kicker {
  color: var(--wedding-text-kicker);
  transition: color 180ms ease;
}

.wedding-text-accent {
  color: var(--wedding-text-accent);
  transition: color 180ms ease;
}
```

Keep the transition short. Long color transitions can look muddy while the reverse cover is appearing.

## Performance Rules

* Do not update React state on every scroll tick.
* Do not attach a separate ScrollTrigger per text section just for color.
* Do not query every text node during scroll.
* Do not use `mix-blend-mode` as the main solution for content text; it is visually unpredictable and can be expensive.
* Prefer CSS variables and a single data attribute.
* Keep the reverse-cover threshold in `useScrollScrubVideo`; text should follow the same mode as the actual visual background.
* Keep `background-clip: text` effects off parent wrappers. Use them only on actual text-bearing elements.
* Do not animate clipped text gradients by default. The current stable production choice is a static gradient surface plus GSAP opacity/transform reveal. If gradient motion is reintroduced, gate it with `prefers-reduced-motion` and verify it does not desynchronize from GSAP opacity on mobile Safari/Chrome.

## Implementation Steps

1. Add `WeddingScrollVisualMode` type near `useScrollScrubVideo` or in a small `types.ts` under `src/features/wedding`.
2. Add `onVisualModeChange` to `useScrollScrubVideo`.
3. Emit mode changes when:
   * scrub initializes with `initialReverseCoverVisible`
   * reverse cover latches
   * forward scroll clears reverse cover
   * fallback activates
4. Add `onVisualModeChange` to `MainScrollVideoBackground`.
5. Store `scrollVisualMode` in `HomePage`.
6. Add `data-scroll-visual-mode` to the invitation shell.
7. Add semantic CSS variable classes.
8. Migrate section text from hard-coded color classes to semantic classes.
9. Decide whether `Navbar` should remain `mix-blend-difference` or move to the same semantic color system. If readability is inconsistent, remove `mix-blend-difference` and theme it explicitly.
10. Verify with:

```txt
npm run lint
npm run build
```

## Manual Test Cases

```txt
After entry ends:
  reverse cover is visible
  text uses reverse/initial cover colors

Scroll down:
  reverse cover clears
  main video is visible
  text changes to forward scrub colors

Scroll up past threshold:
  reverse cover appears
  text changes to reverse cover colors

Stop / change direction quickly:
  text does not flicker every frame
  mode changes only when the visual cover actually changes

Reduced motion / video error:
  poster fallback remains readable
```

## Key Principle

Text color should follow the actual visible background layer, not raw scroll direction alone. Direction is only an input. The visual mode is the public state.
