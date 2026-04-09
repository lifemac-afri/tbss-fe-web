import React from 'react';

const subNavData = {
  Genre: [
    'All Books', 'Christian Literature', 'History', 'Mindset',
    'Novels', 'Business', 'Personal Growth', 'Diaries'
  ],
  Bestsellers: [
    'All Bestsellers', 'Fiction', 'Non-Fiction', 'Children',
    'Academic', 'Self-Help'
  ],
  Games: [
    'All Games', 'Board Games', 'Card Games', 'Puzzles',
    'Educational', 'Strategy'
  ],
  Stationeries: [
    'All Stationeries', 'Pens', 'Notebooks', 'Art Supplies',
    'Office Supplies', 'Gift Wrap'
  ],
  Blogs: [
    'All Blogs', 'Book Reviews', 'Author Interviews', 'Reading Lists',
    'Industry News'
  ],
  Community: [
    'All Community', 'Book Clubs', 'Events', 'Discussions',
    'Recommendations'
  ],
};

const SubNav = ({ activeMainItem, activeSubItem, onSubItemClick }) => {
  const items = subNavData[activeMainItem] || [];
  if (items.length === 0) return null;

  return (
    <nav className="w-full bg-white py-3">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-center gap-3 overflow-x-auto scrollbar-hide">
          {items.map((item) => {
            const isActive = activeSubItem === item || (!activeSubItem && item === items[0]);
            return (
              <button
                key={item}
                onClick={() => onSubItemClick?.(item)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 cursor-pointer
                  ${isActive
                    ? 'bg-[#F46B03] text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-800'
                  }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>
    </nav>
  );
};

export { subNavData };
export default SubNav;
