import { Images } from "lucide-react";
import { useState } from "react";
import { Navbar } from "../../../shared/ui/organisms/Navbar";
import { FramedGallery } from "../components/FramedGallery";
import { PhotoMosaic } from "../components/PhotoMosaic";
import { unsplashSlotResolver } from "../lib/photos";
import { MosaicPresetName, mosaicPresets, presetMeta } from "../lib/presets";
import { framedTemplate, GalleryFill, templateSlots } from "../lib/template";

const presets: MosaicPresetName[] = [
  "elegantMasonry",
  "justifiedRows",
  "uniformColumns",
  "compactMasonry",
];

// Ordered slot ids + a sample image assigned to each — the demo fills these in
// one at a time so you can watch the structure stay put as content arrives.
const framedSlotIds = templateSlots(framedTemplate).map((slot) => slot.id);
const framedDemoPool: Record<string, string> = Object.fromEntries(
  framedSlotIds.map((id, i) => [
    id,
    [
      "photo-1519741497674-611481863552",
      "photo-1511285560929-80b456fea0bc",
      "photo-1465495976277-4387d4b0b4c6",
      "photo-1519225421980-715cb0215aed",
      "photo-1522673607200-164d1b6ce486",
      "photo-1520854221256-17451cc331bf",
      "photo-1583939003579-730e3918a45a",
      "photo-1537633552985-df8429e8048b",
    ][i % 8],
  ]),
);

function Slider({
  label,
  value,
  min,
  max,
  step = 1,
  suffix = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  suffix?: string;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block">
      <span className="mb-1 flex items-center justify-between text-sm text-stone-600">
        <span>{label}</span>
        <span className="font-medium text-stone-800">
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
        className="w-full accent-gold-500"
      />
    </label>
  );
}

export default function GalleryLabPage() {
  const [preset, setPreset] = useState<MosaicPresetName>("elegantMasonry");
  const base = mosaicPresets[preset];

  // Live overrides so you can experiment; changing preset resets them.
  const [columns, setColumns] = useState(base.columns);
  const [spacing, setSpacing] = useState(base.spacing);
  const [radius, setRadius] = useState(base.radius);

  const selectPreset = (next: MosaicPresetName) => {
    setPreset(next);
    setColumns(mosaicPresets[next].columns);
    setSpacing(mosaicPresets[next].spacing);
    setRadius(mosaicPresets[next].radius);
  };

  // Framed (slot-based) demo: fill slots one at a time to watch the structure hold.
  const [framedFill, setFramedFill] = useState<GalleryFill>({});
  const framedFilledCount = framedSlotIds.filter((id) => framedFill[id]).length;
  const fillNextSlot = () => {
    const next = framedSlotIds.find((id) => !framedFill[id]);
    if (next) setFramedFill((current) => ({ ...current, [next]: framedDemoPool[next] }));
  };
  const fillAllSlots = () => setFramedFill({ ...framedDemoPool });
  const clearAllSlots = () => setFramedFill({});

  const isRows = base.layout === "rows";

  return (
    <div className="min-h-screen bg-stone-50 font-sans text-stone-800">
      <Navbar
        title="Gallery Lab"
        links={[
          { label: "Invite", to: "/" },
          { label: "Particles", to: "/particles-lab" },
          { label: "GSAP Lab", to: "/animation-lab" },
        ]}
      />

      <main className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-0 px-5 pt-24 md:grid-cols-[21rem_1fr] md:px-8 lg:px-10">
        <aside className="border-b border-stone-200 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-stone-900 text-stone-50">
              <Images className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-gold-500">Gallery Lab</p>
              <h1 className="font-serif text-3xl">Photo Mosaic</h1>
            </div>
          </div>

          <div className="space-y-2">
            {presets.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => selectPreset(item)}
                className={`w-full rounded-md border px-4 py-3 text-left transition-colors ${
                  preset === item
                    ? "border-stone-900 bg-stone-900 text-stone-50"
                    : "border-stone-200 bg-white text-stone-700 hover:border-gold-500"
                }`}
              >
                <span className="block font-serif text-xl">{presetMeta[item].label}</span>
                <span
                  className={`mt-1 block text-sm leading-relaxed ${
                    preset === item ? "text-stone-300" : "text-stone-500"
                  }`}
                >
                  {presetMeta[item].tone}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-8 space-y-5 border-t border-stone-200 pt-6">
            <p className="text-xs uppercase tracking-[0.22em] text-stone-400">Live tweaks</p>
            {!isRows && (
              <Slider label="Columns (desktop max)" value={columns} min={2} max={6} onChange={setColumns} />
            )}
            <Slider label="Spacing" value={spacing} min={0} max={24} suffix="px" onChange={setSpacing} />
            <Slider label="Corner radius" value={radius} min={0} max={24} suffix="px" onChange={setRadius} />
          </div>

          <div className="mt-8 space-y-3 border-t border-stone-200 pt-6 text-sm leading-relaxed text-stone-500">
            <p>
              <span className="font-medium text-stone-700">Plug and play:</span> drop{" "}
              <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">{'<PhotoMosaic preset="elegantMasonry" />'}</code>{" "}
              anywhere. Tap a photo to open the fullscreen viewer — swipe between shots, pinch or double-tap to zoom, swipe
              down to close.
            </p>
            <p>
              Grid tiles use a small srcSet; the lightbox only loads larger images for the photo you open. Columns scale
              down on narrow screens. Lazy-load it (like the particles backdrop) to keep it out of the invite&apos;s
              critical bundle.
            </p>
          </div>
        </aside>

        <section className="py-8 md:pl-10">
          <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.3em] text-gold-500">Framed · slot-based</p>
              <h2 className="font-serif text-4xl italic">Emma &amp; James</h2>
              <p className="mt-1 text-sm text-stone-500">
                Justified full-width caps top &amp; bottom, fixed 2-col masonry between. Fill slots one at a time —
                the layout never shifts.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="mr-1 text-sm text-stone-500">
                {framedFilledCount}/{framedSlotIds.length}
              </span>
              <button
                type="button"
                onClick={fillNextSlot}
                className="h-9 rounded-md bg-gold-500 px-3 text-sm text-white transition-colors hover:bg-gold-400"
              >
                Fill next
              </button>
              <button
                type="button"
                onClick={fillAllSlots}
                className="h-9 rounded-md border border-stone-300 px-3 text-sm text-stone-700 transition-colors hover:border-gold-500"
              >
                Fill all
              </button>
              <button
                type="button"
                onClick={clearAllSlots}
                className="h-9 rounded-md border border-stone-300 px-3 text-sm text-stone-700 transition-colors hover:border-gold-500"
              >
                Clear
              </button>
            </div>
          </div>

          <FramedGallery template={framedTemplate} fill={framedFill} resolve={unsplashSlotResolver} />

          <div className="mt-16 mb-6 border-t border-stone-200 pt-10">
            <p className="text-xs uppercase tracking-[0.3em] text-gold-500">Free-form mosaic</p>
            <h2 className="font-serif text-4xl italic">Layout explorer</h2>
            <p className="mt-1 text-sm text-stone-500">Experiment with the preset layouts and live tweaks on the left.</p>
          </div>

          <PhotoMosaic
            key={`${preset}-${base.layout}`}
            preset={preset}
            columns={columns}
            spacing={spacing}
            radius={radius}
          />
        </section>
      </main>
    </div>
  );
}
