export function VerticalParallax() {
  return (
    <section className="vertical-parallax-section relative h-[150vh] w-full bg-stone-200 overflow-hidden flex flex-col items-center justify-center">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <img src="https://images.unsplash.com/photo-1541086095944-f4b50f282470?auto=format&fit=crop&q=80&w=600" className="parallax-img absolute top-[20%] left-[5%] md:left-[10%] w-40 md:w-64 rounded-2xl shadow-xl object-cover h-64 md:h-96" data-speed="3" alt="Decoration" />
        <img src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=600" className="parallax-img absolute top-[40%] right-[5%] md:right-[10%] w-48 md:w-80 rounded-2xl shadow-xl object-cover h-72 md:h-[30rem]" data-speed="1.5" alt="Decoration" />
        <img src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=600" className="parallax-img absolute top-[70%] left-[10%] md:left-[20%] w-32 md:w-56 rounded-2xl shadow-xl object-cover h-48 md:h-80" data-speed="4" alt="Decoration" />
      </div>
      <div className="relative z-10 text-center max-w-2xl px-6 bg-stone-50/80 backdrop-blur-sm py-12 rounded-3xl m-6 border border-stone-200/50">
        <h2 className="text-4xl md:text-6xl font-serif">Vertical Parallax</h2>
        <p className="max-w-md mx-auto text-stone-600 mt-6 font-sans leading-relaxed">
          Elements can move at different speeds based on their distance from the viewer, creating an illusion of depth and a more immersive storytelling experience.
        </p>
      </div>
    </section>
  );
}
