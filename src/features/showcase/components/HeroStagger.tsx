export function HeroStagger({ titleText }: { titleText: string[] }) {
  return (
    <section className="h-screen flex items-center justify-center flex-col bg-stone-900 text-stone-50">
      <h1 className="font-serif text-5xl md:text-8xl flex overflow-hidden">
        {titleText.map((char, index) => (
          <span key={index} className="stagger-char inline-block">
            {char === " " ? "\u00A0" : char}
          </span>
        ))}
      </h1>
      <p className="mt-8 font-sans tracking-widest uppercase text-gold-400 opacity-80 animate-pulse text-sm">
        Scroll to explore capabilities
      </p>
    </section>
  );
}
