import { Suspense, lazy } from "react";
import { framedTemplate, type GalleryFill } from "../../gallery/lib/template";
import { weddingContent } from "../content/weddingContent";

// Lazy so react-photo-album + the lightbox load as their own async chunk,
// never in the invite's critical bundle (same pattern as GoldenBackdrop).
const FramedGallery = lazy(() => import("../../gallery/components/FramedGallery"));

// slotId → Cloudinary publicId, straight from content. Insert real photos by
// filling `gallery.slots` in weddingContent.ts; empty slots stay as placeholder
// boxes and the fixed layout never reflows. Resolved by the default
// `cloudinarySlotResolver`. See .agents/photo-gallery-engine.md.
const galleryFill: GalleryFill = weddingContent.gallery.slots;

export function PhotoGallery() {
  const gallery = weddingContent.gallery;

  return (
    <section
      data-wedding-section="រូបភាព"
      className="gallery-section wedding-section wedding-text-primary mx-auto min-h-[100svh] w-full max-w-6xl px-5 py-28 text-center md:px-8 md:py-36"
    >
      <div className="mx-auto max-w-3xl">
        <div className="text-radial-backdrop text-radial-backdrop--block mb-5">
          <h2 className="gallery-heading wedding-animated text-4xl leading-[1.75] opacity-0 md:text-6xl">
            {gallery.title}
          </h2>
        </div>
        <div className="text-radial-backdrop text-radial-backdrop--block">
          <p className="gallery-subtitle wedding-animated wedding-text-secondary text-2xl leading-[1.8] opacity-0 md:text-3xl">
            {gallery.subtitle}
          </p>
        </div>
      </div>

      <div className="gallery-frame wedding-animated opacity-0">
        <Suspense fallback={null}>
          <FramedGallery
            template={framedTemplate}
            fill={galleryFill}
            className="mx-auto mt-12 max-w-2xl"
          />
        </Suspense>
      </div>

      <div className="text-radial-backdrop text-radial-backdrop--block mt-10">
        <p className="gallery-more wedding-animated wedding-text-kicker text-xl leading-[1.8] opacity-0 md:text-2xl">
          {gallery.moreLabel}
        </p>
      </div>
    </section>
  );
}
