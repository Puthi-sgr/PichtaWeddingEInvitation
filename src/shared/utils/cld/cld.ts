import { Cloudinary } from "@cloudinary/url-gen";

export const cloudinaryCloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME ?? "";

export const cld = new Cloudinary({
  cloud: {
    cloudName: cloudinaryCloudName,
  },
});
