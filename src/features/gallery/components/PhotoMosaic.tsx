import { CSSProperties, useMemo, useState } from "react";
import {
  ColumnsPhotoAlbum,
  MasonryPhotoAlbum,
  RowsPhotoAlbum,
  type ResponsiveParameter,
} from "react-photo-album";
import "react-photo-album/masonry.css";
import "react-photo-album/rows.css";
import "react-photo-album/columns.css";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import { GalleryPhoto, samplePhotos } from "../lib/photos";
import { MosaicLayout, MosaicPresetName, mosaicPresets } from "../lib/presets";

export interface PhotoMosaicProps {
  /** Photos to show. Defaults to the built-in sample set. */
  photos?: readonly GalleryPhoto[];
  /** Named starting config. Default "elegantMasonry". */
  preset?: MosaicPresetName;
  /** Per-field overrides applied on top of the preset (orchestration seam). */
  layout?: MosaicLayout;
  columns?: number;
  spacing?: number;
  padding?: number;
  targetRowHeight?: number;
  radius?: number;
  /** Tap-to-open fullscreen viewer with swipe + pinch-zoom. Default true. */
  enableLightbox?: boolean;
  className?: string;
  style?: CSSProperties;
}

// Desktop count/height are treated as a max and scaled down on smaller
// viewports — the core mobile optimization for the *layout* (fewer, larger
// tiles on a phone instead of a cramped 4-up grid).
const responsiveColumns =
  (max: number): ResponsiveParameter =>
  (containerWidth) =>
    containerWidth < 480 ? Math.min(2, max) : containerWidth < 900 ? Math.min(3, max) : max;

const responsiveRowHeight =
  (base: number): ResponsiveParameter =>
  (containerWidth) =>
    containerWidth < 480
      ? Math.round(base * 0.62)
      : containerWidth < 900
        ? Math.round(base * 0.82)
        : base;

/**
 * Drop-in photo mosaic with a tap-to-open fullscreen viewer (swipe between
 * photos, pinch/double-tap zoom, swipe-down to dismiss). Self-contained: owns
 * its lightbox state and brings its own CSS, so it can be `React.lazy`'d into
 * any route without pulling react-photo-album / the lightbox into that route's
 * critical bundle.
 *
 * Mobile-optimized by construction: grid tiles use a small srcSet, the
 * lightbox fetches larger variants only for the opened slide, and column count
 * scales down on narrow viewports.
 */
export function PhotoMosaic({
  photos = samplePhotos,
  preset = "elegantMasonry",
  layout,
  columns,
  spacing,
  padding,
  targetRowHeight,
  radius,
  enableLightbox = true,
  className,
  style,
}: PhotoMosaicProps) {
  const [index, setIndex] = useState(-1);

  const config = useMemo(() => {
    const base = mosaicPresets[preset];
    return {
      layout: layout ?? base.layout,
      columns: columns ?? base.columns,
      spacing: spacing ?? base.spacing,
      padding: padding ?? base.padding,
      targetRowHeight: targetRowHeight ?? base.targetRowHeight,
      radius: radius ?? base.radius,
    };
  }, [preset, layout, columns, spacing, padding, targetRowHeight, radius]);

  const slides = useMemo(
    () =>
      photos.map((photo) => ({
        src: photo.lightbox.src,
        width: photo.lightbox.width,
        height: photo.lightbox.height,
        alt: photo.alt,
        srcSet: photo.lightbox.srcSet as { src: string; width: number; height: number }[] | undefined,
      })),
    [photos],
  );

  const common = {
    photos: photos as GalleryPhoto[],
    spacing: config.spacing,
    padding: config.padding,
    // Tells the browser roughly how wide a tile renders, so it can pick the
    // right srcSet entry instead of always grabbing the largest.
    sizes: {
      size: "calc(100vw - 2rem)",
      sizes: [{ viewport: "(min-width: 1024px)", size: "1024px" }],
    },
    onClick: enableLightbox ? ({ index: i }: { index: number }) => setIndex(i) : undefined,
  };

  const grid =
    config.layout === "rows" ? (
      <RowsPhotoAlbum {...common} targetRowHeight={responsiveRowHeight(config.targetRowHeight)} />
    ) : config.layout === "columns" ? (
      <ColumnsPhotoAlbum {...common} columns={responsiveColumns(config.columns)} />
    ) : (
      <MasonryPhotoAlbum {...common} columns={responsiveColumns(config.columns)} />
    );

  return (
    <div
      className={`photo-mosaic-grid ${className ?? ""}`}
      style={{ ["--mosaic-radius" as string]: `${config.radius}px`, ...style }}
    >
      {grid}

      {enableLightbox && (
        <Lightbox
          open={index >= 0}
          index={index}
          close={() => setIndex(-1)}
          slides={slides}
          plugins={[Zoom, Counter]}
          controller={{ closeOnBackdropClick: true }}
          zoom={{ maxZoomPixelRatio: 3, doubleTapDelay: 300 }}
          carousel={{ finite: false, preload: 2 }}
          styles={{ container: { backgroundColor: "rgba(20, 24, 18, 0.94)" } }}
        />
      )}
    </div>
  );
}

export default PhotoMosaic;
