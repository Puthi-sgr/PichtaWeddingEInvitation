/// <reference types="vite/client" />

import type { Guest } from "./features/wedding/types";

interface ImportMetaEnv {
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

declare global {
  interface Window {
    __GUEST__?: Guest;
  }
}
