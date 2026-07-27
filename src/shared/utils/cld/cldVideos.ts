export type CldVideoAsset = {
  publicId: string;
  title?: string;
  fallbackUrl?: string;
  posterPublicId?: string;
};

export const cldVideos = {
  // Add wedding videos here as they are uploaded to Cloudinary.
  // Example:
  // "hero.main": {
  //   publicId: "wedding/hero-main",
  //   title: "Wedding hero video",
  //   fallbackUrl: "https://example.com/fallback-video.mp4",
  // },
  "wedding.hero-main": {
    publicId: "StillMain_webLoop_900p30_crf27_g30_ia18wt",
    title: "Wedding background video",
    fallbackUrl:
      "https://assets.mixkit.co/videos/preview/mixkit-romantic-couple-on-the-beach-during-a-beautiful-sunset-5231-large.mp4",
  },
  "wedding.entry": {
    publicId: "entry_720_crf22_llxu96",
    title: "Wedding entry video",
  },
  "wedding.dust-overlay": {
    publicId: "BlackForegroundDustSlow3xSmooth_zm4hh4",
    title: "Wedding foreground dust overlay",
  },
} satisfies Record<string, CldVideoAsset>;

export type CldVideoKey = keyof typeof cldVideos;

export function getRegisteredCldVideoAsset(key: string): CldVideoAsset | undefined {
  return cldVideos[key as CldVideoKey];
}
