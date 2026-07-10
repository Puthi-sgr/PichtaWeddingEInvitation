import { CloudinaryImage } from "@cloudinary/url-gen";
import { format, quality } from "@cloudinary/url-gen/actions/delivery";
import { fill, scale } from "@cloudinary/url-gen/actions/resize";
import { auto as formatAuto } from "@cloudinary/url-gen/qualifiers/format";
import { autoGravity } from "@cloudinary/url-gen/qualifiers/gravity";
import { auto as qualityAuto } from "@cloudinary/url-gen/qualifiers/quality";
import { cld } from "./cld";
import { CldAsset, getRegisteredCldAsset } from "./cldAssets";

type GetCldImageOptions = {
  width?: number;
  height?: number;
  autoFormat?: boolean;
  autoQuality?: boolean;
  /**
   * How the image is fit to width/height. "scale" (default) keeps the source
   * aspect ratio and only resizes. "fill" crops to an exact width×height box
   * with smart gravity — used by the gallery so a photo fills a fixed-ratio
   * slot without distortion.
   */
  crop?: "scale" | "fill";
};

type CldImageResult = {
  image: CloudinaryImage;
  url: string;
  alt: string;
};

export function getCldImage(asset: CldAsset, opts?: GetCldImageOptions): CldImageResult;
export function getCldImage(publicId: string, opts?: GetCldImageOptions): CldImageResult;
export function getCldImage(
  assetOrPublicId: CldAsset | string,
  opts: GetCldImageOptions = {},
): CldImageResult {
  const asset =
    typeof assetOrPublicId === "string"
      ? { publicId: assetOrPublicId, alt: "" }
      : assetOrPublicId;

  const image = cld.image(asset.publicId);

  if (opts.width != null || opts.height != null) {
    const resize = opts.crop === "fill" ? fill().gravity(autoGravity()) : scale();
    if (opts.width != null) resize.width(opts.width);
    if (opts.height != null) resize.height(opts.height);
    image.resize(resize);
  }

  if (opts.autoFormat !== false) {
    image.delivery(format(formatAuto()));
  }

  if (opts.autoQuality !== false) {
    image.delivery(quality(qualityAuto()));
  }

  return {
    image,
    url: image.toURL(),
    alt: asset.alt,
  };
}

export function getRegisteredCldImage(key: string, opts?: GetCldImageOptions) {
  const asset = getRegisteredCldAsset(key);

  if (!asset) {
    throw new Error(`Unknown Cloudinary asset key: ${key}`);
  }

  return getCldImage(asset, opts);
}
