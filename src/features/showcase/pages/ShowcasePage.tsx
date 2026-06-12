import { useRef } from "react";
import { Navbar } from "../../../shared/ui/organisms/Navbar";
import { HeroStagger } from "../components/HeroStagger";
import { VerticalParallax } from "../components/VerticalParallax";
import { SpinBox } from "../components/SpinBox";
import { ColorTransition } from "../components/ColorTransition";
import { useShowcaseAnimations } from "../hooks/useShowcaseAnimations";

export default function ShowcasePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  useShowcaseAnimations(containerRef);

  const titleText = "GSAP Showcase".split("");

  return (
    <div ref={containerRef} className="w-full overflow-x-hidden bg-stone-50 font-sans text-stone-800">
      <Navbar links={[{ label: "Back to Invite", to: "/" }]} />
      <HeroStagger titleText={titleText} />
      <VerticalParallax />
      <SpinBox />
      <ColorTransition />
    </div>
  );
}
