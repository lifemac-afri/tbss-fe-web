import React, { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import BookCard from './BookCard';

const BookSection = ({ title, books, viewAllHref }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const displayedBooks = viewAllHref ? books.slice(0, 5) : (isExpanded ? books : books.slice(0, 5));

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-normal font-poppins text-black">{title}</h2>
        {viewAllHref ? (
          <Link
            to={viewAllHref}
            className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-black transition-colors group"
          >
            View All
            <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform duration-300" />
          </Link>
        ) : (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1.5 text-[13px] font-medium text-gray-500 hover:text-black transition-colors group"
          >
            {isExpanded ? 'Show Less' : 'View All'}
            <ArrowRight size={14} className={`transition-transform duration-300 ${isExpanded ? 'rotate-180' : 'group-hover:translate-x-1'}`} />
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
        {displayedBooks.map((book, index) => (
          <BookCard key={index} {...book} />
        ))}
      </div>
    </section>
  );
};

export default BookSection;
