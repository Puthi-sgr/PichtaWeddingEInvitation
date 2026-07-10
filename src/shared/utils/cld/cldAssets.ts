export type CldAsset = {
  publicId: string;
  alt: string;
};

export const cldAssets = {
  // Add wedding assets here as they are uploaded to Cloudinary.
  // Example:
  // "hero.main": { publicId: "wedding/hero-main", alt: "Wedding couple" },
  "wedding.hero-main": { publicId: "Shockwave_vshxyk", alt: "Wedding couple" },
  "wedding.reverse-cover": { publicId: "FinalizeFreezeFrameTransparentCenterStrong_jouf6c", alt: "" },
  "wedding.reverse-scroll-cover": { publicId: "OptimizedBackground_u9wgbc", alt: "" },
  // Framed-gallery slots — point these at real Cloudinary publicIds once the
  // photos are uploaded, then map slot ids to these keys in a GalleryFill.
  // "wedding.gallery-hero": { publicId: "REPLACE_ME", alt: "Opening photo" },
  // "wedding.gallery-01": { publicId: "REPLACE_ME", alt: "" },
  // "wedding.gallery-closing": { publicId: "REPLACE_ME", alt: "Closing photo" },
} satisfies Record<string, CldAsset>;

export type CldAssetKey = keyof typeof cldAssets;

export function getRegisteredCldAsset(key: string): CldAsset | undefined {
  return cldAssets[key as CldAssetKey];
}
