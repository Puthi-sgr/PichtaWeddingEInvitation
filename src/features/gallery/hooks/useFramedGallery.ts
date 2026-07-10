import { useMemo } from "react";
import { cloudinarySlotResolver } from "../lib/cldAdapter";
import { GalleryPhoto } from "../lib/photos";
import { GalleryFill, GalleryTemplate, SlotResolver } from "../lib/template";

export interface UseFramedGalleryOptions {
  /** How slot + key become a photo. Default: Cloudinary. */
  resolve?: SlotResolver;
  /** Per-field overrides on top of the template's tuning. */
  columns?: number;
  spacing?: number;
  radius?: number;
  padding?: number;
}

export interface LightboxSlide {
  src: string;
  width: number;
  height: number;
  alt?: string;
  srcSet?: { src: string; width: number; height: number }[];
}

export interface FramedGalleryModel {
  topCap: GalleryPhoto[];
  masonry: GalleryPhoto[];
  bottomCap: GalleryPhoto[];
  /** Filled photos only, in visual order — the lightbox slide list. */
  slides: LightboxSlide[];
  /** slot id → index into `slides` (absent for empty slots). */
  slideIndexBySlot: Map<string, number>;
  config: { columns: number; spacing: number; radius: number; padding: number };
}

const toSlide = (photo: GalleryPhoto): LightboxSlide => ({
  src: photo.lightbox.src,
  width: photo.lightbox.width,
  height: photo.lightbox.height,
  alt: photo.alt,
  srcSet: photo.lightbox.srcSet ? [...photo.lightbox.srcSet] : undefined,
});

/**
 * Resolves a {@link GalleryTemplate} + {@link GalleryFill} into render-ready
 * data. The layout geometry comes entirely from the template's fixed slot
 * ratios, so inserting/removing a key changes only that tile's image — the
 * masonry structure is invariant (no reflow). Memoized on `[template, fill,
 * resolver, overrides]`.
 */
export function useFramedGallery(
  template: GalleryTemplate,
  fill: GalleryFill,
  options: UseFramedGalleryOptions = {},
): FramedGalleryModel {
  const { resolve = cloudinarySlotResolver, columns, spacing, radius, padding } = options;

  return useMemo(() => {
    const topCap = template.topCap.map((slot) => resolve(slot, fill[slot.id]));
    const masonry = template.masonry.map((slot) => resolve(slot, fill[slot.id]));
    const bottomCap = template.bottomCap.map((slot) => resolve(slot, fill[slot.id]));

    const ordered = [...topCap, ...masonry, ...bottomCap];
    const slides: LightboxSlide[] = [];
    const slideIndexBySlot = new Map<string, number>();
    for (const photo of ordered) {
      if (photo.empty || !photo.key) continue;
      slideIndexBySlot.set(photo.key, slides.length);
      slides.push(toSlide(photo));
    }

    return {
      topCap,
      masonry,
      bottomCap,
      slides,
      slideIndexBySlot,
      config: {
        columns: columns ?? template.columns,
        spacing: spacing ?? template.spacing,
        radius: radius ?? template.radius,
        padding: padding ?? template.padding,
      },
    };
  }, [template, fill, resolve, columns, spacing, radius, padding]);
}
