import { Check, ChevronLeft } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { WeddingDividerPreset, WeddingSectionDivider } from "../components/WeddingSectionDivider";

const choices: Array<{ preset: WeddingDividerPreset; name: string; description: string }> = [
  { preset: "tapered-rule", name: "Tapered Rule", description: "A quiet, centre-free tapered gold rule for smaller subsections and supporting details." },
  { preset: "radiant", name: "Tapered Flower", description: "Tapered gold lines with the supplied flower replicated as the centre ornament—ceremonial, floral, and free of radiating rays." },
  { preset: "radiant-lotus", name: "Tapered Lotus", description: "The same radiant lines with a lotus bloom for purity, grace, and a new beginning." },
  { preset: "radiant-rings", name: "Tapered Rings", description: "The same radiant lines with interlocking wedding rings and a small jewel accent." },
  { preset: "radiant-kbach", name: "Tapered Kbach Crest", description: "The same radiant lines with a compact ornamental crest inspired by Khmer decorative geometry." },
  { preset: "radiant-flame", name: "Tapered Flame", description: "The same radiant lines with a ceremonial flame motif for warmth and blessing." },
  { preset: "cursive-bloom", name: "Cursive Bloom", description: "Light, hand-drawn-style scrollwork that keeps the middle quiet and lets the line flow outward." },
  { preset: "cursive-ribbon", name: "Cursive Ribbon", description: "Long looping ribbons with a graceful central tuck; romantic without becoming too heavy." },
  { preset: "cursive-floral", name: "Cursive Floral", description: "Soft curls with small petal-like marks woven into the lines, inspired by botanical wedding stationery." },
  { preset: "cursive-crest", name: "Cursive Crest", description: "The fullest ceremonial flourish, with layered loops and a delicate crown-like rise." },
  { preset: "double", name: "Double Horizon", description: "Two offset fine lines with a tiny jewel lock—formal, airy, and highly reusable." },
  { preset: "beaded", name: "Beaded Constellation", description: "A measured sequence of fine gold dots along a single rule; delicate rather than flashy." },
  { preset: "deco", name: "Art Deco Steps", description: "Symmetrical stepped geometry for a more cinematic, palace-like section break." },
  { preset: "laurel", name: "Laurel Trace", description: "A slender botanical flourish living inside the linework, with no large centre ornament." },
  { preset: "wave", name: "Silk Wave", description: "A soft repeating curve that makes the invitation feel less rigid while staying restrained." },
  { preset: "filigree", name: "Royal Filigree", description: "Fine looping strokes for the most ornate option—best used sparingly for a major transition." },
  { preset: "frame", name: "Framed Rule", description: "Crisp end caps and a minimal central diamond; elegant for schedule, map, and gallery sections." },
];

export default function DividerLabPage() {
  const [selected, setSelected] = useState<WeddingDividerPreset>("radiant");

  return (
    <main className="min-h-[100svh] bg-[#10180f] px-5 py-8 text-white sm:px-8">
      <div className="mx-auto w-full max-w-3xl">
        <Link to="/" className="inline-flex min-h-11 items-center gap-2 text-sm text-white/70 transition-colors hover:text-[#f8df8a]">
          <ChevronLeft className="h-4 w-4" />
          Back to invitation
        </Link>

        <header className="mb-10 mt-9 text-center">
          <p className="text-xs tracking-[0.24em] text-[#ead7a1]">WEDDING DETAIL LAB</p>
          <h1 className="mt-3 text-3xl text-[#fff4c9] sm:text-4xl">Choose a section divider</h1>
          <p className="mx-auto mt-4 max-w-xl font-serif text-base leading-relaxed text-white/70">
            Each option uses the invitation’s gold palette and is designed for one quiet entrance, not continuous motion.
          </p>
        </header>

        <section className="space-y-5" aria-label="Divider choices">
          {choices.map((choice) => {
            const isSelected = selected === choice.preset;

            return (
              <article
                key={choice.preset}
                className={`overflow-hidden border px-5 py-6 transition-colors sm:px-8 ${
                  isSelected ? "border-[#e8c65f]/80 bg-white/[0.08]" : "border-white/15 bg-black/10 hover:border-[#e8c65f]/45"
                }`}
              >
                <WeddingSectionDivider preset={choice.preset} length="36rem" label={choice.name} />
                <div className="mt-6 flex items-end justify-between gap-5">
                  <div>
                    <h2 className="text-xl text-[#fff4c9]">{choice.name}</h2>
                    <p className="mt-2 max-w-lg font-serif text-sm leading-relaxed text-white/65">{choice.description}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelected(choice.preset)}
                    className={`inline-flex min-h-11 shrink-0 items-center gap-2 border px-4 text-sm transition-colors ${
                      isSelected
                        ? "border-[#e8c65f] bg-[#e8c65f] text-[#193322]"
                        : "border-white/30 text-white/85 hover:border-[#e8c65f] hover:text-[#fff4c9]"
                    }`}
                    aria-pressed={isSelected}
                  >
                    {isSelected && <Check className="h-4 w-4" />}
                    {isSelected ? "Selected" : "Choose"}
                  </button>
                </div>
              </article>
            );
          })}
        </section>

        <p className="mt-8 text-center font-serif text-sm text-white/55">
          Current choice: <span className="text-[#f8df8a]">{choices.find((choice) => choice.preset === selected)?.name}</span>
        </p>
      </div>
    </main>
  );
}
