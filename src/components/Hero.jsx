import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import heroImage from '../assets/img/hero.png';
import Button from './Button';
import { API_BASE } from '../lib/api';

// Each position: ~12% smaller than the previous.
// Width drives height via aspect-[2/3]; items-end aligns all bottoms.
const BOOK_WIDTHS = [
  'w-36 md:w-44 lg:w-56',   // pos 0 — foreground, largest
  'w-32 md:w-40 lg:w-48',   // pos 1
  'w-28 md:w-32 lg:w-40',   // pos 2
  'w-24 md:w-28 lg:w-36',   // pos 3 — background, smallest
];

// Negative margin ≈ 1/3 of that book's own width (left third hidden behind previous).
const BOOK_MARGINS = [
  '',
  '-ml-11 md:-ml-14 lg:-ml-16',
  '-ml-9  md:-ml-11 lg:-ml-[53px]',
  '-ml-8  md:-ml-9  lg:-ml-12',
];

const Hero = () => {
  const [images, setImages] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/hero-images/`)
      .then((r) => r.ok ? r.json() : [])
      .then((data) => setImages(Array.isArray(data) ? data : []))
      .catch(() => setImages([]));
  }, []);

  const books = images && images.length > 0 ? images.slice(0, 4) : null;

  return (
    <div className="flex flex-col md:flex-row items-center justify-center min-h-[300px] md:min-h-[440px] gap-8 md:gap-10 lg:gap-20 py-8 md:py-10">
      <div className="text-center md:text-left max-w-xl lg:max-w-2xl px-4 md:px-0">
        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-aclonica leading-tight tracking-tight text-black">
          <span className='whitespace-nowrap'>Discover Your Next</span>
          <span className="block text-[#F46B03]">Favourite Book.</span>
        </h1>
        <p className="text-xs sm:text-sm md:text-base lg:text-lg font-poppins text-gray-500 font-light mt-4 mb-8 mx-auto md:mx-0 leading-relaxed max-w-lg lg:max-w-xl">
          Build your personal library, one great book at a time. Browse thousands of titles across every genre.
        </p>
        <div className="flex flex-wrap justify-center md:justify-start items-center gap-4">
          <Link to="/shop">
            <Button variant="solid" size="lg" className="rounded-full px-8">
              Shop Now
            </Button>
          </Link>
          <Link to="/community">
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Join Community
            </Button>
          </Link>
        </div>
      </div>

      <div className="flex justify-center flex-shrink-0 w-full md:w-auto px-6 md:px-0">
        {books ? (
          <div
            className="flex items-end"
            style={{ filter: 'drop-shadow(0 24px 48px rgba(0,0,0,0.18))' }}
          >
            {books.map((img, i) => (
              <div
                key={img.id}
                className={`flex-shrink-0 ${BOOK_MARGINS[i]}`}
                style={{ zIndex: books.length - i }}
              >
                <img
                  src={img.image_url}
                  alt=""
                  className={`${BOOK_WIDTHS[i]} aspect-[2/3] object-cover rounded shadow-lg`}
                />
              </div>
            ))}
          </div>
        ) : (
          <img
            src={heroImage}
            alt="Hero Books"
            className="w-full max-w-[260px] sm:max-w-[300px] md:max-w-[320px] lg:max-w-none lg:h-auto lg:max-h-[500px] object-contain drop-shadow-2xl"
          />
        )}
      </div>
    </div>
  );
};

export default Hero;
