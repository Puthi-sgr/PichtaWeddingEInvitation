import { RefObject, useCallback, useEffect, useMemo, useState } from "react";
import { resetLabAnimationState } from "./presets/utils";
import { useGoldenSweepAnimation } from "./presets/useGoldenSweepAnimation";
import { useIrisRevealAnimation } from "./presets/useIrisRevealAnimation";
import { useLetterBloomAnimation } from "./presets/useLetterBloomAnimation";
import { useLocationPinAnimation } from "./presets/useLocationPinAnimation";
import { usePhotoCurtainAnimation } from "./presets/usePhotoCurtainAnimation";
import { useRingLockAnimation } from "./presets/useRingLockAnimation";
import { useVenueWaveAnimation } from "./presets/useVenueWaveAnimation";
import { useVowWhisperAnimation } from "./presets/useVowWhisperAnimation";
import { AnimationPreset, AnimationSettings } from "./presets/types";

export type { AnimationPreset } from "./presets/types";

const presetCombos: Partial<Record<AnimationPreset, AnimationPreset[]>> = {
  classicEntrance: ["photoCurtain", "letterBloom", "vowWhisper"],
  cinematicHero: ["irisReveal", "goldenSweep", "ringLock"],
  venueMoment: ["venueWave", "locationPin"],
  fullInvitation: ["photoCurtain", "letterBloom", "vowWhisper", "venueWave", "locationPin", "ringLock", "goldenSweep"],
};

export function useAnimationLab(previewRef: RefObject<HTMLDivElement | null>) {
  const [preset, setPreset] = useState<AnimationPreset>("photoCurtain");
  const [settings, setSettings] = useState<AnimationSettings>({
    duration: 1,
    intensity: 72,
    stagger: 0.12,
  });
  const [isPaused, setIsPaused] = useState(false);
  const [replayKey, setReplayKey] = useState(0);

  const sharedHookOptions = {
    isPaused,
    previewRef,
    replayKey,
    settings,
  };
  const activePresets = presetCombos[preset] ?? [preset];
  const isActive = (animation: AnimationPreset) => activePresets.includes(animation);
  const isCombo = activePresets.length > 1;

  useEffect(() => {
    if (!isCombo) return;
    const root = previewRef.current;
    if (!root) return;
    resetLabAnimationState(root);
  }, [isCombo, preset, previewRef, replayKey, settings]);

  usePhotoCurtainAnimation({
    ...sharedHookOptions,
    active: isActive("photoCurtain"),
    resetOnStart: !isCombo,
  });
  useLetterBloomAnimation({
    ...sharedHookOptions,
    active: isActive("letterBloom"),
    resetOnStart: !isCombo,
  });
  useVenueWaveAnimation({
    ...sharedHookOptions,
    active: isActive("venueWave"),
    resetOnStart: !isCombo,
  });
  useVowWhisperAnimation({
    ...sharedHookOptions,
    active: isActive("vowWhisper"),
    resetOnStart: !isCombo,
  });
  useGoldenSweepAnimation({
    ...sharedHookOptions,
    active: isActive("goldenSweep"),
    resetOnStart: !isCombo,
  });
  useLocationPinAnimation({
    ...sharedHookOptions,
    active: isActive("locationPin"),
    resetOnStart: !isCombo,
  });
  useIrisRevealAnimation({
    ...sharedHookOptions,
    active: isActive("irisReveal"),
    resetOnStart: !isCombo,
  });
  useRingLockAnimation({
    ...sharedHookOptions,
    active: isActive("ringLock"),
    resetOnStart: !isCombo,
  });

  const replay = useCallback(() => {
    setReplayKey((current) => current + 1);
    setIsPaused(false);
  }, []);

  const updateSetting = useCallback((key: keyof AnimationSettings, value: number) => {
    setSettings((current) => ({ ...current, [key]: value }));
  }, []);

  const togglePaused = useCallback(() => {
    setIsPaused((current) => !current);
  }, []);

  const presetMeta = useMemo(
    () => ({
      photoCurtain: {
        label: "Photo Curtain",
        tone: "Premium center-out image reveal for hero or couple photos.",
      },
      letterBloom: {
        label: "Letter Bloom",
        tone: "Guest name blooms from the center, letter by letter.",
      },
      venueWave: {
        label: "Venue Wave",
        tone: "Venue and address words enter with a gentle wave.",
      },
      vowWhisper: {
        label: "Vow Whisper",
        tone: "Short romantic copy appears word by word with a gentle lift.",
      },
      goldenSweep: {
        label: "Golden Sweep",
        tone: "A warm highlight passes across the main photo.",
      },
      locationPin: {
        label: "Location Pin",
        tone: "The map pin drops into the venue card.",
      },
      irisReveal: {
        label: "Iris Reveal",
        tone: "Circular cinematic image reveal; heavier than Photo Curtain.",
      },
      ringLock: {
        label: "Ring Lock",
        tone: "Two rings slide together with small sparkle accents.",
      },
      classicEntrance: {
        label: "Classic Entrance",
        tone: "Photo Curtain, Letter Bloom, and Vow Whisper together.",
      },
      cinematicHero: {
        label: "Cinematic Hero",
        tone: "Iris Reveal, Golden Sweep, and Ring Lock for a dramatic opening.",
      },
      venueMoment: {
        label: "Venue Moment",
        tone: "Venue Wave and Location Pin focused on the location card.",
      },
      fullInvitation: {
        label: "Full Invitation",
        tone: "A complete choreography using the safer production sequence.",
      },
    }),
    [],
  );

  return {
    isPaused,
    preset,
    presetMeta,
    replay,
    settings,
    setPreset,
    togglePaused,
    updateSetting,
  };
}
