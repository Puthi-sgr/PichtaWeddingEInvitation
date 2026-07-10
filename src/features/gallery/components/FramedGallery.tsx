import { ImageIcon } from "lucide-react";
import { CSSProperties, useState } from "react";
import { MasonryPhotoAlbum } from "react-photo-album";
import "react-photo-album/masonry.css";
import Lightbox from "yet-another-react-lightbox";
import Counter from "yet-another-react-lightbox/plugins/counter";
import Zoom from "yet-another-react-lightbox/plugins/zoom";
import "yet-another-react-lightbox/styles.css";
import "yet-another-react-lightbox/plugins/counter.css";
import { useFramedGallery, UseFramedGalleryOptions } from "../hooks/useFramedGallery";
import { GalleryPhoto } from "../lib/photos";
import { GalleryFill, GalleryTemplate } from "../lib/template";

export interface FramedGalleryProps extends UseFramedGalleryOptions {
  template: GalleryTemplate;
  fill: GalleryFill;
  /** Tap-to-open fullscreen viewer (swipe + pinch-zoom). Default true. */
  enableLightbox?: boolean;
  className?: string;
  style?: CSSProperties;
}

const srcSetAttr = (images?: readonly { src: string; width: number }[]) =>
  images?.map((image) => `${image.src} ${image.width}w`).join(", ");

function SlotPlaceholder() {
  return (
    <div className="framed-gallery-placeholder">
      <ImageIcon className="h-6 w-6" aria-hidden="true" />
    </div>
  );
}

/** A full-width justified row of 1–2 photos: widths split proportionally to
 *  aspect ratio so every tile is the same height and the row is edge-to-edge. */
function CapRow({
  photos,
  spacing,
  onOpen,
}: {
  photos: GalleryPhoto[];
  spacing: number;
  onOpen: (photo: GalleryPhoto) => void;
}) {
  if (photos.length === 0) return null;
  const sizeHint = `${Math.round(100 / photos.length)}vw`;

  return (
    <div className="framed-gallery-cap" style={{ display: "flex", gap: spacing }}>
      {photos.map((photo) => (
        <div
          key={photo.key}
          style={{
            flex: `${photo.width / photo.height} 1 0`,
            aspectRatio: `${photo.width} / ${photo.height}`,
            minWidth: 0,
          }}
        >
          {photo.empty ? (
            <SlotPlaceholder />
          ) : (
            <img
              src={photo.src}
              srcSet={srcSetAttr(photo.srcSet)}
              sizes={sizeHint}
              alt={photo.alt ?? ""}
              loading="lazy"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
              onClick={() => onOpen(photo)}
            />
          )}
        </div>
      ))}
    </div>
  );
}

/**
 * "Framed" slot-based gallery: a justified full-width cap at the top and bottom
 * (straight edges) with a fixed-geometry masonry grid between them. The layout
 * is driven by the template's slot ratios, so filling/clearing images never
 * reflows the structure. All photos (caps + masonry) share one lightbox, so a
 * guest swipes through the whole set in order.
 *
 * Self-contained (owns lightbox state + CSS) and safe to `React.lazy` into any
 * route to keep react-photo-album / the lightbox out of the critical bundle.
 */
export function FramedGallery({
  template,
  fill,
  resolve,
  columns,
  spacing,
  radius,
  padding,
  enableLightbox = true,
  className,
  style,
}: FramedGalleryProps) {
  const { topCap, masonry, bottomCap, slides, slideIndexBySlot, config } = useFramedGallery(
    template,
    fill,
    { resolve, columns, spacing, radius, padding },
  );
  const [index, setIndex] = useState(-1);

  const open = (photo: GalleryPhoto) => {
    if (!enableLightbox || photo.empty || !photo.key) return;
    const slideIndex = slideIndexBySlot.get(photo.key);
    if (slideIndex != null) setIndex(slideIndex);
  };

  return (
    <div
      className={`framed-gallery ${className ?? ""}`}
      style={{
        ["--mosaic-radius" as string]: `${config.radius}px`,
        display: "flex",
        flexDirection: "column",
        gap: config.spacing,
        ...style,
      }}
    >
      <CapRow photos={topCap} spacing={config.spacing} onOpen={open} />

      <MasonryPhotoAlbum
        photos={masonry}
        columns={config.columns}
        spacing={config.spacing}
        padding={config.padding}
        sizes={{
          size: "calc(50vw - 1rem)",
          sizes: [{ viewport: "(min-width: 1024px)", size: "512px" }],
        }}
        onClick={({ index: i }) => open(masonry[i])}
        render={{
          image: (_props, { photo }) => (photo.empty ? <SlotPlaceholder /> : undefined),
        }}
      />

      <CapRow photos={bottomCap} spacing={config.spacing} onOpen={open} />

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

export default FramedGallery;
