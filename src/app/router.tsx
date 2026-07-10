import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import HomePage from "../features/wedding/pages/HomePage";

// Lab/showcase routes are lazy so their (sometimes heavy) dependencies —
// tsparticles, react-photo-album, the lightbox — load as their own async
// chunks only when visited, never in the invite's critical bundle.
const GalleryLabPage = lazy(() => import("../features/gallery/pages/GalleryLabPage"));
const ParticlesLabPage = lazy(() => import("../features/particles/pages/ParticlesLabPage"));
const AnimationLabPage = lazy(() => import("../features/animationLab/pages/AnimationLabPage"));
const ShowcasePage = lazy(() => import("../features/showcase/pages/ShowcasePage"));

export function AppRouter() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Suspense fallback={null}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/invite/:slug" element={<HomePage />} />
          <Route path="/gallery-lab" element={<GalleryLabPage />} />
          <Route path="/particles-lab" element={<ParticlesLabPage />} />
          <Route path="/animation-lab" element={<AnimationLabPage />} />
          <Route path="/showcase" element={<ShowcasePage />} />
          <Route path="*" element={<HomePage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
