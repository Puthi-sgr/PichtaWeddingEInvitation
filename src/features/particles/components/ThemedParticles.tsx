import { Container } from "@tsparticles/engine";
import { Particles } from "@tsparticles/react";
import { CSSProperties, useId } from "react";
import { useThemedParticles, UseThemedParticlesOptions } from "../hooks/useThemedParticles";
import { ParticleRecipe } from "../lib/recipes";

export type ThemedParticlesProps = UseThemedParticlesOptions & {
  recipe: ParticleRecipe;
  id?: string;
  className?: string;
  style?: CSSProperties;
  particlesLoaded?: (container?: Container) => void;
};

/**
 * Drop-in ambient/celebratory particle layer. Renders nothing until the
 * shared engine has loaded, and self-disables on reduced-motion or
 * low-memory devices. Must be mounted under a <ParticlesProvider
 * init={registerParticlesEngine}> ancestor (see engine.ts) — wrap the
 * nearest shared parent, not the app root, so unrelated routes don't pay
 * for loading @tsparticles.
 */
export function ThemedParticles({
  recipe,
  id,
  active,
  minDeviceMemory,
  className,
  style,
  particlesLoaded,
}: ThemedParticlesProps) {
  const { shouldRender, options } = useThemedParticles(recipe, { active, minDeviceMemory });
  const generatedId = useId();

  if (!shouldRender) return null;

  return (
    <Particles
      id={id ?? `themed-particles-${recipe}-${generatedId}`}
      options={options}
      className={className}
      style={{ pointerEvents: "none", ...style }}
      particlesLoaded={particlesLoaded}
    />
  );
}
