import { MapPin, Pause, Play, RotateCcw, SlidersHorizontal } from "lucide-react";
import { useRef } from "react";
import { Link } from "react-router-dom";
import { Navbar } from "../../../shared/ui/organisms/Navbar";
import { AnimationPreset, useAnimationLab } from "../hooks/useAnimationLab";

const presets: AnimationPreset[] = [
  "photoCurtain",
  "letterBloom",
  "venueWave",
  "vowWhisper",
  "goldenSweep",
  "locationPin",
  "irisReveal",
  "ringLock",
];
const comboPresets: AnimationPreset[] = ["classicEntrance", "cinematicHero", "venueMoment", "fullInvitation"];

const guestName = "Chantha Family";
const venueWords = ["The", "Garden", "Hall,", "Phnom", "Penh"];
const vowWords = "We joyfully invite you to celebrate our wedding day with us.".split(" ");

export default function AnimationLabPage() {
  const previewRef = useRef<HTMLDivElement>(null);
  const {
    isPaused,
    preset,
    presetMeta,
    replay,
    settings,
    setPreset,
    togglePaused,
    updateSetting,
  } = useAnimationLab(previewRef);

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800">
      <Navbar
        title="GSAP Lab"
        links={[
          { label: "Invite", to: "/" },
          { label: "Showcase", to: "/showcase" },
          { label: "Particles", to: "/particles-lab" },
        ]}
      />

      <main className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-0 px-5 pt-24 md:grid-cols-[21rem_1fr] md:px-8 lg:px-10">
        <aside className="border-b border-stone-200 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-stone-900 text-stone-50">
              <SlidersHorizontal className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-gold-500">Animation Lab</p>
              <h1 className="font-serif text-3xl">GSAP Presets</h1>
            </div>
          </div>

          <div className="space-y-2">
            {presets.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setPreset(item)}
                className={`w-full rounded-md border px-4 py-3 text-left transition-colors ${
                  preset === item
                    ? "border-stone-900 bg-stone-900 text-stone-50"
                    : "border-stone-200 bg-white text-stone-700 hover:border-gold-500"
                }`}
              >
                <span className="block font-serif text-xl">{presetMeta[item].label}</span>
                <span className={`mt-1 block text-sm leading-relaxed ${preset === item ? "text-stone-300" : "text-stone-500"}`}>
                  {presetMeta[item].tone}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-6 border-t border-stone-200 pt-6">
            <p className="mb-3 text-xs uppercase tracking-[0.22em] text-gold-500">Combos</p>
            <div className="space-y-2">
              {comboPresets.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setPreset(item)}
                  className={`w-full rounded-md border px-4 py-3 text-left transition-colors ${
                    preset === item
                      ? "border-gold-500 bg-gold-500 text-white"
                      : "border-stone-200 bg-white text-stone-700 hover:border-gold-500"
                  }`}
                >
                  <span className="block font-serif text-xl">{presetMeta[item].label}</span>
                  <span className={`mt-1 block text-sm leading-relaxed ${preset === item ? "text-white/85" : "text-stone-500"}`}>
                    {presetMeta[item].tone}
                  </span>
                </button>
              ))}
            </div>
          </div>

          <div className="mt-8 space-y-5 border-t border-stone-200 pt-6">
            <ControlSlider
              label="Duration"
              max={2}
              min={0.3}
              step={0.1}
              value={settings.duration}
              suffix="s"
              onChange={(value) => updateSetting("duration", value)}
            />
            <ControlSlider
              label="Intensity"
              max={140}
              min={20}
              step={4}
              value={settings.intensity}
              suffix="px"
              onChange={(value) => updateSetting("intensity", value)}
            />
            <ControlSlider
              label="Stagger"
              max={0.35}
              min={0}
              step={0.01}
              value={settings.stagger}
              suffix="s"
              onChange={(value) => updateSetting("stagger", value)}
            />
          </div>

          <div className="mt-8 flex gap-3">
            <button
              type="button"
              onClick={replay}
              className="inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-md bg-gold-500 px-4 text-sm uppercase tracking-widest text-white transition-colors hover:bg-gold-400"
            >
              <RotateCcw className="h-4 w-4" />
              Replay
            </button>
            <button
              type="button"
              onClick={togglePaused}
              className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-stone-300 bg-white text-stone-700 transition-colors hover:border-stone-900"
              aria-label={isPaused ? "Play animation" : "Pause animation"}
            >
              {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
            </button>
          </div>
        </aside>

        <section className="py-8 md:pl-10">
          <div ref={previewRef} className="relative min-h-[40rem] overflow-hidden rounded-md bg-stone-900 text-stone-50 shadow-xl">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,167,93,0.28),transparent_34%),linear-gradient(135deg,#1c1917,#44403c)]" />

            <div className="relative z-10 grid min-h-[40rem] grid-cols-1 items-center gap-8 p-6 md:grid-cols-[1fr_21rem] md:p-10 lg:p-14">
              <div>
                <div className="lab-photo-frame lab-animated relative mb-8 h-64 overflow-hidden rounded-md bg-stone-700 md:h-80">
                  <img
                    src="https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=1200"
                    alt="Wedding table setting"
                    className="h-full w-full object-cover opacity-90"
                  />
                  <div className="lab-shine-sweep pointer-events-none absolute -top-10 bottom-0 left-0 w-28 -skew-x-12 bg-gradient-to-r from-transparent via-white/70 to-transparent blur-sm" />
                </div>

                <p className="mb-4 text-xs uppercase tracking-[0.28em] text-gold-400">Wedding Invitation</p>
                <h2 className="lab-guest-name lab-animated max-w-2xl font-serif text-5xl leading-tight md:text-7xl">
                  {guestName.split("").map((letter, index) => (
                    <span key={`${letter}-${index}`} className="lab-guest-letter lab-animated inline-block">
                      {letter === " " ? "\u00A0" : letter}
                    </span>
                  ))}
                </h2>

                <p className="lab-intro-copy mt-6 max-w-xl text-lg leading-relaxed text-stone-300">
                  {vowWords.map((word, index) => (
                    <span key={`${word}-${index}`} className="lab-intro-word lab-animated mr-1 inline-block">
                      {word}
                    </span>
                  ))}
                </p>
              </div>

              <div className="grid gap-4">
                <div className="lab-venue-card lab-animated rounded-md border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <div className="mb-4 flex items-center gap-3">
                    <div className="lab-venue-pin lab-animated flex h-11 w-11 items-center justify-center rounded-full bg-gold-500 text-white">
                      <MapPin className="h-5 w-5" />
                    </div>
                    <span className="text-xs uppercase tracking-[0.22em] text-gold-400">Venue</span>
                  </div>
                  <p className="lab-venue-text font-serif text-2xl leading-snug">
                    {venueWords.map((word) => (
                      <span key={word} className="lab-venue-word lab-animated mr-2 inline-block">
                        {word}
                      </span>
                    ))}
                  </p>
                  <p className="mt-3 text-sm leading-relaxed text-stone-300">Norodom Boulevard, Phnom Penh</p>
                </div>

                <div className="lab-rings-wrap lab-animated relative flex h-40 items-center justify-center rounded-md border border-white/10 bg-white/10 backdrop-blur">
                  <div className="lab-ring-one lab-animated absolute h-24 w-24 rounded-full border-[10px] border-gold-400" />
                  <div className="lab-ring-two lab-animated absolute h-24 w-24 rounded-full border-[10px] border-stone-100" />
                  <span className="lab-sparkle-dot lab-animated absolute left-[28%] top-[28%] h-2 w-2 rounded-full bg-gold-400" />
                  <span className="lab-sparkle-dot lab-animated absolute right-[30%] top-[22%] h-2.5 w-2.5 rounded-full bg-white" />
                  <span className="lab-sparkle-dot lab-animated absolute bottom-[26%] left-1/2 h-1.5 w-1.5 rounded-full bg-gold-400" />
                </div>

                <div className="rounded-md border border-white/10 bg-white/10 p-5 backdrop-blur">
                  <span className="block text-xs uppercase tracking-[0.22em] text-gold-400">Reception</span>
                  <span className="mt-2 block font-serif text-2xl">6:30 PM</span>
                  <span className="mt-3 block text-sm leading-relaxed text-stone-300">
                    Dinner, blessings, and dancing with family.
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-end gap-3 text-sm text-stone-500">
            <Link to="/" className="uppercase tracking-widest text-stone-700 transition-colors hover:text-gold-500">
              Return to invitation
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}

function ControlSlider({
  label,
  max,
  min,
  onChange,
  step,
  suffix,
  value,
}: {
  label: string;
  max: number;
  min: number;
  onChange: (value: number) => void;
  step: number;
  suffix: string;
  value: number;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center justify-between text-sm">
        <span className="font-medium text-stone-700">{label}</span>
        <span className="text-stone-500">
          {value}
          {suffix}
        </span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full accent-gold-500"
      />
    </label>
  );
}
