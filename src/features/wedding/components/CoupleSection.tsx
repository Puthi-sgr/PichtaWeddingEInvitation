import { Heart } from "lucide-react";

export function CoupleSection() {
  return (
    <section className="py-24 md:py-40 px-6 md:px-12 max-w-7xl mx-auto overflow-hidden">
      <div className="text-center mb-16 md:mb-24 reveal-left">
        <Heart className="w-8 h-8 mx-auto mb-6 text-gold-500 stroke-1" />
        <h2 className="font-serif text-4xl md:text-6xl mb-6">The Couple</h2>
        <p className="font-sans text-stone-500 max-w-2xl mx-auto leading-relaxed">
          Two souls with but a single thought, two hearts that beat as one. We invite you to share in our joy as we exchange vows and begin our new life together.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center">
        <div className="order-2 md:order-1 text-center md:text-right reveal-left">
          <h3 className="font-serif text-3xl mb-4">Emma Watson</h3>
          <p className="text-stone-500 mb-6 leading-relaxed">
            A lover of art, long walks in the evening, and finding beauty in the little things. She brings light to every room she enters.
          </p>
        </div>
        <div className="order-1 md:order-2 img-parallax-container overflow-hidden rounded-[2rem] h-[60vh] md:h-[80vh] relative reveal-right">
          <img 
            src="https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&q=80&w=1000" 
            alt="Emma" 
            className="img-parallax w-full h-[130%] object-cover absolute top-0"
          />
        </div>

        <div className="order-3 img-parallax-container overflow-hidden rounded-[2rem] h-[60vh] md:h-[80vh] relative reveal-left mt-12 md:mt-0">
          <img 
            src="https://images.unsplash.com/photo-1522673607200-164d1b6ce486?auto=format&fit=crop&q=80&w=1000" 
            alt="James" 
            className="img-parallax w-full h-[130%] object-cover absolute top-0"
          />
        </div>
        <div className="order-4 text-center md:text-left reveal-right">
          <h3 className="font-serif text-3xl mb-4">James Harrison</h3>
          <p className="text-stone-500 mb-6 leading-relaxed">
            An adventurer at heart, always seeking the next great story to tell. He is the anchor and the sails, guiding us towards our future.
          </p>
        </div>
      </div>
    </section>
  );
}
