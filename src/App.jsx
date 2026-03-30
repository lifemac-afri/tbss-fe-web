import './App.css'
import { useState } from 'react'
import MainNav from './components/MainNav'
import SubNav from './components/SubNav'
import SearchBar from './components/SearchBar'
import Hero from './components/Hero'
import BookCard from './components/BookCard'

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

      <Hero />

      {/* Page content area - Book Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          <BookCard />
          <BookCard 
            title="The 7 Habits of Highly Effective People"
            author="Stephen R. Covey"
            rating={4.8}
            reviews={1240}
            price={180}
          />
          <BookCard 
            title="Atomic Habits"
            author="James Clear"
            rating={4.9}
            reviews={2540}
            price={220}
          />
          <BookCard 
            title="Think and Grow Rich"
            author="Napoleon Hill"
            rating={4.7}
            reviews={850}
            price={160}
          />
          <BookCard 
            title="Rich Dad Poor Dad"
            author="Robert Kiyosaki"
            rating={4.6}
            reviews={980}
            price={150}
          />
        </div>
      </main>
    </div>
  )
}

export default App
