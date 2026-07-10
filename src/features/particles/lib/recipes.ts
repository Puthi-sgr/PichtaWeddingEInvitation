import type { ISourceOptions } from "@tsparticles/engine";

export type ParticleRecipe =
  | "goldenFireflies"
  | "gildedDust"
  | "celebrationBurst"
  | "driftingButterflies"
  | "constellationThread"
  | "bokehGlow"
  | "fallingPetals"
  | "sparkleGlitter";

const goldPalette = ["#f7e0a7", "#c9a75d", "#b59247", "#fafaf9"];

// Slightly richer than the original 22 now that fireflies drive the real hero;
// `density` (below) scales this down automatically on smaller screens.
export const goldenFirefliesTuning = {
  count: 30,
};

const shared: ISourceOptions = {
  fullScreen: { enable: false },
  fpsLimit: 30,
  detectRetina: true,
  pauseOnBlur: true,
  pauseOnOutsideViewport: true,
  interactivity: {
    events: {
      onHover: { enable: false },
      onClick: { enable: false },
    },
  },
};

export const particleRecipes: Record<ParticleRecipe, ISourceOptions> = {
  
  goldenFireflies: {
    ...shared,
    particles: {
      number: {
        value: goldenFirefliesTuning.count,
        density: { enable: true, width: 1920, height: 1080 },
      },
      color: { value: goldPalette },
      shape: { type: "circle" },
      opacity: {
        value: { min: 0.15, max: 0.85 },
        animation: { enable: true, speed: 1.1, sync: false, startValue: "random", mode: "auto" },
      },
      size: { value: { min: 1, max: 3 } },
      move: {
        enable: true,
        speed: { min: 0.3, max: 0.9 },
        direction: "top",
        random: true,
        straight: false,
        outModes: { default: "out" },
      },
    },
  },

  // Very subtle in-place twinkle, meant to sit behind copy-heavy sections
  // (details/RSVP) without competing for attention. `density` scales the count
  // down on smaller screens (~14 on desktop, a couple on a phone) so it stays
  // cheap on mobile — same mobile-safe pattern as goldenFireflies.
  gildedDust: {
    ...shared,
    particles: {
      number: { value: 14, density: { enable: true, width: 1920, height: 1080 } },
      color: { value: ["#c9a75d", "#e7e5e4"] },
      shape: { type: "circle" },
      opacity: {
        value: { min: 0.1, max: 0.55 },
        animation: { enable: true, speed: 0.6, sync: false, startValue: "random", mode: "auto" },
      },
      size: { value: { min: 1.5, max: 3 } },
      move: {
        enable: true,
        speed: 0.15,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "bounce" },
      },
    },
  },

  // One-shot celebratory confetti fall (e.g. on RSVP success). Container
  // auto-stops after `duration`; particles never respawn (`life.count: 1`).
  celebrationBurst: {
    ...shared,
    fpsLimit: 60,
    duration: 4,
    particles: {
      number: { value: 60 },
      color: { value: goldPalette },
      shape: { type: ["circle", "square"] },
      opacity: { value: 1 },
      size: { value: { min: 2, max: 5 } },
      life: { count: 1, duration: { value: 0 }, delay: { value: 0 } },
      rotate: {
        value: { min: 0, max: 360 },
        direction: "random",
        animation: { enable: true, speed: 30, sync: false },
      },
      move: {
        enable: true,
        speed: { min: 4, max: 9 },
        direction: "bottom",
        random: true,
        straight: false,
        gravity: { enable: true, acceleration: 6 },
        outModes: { default: "destroy", top: "none" },
      },
    },
  },

  // A handful of real butterflies wandering the frame — cheaper than a video
  // layer, echoes the butterfly motif already in the wedding frame artwork.
  driftingButterflies: {
    ...shared,
    particles: {
      number: { value: 6 },
      shape: {
        type: "emoji",
        options: { emoji: { value: ["🦋"] } },
      },
      size: { value: { min: 14, max: 22 } },
      opacity: { value: { min: 0.7, max: 1 } },
      rotate: {
        value: { min: -15, max: 15 },
        direction: "random",
        animation: { enable: true, speed: 4, sync: false },
      },
      move: {
        enable: true,
        speed: { min: 0.6, max: 1.4 },
        direction: "none",
        random: true,
        straight: false,
        vibrate: true,
        outModes: { default: "bounce" },
      },
    },
  },

  // Faint gold threads linking nearby points, like lace or filigree —
  // understated, works best behind a name/title rather than body copy.
  constellationThread: {
    ...shared,
    particles: {
      number: { value: 30 },
      color: { value: goldPalette },
      shape: { type: "circle" },
      opacity: { value: { min: 0.2, max: 0.6 } },
      size: { value: { min: 1, max: 2 } },
      links: {
        enable: true,
        color: "#c9a75d",
        distance: 130,
        opacity: 0.25,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.4,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "bounce" },
      },
    },
  },

  // Large, very-low-opacity soft circles — reads as an out-of-focus bokeh
  // glow rather than distinct particles. Good behind a photo or quote.
  bokehGlow: {
    ...shared,
    particles: {
      number: { value: 10 },
      color: { value: ["#f7e0a7", "#c9a75d"] },
      shape: { type: "circle" },
      opacity: {
        value: { min: 0.05, max: 0.25 },
        animation: { enable: true, speed: 0.4, sync: false, startValue: "random", mode: "auto" },
      },
      size: { value: { min: 20, max: 48 } },
      move: {
        enable: true,
        speed: { min: 0.1, max: 0.3 },
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "bounce" },
      },
    },
  },

  // Gentle cream/gold petals tumbling down with a slight sideways drift —
  // a softer, botanical alternative to the square/circle confetti burst.
  fallingPetals: {
    ...shared,
    particles: {
      number: { value: 16 },
      color: { value: ["#f3d9b1", "#e7c68a", "#fafaf9"] },
      shape: { type: "polygon", options: { polygon: { sides: 5 } } },
      opacity: { value: { min: 0.5, max: 0.9 } },
      size: { value: { min: 4, max: 8 } },
      rotate: {
        value: { min: 0, max: 360 },
        direction: "random",
        animation: { enable: true, speed: 8, sync: false },
      },
      move: {
        enable: true,
        speed: { min: 0.5, max: 1.2 },
        direction: "bottom",
        random: true,
        straight: false,
        drift: { min: -0.2, max: 0.2 },
        outModes: { default: "out" },
      },
    },
  },

  // Glitter/sparkle: tiny stars that shimmer in place, each blinking its
  // opacity across the full 0–1 range at a random phase so the field reads as
  // flickering glints rather than steady dots. No dedicated "twinkle" plugin
  // exists in the slim bundle — this reproduces it with star shape + a fast
  // opacity animation + near-zero movement.
  sparkleGlitter: {
    ...shared,
    particles: {
      number: { value: 40, density: { enable: true, width: 1920, height: 1080 } },
      color: { value: ["#ffffff", "#f7e0a7", "#c9a75d"] },
      shape: { type: "star", options: { star: { sides: 5 } } },
      opacity: {
        value: { min: 0, max: 1 },
        animation: { enable: true, speed: 3.2, sync: false, startValue: "random", mode: "auto" },
      },
      size: {
        value: { min: 1, max: 3 },
        animation: { enable: true, speed: 2, sync: false, startValue: "random", mode: "auto" },
      },
      rotate: {
        value: { min: 0, max: 360 },
        direction: "random",
        animation: { enable: true, speed: 3, sync: false },
      },
      move: {
        enable: true,
        speed: 0.15,
        direction: "none",
        random: true,
        straight: false,
        outModes: { default: "out" },
      },
    },
  },
};

export const recipeMeta: Record<ParticleRecipe, { label: string; tone: string }> = {
  goldenFireflies: {
    label: "Golden Fireflies",
    tone: "Ambient drifting sparkle for the hero/backdrop.",
  },
  gildedDust: {
    label: "Gilded Dust",
    tone: "Subtle in-place twinkle for copy-heavy sections.",
  },
  celebrationBurst: {
    label: "Celebration Burst",
    tone: "One-shot confetti fall for an RSVP success moment.",
  },
  driftingButterflies: {
    label: "Drifting Butterflies",
    tone: "A few real butterflies wandering the frame.",
  },
  constellationThread: {
    label: "Constellation Thread",
    tone: "Faint gold lace linking nearby points.",
  },
  bokehGlow: {
    label: "Bokeh Glow",
    tone: "Soft out-of-focus gold light, very sparse.",
  },
  fallingPetals: {
    label: "Falling Petals",
    tone: "Botanical petal fall, softer than confetti.",
  },
  sparkleGlitter: {
    label: "Sparkle Glitter",
    tone: "Tiny stars twinkling in place like glints of glitter.",
  },
};
