import { ParticlesProvider } from "@tsparticles/react";
import { RotateCcw, Sparkles } from "lucide-react";
import { useState } from "react";
import { Navbar } from "../../../shared/ui/organisms/Navbar";
import { ThemedParticles } from "../components/ThemedParticles";
import { registerParticlesEngine } from "../lib/engine";
import { ParticleRecipe, recipeMeta } from "../lib/recipes";

const recipes: ParticleRecipe[] = [
  "goldenFireflies",
  "gildedDust",
  "celebrationBurst",
  "driftingButterflies",
  "constellationThread",
  "bokehGlow",
  "fallingPetals",
  "sparkleGlitter",
];

export default function ParticlesLabPage() {
  const [recipe, setRecipe] = useState<ParticleRecipe>("goldenFireflies");
  const [replayKey, setReplayKey] = useState(0);

  const replay = () => setReplayKey((current) => current + 1);

  return (
    <ParticlesProvider init={registerParticlesEngine}>
      <div className="min-h-screen bg-stone-50 font-sans text-stone-800">
      <Navbar
        title="Particles Lab"
        links={[
          { label: "Invite", to: "/" },
          { label: "GSAP Lab", to: "/animation-lab" },
          { label: "Showcase", to: "/showcase" },
          { label: "Gallery", to: "/gallery-lab" },
        ]}
      />

      <main className="mx-auto grid min-h-screen w-full max-w-7xl grid-cols-1 gap-0 px-5 pt-24 md:grid-cols-[21rem_1fr] md:px-8 lg:px-10">
        <aside className="border-b border-stone-200 pb-6 md:border-b-0 md:border-r md:pb-0 md:pr-8">
          <div className="mb-8 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-md bg-stone-900 text-stone-50">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-gold-500">Particles Lab</p>
              <h1 className="font-serif text-3xl">tsparticles Recipes</h1>
            </div>
          </div>

          <div className="space-y-2">
            {recipes.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => {
                  setRecipe(item);
                  setReplayKey((current) => current + 1);
                }}
                className={`w-full rounded-md border px-4 py-3 text-left transition-colors ${
                  recipe === item
                    ? "border-stone-900 bg-stone-900 text-stone-50"
                    : "border-stone-200 bg-white text-stone-700 hover:border-gold-500"
                }`}
              >
                <span className="block font-serif text-xl">{recipeMeta[item].label}</span>
                <span className={`mt-1 block text-sm leading-relaxed ${recipe === item ? "text-stone-300" : "text-stone-500"}`}>
                  {recipeMeta[item].tone}
                </span>
              </button>
            ))}
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
          </div>

          <div className="mt-8 space-y-3 border-t border-stone-200 pt-6 text-sm leading-relaxed text-stone-500">
            <p>
              <span className="font-medium text-stone-700">Plug and play:</span> drop{" "}
              <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">{"<ThemedParticles recipe=\"goldenFireflies\" />"}</code>{" "}
              anywhere under a <code className="rounded bg-stone-100 px-1 py-0.5 text-xs">ParticlesProvider</code> — wrap the
              nearest shared ancestor once (e.g. HomePage) if you use it in production, so the engine only loads on routes
              that need it.
            </p>
            <p>Auto-disables on reduced-motion and very-low-memory devices; pauses off-screen and when the tab is backgrounded.</p>
          </div>
        </aside>

        <section className="py-8 md:pl-10">
          <div className="relative min-h-[40rem] overflow-hidden rounded-md shadow-xl" style={{ backgroundColor: "#1f2a1d" }}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(201,167,93,0.22),transparent_45%),linear-gradient(160deg,#182118,#2a3624)]" />

            <ThemedParticles
              key={`${recipe}-${replayKey}`}
              recipe={recipe}
              className="absolute inset-0 z-10"
            />

            <div className="relative z-20 flex min-h-[40rem] flex-col items-center justify-center gap-4 p-10 text-center text-stone-50">
              <p className="text-xs uppercase tracking-[0.3em] text-gold-400">Sample Preview</p>
              <h2 className="font-serif text-5xl italic">Emma &amp; James</h2>
              <p className="max-w-md text-sm leading-relaxed text-stone-300">
                {recipeMeta[recipe].tone} Colors and density are hand-picked to sit behind the gold/dark-green invite theme
                without competing with GSAP or the scroll video.
              </p>
            </div>
          </div>
        </section>
      </main>
      </div>
    </ParticlesProvider>
  );
}
