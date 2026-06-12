export function HeroSection() {
  return (
    <section className="hero-section relative h-screen w-full overflow-hidden flex flex-col items-center justify-center">
      <div className="hero-bg absolute top-[-10%] left-[-10%] right-[-10%] bottom-[-10%]">
        <video 
          autoPlay 
          muted 
          loop 
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="https://assets.mixkit.co/videos/preview/mixkit-romantic-couple-on-the-beach-during-a-beautiful-sunset-5231-large.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-stone-900/40" />
      </div>
      
      <div className="hero-content relative z-10 text-center text-white px-4 mt-20">
        <p className="font-sans tracking-[0.3em] uppercase text-sm md:text-md mb-6 reveal-left">We are getting married</p>
        <h1 className="font-serif text-6xl md:text-8xl lg:text-9xl mb-4 font-normal reveal-right">
          Emma <span className="font-serif italic text-gold-400">&</span> James
        </h1>
        <p className="font-serif italic text-2xl md:text-3xl mt-6 reveal-left">Save the Date</p>
      </div>

      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white flex flex-col items-center animate-bounce">
        <span className="text-xs tracking-widest uppercase mb-2 opacity-70">Scroll</span>
        <div className="w-[1px] h-12 bg-white/50"></div>
      </div>
    </section>
  );
}
