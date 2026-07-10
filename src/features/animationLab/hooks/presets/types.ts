import { RefObject } from "react";

export type AnimationPreset =
  | "photoCurtain"
  | "letterBloom"
  | "venueWave"
  | "vowWhisper"
  | "goldenSweep"
  | "locationPin"
  | "irisReveal"
  | "ringLock"
  | "classicEntrance"
  | "cinematicHero"
  | "venueMoment"
  | "fullInvitation";

export type AnimationSettings = {
  duration: number;
  intensity: number;
  stagger: number;
};

export type PresetHookOptions = {
  active: boolean;
  isPaused: boolean;
  previewRef: RefObject<HTMLDivElement | null>;
  replayKey: number;
  resetOnStart?: boolean;
  settings: AnimationSettings;
};
