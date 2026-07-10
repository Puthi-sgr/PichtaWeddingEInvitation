import type { GalleryPhoto } from "./photos";

export type SlotRole = "cap" | "masonry";

/**
 * One position in the gallery. The slot owns the **geometry** (`aspectRatio`);
 * content is supplied separately via a {@link GalleryFill}. Because the ratio
 * is fixed here, the computed masonry layout never changes when the image that
 * fills the slot changes — that's what makes the gallery "hold its structure".
 */
export interface GallerySlot {
  /** Stable id — the key you insert images against in a {@link GalleryFill}. */
  id: string;
  role: SlotRole;
  /** width ÷ height. Drives the layout; the image is cropped to match. */
  aspectRatio: number;
  /** Default alt text for the slot (an image's own alt can override). */
  alt?: string;
}

/**
 * The fixed structure of a framed gallery: a full-width justified **cap** row
 * at each end (1 slot → spans full width; 2 slots → split proportionally at
 * equal height) with a masonry grid between them.
 */
export interface GalleryTemplate {
  topCap: GallerySlot[];
  masonry: GallerySlot[];
  bottomCap: GallerySlot[];
  /** Masonry columns (kept equal on mobile + desktop). */
  columns: number;
  /** Gap between tiles/rows in px. */
  spacing: number;
  /** Corner radius in px. */
  radius: number;
  /** Padding inside each masonry tile in px. */
  padding: number;
}

/** slotId → image key (registered Cloudinary key, raw publicId, or resolver-specific id). */
export type GalleryFill = Record<string, string | undefined>;

/** Turns a slot + its assigned key into a fully responsive photo (or a placeholder when unfilled). */
export type SlotResolver = (slot: GallerySlot, key?: string) => GalleryPhoto;

const slot = (id: string, role: SlotRole, aspectRatio: number, alt?: string): GallerySlot => ({
  id,
  role,
  aspectRatio,
  alt,
});

/**
 * Default 2-column framed template. The masonry ratios are deliberately chosen
 * so the two columns pack to **equal height** (each column = one portrait +
 * one square + one landscape), giving a clean straight seam above the bottom
 * cap — no ragged masonry edge fighting the justified ends.
 *
 * Locked tuning: 2 columns / spacing 10 / radius 8 (mobile-optimal, same on
 * desktop per design).
 */
export const framedTemplate: GalleryTemplate = {
  topCap: [slot("top", "cap", 2.4, "Opening photo")],
  masonry: [
    slot("m1", "masonry", 0.75),
    slot("m2", "masonry", 0.75),
    slot("m3", "masonry", 1.0),
    slot("m4", "masonry", 1.0),
    slot("m5", "masonry", 1.5),
    slot("m6", "masonry", 1.5),
  ],
  bottomCap: [slot("bottom", "cap", 2.4, "Closing photo")],
  columns: 2,
  spacing: 10,
  radius: 8,
  padding: 0,
};

/** Every slot id in a template, in visual order (top cap → masonry → bottom cap). */
export function templateSlots(template: GalleryTemplate): GallerySlot[] {
  return [...template.topCap, ...template.masonry, ...template.bottomCap];
}
