import React, { useEffect, useState } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Users, Calendar, BookOpen, Lock, ExternalLink, Loader2 } from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';

const ClubDetailPage = () => {
  const { slug } = useParams();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [club, setClub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/api/book-clubs/${slug}/`)
      .then(r => r.json())
      .then(data => {
        setClub(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [slug]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      navigate(`/login?returnTo=/community/book-clubs/${slug}`);
      return;
    }
    setJoining(true);
    try {
      await api.post(`/api/book-clubs/${slug}/join/`, {});
      setJoined(true);
    } catch {
      setJoined(true);
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-[#F46B03]" />
      </div>
    );
  }

  if (!club) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Club not found</h1>
        <p className="text-gray-500 mb-6">This book club doesn't exist or may have been removed.</p>
        <Link to="/community" className="text-[#F46B03] font-semibold hover:underline">← Back to Community</Link>
      </div>
    );
  }

  const memberCount = club.member_count || club.members || 0;
  const currentBook = club.current_book || club.currentBook;
  const pastReads = club.past_reads || club.pastReads || [];
  const nextMeeting = club.next_meeting || club.nextMeeting || '';
  const meetingLink = club.meeting_link || club.meetingLink || '#';
  const heroImage = club.cover_image || club.heroImage || club.image || 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=1200&q=80';
  const isMember = joined || club.is_member;

  return (
    <>
      <Helmet>
        <title>{club.name} — TBSS Community</title>
        <meta name="description" content={club.description} />
      </Helmet>

      <div className="bg-gray-50 min-h-screen">

        {/* Hero image */}
        <div className="w-full h-56 sm:h-72 overflow-hidden bg-gray-200">
          <img src={heroImage} alt={club.name} className="w-full h-full object-cover" />
        </div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-sm text-gray-400 mb-6">
            <Link to="/" className="hover:text-[#F46B03]">Home</Link>
            <span>›</span>
            <Link to="/community" className="hover:text-[#F46B03]">Community</Link>
            <span>›</span>
            <span className="text-gray-700 font-medium truncate">{club.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Main content */}
            <div className="lg:col-span-2 space-y-8">

              {/* Club header */}
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-3">{club.name}</h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1.5"><Users size={14} className="text-[#F46B03]" />{memberCount} members</span>
                  {nextMeeting && (
                    <span className="flex items-center gap-1.5"><Calendar size={14} className="text-[#F46B03]" />Next meeting: {nextMeeting}</span>
                  )}
                </div>
                <p className="text-gray-600 leading-relaxed">{club.description}</p>
              </div>

              {/* Current book */}
              {currentBook && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <BookOpen size={18} className="text-[#F46B03]" />
                    Book of the Month
                  </h2>
                  <div className="flex gap-5">
                    <img
                      src={currentBook.cover || currentBook.cover_image || currentBook.image || 'https://via.placeholder.com/96x128'}
                      alt={currentBook.title}
                      className="w-24 h-32 object-cover rounded-lg flex-shrink-0 shadow-sm"
                    />
                    <div className="flex flex-col justify-center">
                      <h3 className="font-bold text-gray-900 text-lg mb-1">{currentBook.title}</h3>
                      <p className="text-sm text-gray-500 mb-4">by {currentBook.author}</p>
                      <Link
                        to="/shop"
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#F46B03] hover:underline"
                      >
                        View in shop <ExternalLink size={13} />
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {/* Meeting details — gated */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Calendar size={18} className="text-[#F46B03]" />
                  Meeting Details
                </h2>
                {isAuthenticated && isMember ? (
                  <div>
                    {nextMeeting && (
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-semibold">Next meeting:</span> {nextMeeting}
                      </p>
                    )}
                    <p className="text-sm text-gray-600 mb-4">
                      <span className="font-semibold">Platform:</span> Zoom
                    </p>
                    <a
                      href={meetingLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 bg-[#F46B03] hover:bg-[#C15300] text-white text-sm font-semibold rounded-full px-5 py-2.5 transition-colors"
                    >
                      <ExternalLink size={14} />
                      Join Meeting
                    </a>
                  </div>
                ) : (
                  <div className="flex flex-col items-start gap-3 py-2">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Lock size={16} className="text-gray-400" />
                      <span className="text-sm">Join this club to see meeting details and the Zoom link.</span>
                    </div>
                    <button
                      onClick={handleJoin}
                      disabled={joining}
                      className="bg-[#F46B03] hover:bg-[#C15300] text-white text-sm font-semibold rounded-full px-5 py-2.5 transition-colors disabled:opacity-60 flex items-center gap-2"
                    >
                      {joining && <Loader2 size={14} className="animate-spin" />}
                      Join to see meeting details
                    </button>
                  </div>
                )}
              </div>

              {/* Past reads */}
              {pastReads.length > 0 && (
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-4">Past Reads</h2>
                  <ul className="space-y-3">
                    {pastReads.map((book, i) => (
                      <li key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                        <div>
                          <p className="text-sm font-semibold text-gray-800">{book.title}</p>
                          <p className="text-xs text-gray-400">by {book.author}</p>
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0 ml-4">{book.year}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-5">

              {/* Join CTA */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 text-center">
                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center mx-auto mb-3">
                  <Users size={24} className="text-[#F46B03]" />
                </div>
                <p className="font-bold text-gray-900 mb-1">{memberCount} members</p>
                <p className="text-xs text-gray-500 mb-4">Join the conversation</p>
                {isMember ? (
                  <Button variant="solid" className="w-full rounded-full">Joined ✓</Button>
                ) : (
                  <button
                    onClick={handleJoin}
                    disabled={joining}
                    className="w-full bg-[#F46B03] hover:bg-[#C15300] text-white font-semibold rounded-full py-2.5 text-sm transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
                  >
                    {joining && <Loader2 size={14} className="animate-spin" />}
                    Join Club
                  </button>
                )}
                {!isAuthenticated && (
                  <p className="text-xs text-gray-400 mt-2">
                    <Link to="/login" className="text-[#F46B03] hover:underline">Sign in</Link> to join
                  </p>
                )}
              </div>

              {/* Quick stats */}
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Books read</span>
                  <span className="font-semibold text-gray-900">{pastReads.length + (currentBook ? 1 : 0)}</span>
                </div>
                {currentBook && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Current book</span>
                    <span className="font-semibold text-gray-900 truncate ml-4 text-right">{currentBook.title}</span>
                  </div>
                )}
                {nextMeeting && (
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Next meeting</span>
                    <span className="font-semibold text-gray-900">{nextMeeting}</span>
                  </div>
                )}
              </div>

              <Link to="/community">
                <Button variant="outline" className="w-full rounded-full text-sm">← All Clubs</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ClubDetailPage;
