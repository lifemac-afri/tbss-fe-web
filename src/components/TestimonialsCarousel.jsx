import React, { useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const TESTIMONIALS = [
  {
    name: 'Akosua Mensah',
    initials: 'AM',
    text: 'TBSS has completely transformed my reading experience. The book selections are incredible and delivery is always on time. I\'ve discovered so many great Ghanaian authors!',
  },
  {
    name: 'Kwame Darko',
    initials: 'KD',
    text: 'I love how easy it is to discover new books. The recommendations are spot on and the prices are unbeatable. My whole family now shops here.',
  },
  {
    name: 'Ama Asante',
    initials: 'AA',
    text: 'The community feature is wonderful. I\'ve connected with so many fellow readers and discovered books I never would have found on my own. Highly recommend!',
  },
  {
    name: 'Kofi Boateng',
    initials: 'KB',
    text: 'From ordering to delivery, the experience is seamless. The staff are knowledgeable and always happy to help you find exactly what you\'re looking for.',
  },
];

const TestimonialsCarousel = () => {
  const [current, setCurrent] = useState(0);
  const [animating, setAnimating] = useState(false);

  const goTo = useCallback((index) => {
    if (animating) return;
    setAnimating(true);
    setCurrent((index + TESTIMONIALS.length) % TESTIMONIALS.length);
    setTimeout(() => setAnimating(false), 400);
  }, [animating]);

  useEffect(() => {
    const timer = setInterval(() => goTo(current + 1), 5500);
    return () => clearInterval(timer);
  }, [current, goTo]);

  const t = TESTIMONIALS[current];

  return (
    <section className="w-full bg-[#F9B27A] py-16 sm:py-24 px-6 sm:px-12 relative overflow-hidden">
      <div className="max-w-4xl mx-auto relative px-4 sm:px-0">
        <button
          onClick={() => goTo(current - 1)}
          aria-label="Previous"
          className="absolute left-[-1.5rem] sm:left-[-4rem] top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors"
        >
          <ChevronLeft size={28} />
        </button>

        <button
          onClick={() => goTo(current + 1)}
          aria-label="Next"
          className="absolute right-[-1.5rem] sm:right-[-4rem] top-1/2 -translate-y-1/2 z-10 w-10 h-10 flex items-center justify-center rounded-full text-white hover:bg-white/20 transition-colors"
        >
          <ChevronRight size={28} />
        </button>

        <div
          className="flex flex-col sm:flex-row items-center gap-8 sm:gap-12"
          style={{ transition: 'opacity 0.4s', opacity: animating ? 0 : 1 }}
        >
          <div className="flex-shrink-0 w-28 h-28 rounded-full bg-[#F46B03] flex items-center justify-center shadow-lg text-white text-3xl font-bold font-aclonica">
            {t.initials}
          </div>

          <div className="flex-1 text-center sm:text-left">
            <span className="text-5xl leading-none text-white/60 font-serif select-none">"</span>
            <p className="text-white text-base sm:text-lg font-poppins leading-relaxed -mt-3 mb-4">
              {t.text}
            </p>
            <span className="text-5xl leading-none text-white/60 font-serif select-none block text-right -mt-6">"</span>
            <p className="text-white/80 font-semibold font-poppins text-sm mt-2">— {t.name}</p>
          </div>
        </div>

        <div className="flex justify-center gap-2 mt-8">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                i === current ? 'bg-white scale-125' : 'bg-white/40'
              }`}
              aria-label={`Go to testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialsCarousel;
