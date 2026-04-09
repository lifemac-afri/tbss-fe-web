import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import PromoBanners from '../components/PromoBanners';
import BookSection from '../components/BookSection';
import CommunityBanner from '../components/CommunityBanner';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import CategoryBentoGrid from '../components/CategoryBentoGrid';
import NewsletterSection from '../components/NewsletterSection';
import GlobalSearch from '../components/GlobalSearch';
import api from '../lib/api';
import { normalizeProduct } from '../lib/normalizeProduct';

const fetchSection = (param) =>
  api.get(`/api/products/?${param}&page_size=12&is_active=true`)
    .then(r => r.json())
    .then(data => {
      const list = Array.isArray(data) ? data : (data.results || []);
      return list.map(normalizeProduct);
    })
    .catch(() => []);

const fetchBestsellers = () =>
  fetchSection('is_bestseller=true').then(list => {
    if (list.length > 0) return list.slice(0, 5);
    return fetchSection('ordering=id').then(fallback => fallback.slice(0, 5));
  });

const HomePage = () => {
  const [bestsellers, setBestsellers] = useState([]);
  const [todaysDeals, setTodaysDeals] = useState([]);
  const [greatReads, setGreatReads] = useState([]);

  useEffect(() => {
    fetchBestsellers().then(setBestsellers);
    fetchSection('is_todays_deal=true').then(setTodaysDeals);
    fetchSection('is_great_read=true').then(setGreatReads);
  }, []);

  return (
    <div className="bg-gray-50">
      <GlobalSearch />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 pb-16">
        <Hero />
        <PromoBanners />
      </div>

      <div>
        {bestsellers.length > 0 && (
          <BookSection title="Bestsellers" books={bestsellers.slice(0, 5)} viewAllHref="/shop?sort=bestsellers" />
        )}
        {todaysDeals.length > 0 && (
          <BookSection title="Today's Deals" books={todaysDeals} viewAllHref="/shop?sort=deals" />
        )}

        <CommunityBanner />

        {greatReads.length > 0 && (
          <BookSection title="Great Reads" books={greatReads} viewAllHref="/shop?sort=great-reads" />
        )}

        <TestimonialsCarousel />
        <CategoryBentoGrid />
        <NewsletterSection />
      </div>
    </div>
  );
};

export default HomePage;
