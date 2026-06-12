export function RsvpSection() {
  return (
    <section className="py-32 px-6 bg-stone-800 text-stone-50 text-center relative overflow-hidden">
      <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\\'60\\' height=\\'60\\' viewBox=\\'0 0 60 60\\' xmlns=\\'http://www.w3.org/2000/svg\\'%3E%3Cg fill=\\'none\\' fill-rule=\\'evenodd\\'%3E%3Cg fill=\\'%23ffffff\\' fill-opacity=\\'1\\'%3E%3Cpath d=\\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
      
      <div className="relative z-10 max-w-2xl mx-auto reveal-left">
        <h2 className="font-serif text-5xl md:text-7xl mb-8">RSVP</h2>
        <p className="font-sans text-stone-300 mb-12 text-lg">
          Please kindly respond by September 1st, 2026.
        </p>
        
        <form className="space-y-6 text-left" onSubmit={(e) => e.preventDefault()}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block font-sans text-xs tracking-widest uppercase mb-2 text-stone-400">First Name</label>
              <input type="text" className="w-full bg-transparent border-b border-stone-600 py-3 text-white focus:outline-none focus:border-gold-400 transition-colors" />
            </div>
            <div>
              <label className="block font-sans text-xs tracking-widest uppercase mb-2 text-stone-400">Last Name</label>
              <input type="text" className="w-full bg-transparent border-b border-stone-600 py-3 text-white focus:outline-none focus:border-gold-400 transition-colors" />
            </div>
          </div>
          <div>
            <label className="block font-sans text-xs tracking-widest uppercase mb-2 text-stone-400">Email Address</label>
            <input type="email" className="w-full bg-transparent border-b border-stone-600 py-3 text-white focus:outline-none focus:border-gold-400 transition-colors" />
          </div>
          <div>
            <label className="block font-sans text-xs tracking-widest uppercase mb-2 mt-8 text-stone-400">Will you be attending?</label>
            <div className="flex gap-8 mt-4">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-5 h-5 rounded-full border border-stone-500 group-hover:border-gold-400 flex items-center justify-center relative">
                  <input type="radio" name="attending" className="peer opacity-0 absolute" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gold-400 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                </div>
                <span className="font-serif text-xl">Joyfully Accept</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="w-5 h-5 rounded-full border border-stone-500 group-hover:border-gold-400 flex items-center justify-center relative">
                  <input type="radio" name="attending" className="peer opacity-0 absolute" />
                  <div className="w-2.5 h-2.5 rounded-full bg-gold-400 opacity-0 peer-checked:opacity-100 transition-opacity"></div>
                </div>
                <span className="font-serif text-xl">Regretfully Decline</span>
              </label>
            </div>
          </div>

          <button className="w-full mt-12 bg-gold-500 hover:bg-gold-400 text-white font-sans tracking-widest uppercase py-5 text-sm transition-colors duration-300">
            Send RSVP
          </button>
        </form>
      </div>
    </section>
  );
}
