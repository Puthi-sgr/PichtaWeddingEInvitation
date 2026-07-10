# animation.md

## Purpose

This document defines the locked animation direction for a mobile-first static wedding invitation website.

The website uses pre-generated static invite pages. The guest name and invitation content should already exist in the HTML. Animation is only an enhancement layer.

## Core principle

Use GSAP for choreographed reveal effects, not for basic page rendering.

The page must remain readable if JavaScript is delayed or disabled.

```txt
HTML = content
CSS = visual style
Cloudinary/CDN = optimized image delivery
GSAP = emotional motion enhancement
ScrollTrigger = viewport-based launcher only
```

## Current section orchestration

The production invite uses one public animation hook:

```txt
useWeddingAnimations()
  -> foreground handoff
  -> InvitationBody reveal
  -> lineage reveal
  -> agenda reveal
  -> venue reveal
  -> gallery reveal
  -> footer reveal
```

Each major section should have one section-level `ScrollTrigger` with `once: true`.
This keeps mobile work bounded to intersection-time launch events instead of
continuous scroll-frame text updates.

```txt
Preferred:
  one trigger per major section
  opacity + transform only
  small stagger inside the section timeline
  temporary will-change, then clear it

Avoid:
  one trigger per letter/row/text node
  scrubbed text timelines
  pinning
  per-frame gradient/text-shadow animation
```

The background scroll scrub tracker remains separate. It owns video seeking,
reverse-cover visibility, and coarse visual mode reporting only.

## Current typography and surface effects

The production wedding invite is Khmer-only and uses `Moul` as the visible wedding font. Text styling is split between CSS surface effects and GSAP reveal effects:

```txt
CSS:
  gold clipped-gradient text for ceremonial labels
  antique cream clipped-gradient / raised print effect for the main invitation line

GSAP:
  opacity + transform reveal only
  no ownership of text gradients, strokes, or color surfaces
```

The selected main non-gold text style is `antique-cream-text`. The gold ceremonial style is applied through `wedding-text-kicker`, `wedding-text-accent`, or `gold-text`.

Critical rule: apply clipped-gradient text effects to the exact text-bearing element that GSAP animates. Do not put `antique-cream-text`, `gold-text`, or any class with `background-clip: text` on a parent wrapper around `.guest-letter`/`.hero-detail` children. Parent-level clipped gradients can paint ghost text before the child opacity reveal completes.

Good:

```jsx
<span className="hero-detail wedding-animated antique-cream-text opacity-0">
  សូមគោរពអញ្ជើញ
</span>

<span className="guest-letter wedding-animated antique-cream-text inline-block opacity-0">
  ក
</span>
```

Avoid:

```jsx
<h1 className="guest-name wedding-animated antique-cream-text">
  <span className="guest-letter wedding-animated opacity-0">ក</span>
</h1>
```

Do not animate gradient positions by default. The current stable decision is: static gradient surface, GSAP entrance motion. If a future pass adds moving highlights/shimmer, it must include a `prefers-reduced-motion` guard and be tested against GSAP opacity/transform timing.

## Locked animation bucket

The approved animation set is:

1. Photo Curtain
2. Letter Bloom
3. Venue Wave
4. Vow Whisper
5. Golden Sweep
6. Location Pin
7. Iris Reveal / Iris Sweep
8. Ring Lock

Avoid adding generic fade-up animations unless they support one of the approved effects.

---

# GSAP setup

Install GSAP:

```bash
npm install gsap
```

For viewport-triggered animations:

```js
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
```

Use `gsap.context()` in React components so animations are cleaned up correctly.

```js
useEffect(() => {
  const ctx = gsap.context(() => {
    // animations here
  }, rootRef);

  return () => ctx.revert();
}, []);
```

---

# ScrollTrigger rule

Use ScrollTrigger only as a lazy viewport trigger.

Good:

```js
scrollTrigger: {
  trigger: ".section",
  start: "top 80%",
  once: true
}
```

Avoid:

```js
scrollTrigger: {
  scrub: true,
  pin: true
}
```

Do not use `scrub`, `pin`, or long scroll-controlled timelines for this wedding site unless explicitly approved.

---

# 1. Photo Curtain

## Purpose

Reveal the main photo with a premium center-out curtain effect.

## Best use

Hero image or important couple photo.

## Required HTML shape

```html
<div class="hero-image">
  <img src="..." alt="Wedding couple" />
</div>
```

## Snippet

```js
gsap.fromTo(
  ".hero-image",
  {
    // Starts hidden from both left and right sides.
    clipPath: "inset(0 50% 0 50% round 1.7rem)",
    opacity: 0.4,
    scale: 1.04,
  },
  {
    // Reveals full image.
    clipPath: "inset(0 0% 0 0% round 1.7rem)",
    opacity: 1,
    scale: 1,
    duration: 1.1, // Adjust: 0.8 faster, 1.2 slower/more elegant.
    ease: "expo.out", // Adjust: power3.out is softer; expo.out is more dramatic.
    scrollTrigger: {
      trigger: ".hero-image",
      start: "top 80%", // Adjust: 90% starts earlier, 70% starts later.
      once: true,
    },
  }
);
```

## Tunable parameters

* `duration`: controls reveal speed.
* `clipPath inset`: controls direction and amount of masking.
* `scale`: controls subtle zoom-out feeling.
* `start`: controls when the reveal begins in the viewport.

## Performance note

Medium overhead because `clip-path` is more expensive than `transform`. Use once for the main image.

---

# 2. Iris Reveal / Iris Sweep

## Purpose

Reveal the photo through a circular aperture effect.

## Best use

Alternative to Photo Curtain. Do not use both on the same hero image during page load.

## Snippet

```js
gsap.fromTo(
  ".hero-image",
  {
    // Starts as a tiny circle from the center.
    clipPath: "circle(0% at 50% 50%)",
    opacity: 0.35,
    scale: 1.06,
  },
  {
    // Expands until the image is fully visible.
    clipPath: "circle(78% at 50% 50%)",
    opacity: 1,
    scale: 1,
    duration: 1.15, // Adjust: 0.9 faster, 1.25 more cinematic.
    ease: "expo.out",
    scrollTrigger: {
      trigger: ".hero-image",
      start: "top 80%",
      once: true,
    },
  }
);
```

## Tunable parameters

* `circle(78%)`: increase to `85%` if corners are still hidden.
* `at 50% 50%`: move origin, e.g. `at 50% 40%`.
* `duration`: controls cinematic pacing.

## Performance note

Medium-high overhead. Use once only. Prefer Photo Curtain for safer mobile performance.

---

# 3. Letter Bloom

## Purpose

Reveal the invitee name letter by letter, blooming from the center.

## Best use

Personalized guest name.

## Required rendering shape

Split the guest name into spans.

```jsx
const guestName = "Chantha Family";
const guestLetters = guestName.split("");

<p className="guest-name">
  {guestLetters.map((letter, index) => (
    <span key={index} className="guest-letter inline-block">
      {letter === " " ? "\u00A0" : letter}
    </span>
  ))}
</p>
```

## Snippet

```js
gsap.fromTo(
  ".guest-letter",
  {
    opacity: 0,
    y: 24, // Adjust: higher value = stronger upward bloom.
    rotation: (index) => (index % 2 === 0 ? -8 : 8),
    scale: 0.82,
  },
  {
    opacity: 1,
    y: 0,
    rotation: 0,
    scale: 1,
    duration: 0.72, // Adjust: 0.55 faster, 0.85 softer.
    stagger: {
      each: 0.035, // Adjust: smaller = faster word reveal.
      from: "center", // Keep this; it creates the bloom effect.
    },
    ease: "back.out(1.9)", // Adjust: lower number = less bounce.
    scrollTrigger: {
      trigger: ".guest-name",
      start: "top 85%",
      once: true,
    },
  }
);
```

## Tunable parameters

* `stagger.each`: controls letter speed.
* `from: "center"`: creates the signature bloom.
* `y`: controls entrance distance.
* `back.out(1.9)`: controls bounce intensity.

## Performance note

Low overhead. Uses transform and opacity. Safe on mobile.

## Production note for Khmer invitee text

For the current invite, the guest name letters may also carry `antique-cream-text`:

```jsx
<span className="guest-letter wedding-animated antique-cream-text inline-block opacity-0">
  {letter === " " ? "\u00A0" : letter}
</span>
```

Keep the gradient/stroke style on each `.guest-letter`, because `.guest-letter` is the element whose opacity and transform GSAP owns. Do not move the style up to `.guest-name`.

---

# 4. Venue Wave

## Purpose

Reveal venue text word by word with a gentle wave.

## Best use

Venue name, location line, or short address.

## Required rendering shape

```html
<p class="venue-text">
  <span class="venue-word">The</span>
  <span class="venue-word">Garden</span>
  <span class="venue-word">Hall,</span>
  <span class="venue-word">Phnom</span>
  <span class="venue-word">Penh</span>
</p>
```

## Snippet

```js
gsap.fromTo(
  ".venue-word",
  {
    opacity: 0,
    y: 18,
    rotation: -4,
  },
  {
    opacity: 1,
    y: 0,
    rotation: 0,
    duration: 0.55, // Adjust: 0.45 faster, 0.7 more elegant.
    stagger: 0.09, // Adjust: lower = faster wave.
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".venue-text",
      start: "top 85%",
      once: true,
    },
  }
);
```

## Tunable parameters

* `stagger`: controls wave timing.
* `rotation`: controls playful tilt.
* `duration`: controls smoothness.

## Performance note

Low overhead. Safe on mobile.

---

# 5. Vow Whisper

## Purpose

Reveal a short message word by word with a soft, romantic whisper effect.

## Best use

Short invitation sentence or vow-style message.

## Required rendering shape

```jsx
const introText = "We joyfully invite you to celebrate our wedding day with us.";
const introWords = introText.split(" ");

<p className="intro-copy">
  {introWords.map((word, index) => (
    <span key={index} className="intro-word inline-block mr-1">
      {word}
    </span>
  ))}
</p>
```

## Snippet

```js
gsap.fromTo(
  ".intro-word",
  {
    opacity: 0,
    y: 14,
    filter: "blur(2px)", // Adjust carefully. 2px is safer than 6px on phones.
  },
  {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    duration: 0.55,
    stagger: 0.045,
    ease: "power3.out",
    scrollTrigger: {
      trigger: ".intro-copy",
      start: "top 85%",
      once: true,
    },
  }
);
```

## Tunable parameters

* `filter: blur(2px)`: increase only after testing. Avoid 6px on low-end phones.
* `stagger`: controls word rhythm.
* `y`: controls float-up distance.

## Performance note

Medium overhead because blur is expensive. Keep the text short and blur low.

Fallback option for weak phones:

```js
filter: "blur(0px)"
```

---

# 6. Golden Sweep

## Purpose

Move a soft golden/white light across the photo for a premium card effect.

## Best use

After the hero image is already visible.

## Required HTML shape

```html
<div class="hero-image">
  <img src="..." alt="Wedding couple" />
  <div class="shine-sweep"></div>
</div>
```

Suggested CSS/Tailwind concept:

```html
<div class="shine-sweep pointer-events-none absolute -top-10 bottom-0 left-0 w-24 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-sm"></div>
```

## Snippet

```js
gsap
  .timeline({
    scrollTrigger: {
      trigger: ".hero-image",
      start: "top 75%",
      once: true,
    },
  })
  .fromTo(
    ".hero-image",
    { scale: 0.985 },
    {
      scale: 1,
      duration: 0.45,
      ease: "power2.out",
    }
  )
  .fromTo(
    ".shine-sweep",
    {
      x: "-130%",
      opacity: 0,
    },
    {
      x: "130%",
      opacity: 0.7, // Adjust: lower for subtle, higher for dramatic.
      duration: 1.05, // Adjust sweep speed.
      ease: "power3.inOut",
    },
    "-=0.15"
  )
  .to(
    ".shine-sweep",
    {
      opacity: 0,
      duration: 0.18,
    },
    "-=0.2"
  );
```

## Tunable parameters

* `x`: controls travel distance.
* `opacity`: controls strength of shine.
* `duration`: controls sweep speed.
* `blur-sm`: reduce/remove if weak phone performance is poor.

## Performance note

Medium overhead because the overlay uses blur. Use once only.

---

# 7. Location Pin

## Purpose

Make the venue/location card feel alive by dropping the map pin icon into place.

## Best use

Venue card.

## Required HTML shape

```html
<div class="venue-card">
  <div class="venue-pin">...</div>
  <div>Venue details...</div>
</div>
```

## Snippet

```js
gsap
  .timeline({
    scrollTrigger: {
      trigger: ".venue-card",
      start: "top 85%",
      once: true,
    },
    defaults: { ease: "power3.out" },
  })
  .fromTo(
    ".venue-pin",
    {
      opacity: 0,
      y: -42, // Adjust: drop height.
      scale: 0.65,
      rotation: -8,
    },
    {
      opacity: 1,
      y: 0,
      scale: 1,
      rotation: 0,
      duration: 0.65,
      ease: "bounce.out", // Adjust: power3.out for less playful.
    }
  )
  .fromTo(
    ".venue-card",
    { scale: 0.98 },
    {
      scale: 1,
      duration: 0.35,
      ease: "back.out(1.8)",
    },
    "-=0.2"
  );
```

## Tunable parameters

* `y`: controls drop height.
* `bounce.out`: controls playful bounce. Replace with `power3.out` for premium/subtle.
* `scale`: controls card response.

## Performance note

Low overhead. Safe on mobile.

---

# 8. Ring Lock

## Purpose

Animate two wedding rings sliding into each other with small sparkle accents.

## Best use

Couple section, before or after the couple names.

## Required HTML shape

```html
<div class="rings-wrap">
  <div class="ring-one"></div>
  <div class="ring-two"></div>
  <span class="sparkle-dot"></span>
  <span class="sparkle-dot"></span>
  <span class="sparkle-dot"></span>
</div>
```

## Snippet

```js
gsap
  .timeline({
    scrollTrigger: {
      trigger: ".rings-wrap",
      start: "top 85%",
      once: true,
    },
    defaults: { ease: "power3.out" },
  })
  .fromTo(
    ".ring-one",
    {
      opacity: 0,
      x: -54,
      rotation: -32,
      scale: 0.8,
    },
    {
      opacity: 1,
      x: 0,
      rotation: -12,
      scale: 1,
      duration: 0.75,
    }
  )
  .fromTo(
    ".ring-two",
    {
      opacity: 0,
      x: 54,
      rotation: 32,
      scale: 0.8,
    },
    {
      opacity: 1,
      x: 0,
      rotation: 12,
      scale: 1,
      duration: 0.75,
    },
    "-=0.62"
  )
  .to([".ring-one", ".ring-two"], {
    scale: 1.08,
    duration: 0.25,
    yoyo: true,
    repeat: 1,
    ease: "sine.inOut",
  })
  .fromTo(
    ".sparkle-dot",
    {
      opacity: 0,
      scale: 0,
    },
    {
      opacity: 1,
      scale: 1,
      duration: 0.28,
      stagger: 0.05,
      ease: "back.out(2)",
    },
    "-=0.18"
  );
```

## Tunable parameters

* `x`: controls how far rings travel.
* `rotation`: controls ring angle.
* `scale: 1.08`: controls lock pulse strength.
* `stagger`: controls sparkle timing.

## Performance note

Low to medium overhead. Mostly transform/opacity. Safe if sparkle count is small.

---

# Recommended page choreography

Do not fire every animation at page load.

Recommended flow:

```txt
Hero section:
- Photo Curtain OR Iris Reveal
- Letter Bloom
- Ring Lock

Message section:
- Vow Whisper

Venue section:
- Venue Wave
- Location Pin

Photo polish:
- Golden Sweep once, after image is visible
```

## Important rule

Choose only one hero image reveal:

```txt
Option A: Photo Curtain = safer and elegant
Option B: Iris Reveal = cooler and heavier
```

Do not run both on the same image during initial load.

---

# Performance matrix

| Animation     |    Overhead | Main cost                                | Mobile verdict               |
| ------------- | ----------: | ---------------------------------------- | ---------------------------- |
| Letter Bloom  |         Low | Text spans + transform/opacity           | Safe                         |
| Venue Wave    |         Low | Word spans + transform/opacity           | Safe                         |
| Location Pin  |         Low | Icon transform + card scale              | Safe                         |
| Ring Lock     |  Low-medium | Small shape transforms + sparkle stagger | Safe                         |
| Golden Sweep  |      Medium | Moving overlay + blur                    | Use once                     |
| Photo Curtain |      Medium | `clip-path: inset(...)`                  | Use once                     |
| Iris Reveal   | Medium-high | `clip-path: circle(...)`                 | Use instead of Photo Curtain |
| Vow Whisper   | Medium-high | Word stagger + blur                      | Reduce blur on mobile        |

---

# Mobile performance rules

## Use freely

```txt
opacity
transform
x / y
scale
rotation
small stagger
once: true ScrollTrigger
```

## Use carefully

```txt
clip-path
filter: blur()
large overlays
many text spans
long timelines
```

## Avoid

```txt
scrub: true
pin: true
infinite heavy animation
large particle systems
animating width/height/top/left/margin/padding
many blurred elements
```

## Text surface performance rules

Use clipped gradients and text shadows sparingly:

```txt
Safe:
  static background-clip text on short labels or headline spans
  text-shadow layers on main invitation text
  GSAP opacity/transform on the same text-bearing element

Avoid:
  background-clip text on section/layout wrappers
  animated gradient-position on many letters
  filter/blur on long Khmer text
  transition: all
```

If text reveal looks like a ghost/empty fill before the animation completes, check for `background-clip: text` or `color: transparent` on an ancestor wrapper first.

---

# Reduced motion support

Respect user motion preferences.

```js
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (reduceMotion) {
  gsap.set(".animated", {
    opacity: 1,
    y: 0,
    x: 0,
    scale: 1,
    rotation: 0,
    clearProps: "filter,clipPath",
  });
  ScrollTrigger.getAll().forEach((trigger) => trigger.kill());
}
```

Use this class approach:

```html
<div class="hero-image animated">...</div>
<span class="guest-letter animated">C</span>
```

---

# Image optimization rule

Images should not be bundled inside JavaScript.

Use Cloudinary/CDN-hosted responsive images.

Recommended Cloudinary concept:

```html
<img
  src="https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto,w_768/wedding-main.jpg"
  srcset="
    https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto,w_480/wedding-main.jpg 480w,
    https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto,w_768/wedding-main.jpg 768w,
    https://res.cloudinary.com/YOUR_CLOUD/image/upload/f_auto,q_auto,w_1200/wedding-main.jpg 1200w
  "
  sizes="100vw"
  alt="Wedding couple"
/>
```

---

# Agent implementation checklist

Before coding:

* Confirm final animation list.
* Confirm whether hero uses Photo Curtain or Iris Reveal.
* Confirm DOM class names match snippets.
* Confirm GSAP + ScrollTrigger are installed and registered.
* Confirm images are optimized and not imported into the JS bundle as large assets.

During coding:

* Use `gsap.context()` for React cleanup.
* Use `once: true` in ScrollTrigger.
* Avoid `scrub` and `pin`.
* Keep `filter: blur()` at 2px or remove it for weak devices.
* Keep sparkle/petal counts low.

Testing:

* Test on Chrome mobile emulation.
* Test on at least one real Android phone.
* Test with slow 4G throttling.
* Check if content is visible before animation starts.
* Check if layout does not jump when animations trigger.
* Check if the page still works with reduced motion.

---

# Final recommended lock

Use this production combination:

```txt
Hero:
- Photo Curtain OR Iris Reveal
- Letter Bloom
- Ring Lock

Message:
- Vow Whisper with blur 2px max

Venue:
- Venue Wave
- Location Pin

Photo polish:
- Golden Sweep once
```

Default safer choice:

```txt
Photo Curtain > Iris Reveal
```

Default cooler choice:

```txt
Iris Reveal > Photo Curtain
```
