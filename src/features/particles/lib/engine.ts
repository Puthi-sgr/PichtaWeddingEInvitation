import type { Engine } from "@tsparticles/engine";
import { loadSlim } from "@tsparticles/slim";

// Must stay a single stable reference: ParticlesProvider throws if it
// receives a different `init` function while the engine is still loading.
export const registerParticlesEngine = async (engine: Engine): Promise<void> => {
  await loadSlim(engine);
};
