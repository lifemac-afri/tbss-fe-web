import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BookOpen, CheckCircle, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import api from '../../lib/api';

const bookStatusIcon = (status) => {
  if (status === 'completed') return <CheckCircle size={14} className="text-green-500 flex-shrink-0" />;
  if (status === 'reading') return <BookOpen size={14} className="text-[#F46B03] flex-shrink-0" />;
  return <Clock size={14} className="text-gray-300 flex-shrink-0" />;
};

const PlanCard = ({ plan }) => {
  const [expanded, setExpanded] = useState(plan.status === 'pending' || plan.status === 'ready');

  const STATUS_MAP = {
    pending:    { label: 'Pending',    cls: 'bg-amber-50 text-amber-600' },
    processing: { label: 'Processing', cls: 'bg-blue-50 text-blue-600' },
    ready:      { label: 'Ready',      cls: 'bg-green-50 text-green-600' },
    rejected:   { label: 'Rejected',   cls: 'bg-red-50 text-red-600' },
  };
  const { label: statusLabel, cls: statusClass } = STATUS_MAP[plan.status] || { label: plan.status, cls: 'bg-gray-50 text-gray-600' };

  const formatDate = (iso) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const genres = plan.genre_preference
    ? plan.genre_preference.split(',').map(g => g.trim()).filter(Boolean)
    : [];

  return (
    <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm">
      <div className="p-4 lg:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${statusClass}`}>
                {statusLabel}
              </span>
            </div>
            <h3 className="font-bold text-gray-800 text-base">
              {plan.genre_preference ? `${plan.genre_preference.split(',')[0].trim()} Reading Plan` : 'Reading Plan'}
            </h3>
            <p className="text-xs text-gray-500 mt-0.5">
              {plan.reading_level && `${plan.reading_level} · `}
              {plan.target_audience && `${plan.target_audience} · `}
              Requested {formatDate(plan.created_at)}
            </p>
          </div>
          <button onClick={() => setExpanded((v) => !v)} className="flex-shrink-0 p-1 text-gray-400 hover:text-gray-600">
            {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="border-t border-gray-100 p-4 lg:p-5 space-y-3">
          {genres.length > 0 && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Preferred Genres</p>
              <div className="flex flex-wrap gap-1.5">
                {genres.map(g => (
                  <span key={g} className="text-xs bg-orange-50 text-orange-700 px-2.5 py-1 rounded-full">{g}</span>
                ))}
              </div>
            </div>
          )}
          {plan.additional_notes && (
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Notes</p>
              <p className="text-sm text-gray-600 leading-relaxed">{plan.additional_notes}</p>
            </div>
          )}
          {plan.admin_response && (
            <div className="bg-green-50 rounded-xl p-3 border border-green-100">
              <p className="text-xs font-semibold text-green-700 uppercase tracking-wider mb-1">Your Reading Plan from TBSS</p>
              <p className="text-sm text-green-800 leading-relaxed whitespace-pre-line">{plan.admin_response}</p>
              {plan.responded_at && (
                <p className="text-[10px] text-green-600 mt-2">
                  Delivered {new Date(plan.responded_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </p>
              )}
            </div>
          )}
          {plan.status === 'pending' && (
            <p className="text-xs text-amber-600 bg-amber-50 rounded-xl px-3 py-2">
              Your reading plan request is being reviewed. Expect a personalised response within 2–3 business days.
            </p>
          )}
          {plan.status === 'processing' && (
            <p className="text-xs text-blue-600 bg-blue-50 rounded-xl px-3 py-2">
              Our team is currently working on your personalised reading plan.
            </p>
          )}
          {plan.status === 'rejected' && (
            <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">
              We were unable to fulfil this request. Please contact us for more information.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

const ReadingPlansDashPage = () => {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/reading-plans/')
      .then(r => r.json())
      .then(data => {
        const list = Array.isArray(data) ? data : data.results || [];
        setPlans(list);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Reading Plans</h2>
          <p className="text-sm text-gray-500 mt-1">Your personalised reading journeys</p>
        </div>
        <button
          onClick={() => navigate('/services/reading-plan')}
          className="flex-shrink-0 px-4 py-2 bg-[#F46B03] text-white text-sm font-semibold rounded-full hover:bg-[#C15300] transition-colors"
        >
          + New Plan
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse">
              <div className="h-4 bg-gray-100 rounded w-1/3 mb-3" />
              <div className="h-5 bg-gray-100 rounded w-2/3 mb-2" />
              <div className="h-3 bg-gray-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : plans.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
          <BookOpen size={36} className="mx-auto text-gray-200 mb-3" />
          <p className="text-gray-500 font-medium mb-4">No reading plans yet</p>
          <button
            onClick={() => navigate('/services/reading-plan')}
            className="px-5 py-2 bg-[#F46B03] text-white text-sm font-semibold rounded-full hover:bg-[#C15300] transition-colors"
          >
            Request a Plan
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReadingPlansDashPage;
