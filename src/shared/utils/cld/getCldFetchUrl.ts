import { cloudinaryCloudName } from "./cld";

type GetCldFetchOptions = {
  width?: number;
  height?: number;
  /** "scale" (default) resizes keeping ratio; "fill" crops to an exact
   *  width×height box with smart gravity (c_fill,g_auto). */
  crop?: "scale" | "fill";
  autoFormat?: boolean;
  autoQuality?: boolean;
};

export function getCldFetchUrl(src: string, opts: GetCldFetchOptions = {}) {
  if (!cloudinaryCloudName || !src) {
    return src;
  }

  if (!/^https?:\/\//i.test(src)) {
    return src;
  }

  if (src.includes("res.cloudinary.com")) {
    return src;
  }

  const transforms: string[] = [];

  if (opts.width != null || opts.height != null) {
    const crop = opts.crop ?? "scale";
    transforms.push(`c_${crop}`);
    if (crop === "fill") transforms.push("g_auto");
    if (opts.width != null) transforms.push(`w_${opts.width}`);
    if (opts.height != null) transforms.push(`h_${opts.height}`);
  }

  if (opts.autoFormat !== false) {
    transforms.push("f_auto");
  }

  if (opts.autoQuality !== false) {
    transforms.push("q_auto");
  }

  const transformString = transforms.length ? `${transforms.join(",")}/` : "";

  return `https://res.cloudinary.com/${cloudinaryCloudName}/image/fetch/${transformString}${encodeURIComponent(src)}`;
}
