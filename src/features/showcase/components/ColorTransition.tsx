import { Link } from "react-router-dom";

export function ColorTransition() {
  return (
    <section className="color-section h-screen flex flex-col items-center justify-center p-8 transition-colors duration-200 bg-white">
      <h2 className="text-4xl md:text-6xl font-serif mb-6">Dynamic Theming</h2>
      <p className="max-w-2xl text-center text-lg md:text-xl font-sans opacity-80 leading-relaxed">
        Watch as the background and text colors smoothly interpolate as you scroll down this section. 
        GSAP can animate almost any CSS property, including colors, border radii, and drop shadows, giving your site a fluid, unified aesthetic.
      </p>
      <Link to="/" className="mt-12 px-8 py-4 border border-current hover:bg-white hover:text-stone-900 transition-colors tracking-widest uppercase text-sm font-sans mx-auto inline-block">
        Return Home
      </Link>
    </section>
  );
}
