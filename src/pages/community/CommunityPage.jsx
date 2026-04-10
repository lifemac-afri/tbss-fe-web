import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Users, BookOpen, Calendar } from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const ClubCard = ({ club, onJoined }) => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(club.is_member || false);

  const rawDate = club.next_meeting || club.meeting_date;
  const meetingDate = rawDate
    ? new Date(rawDate).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })
    : 'TBA';

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/community' } });
      return;
    }
    if (joined) return;
    setJoining(true);
    try {
      await api.post(`/api/book-clubs/${club.id}/join/`, {});
      setJoined(true);
      onJoined?.();
    } catch {
      // silently fail
    } finally {
      setJoining(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
      <div className="aspect-[16/7] bg-gray-100 overflow-hidden">
        {club.image ? (
          <img src={club.image} alt={club.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-orange-50">
            <BookOpen size={40} className="text-[#F46B03] opacity-30" />
          </div>
        )}
      </div>
      <div className="p-5 flex flex-col flex-1">
        <h3 className="font-bold text-gray-900 text-base mb-3">{club.name}</h3>

        <div className="space-y-1.5 mb-4">
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <BookOpen size={13} className="flex-shrink-0 text-[#F46B03]" />
            <span className="line-clamp-1">{club.description}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-500">
            <Calendar size={13} className="flex-shrink-0 text-[#F46B03]" />
            <span>Next meeting: {meetingDate}</span>
          </div>
        </div>

        <div className="mt-auto flex gap-2">
          <button
            onClick={handleJoin}
            disabled={joining || joined}
            className={`flex-1 text-sm font-semibold rounded-full px-4 py-2 transition-colors ${
              joined
                ? 'bg-green-100 text-green-700 cursor-default'
                : joining
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-[#F46B03] hover:bg-[#C15300] text-white'
            }`}
          >
            {joined ? 'Joined' : joining ? 'Joining…' : 'Join Club'}
          </button>
        </div>
      </div>
    </div>
  );
};

const SkeletonClubCard = () => (
  <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden animate-pulse">
    <div className="aspect-[16/7] bg-gray-100" />
    <div className="p-5 space-y-3">
      <div className="h-4 bg-gray-100 rounded w-2/3" />
      <div className="h-3 bg-gray-100 rounded" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
      <div className="h-9 bg-gray-100 rounded-full mt-4" />
    </div>
  </div>
);

const CommunityPage = () => {
  const [clubs, setClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchClubs = () => {
    setLoading(true);
    setError('');
    api.get('/api/book-clubs/')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        const list = Array.isArray(data) ? data : data.results || [];
        setClubs(list);
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load book clubs.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchClubs();
  }, []);

  return (
    <>
      <Helmet>
        <title>Book Clubs — TBSS Community</title>
        <meta name="description" content="Join a book club community at TBSS. Read together, discuss, and grow." />
      </Helmet>

      <div className="bg-gray-50 min-h-screen">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Header */}
          <div className="mb-10 text-center max-w-2xl mx-auto">
            <div className="inline-flex items-center gap-2 bg-orange-50 text-[#F46B03] text-xs font-semibold px-4 py-1.5 rounded-full mb-4">
              <Users size={14} />
              Active Community
            </div>
            <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-3">TBSS Book Clubs</h1>
            <p className="text-gray-500 text-sm leading-relaxed">
              Join a community of passionate readers. Explore books together, share insights, and attend monthly discussions.
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map((i) => <SkeletonClubCard key={i} />)}
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <svg width="180" height="160" viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
                {/* Table */}
                <rect x="20" y="120" width="140" height="8" rx="4" fill="#E5E7EB"/>
                <rect x="30" y="128" width="10" height="20" rx="3" fill="#D1D5DB"/>
                <rect x="140" y="128" width="10" height="20" rx="3" fill="#D1D5DB"/>
                {/* Chair left */}
                <rect x="12" y="110" width="40" height="6" rx="3" fill="#D1D5DB"/>
                <rect x="16" y="116" width="8" height="18" rx="2" fill="#E5E7EB"/>
                <rect x="36" y="116" width="8" height="18" rx="2" fill="#E5E7EB"/>
                {/* Chair right */}
                <rect x="128" y="110" width="40" height="6" rx="3" fill="#D1D5DB"/>
                <rect x="132" y="116" width="8" height="18" rx="2" fill="#E5E7EB"/>
                <rect x="152" y="116" width="8" height="18" rx="2" fill="#E5E7EB"/>
                {/* Person 1 silhouette - left */}
                <circle cx="42" cy="72" r="14" fill="#FED7AA"/>
                <path d="M22 112 Q22 92 42 92 Q62 92 62 112" fill="#FED7AA"/>
                {/* Person 2 silhouette - right */}
                <circle cx="138" cy="72" r="14" fill="#C7D2FE"/>
                <path d="M118 112 Q118 92 138 92 Q158 92 158 112" fill="#C7D2FE"/>
                {/* Empty chair middle - highlighted */}
                <rect x="70" y="108" width="40" height="6" rx="3" fill="#FDBA74"/>
                <rect x="74" y="114" width="8" height="18" rx="2" fill="#FED7AA"/>
                <rect x="98" y="114" width="8" height="18" rx="2" fill="#FED7AA"/>
                {/* Question mark above empty chair */}
                <circle cx="90" cy="58" r="18" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.5"/>
                <text x="90" y="65" textAnchor="middle" fontSize="18" fontWeight="bold" fill="#F97316">?</text>
                {/* Disconnected dots */}
                <circle cx="62" cy="100" r="3" fill="#F46B03" opacity="0.4"/>
                <circle cx="72" cy="100" r="3" fill="#F46B03" opacity="0.3"/>
                <circle cx="108" cy="100" r="3" fill="#F46B03" opacity="0.3"/>
                <circle cx="118" cy="100" r="3" fill="#F46B03" opacity="0.4"/>
                {/* Book on table */}
                <rect x="78" y="114" width="24" height="4" rx="1" fill="#BBF7D0" opacity="0.8"/>
              </svg>
              <h3 className="text-gray-800 font-bold text-lg mb-1">Couldn't load book clubs</h3>
              <p className="text-gray-400 text-sm mb-5 max-w-xs">The community couldn't connect right now. Check your connection or try again shortly.</p>
              <button
                onClick={fetchClubs}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#F46B03] hover:bg-[#C15300] text-white text-sm font-semibold rounded-full transition-colors shadow-sm"
              >
                Try again
              </button>
            </div>
          ) : clubs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center px-4">
              <svg width="180" height="160" viewBox="0 0 180 160" fill="none" xmlns="http://www.w3.org/2000/svg" className="mb-6">
                {/* Table */}
                <rect x="20" y="120" width="140" height="8" rx="4" fill="#E5E7EB"/>
                <rect x="30" y="128" width="10" height="20" rx="3" fill="#D1D5DB"/>
                <rect x="140" y="128" width="10" height="20" rx="3" fill="#D1D5DB"/>
                {/* Empty chairs */}
                <rect x="12" y="110" width="40" height="6" rx="3" fill="#F3F4F6"/>
                <rect x="16" y="116" width="8" height="18" rx="2" fill="#E5E7EB"/>
                <rect x="36" y="116" width="8" height="18" rx="2" fill="#E5E7EB"/>
                <rect x="70" y="110" width="40" height="6" rx="3" fill="#F3F4F6"/>
                <rect x="74" y="116" width="8" height="18" rx="2" fill="#E5E7EB"/>
                <rect x="98" y="116" width="8" height="18" rx="2" fill="#E5E7EB"/>
                <rect x="128" y="110" width="40" height="6" rx="3" fill="#F3F4F6"/>
                <rect x="132" y="116" width="8" height="18" rx="2" fill="#E5E7EB"/>
                <rect x="152" y="116" width="8" height="18" rx="2" fill="#E5E7EB"/>
                {/* Open book on table */}
                <path d="M72 116 Q90 110 108 116" stroke="#D1D5DB" strokeWidth="2" fill="none"/>
                <rect x="72" y="114" width="18" height="4" rx="1" fill="#FED7AA" opacity="0.8"/>
                <rect x="90" y="114" width="18" height="4" rx="1" fill="#BFDBFE" opacity="0.8"/>
                {/* "Come join" speech bubble */}
                <rect x="54" y="30" width="72" height="48" rx="12" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.5"/>
                <path d="M82 78 L90 92 L98 78" fill="#FFF7ED" stroke="#FDBA74" strokeWidth="1.5"/>
                <path d="M84 78 L96 78" fill="#FFF7ED" stroke="none"/>
                <text x="90" y="54" textAnchor="middle" fontSize="22">📚</text>
                <text x="90" y="70" textAnchor="middle" fontSize="9" fill="#F97316" fontWeight="600">Be the first!</text>
              </svg>
              <h3 className="text-gray-800 font-bold text-lg mb-1">No book clubs yet</h3>
              <p className="text-gray-400 text-sm max-w-xs">New clubs are being formed. Check back soon or start your own reading group!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {clubs.map((club) => (
                <ClubCard key={club.id} club={club} onJoined={fetchClubs} />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default CommunityPage;
