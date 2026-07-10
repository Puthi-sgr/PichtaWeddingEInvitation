import type { Photo } from "react-photo-album";
import { getCldImage } from "../../../shared/utils/cld";
import type { GallerySlot, SlotResolver } from "./template";

/** A single fixed-size image variant (used inside a srcSet). */
export interface ResponsiveImage {
  src: string;
  width: number;
  height: number;
}

/**
 * A photo for the mosaic. `src`/`srcSet` (inherited from react-photo-album's
 * `Photo`) drive the small **grid tile**; `lightbox` carries the larger
 * variants used only once a guest actually opens the fullscreen viewer — so
 * phones never download full-res just to render the wall.
 */
export interface GalleryPhoto extends Photo {
  lightbox: ResponsiveImage & { srcSet?: ResponsiveImage[] };
  /** True when the slot has no image yet — rendered as a placeholder box. */
  empty?: boolean;
}

// Grid tiles stay small (a phone tile is ~150–350px wide); the browser picks
// the smallest srcSet entry that satisfies the `sizes` hint on the album.
const GRID_WIDTHS = [320, 480, 640, 768, 1024] as const;
const GRID_BASE = 1024;

// The lightbox shows one photo near-fullscreen, so it needs bigger variants —
// but still capped, and still only fetched for the opened slide + neighbours.
const LIGHTBOX_WIDTHS = [1024, 1600, 2048] as const;
const LIGHTBOX_BASE = 1600;

/**
 * Produces every image URL for a given target width/height. This is the seam
 * that makes the gallery source-agnostic and "optimized" by construction:
 * whatever you pass here decides the actual bytes sent to the device.
 *   - Cloudinary  → {@link cldUrlFactory}
 *   - Unsplash    → {@link unsplashUrlFactory} (used by the sample set)
 *   - anything    → your own `(w, h) => string`
 */
export type UrlFactory = (width: number, height: number) => string;

export interface BuildResponsivePhotoInput {
  /** width ÷ height of the source image (e.g. 1.5 landscape, 0.75 portrait). */
  aspectRatio: number;
  /** Builds a URL for a requested pixel size. */
  url: UrlFactory;
  alt?: string;
  key?: string;
}

/**
 * Turns one source image into a fully responsive {@link GalleryPhoto} with a
 * small grid srcSet and a separate larger lightbox srcSet. Heights are derived
 * from `aspectRatio` so the layout never shifts while images load.
 */
export function buildResponsivePhoto({
  aspectRatio,
  url,
  alt = "",
  key,
}: BuildResponsivePhotoInput): GalleryPhoto {
  const h = (w: number) => Math.round(w / aspectRatio);

  return {
    key,
    alt,
    src: url(GRID_BASE, h(GRID_BASE)),
    width: GRID_BASE,
    height: h(GRID_BASE),
    srcSet: GRID_WIDTHS.map((w) => ({ src: url(w, h(w)), width: w, height: h(w) })),
    lightbox: {
      src: url(LIGHTBOX_BASE, h(LIGHTBOX_BASE)),
      width: LIGHTBOX_BASE,
      height: h(LIGHTBOX_BASE),
      srcSet: LIGHTBOX_WIDTHS.map((w) => ({ src: url(w, h(w)), width: w, height: h(w) })),
    },
  };
}

/**
 * URL factory for a Cloudinary asset (production path). Uses width-based
 * scaling, so the source's own aspect ratio must match the `aspectRatio` you
 * declare for the photo. For real invite photos: register them in
 * `cldAssets.ts` and pass `cldUrlFactory("wedding.gallery-01")` (a registered
 * key) or a raw publicId.
 */
export function cldUrlFactory(publicId: string): UrlFactory {
  return (width) => getCldImage(publicId, { width }).url;
}

/**
 * URL factory for an Unsplash photo id. `fit=crop` + explicit w/h means the
 * returned image exactly matches the requested box, so the declared
 * `aspectRatio` is always honoured (no layout shift). Used by the sample set
 * so the preview works without any Cloudinary config.
 */
export function unsplashUrlFactory(photoId: string): UrlFactory {
  return (width, height) =>
    `https://images.unsplash.com/${photoId}?auto=format&fit=crop&q=80&w=${width}&h=${height}`;
}

// A mixed portrait/landscape/square set so the masonry reads as a real mosaic.
// Swap these for `cldUrlFactory(...)` entries once real photos are uploaded.
export const samplePhotos: GalleryPhoto[] = [
  { id: "photo-1519741497674-611481863552", aspectRatio: 0.72, alt: "Wedding rings on lace" },
  { id: "photo-1511285560929-80b456fea0bc", aspectRatio: 1.5, alt: "Couple walking a garden path" },
  { id: "photo-1465495976277-4387d4b0b4c6", aspectRatio: 1, alt: "Bridal bouquet" },
  { id: "photo-1519225421980-715cb0215aed", aspectRatio: 0.75, alt: "Bride portrait" },
  { id: "photo-1522673607200-164d1b6ce486", aspectRatio: 1.5, alt: "Table setting with candles" },
  { id: "photo-1520854221256-17451cc331bf", aspectRatio: 1.33, alt: "Wedding reception" },
  { id: "photo-1583939003579-730e3918a45a", aspectRatio: 0.75, alt: "First dance" },
  { id: "photo-1537633552985-df8429e8048b", aspectRatio: 1.5, alt: "Ceremony arch" },
  { id: "photo-1606216794074-735e91aa2c92", aspectRatio: 1, alt: "Wedding cake" },
  { id: "photo-1525258946800-98cfd641d0de", aspectRatio: 0.75, alt: "Bride and bridesmaids" },
  { id: "photo-1465146344425-f00d5f5c8f07", aspectRatio: 1.5, alt: "Floral arrangement" },
  { id: "photo-1519671482749-fd09be7ccebf", aspectRatio: 1.33, alt: "Champagne toast" },
].map(({ id, aspectRatio, alt }) =>
  buildResponsivePhoto({ aspectRatio, alt, key: id, url: unsplashUrlFactory(id) }),
);

// 1×1 transparent GIF — reserves a slot's box before an image is inserted.
const TRANSPARENT_PIXEL =
  "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";

/**
 * A photo that occupies a slot's fixed geometry but carries no real image —
 * so the gallery renders its full structure before (or without) content.
 */
export function placeholderPhoto(slot: GallerySlot): GalleryPhoto {
  const width = 1024;
  const height = Math.max(1, Math.round(width / slot.aspectRatio));
  return {
    key: slot.id,
    alt: slot.alt ?? "",
    src: TRANSPARENT_PIXEL,
    width,
    height,
    empty: true,
    lightbox: { src: TRANSPARENT_PIXEL, width, height },
  };
}

/**
 * Slot resolver backed by Unsplash (fill-cropped to the slot ratio). Used by
 * the preview/lab so it works with zero Cloudinary config; production uses the
 * Cloudinary resolver instead. The fill value is an Unsplash photo id.
 */
export const unsplashSlotResolver: SlotResolver = (slot, key) =>
  key
    ? buildResponsivePhoto({
        aspectRatio: slot.aspectRatio,
        alt: slot.alt,
        key: slot.id,
        url: unsplashUrlFactory(key),
      })
    : placeholderPhoto(slot);
