import { Calendar, Clock, MapPin } from "lucide-react";

export function DetailsSection() {
  return (
    <section className="py-24 md:py-40 px-6 max-w-6xl mx-auto bg-stone-100 overflow-hidden">
      <div className="text-center mb-20 reveal-left">
        <span className="font-sans tracking-widest text-gold-500 uppercase text-sm mb-4 block">When & Where</span>
        <h2 className="font-serif text-4xl md:text-6xl">The Details</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-16 md:gap-24">
        <div className="flex flex-col items-center text-center reveal-left bg-white p-10 md:p-16 rounded-[2rem] shadow-sm transform transition-transform hover:-translate-y-2 duration-500">
          <h3 className="font-serif text-3xl mb-8 border-b border-stone-200 pb-6 inline-block">Ceremony</h3>
          <div className="space-y-6 text-stone-600">
            <div className="flex flex-col items-center">
              <Calendar className="w-5 h-5 mb-2 text-gold-400" />
              <p>Saturday, October 24th, 2026</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-5 h-5 mb-2 text-gold-400" />
              <p>3:00 PM in the Afternoon</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-5 h-5 mb-2 text-gold-400" />
              <p><strong>St. Patrick's Cathedral</strong></p>
              <p className="text-sm">5th Ave, New York, NY 10022</p>
            </div>
          </div>
          <button className="mt-10 px-8 py-3 border whitespace-nowrap border-stone-300 text-stone-600 font-sans tracking-widest uppercase text-xs hover:bg-stone-800 hover:text-white transition-colors duration-300">
            View Map
          </button>
        </div>

        <div className="flex flex-col items-center text-center reveal-right bg-white p-10 md:p-16 rounded-[2rem] shadow-sm transform transition-transform hover:-translate-y-2 duration-500">
          <h3 className="font-serif text-3xl mb-8 border-b border-stone-200 pb-6 inline-block">Reception</h3>
          <div className="space-y-6 text-stone-600">
            <div className="flex flex-col items-center">
              <Calendar className="w-5 h-5 mb-2 text-gold-400" />
              <p>Saturday, October 24th, 2026</p>
            </div>
            <div className="flex flex-col items-center">
              <Clock className="w-5 h-5 mb-2 text-gold-400" />
              <p>5:30 PM Onwards</p>
            </div>
            <div className="flex flex-col items-center">
              <MapPin className="w-5 h-5 mb-2 text-gold-400" />
              <p><strong>The Plaza Hotel</strong></p>
              <p className="text-sm">768 5th Ave, New York, NY 10019</p>
            </div>
          </div>
          <button className="mt-10 px-8 py-3 border whitespace-nowrap border-stone-300 text-stone-600 font-sans tracking-widest uppercase text-xs hover:bg-stone-800 hover:text-white transition-colors duration-300">
            View Map
          </button>
        </div>
      </div>
    </section>
  );
}
