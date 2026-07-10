export type MosaicLayout = "masonry" | "rows" | "columns";

export type MosaicPresetName =
  | "elegantMasonry"
  | "justifiedRows"
  | "uniformColumns"
  | "compactMasonry";

/**
 * A fully-resolved mosaic configuration. Every field is always present so the
 * component never juggles undefined; fields irrelevant to a given `layout`
 * (e.g. `targetRowHeight` for masonry) are simply ignored. `columns` /
 * `targetRowHeight` are treated as the desktop maximum — the component scales
 * them down responsively on smaller viewports.
 */
export interface MosaicPreset {
  layout: MosaicLayout;
  /** Desktop column count (masonry/columns). Scaled down on smaller screens. */
  columns: number;
  /** Desktop target row height in px (rows). Scaled down on smaller screens. */
  targetRowHeight: number;
  /** Gap between tiles in px. */
  spacing: number;
  /** Padding inside each tile in px. */
  padding: number;
  /** Corner radius on tiles in px. */
  radius: number;
}

export const mosaicPresets: Record<MosaicPresetName, MosaicPreset> = {
  // Pinterest-style uneven mosaic — the default "wall of memories" look.
  elegantMasonry: {
    layout: "masonry",
    columns: 3,
    targetRowHeight: 220,
    spacing: 10,
    padding: 0,
    radius: 8,
  },
  // Google-Photos-style justified rows: every row is flush edge-to-edge.
  justifiedRows: {
    layout: "rows",
    columns: 3,
    targetRowHeight: 230,
    spacing: 10,
    padding: 0,
    radius: 8,
  },
  // Strict equal-width columns — tidiest, most formal grid.
  uniformColumns: {
    layout: "columns",
    columns: 3,
    targetRowHeight: 220,
    spacing: 10,
    padding: 0,
    radius: 8,
  },
  // Denser masonry with more, tighter columns — good for lots of photos.
  compactMasonry: {
    layout: "masonry",
    columns: 4,
    targetRowHeight: 200,
    spacing: 6,
    padding: 0,
    radius: 6,
  },
};

export const presetMeta: Record<MosaicPresetName, { label: string; tone: string }> = {
  elegantMasonry: {
    label: "Elegant Masonry",
    tone: "Uneven Pinterest-style mosaic. The default wall-of-memories look.",
  },
  justifiedRows: {
    label: "Justified Rows",
    tone: "Google-Photos-style rows, flush edge-to-edge on every line.",
  },
  uniformColumns: {
    label: "Uniform Columns",
    tone: "Strict equal-width columns — the tidiest, most formal grid.",
  },
  compactMasonry: {
    label: "Compact Masonry",
    tone: "Denser masonry with tighter columns — good for many photos.",
  },
};
