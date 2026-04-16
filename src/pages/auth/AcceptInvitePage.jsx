import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../../lib/api';
import { useToast } from '../../components/Toast';
import logo from '../../assets/logo/logo.png';

export default function AcceptInvitePage() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const navigate = useNavigate();
  const toast = useToast();

  const [form, setForm] = useState({ first_name: '', last_name: '', password: '', confirm: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <p className="text-red-500 font-medium">Invalid invite link.</p>
          <button onClick={() => navigate('/login')} className="mt-4 text-sm text-[#F46B03] hover:underline">
            Go to login
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) { setError('Passwords do not match.'); return; }
    if (form.password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    try {
      const res = await api.post('/api/auth/accept-invite/', {
        token,
        first_name: form.first_name,
        last_name: form.last_name,
        password: form.password,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success('Account created! Please sign in.');
        navigate('/login', { replace: true });
      } else {
        setError(data.detail || 'Something went wrong.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F46B03]/20 focus:border-[#F46B03] transition-colors";

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-7">
          <img src={logo} alt="TBSS" className="h-10 w-auto mx-auto mb-5" />
          <h1 className="text-2xl font-bold text-gray-900">Set up your account</h1>
          <p className="text-sm text-gray-500 mt-1">You've been invited to join the TBSS team.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">First Name</label>
              <input required className={inputCls} value={form.first_name}
                onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5">Last Name</label>
              <input className={inputCls} value={form.last_name}
                onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} />
            </div>
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Password</label>
            <input required type="password" className={inputCls} value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))} autoComplete="new-password" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5">Confirm Password</label>
            <input required type="password" className={inputCls} value={form.confirm}
              onChange={e => setForm(f => ({ ...f, confirm: e.target.value }))} autoComplete="new-password" />
          </div>

          {error && <p className="text-sm text-red-500">{error}</p>}

          <button type="submit" disabled={loading}
            className="w-full py-3 bg-[#F46B03] text-white font-semibold rounded-xl hover:bg-[#C15300] disabled:opacity-50 transition-colors mt-2">
            {loading ? 'Creating account…' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}
