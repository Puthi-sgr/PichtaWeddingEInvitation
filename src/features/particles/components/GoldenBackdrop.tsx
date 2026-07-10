import { CSSProperties } from "react";
import { ParticlesProvider } from "@tsparticles/react";
import { registerParticlesEngine } from "../lib/engine";
import { ParticleRecipe } from "../lib/recipes";
import { ThemedParticles } from "./ThemedParticles";

export type GoldenBackdropProps = {
  /** Which particle recipe drives the animated layer. Default "bokehGlow". */
  particleRecipe?: ParticleRecipe;
  /** Where the haze glow is anchored, as a CSS gradient position. Default: top-left corner. */
  hazePosition?: string;
  /** Peak opacity (0–1) of the haze at its center. Default 0.22. */
  hazeIntensity?: number;
  /** How far the glow spreads before fully fading, as a CSS length/percentage. Default "45%". */
  hazeRadius?: string;
  /** Haze center color as an "r, g, b" triplet (alpha comes from hazeIntensity). Default theme gold #c9a75d. */
  hazeColor?: string;
  /** Toggle the animated particle layer (haze stays either way). Default true. */
  showParticles?: boolean;
  /**
   * Positioning + stacking of the backdrop root. Default "absolute inset-0"
   * fills the nearest positioned ancestor. Pass "fixed inset-0 z-[5]" to lock
   * it to the viewport (frozen, like a border overlay).
   */
  positionClassName?: string;
  className?: string;
  style?: CSSProperties;
};

/**
 * Ambient hero/section backdrop: a static CSS "golden haze" glow plus an
 * animated particle layer (bokeh glow by default). Self-contained — brings
 * its own <ParticlesProvider> — so it can be React.lazy'd into any route
 * without pulling @tsparticles into that route's main bundle.
 *
 * The haze is pure CSS (safe under reduced-motion / low-memory); only the
 * particles are gated off in those cases by ThemedParticles.
 */
export function GoldenBackdrop({
  particleRecipe = "bokehGlow",
  hazePosition = "top left",
  hazeIntensity = 0.22,
  hazeRadius = "45%",
  hazeColor = "201, 167, 93",
  showParticles = true,
  positionClassName = "absolute inset-0",
  className,
  style,
}: GoldenBackdropProps) {
  const haze = `radial-gradient(circle at ${hazePosition}, rgba(${hazeColor}, ${hazeIntensity}), transparent ${hazeRadius})`;

  return (
    <div
      aria-hidden="true"
      className={`pointer-events-none overflow-hidden ${positionClassName} ${className ?? ""}`}
      style={style}
    >
      <div className="absolute inset-0" style={{ backgroundImage: haze }} />
      {showParticles && (
        <ParticlesProvider init={registerParticlesEngine}>
          <ThemedParticles recipe={particleRecipe} className="absolute inset-0" />
        </ParticlesProvider>
      )}
    </div>
  );
}

export default GoldenBackdrop;
