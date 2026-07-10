import { getCldFetchUrl, getCldImage } from "../../../shared/utils/cld";
import { getRegisteredCldAsset } from "../../../shared/utils/cld/cldAssets";
import { buildResponsivePhoto, placeholderPhoto, type UrlFactory } from "./photos";
import type { SlotResolver } from "./template";

/**
 * Builds a {@link UrlFactory} for a Cloudinary image that **fill-crops** to the
 * requested width×height (with smart gravity), so it fills a fixed-ratio slot
 * without distortion. Accepts either a registered asset key (see
 * `cldAssets.ts`) or a raw Cloudinary publicId.
 */
export function cldCropUrlFactory(keyOrPublicId: string): UrlFactory {
  const asset = getRegisteredCldAsset(keyOrPublicId);
  const publicId = asset?.publicId ?? keyOrPublicId;
  return (width, height) => getCldImage(publicId, { width, height, crop: "fill" }).url;
}

/**
 * Production slot resolver: turns a slot + its assigned Cloudinary key into a
 * responsive, fill-cropped {@link GalleryPhoto}; renders a placeholder when the
 * slot is unfilled. Insert an image simply by pointing the slot's id at a key
 * in your {@link GalleryFill}.
 */
export const cloudinarySlotResolver: SlotResolver = (slot, key) => {
  if (!key) return placeholderPhoto(slot);

  const asset = getRegisteredCldAsset(key);
  return buildResponsivePhoto({
    aspectRatio: slot.aspectRatio,
    alt: slot.alt ?? asset?.alt ?? "",
    key: slot.id,
    url: cldCropUrlFactory(key),
  });
};

/**
 * Builds a {@link UrlFactory} that delivers a **remote image URL** through
 * Cloudinary fetch, fill-cropped to the requested width×height. Use this when
 * the gallery is fed raw remote URLs (e.g. the invite's sample photos) rather
 * than uploaded Cloudinary publicIds. Falls back to the raw URL when Cloudinary
 * isn't configured.
 */
export function cldFetchCropUrlFactory(remoteUrl: string): UrlFactory {
  return (width, height) => getCldFetchUrl(remoteUrl, { width, height, crop: "fill" });
}

/**
 * Slot resolver backed by remote image URLs (delivered via Cloudinary fetch,
 * fill-cropped to the slot ratio). Here the {@link GalleryFill} value is the
 * image URL itself. Used by the invite's `PhotoGallery`, which stores plain
 * remote URLs; swap to {@link cloudinarySlotResolver} once photos are uploaded
 * to Cloudinary as publicIds.
 */
export const remoteSlotResolver: SlotResolver = (slot, url) => {
  if (!url) return placeholderPhoto(slot);
  return buildResponsivePhoto({
    aspectRatio: slot.aspectRatio,
    alt: slot.alt ?? "",
    key: slot.id,
    url: cldFetchCropUrlFactory(url),
  });
};
