import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../lib/api';

const genres = ['Fiction', 'Non-Fiction', 'Business', 'Christian Literature', 'History', 'Self-Help', 'Science', 'Biographies'];
const frequencies = ['Daily', '3-4 times a week', 'Weekends only', 'Whenever I can'];
const timesPerDay = ['Less than 15 minutes', '15-30 minutes', '30-60 minutes', '1-2 hours', '2+ hours'];
const budgetRanges = ['₵50–₵100', '₵100–₵200', '₵200–₵500', '₵500+'];
const readingLevels = ['Beginner', 'Intermediate', 'Advanced'];
const audienceOptions = ['General Adult', 'Young Adult', 'Child', 'Student', 'Professional'];

const ReadingPlanPage = () => {
  const [form, setForm] = useState({
    goal: '',
    genres: [],
    frequency: '',
    time: '',
    budget: '',
    notes: '',
    reading_level: 'Intermediate',
    target_audience: 'General Adult',
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [apiError, setApiError] = useState('');
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const toggleGenre = (g) => {
    setForm((prev) => ({
      ...prev,
      genres: prev.genres.includes(g) ? prev.genres.filter((x) => x !== g) : [...prev.genres, g],
    }));
  };

  const validate = () => {
    const e = {};
    if (!form.goal.trim()) e.goal = 'Reading goal is required';
    if (form.genres.length === 0) e.genres = 'Select at least one genre';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      navigate('/login', { state: { returnTo: '/services/reading-plan' } });
      return;
    }
    if (!validate()) return;
    setLoading(true);
    setApiError('');

    const noteParts = [];
    if (form.goal) noteParts.push(`Goal: ${form.goal}`);
    if (form.frequency) noteParts.push(`Frequency: ${form.frequency}`);
    if (form.time) noteParts.push(`Time per day: ${form.time}`);
    if (form.budget) noteParts.push(`Budget: ${form.budget}`);
    if (form.notes) noteParts.push(form.notes);

    const payload = {
      genre_preference: form.genres.join(', '),
      target_audience: form.target_audience,
      reading_level: form.reading_level,
      additional_notes: noteParts.join(' | '),
    };

    try {
      const res = await api.post('/api/reading-plans/', payload);
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.detail || JSON.stringify(data) || 'Submission failed');
      }
      setSubmitted(true);
    } catch (err) {
      setApiError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-card px-8 py-12 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Plan Request Submitted!</h2>
          <p className="text-sm text-gray-500 mb-4">
            Expect your personalised reading plan within <strong>2–3 business days</strong>. We'll email it to your registered address once it's ready.
          </p>
          <button
            onClick={() => navigate('/dashboard/reading-plans')}
            className="text-sm text-[#F46B03] hover:underline font-medium"
          >
            View your reading plans →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 font-poppins mb-2">Request a Reading Plan</h1>
        <p className="text-gray-500 text-sm">Tell us about your reading goals and we'll curate a personalised book plan just for you.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl border border-gray-100 shadow-card p-8 space-y-6">

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reading Goal *</label>
          <textarea
            value={form.goal}
            onChange={(e) => { setForm((f) => ({ ...f, goal: e.target.value })); setErrors((err) => ({ ...err, goal: '' })); }}
            rows={3}
            placeholder="e.g. I want to read more African literature and improve my financial literacy..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F46B03] transition-colors resize-none"
          />
          {errors.goal && <p className="text-red-500 text-xs mt-1">{errors.goal}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Preferred Genres * (select all that apply)</label>
          <div className="flex flex-wrap gap-2">
            {genres.map((g) => (
              <button key={g} type="button" onClick={() => toggleGenre(g)}
                className={`px-4 py-1.5 rounded-full text-sm border transition-colors
                  ${form.genres.includes(g) ? 'bg-[#F46B03] text-white border-[#F46B03]' : 'border-gray-200 text-gray-600 hover:border-[#F46B03]'}`}>
                {g}
              </button>
            ))}
          </div>
          {errors.genres && <p className="text-red-500 text-xs mt-1">{errors.genres}</p>}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Target Audience</label>
          <select value={form.target_audience} onChange={(e) => setForm((f) => ({ ...f, target_audience: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03] bg-white">
            {audienceOptions.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Reading Level</label>
          <select value={form.reading_level} onChange={(e) => setForm((f) => ({ ...f, reading_level: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03] bg-white">
            {readingLevels.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Reading Frequency</label>
          <div className="space-y-2">
            {frequencies.map((f) => (
              <label key={f} className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                <input type="radio" name="frequency" value={f} checked={form.frequency === f}
                  onChange={(e) => setForm((prev) => ({ ...prev, frequency: e.target.value }))} className="accent-[#F46B03]" />
                {f}
              </label>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Time Per Day</label>
          <select value={form.time} onChange={(e) => setForm((f) => ({ ...f, time: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03] bg-white">
            <option value="">Select time</option>
            {timesPerDay.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Budget Range</label>
          <select value={form.budget} onChange={(e) => setForm((f) => ({ ...f, budget: e.target.value }))}
            className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#F46B03] bg-white">
            <option value="">Select budget</option>
            {budgetRanges.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1.5">Additional Notes</label>
          <textarea value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} rows={2}
            placeholder="Anything else you'd like us to know..."
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-[#F46B03] transition-colors resize-none" />
        </div>

        {apiError && (
          <p className="text-sm text-red-500 text-center font-medium bg-red-50 rounded-xl px-4 py-3">{apiError}</p>
        )}

        <Button type="submit" variant="solid" size="lg" className="w-full rounded-full" loading={loading}>
          Submit Request
        </Button>
      </form>
    </div>
  );
};

export default ReadingPlanPage;
