import { Suspense, lazy, useCallback, useRef, useState } from "react";
import { EventAgenda } from "../components/EventAgenda";
import { InvitationBody } from "../components/InvitationBody";
import { MainScrollVideoBackground } from "../components/MainScrollVideoBackground";
import { PhotoGallery } from "../components/PhotoGallery";
import { VenueMap } from "../components/VenueMap";
import { WeddingFooter } from "../components/WeddingFooter";
import { DebugSection } from "../components/DebugSection";
import { ScrollVideoDebugPanel } from "../components/ScrollVideoDebugPanel";
import { EntryVideoGate } from "../components/EntryVideoGate";
import { WeddingFrameOverlay } from "../components/WeddingFrameOverlay";
import { useWeddingAnimations } from "../hooks/useWeddingAnimations";
import { useWeddingExperienceOrchestrator } from "../hooks/useWeddingExperienceOrchestrator";
import { useCriticalAssetPreload } from "../hooks/useCriticalAssetPreload";
import { useCurrentGuest } from "../hooks/useCurrentGuest";
import { WeddingScrollVisualMode } from "../types";

// Lazy so @tsparticles loads as its own async chunk after first paint,
// keeping it out of the critical invite-page bundle. Rendered viewport-fixed
// (z-[5]) so the haze + fireflies stay frozen on screen like the frame border.
const GoldenBackdrop = lazy(() => import("../../particles/components/GoldenBackdrop"));

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scrollVisualMode, setScrollVisualMode] = useState<WeddingScrollVisualMode>("initialCover");
  const [hasEntryBuffered, setHasEntryBuffered] = useState(false);
  const guest = useCurrentGuest();
  const experience = useWeddingExperienceOrchestrator({
    hasEntryVideo: true,
    persistEntryDismissal: false,
  });
  const handleVisualModeChange = useCallback((mode: WeddingScrollVisualMode) => {
    setScrollVisualMode((currentMode) => (currentMode === mode ? currentMode : mode));
  }, []);
  const handleEntryBuffered = useCallback(() => {
    setHasEntryBuffered(true);
  }, []);

  useWeddingAnimations(containerRef, experience.enableSectionAnimations);
  useCriticalAssetPreload({ enabled: hasEntryBuffered || !experience.showEntryVideo });

  return (
    <div ref={containerRef} className="relative w-full overflow-x-hidden bg-stone-950 font-sans text-stone-800">
      {experience.showEntryVideo && (
        <EntryVideoGate
          isExiting={experience.isEntryExiting}
          exitDurationMs={experience.entryExitDurationMs}
          onComplete={experience.completeEntry}
          onFallback={experience.skipEntry}
          onBuffered={handleEntryBuffered}
        />
      )}

      {experience.showInvitation && (
        <>
          <MainScrollVideoBackground
            containerRef={containerRef}
            initialReverseCoverVisible
            onVisualModeChange={handleVisualModeChange}
          />
          <Suspense fallback={null}>
            <GoldenBackdrop
              particleRecipe="gildedDust"
              hazePosition="top left"
              positionClassName="fixed inset-0 z-[5]"
            />
          </Suspense>
          <ScrollVideoDebugPanel />
          <div
            className="invitation-foreground wedding-copy-theme relative z-10 opacity-0"
            data-scroll-visual-mode={scrollVisualMode}
          >
            <div className="relative z-10">
              <DebugSection name="សេចក្តីអញ្ជើញ">
                <InvitationBody guest={guest} />
              </DebugSection>
              <DebugSection name="របៀបវារៈ">
                <EventAgenda />
              </DebugSection>
              <DebugSection name="ទីតាំង">
                <VenueMap />
              </DebugSection>
              <DebugSection name="រូបភាព">
                <PhotoGallery />
              </DebugSection>
              <DebugSection name="អំណរគុណ">
                <WeddingFooter />
              </DebugSection>
            </div>
          </div>
          <WeddingFrameOverlay />
        </>
      )}
    </div>
  );
}
