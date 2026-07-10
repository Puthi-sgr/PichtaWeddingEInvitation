export type WeddingScrollVisualMode = "initialCover" | "forwardScrub" | "reverseCover" | "posterFallback";

export type Guest = {
  slug: string;
  displayName: string;
  seats?: number;
};
