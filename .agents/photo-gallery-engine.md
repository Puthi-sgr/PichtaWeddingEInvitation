# Photo Gallery Engine

## Purpose

This document defines the photo gallery system for the mobile-first static
wedding invitation. There are two gallery components, both self-contained,
lazy-loadable, and matched to the gold / dark-green invite theme:

* **`FramedGallery`** — the primary, slot-based gallery. Fixed structure with a
  justified full-width photo at each end and a fixed 2-column masonry between
  them. Layout is decoupled from content: **slots own the geometry, keys supply
  the images.**
* **`PhotoMosaic`** — a free-form explorer (masonry / rows / columns presets)
  used mainly in the lab for experimentation. Content and layout are coupled
  (react-photo-album computes the layout from each photo's aspect ratio).

Both share one fullscreen viewer (`yet-another-react-lightbox`): tap a photo to
open, swipe between shots, pinch / double-tap to zoom, swipe down to dismiss.

## Core principle (FramedGallery)

The layout geometry comes **entirely from the template's fixed slot aspect
ratios**, never from the images. Inserting, swapping, or clearing a photo only
changes that tile's `src`/`srcSet` — `width`/`height` are constant, so the
masonry layout is invariant. **No reflow on content changes; the frame holds
its shape even before any image is inserted** (unfilled slots render as
placeholder boxes).

```txt
Template (slots) = fixed geometry  → layout computed once, never recomputed
GalleryFill (slotId → key)         = content, swappable freely
SlotResolver                       = key → responsive, fill-cropped photo
Cloudinary c_fill,g_auto           = image cropped to the slot's ratio
Lightbox                           = one shared viewer across caps + masonry
```

## Folder structure

```txt
src/features/gallery/
  lib/
    photos.ts       # GalleryPhoto, buildResponsivePhoto, placeholderPhoto,
                    # UrlFactory, unsplash + sample data, unsplashSlotResolver
    template.ts     # GallerySlot, GalleryTemplate, GalleryFill, SlotResolver,
                    # framedTemplate (the locked default), templateSlots()
    cldAdapter.ts   # cloudinarySlotResolver (upload publicIds),
                    # remoteSlotResolver (raw remote URLs via Cloudinary fetch)
    presets.ts      # PhotoMosaic layout presets (free-form explorer)
  hooks/
    useFramedGallery.ts   # template + fill → region arrays + lightbox slides
  components/
    FramedGallery.tsx     # caps + masonry + unified lightbox (slot-based)
    PhotoMosaic.tsx       # free-form masonry/rows/columns + lightbox
  pages/
    GalleryLabPage.tsx    # /gallery-lab preview (Framed demo + mosaic explorer)
```

## Locked tuning

Chosen for mobile, kept identical on desktop by design:

* **2 masonry columns** (mobile and desktop — do not scale up per viewport)
* **spacing 10px**, **corner radius 8px**
* Caps: one full-width photo each end. A cap is a `GallerySlot[]`, so it may
  hold **1 or 2** photos — a 2-photo cap splits width proportionally at equal
  height (still edge-to-edge / justified).

The default `framedTemplate` masonry ratios are deliberately balanced (each
column = one portrait + one square + one landscape) so both columns pack to
**equal height** — this gives a clean straight seam above the bottom cap
instead of a ragged masonry edge fighting the justified ends. If you edit the
masonry slot ratios, keep the two columns height-balanced or the bottom seam
will gap.

## Data model

```ts
interface GallerySlot {
  id: string;          // stable — the key you fill against
  role: "cap" | "masonry";
  aspectRatio: number; // width ÷ height; drives layout, image is cropped to it
  alt?: string;
}

interface GalleryTemplate {
  topCap: GallerySlot[];      // 1–2 slots, justified full-width row
  masonry: GallerySlot[];
  bottomCap: GallerySlot[];   // 1–2 slots
  columns: number;            // 2
  spacing: number;            // 10
  radius: number;             // 8
  padding: number;            // 0
}

type GalleryFill = Record<string, string | undefined>;  // slotId → image key
type SlotResolver = (slot: GallerySlot, key?: string) => GalleryPhoto;
```

## Usage (production)

Insert a photo by pointing a slot id at a Cloudinary key (registered key from
`cldAssets.ts` **or** a raw publicId). Omit a slot to leave a placeholder.

```tsx
import { lazy, Suspense } from "react";
import { framedTemplate } from "../../gallery/lib/template";
import type { GalleryFill } from "../../gallery/lib/template";

const FramedGallery = lazy(() => import("../../gallery/components/FramedGallery"));

const fill: GalleryFill = {
  top: "wedding.gallery-hero",     // registered key or raw publicId
  m1: "wedding.gallery-01",
  m2: "wedding.gallery-02",
  // m3 omitted → placeholder, layout unchanged
  bottom: "wedding.gallery-closing",
};

<Suspense fallback={null}>
  <FramedGallery template={framedTemplate} fill={fill} />
</Suspense>;
```

The default resolver is `cloudinarySlotResolver` (uploaded publicIds). To source
images elsewhere, pass a different `SlotResolver`:

* `remoteSlotResolver` — fill values are **plain remote image URLs**, delivered
  through Cloudinary fetch and fill-cropped to the slot ratio. This is what the
  live invite uses (`cldAdapter.ts` → `cldFetchCropUrlFactory`).
* `unsplashSlotResolver` — fill values are Unsplash photo ids; used by the lab so
  it works with zero Cloudinary config.

### Live integration (the invite)

`src/features/wedding/components/PhotoGallery.tsx` is wired to the production
path: it lazy-loads `FramedGallery` and passes `weddingContent.gallery.slots`
(a `slotId → Cloudinary publicId` map) as the `GalleryFill`, resolved by the
default `cloudinarySlotResolver`. The Khmer heading/subtitle and the
`data-wedding-section` hook are preserved.

**To insert real photos:** upload to Cloudinary, then paste the publicId into the
matching slot in `weddingContent.gallery.slots` (`top`, `m1`–`m6`, `bottom`). An
empty string leaves a placeholder box; the fixed layout never reflows as slots
fill. (`remoteSlotResolver` remains available for feeding plain remote URLs
instead — e.g. a quick preview — but the invite uses Cloudinary publicIds.)

## Optimization notes

* **Lazy-load it.** Import `FramedGallery` / `PhotoMosaic` via `React.lazy` (same
  pattern as `GoldenBackdrop`) so react-photo-album + the lightbox load as their
  own async chunk, never in the invite's critical bundle. Verify with
  `npm run build`: the gallery code should land in a route/`GalleryLabPage`-style
  chunk, not `index-*.js`.
* **Two-tier images.** Grid tiles use a small srcSet (320–1024px); the lightbox
  fetches larger variants (up to 2048px) **only for the opened slide** +
  neighbours. Never point a grid tile at a full-res source.
* **Fill-crop, don't scale.** The Cloudinary resolver uses `crop: "fill"`
  (`c_fill,g_auto`) so an image fills its fixed-ratio slot without distortion or
  layout shift. Width-only `scale` would only be correct if the source already
  matched the slot ratio.
* **No layout shift.** Heights are derived from the slot ratio up front, so tiles
  reserve their space before images load.

## Registered assets

Add gallery image keys to `src/shared/utils/cld/cldAssets.ts` (example keys are
present, commented). The resolver also accepts raw publicIds, so registration is
optional convenience for reused assets. See
`.agents/architecture-handoff.md` §8 for Cloudinary rules and the `crop: "fill"`
option on `getCldImage`.

## Preview / lab

`/gallery-lab` (route registered lazily in `src/app/router.tsx`) hosts:

* the **Framed** demo with Fill next / Fill all / Clear controls — use it to
  confirm the structure stays put as slots fill and empty;
* the **free-form mosaic** explorer for the `PhotoMosaic` presets and live
  spacing/columns/radius tweaks.

## Rules

* Do not couple layout to content in `FramedGallery` — geometry stays in the
  template's slot ratios. Adding photos must never change slot `width`/`height`.
* Keep the two masonry columns height-balanced when editing `framedTemplate`.
* Keep the gallery lazy-loaded; do not import it into the invite's critical path.
* Prefer the typed `SlotResolver` / `UrlFactory` seams over handwritten image
  URLs in components.
