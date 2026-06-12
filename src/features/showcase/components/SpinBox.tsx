import { Heart } from "lucide-react";

export function SpinBox() {
  return (
    <section className="spin-section h-screen w-full flex items-center justify-center relative bg-stone-100">
      <div className="text-center absolute z-10 w-full px-6 mix-blend-difference text-white pointer-events-none">
        <h2 className="text-4xl md:text-6xl font-serif">Seamless Scrubbing</h2>
        <p className="font-sans mt-4 tracking-widest uppercase text-sm">Link animations directly to scroll progress</p>
      </div>
      <div className="spin-box w-64 h-64 bg-gold-400 rounded-xl shadow-2xl flex items-center justify-center">
        <Heart className="text-white w-20 h-20" />
      </div>
    </section>
  );
}
