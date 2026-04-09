import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Calendar, ExternalLink, BookOpen } from 'lucide-react';
import api from '../../lib/api';

const BookClubsDashPage = () => {
  const navigate = useNavigate();
  const [tab, setTab] = useState('joined');
  const [joinedClubs, setJoinedClubs] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(null);

  useEffect(() => {
    Promise.all([
      api.get('/api/users/me/book-clubs/').then(r => r.json()).catch(() => []),
      api.get('/api/book-clubs/?page_size=50').then(r => r.json()).catch(() => []),
    ]).then(([myClubs, allData]) => {
      const myList = Array.isArray(myClubs) ? myClubs : myClubs.results || [];
      const allList = Array.isArray(allData) ? allData : allData.results || [];
      setJoinedClubs(myList);
      setAllClubs(allList);
      setLoading(false);
    });
  }, []);

  const joinedIds = new Set(joinedClubs.map(c => c.id || c.book_club?.id));
  const discoverClubs = allClubs.filter(c => !joinedIds.has(c.id));
  const display = tab === 'joined' ? joinedClubs : discoverClubs;

  const handleJoin = async (clubId) => {
    setJoining(clubId);
    try {
      await api.post(`/api/book-clubs/${clubId}/join/`);
      const joined = allClubs.find(c => c.id === clubId);
      if (joined) setJoinedClubs(prev => [...prev, joined]);
    } catch {
      // if error, ignore
    } finally {
      setJoining(null);
    }
  };

  const getClubData = (item) => {
    return item.book_club || item;
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Book Clubs</h2>
        <p className="text-sm text-gray-500 mt-1">Communities you read with</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        {['joined', 'discover'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
              tab === t
                ? 'bg-[#F46B03] text-white border-[#F46B03]'
                : 'bg-white text-gray-600 border-gray-200 hover:border-[#F46B03] hover:text-[#F46B03]'
            }`}
          >
            {t === 'joined' ? `Joined (${joinedClubs.length})` : `Discover (${discoverClubs.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse overflow-hidden">
              <div className="h-24 bg-gray-100" />
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-1/3" />
              </div>
            </div>
          ))}
        </div>
      ) : display.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <Users size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium">
            {tab === 'joined' ? "You haven't joined any clubs yet" : 'No more clubs to discover'}
          </p>
          {tab === 'joined' && (
            <button
              onClick={() => setTab('discover')}
              className="mt-4 px-5 py-2 bg-[#F46B03] text-white rounded-full text-sm font-semibold hover:bg-[#C15300] transition-colors"
            >
              Discover Clubs
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {display.map((item) => {
            const club = getClubData(item);
            return (
              <div key={club.id} className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
                {club.hero_image || club.heroImage || club.image ? (
                  <div
                    className="h-24 bg-cover bg-center relative"
                    style={{ backgroundImage: `url(${club.hero_image || club.heroImage || club.image})` }}
                  >
                    <div className="absolute inset-0 bg-black/40" />
                    <div className="absolute bottom-3 left-4">
                      <p className="text-white font-bold text-base leading-tight">{club.name}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-24 bg-[#F46B03]/10 relative flex items-end px-4 pb-3">
                    <p className="font-bold text-gray-800 text-base">{club.name}</p>
                  </div>
                )}

                <div className="p-4 space-y-3">
                  <div className="flex items-center gap-4 text-xs text-gray-500">
                    <span className="flex items-center gap-1"><Users size={12} /> {club.members_count || club.members || 0} members</span>
                    {club.meeting_schedule && (
                      <span className="flex items-center gap-1"><Calendar size={12} /> {club.meeting_schedule}</span>
                    )}
                  </div>

                  {club.current_book && (
                    <div className="flex items-center gap-3 bg-orange-50 rounded-xl p-3">
                      {club.current_book.cover_image && (
                        <img src={club.current_book.cover_image} alt={club.current_book.title} className="w-10 h-14 object-cover rounded-lg flex-shrink-0" />
                      )}
                      <div className="min-w-0">
                        <p className="text-[10px] font-semibold text-[#F46B03] uppercase tracking-wider mb-0.5 flex items-center gap-1">
                          <BookOpen size={10} /> Currently Reading
                        </p>
                        <p className="text-sm font-semibold text-gray-800 line-clamp-1">{club.current_book.title}</p>
                        {club.current_book.author && <p className="text-xs text-gray-500">{club.current_book.author}</p>}
                      </div>
                    </div>
                  )}

                  {club.description && (
                    <p className="text-xs text-gray-500 line-clamp-2">{club.description}</p>
                  )}

                  <div className="flex gap-2">
                    <button
                      onClick={() => navigate(`/community/book-clubs/${club.slug || club.id}`)}
                      className="flex-1 py-2 border border-gray-200 text-sm font-medium text-gray-600 rounded-full hover:border-[#F46B03] hover:text-[#F46B03] transition-colors"
                    >
                      View Club
                    </button>
                    {tab === 'joined' && club.meeting_link && (
                      <a
                        href={club.meeting_link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-4 py-2 bg-[#F46B03] text-white text-sm font-medium rounded-full hover:bg-[#C15300] transition-colors"
                      >
                        <ExternalLink size={13} /> Join Meeting
                      </a>
                    )}
                    {tab === 'discover' && (
                      <button
                        onClick={() => handleJoin(club.id)}
                        disabled={joining === club.id}
                        className="px-4 py-2 bg-[#F46B03] text-white text-sm font-medium rounded-full hover:bg-[#C15300] transition-colors disabled:opacity-50"
                      >
                        {joining === club.id ? 'Joining…' : 'Join Club'}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default BookClubsDashPage;
