import { useRef } from "react";
import { Navbar } from "../../../shared/ui/organisms/Navbar";
import { Footer } from "../../../shared/ui/organisms/Footer";
import { HeroSection } from "../components/HeroSection";
import { CoupleSection } from "../components/CoupleSection";
import { QuoteSection } from "../components/QuoteSection";
import { DetailsSection } from "../components/DetailsSection";
import { RsvpSection } from "../components/RsvpSection";
import { useWeddingAnimations } from "../hooks/useWeddingAnimations";

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useWeddingAnimations(containerRef);

  return (
    <div ref={containerRef} className="w-full overflow-x-hidden bg-stone-50 font-sans text-stone-800">
      <Navbar links={[{ label: "Showcase", to: "/showcase" }]} />
      <HeroSection />
      <CoupleSection />
      <QuoteSection />
      <DetailsSection />
      <RsvpSection />
      <Footer text="Emma & James &copy; 2026" />
    </div>
  );
}
