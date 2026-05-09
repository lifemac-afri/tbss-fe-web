import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import PromoBanners from '../components/PromoBanners';
import BookSection from '../components/BookSection';
import CommunityBanner from '../components/CommunityBanner';
import TestimonialsCarousel from '../components/TestimonialsCarousel';
import CategoryBentoGrid from '../components/CategoryBentoGrid';
import NewsletterSection from '../components/NewsletterSection';
import GlobalSearch from '../components/GlobalSearch';
import { API_BASE } from '../lib/api';
import { normalizeProduct } from '../lib/normalizeProduct';
import SEO from '../components/SEO';

const HomePage = () => {
  const [homepageData, setHomepageData] = useState(null);

  useEffect(() => {
    fetch(`${API_BASE}/api/homepage/`)
      .then(r => r.ok ? r.json() : null)
      .then(data => setHomepageData(data))
      .catch(() => {});
  }, []);

  const bestsellers = (
    homepageData?.bestsellers?.length > 0
      ? homepageData.bestsellers
      : (homepageData?.new_arrivals || [])
  ).slice(0, 5).map(normalizeProduct);

  const todaysDeals = (homepageData?.todays_deals || []).map(normalizeProduct);
  const greatReads = (homepageData?.great_reads || []).map(normalizeProduct);

  return (
    <div className="bg-white">
      <SEO
        title="Home"
        description="Ghana's leading bookshop and reading community. Shop the best textbooks, stationery, and join our vibrant reading community."
        canonicalUrl="/"
      />
      <GlobalSearch />

      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-12">
        <Hero heroImages={homepageData?.hero_images} />
        <PromoBanners />
      </div>

      <div>
        {bestsellers.length > 0 && (
          <BookSection title="Bestsellers" books={bestsellers} viewAllHref="/shop?sort=bestsellers" />
        )}
        {todaysDeals.length > 0 && (
          <BookSection title="Today's Deals" books={todaysDeals} viewAllHref="/shop?sort=deals" />
        )}

        <CommunityBanner />

        {greatReads.length > 0 && (
          <BookSection title="Great Reads" books={greatReads} viewAllHref="/shop?sort=great-reads" />
        )}

        <TestimonialsCarousel />
        <CategoryBentoGrid games={homepageData?.games} stationery={homepageData?.stationery} />
        <NewsletterSection />
      </div>
    </div>
  );
};

export default HomePage;
