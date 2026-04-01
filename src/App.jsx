import './App.css'
import { useState } from 'react'
import MainNav from './components/MainNav'
import SubNav from './components/SubNav'
import SearchBar from './components/SearchBar'
import Hero from './components/Hero'
import PromoBanners from './components/PromoBanners'
import BookSection from './components/BookSection'
import CommunityBanner from './components/CommunityBanner'
import { trendingBooks, bestsellerBooks } from './data/books'

function App() {
  const [activeMainItem, setActiveMainItem] = useState('Genre');
  const [activeSubItem, setActiveSubItem] = useState(null);

  const handleMainItemClick = (item) => {
    setActiveMainItem(item);
    setActiveSubItem(null); // Reset sub-nav selection when main nav changes
  };

  const handleSearch = (query) => {
    console.log('Search query:', query);
  };

  return (
    <div className="min-h-screen bg-gray-50 font-poppins">
      <MainNav
        activeItem={activeMainItem}
        onItemClick={handleMainItemClick}
      />
      <div className="flex flex-col items-center bg-white border-b border-gray-200">
        <div className="w-fit">
          <SubNav
            activeMainItem={activeMainItem}
            activeSubItem={activeSubItem}
            onSubItemClick={setActiveSubItem}
          />
          <SearchBar onSearch={handleSearch} />
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Hero />
        <PromoBanners />
      </div>

      <main className="pb-20">
        <BookSection title="Trending" books={trendingBooks} />
        <BookSection title="Bestsellers" books={bestsellerBooks} />
        <CommunityBanner />
      </main>
    </div>
  )
}

export default App
