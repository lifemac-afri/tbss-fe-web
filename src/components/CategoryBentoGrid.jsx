import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import api from '../lib/api';
import stat1 from '../assets/img/stat1.jpeg';
import stat2 from '../assets/img/stat2.jpeg';
import stat3 from '../assets/img/stat3.jpeg';
import game1 from '../assets/img/game1.jpeg';
import game2 from '../assets/img/game2.jpeg';
import game3 from '../assets/img/game3.jpeg';


const GAMES_PLACEHOLDER = [
  game1,
  game2,
  game3,
  game1, // Fallback if 4 are needed
];

const STATIONERY_PLACEHOLDER = [
  stat1,
  stat2,
  stat3,
  stat1, // Fallback if 4 are needed
];

const BentoGrid = ({ images, label, href, ctaLabel }) => {
  const imgs = [...images];
  while (imgs.length < 3) imgs.push(null);

  return (
    <div>
      <h3 className="text-2xl font-bold font-poppins text-gray-900 mb-4">{label}</h3>
      <div className="flex gap-2 h-96">
        {/* Large left cell */}
        <div style={{ flex: '1.6' }} className="relative rounded-2xl overflow-hidden group">
          {imgs[0] ? (
            <img
              src={imgs[0]}
              alt={label}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
            />
          ) : (
            <div className="w-full h-full bg-gray-200" />
          )}
          <Link
            to={href}
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end p-6"
          >
            <span className="text-white font-bold font-poppins text-2xl leading-tight">
              {ctaLabel.split(' ').map((word, i) => (
                <span key={i} className="block">{word}</span>
              ))}
            </span>
          </Link>
        </div>

        {/* Right column — two stacked cells */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex-1 rounded-2xl overflow-hidden">
            {imgs[1] ? (
              <img
                src={imgs[1]}
                alt=""
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>
          <div className="flex-1 rounded-2xl overflow-hidden">
            {imgs[2] ? (
              <img
                src={imgs[2]}
                alt=""
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gray-200" />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const CategoryBentoGrid = () => {
  const [gameImages, setGameImages] = useState(GAMES_PLACEHOLDER);
  const [stationeryImages, setStationeryImages] = useState(STATIONERY_PLACEHOLDER);

  useEffect(() => {
    api.get('/api/products/?category=games&page_size=4&is_active=true')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || []);
        const imgs = list.map(p => p.image).filter(Boolean);
        setGameImages([
          imgs[0] || GAMES_PLACEHOLDER[0],
          imgs[1] || GAMES_PLACEHOLDER[1],
          imgs[2] || GAMES_PLACEHOLDER[2],
        ]);
      })
      .catch(() => {});

    api.get('/api/products/?category=stationery&page_size=4&is_active=true')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : (data.results || []);
        const imgs = list.map(p => p.image).filter(Boolean);
        setStationeryImages([
          imgs[0] || STATIONERY_PLACEHOLDER[0],
          imgs[1] || STATIONERY_PLACEHOLDER[1],
          imgs[2] || STATIONERY_PLACEHOLDER[2],
        ]);
      })
      .catch(() => {});
  }, []);

  return (
    <section className="w-full px-4 sm:px-6 lg:px-8 py-16">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          <BentoGrid
            images={gameImages}
            label="Games"
            href="/shop?category=games"
            ctaLabel="Explore Games"
          />
          <BentoGrid
            images={stationeryImages}
            label="Stationeries"
            href="/shop?category=stationery"
            ctaLabel="Explore Stationeries"
          />
        </div>
      </div>
    </section>
  );
};

export default CategoryBentoGrid;
