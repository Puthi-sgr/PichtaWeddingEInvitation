import { useParticlesProvider } from "@tsparticles/react";
import { particleRecipes, ParticleRecipe } from "../lib/recipes";

type NavigatorWithMemory = Navigator & { deviceMemory?: number };

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const meetsDeviceMemory = (minDeviceMemory: number) => {
  if (typeof navigator === "undefined") return true;
  const deviceMemory = (navigator as NavigatorWithMemory).deviceMemory;
  // Non-Chromium browsers don't expose deviceMemory at all — default to on.
  return deviceMemory === undefined || deviceMemory >= minDeviceMemory;
};

export type UseThemedParticlesOptions = {
  active?: boolean;
  minDeviceMemory?: number;
};

export function useThemedParticles(recipe: ParticleRecipe, options: UseThemedParticlesOptions = {}) {
  const { active = true, minDeviceMemory = 2 } = options;
  const { loaded } = useParticlesProvider();

  const shouldRender = loaded && active && !prefersReducedMotion() && meetsDeviceMemory(minDeviceMemory);

  return {
    shouldRender,
    loaded,
    options: particleRecipes[recipe],
  };
}
