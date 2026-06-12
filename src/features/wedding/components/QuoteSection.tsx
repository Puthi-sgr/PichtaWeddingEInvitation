export function QuoteSection() {
  return (
    <section className="story-section relative h-[70vh] md:h-screen w-full overflow-hidden flex items-center justify-center">
      <div 
        className="story-bg absolute top-[-20%] left-0 right-0 bottom-[-20%] bg-cover bg-center"
        style={{ backgroundImage: "url('https://images.unsplash.com/photo-1606800052052-a08af7148866?auto=format&fit=crop&q=80&w=2000')" }}
      >
        <div className="absolute inset-0 bg-stone-900/40" />
      </div>
      
      <div className="relative z-10 text-center px-6 max-w-4xl mx-auto text-white reveal-right">
        <p className="font-serif italic text-3xl md:text-5xl lg:text-6xl leading-tight">
          "I love you not only for what you are, but for what I am when I am with you."
        </p>
        <p className="mt-8 font-sans tracking-widest uppercase text-sm opacity-80">— Roy Croft</p>
      </div>
    </section>
  );
}
