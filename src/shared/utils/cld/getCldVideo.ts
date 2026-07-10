import { cloudinaryCloudName } from "./cld";
import { CldVideoAsset, getRegisteredCldVideoAsset } from "./cldVideos";

type CldVideoCrop = "fill" | "fit" | "limit" | "pad" | "scale" | "crop";
type CldVideoFormat = "auto" | "mp4" | "webm" | "mov";
type CldVideoQuality = "auto" | number;

type GetCldVideoOptions = {
  width?: number;
  height?: number;
  crop?: CldVideoCrop;
  gravity?: "auto" | "center" | "north" | "south" | "east" | "west";
  format?: CldVideoFormat;
  quality?: CldVideoQuality;
  startOffset?: number;
  endOffset?: number;
  duration?: number;
  speed?: number;
  volume?: number | "mute";
  posterOffset?: number;
};

type CldVideoResult = {
  url: string;
  type: string;
  title?: string;
  posterUrl?: string;
  sourceProps: {
    src: string;
    type: string;
  };
};

function cleanPublicId(publicId: string) {
  return publicId.replace(/^\/+/, "");
}

function getVideoMimeType(format: CldVideoFormat = "mp4") {
  if (format === "webm") return "video/webm";
  if (format === "mov") return "video/quicktime";
  return "video/mp4";
}

function buildVideoTransform(opts: GetCldVideoOptions) {
  const transforms: string[] = [];

  if (opts.width != null || opts.height != null || opts.crop || opts.gravity) {
    transforms.push(`c_${opts.crop ?? "fill"}`);
    if (opts.width != null) transforms.push(`w_${opts.width}`);
    if (opts.height != null) transforms.push(`h_${opts.height}`);
    if (opts.gravity) transforms.push(`g_${opts.gravity === "auto" ? "center" : opts.gravity}`);
  }

  if (opts.startOffset != null) transforms.push(`so_${opts.startOffset}`);
  if (opts.endOffset != null) transforms.push(`eo_${opts.endOffset}`);
  if (opts.duration != null) transforms.push(`du_${opts.duration}`);
  if (opts.speed != null) transforms.push(`e_accelerate:${opts.speed}`);
  if (opts.volume != null) transforms.push(opts.volume === "mute" ? "e_volume:mute" : `e_volume:${opts.volume}`);

  transforms.push(`q_${opts.quality ?? "auto"}`);
  transforms.push(`f_${opts.format ?? "mp4"}`);

  return transforms.join(",");
}

function buildCloudinaryVideoUrl(publicId: string, opts: GetCldVideoOptions) {
  const transform = buildVideoTransform(opts);
  return `https://res.cloudinary.com/${cloudinaryCloudName}/video/upload/${transform}/${cleanPublicId(publicId)}`;
}

function buildPosterUrl(asset: CldVideoAsset, opts: GetCldVideoOptions) {
  const posterPublicId = asset.posterPublicId ?? asset.publicId;
  const transforms = [
    opts.posterOffset != null ? `so_${opts.posterOffset}` : undefined,
    opts.width != null || opts.height != null ? `c_${opts.crop ?? "fill"}` : undefined,
    opts.width != null ? `w_${opts.width}` : undefined,
    opts.height != null ? `h_${opts.height}` : undefined,
    "q_auto",
    "f_jpg",
  ].filter(Boolean);

  return `https://res.cloudinary.com/${cloudinaryCloudName}/video/upload/${transforms.join(",")}/${cleanPublicId(
    posterPublicId,
  )}.jpg`;
}

export function getCldVideo(asset: CldVideoAsset, opts?: GetCldVideoOptions): CldVideoResult;
export function getCldVideo(publicId: string, opts?: GetCldVideoOptions): CldVideoResult;
export function getCldVideo(
  assetOrPublicId: CldVideoAsset | string,
  opts: GetCldVideoOptions = {},
): CldVideoResult {
  const asset =
    typeof assetOrPublicId === "string"
      ? { publicId: assetOrPublicId }
      : assetOrPublicId;

  const type = getVideoMimeType(opts.format);
  const url = cloudinaryCloudName
    ? buildCloudinaryVideoUrl(asset.publicId, opts)
    : asset.fallbackUrl ?? "";

  return {
    url,
    type,
    title: asset.title,
    posterUrl: cloudinaryCloudName ? buildPosterUrl(asset, opts) : undefined,
    sourceProps: {
      src: url,
      type,
    },
  };
}

export function getRegisteredCldVideo(key: string, opts?: GetCldVideoOptions) {
  const asset = getRegisteredCldVideoAsset(key);

  if (!asset) {
    throw new Error(`Unknown Cloudinary video key: ${key}`);
  }

  return getCldVideo(asset, opts);
}
