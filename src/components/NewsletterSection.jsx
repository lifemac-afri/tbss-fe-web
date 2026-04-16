import React, { useState } from 'react';
import Turnstile from '@marsidev/react-turnstile';
import api from '../lib/api';

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || '';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [token, setToken] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setError('');

    if (SITE_KEY && !token) {
      setError('Please complete the safety check.');
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/api/newsletter/subscribe/', { 
        email: email.trim(), 
        captcha_token: token 
      });
      if (res.ok || res.status === 201) {
        setSubmitted(true);
        setEmail('');
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.detail || 'Something went wrong. Please try again.');
        // Turnstile usually auto-resets on failure if configured, 
        // but we can force it by resetting the state if needed.
      }
    } catch {
      setError('Could not connect. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="w-full bg-[#EFA87A] py-12 px-6">
      <div className="max-w-2xl mx-auto text-center">
        <p className="text-white font-bold font-poppins text-lg sm:text-xl mb-8 leading-snug">
          Subscribe to our newsletter for newest<br />book updates
        </p>

        {submitted ? (
          <p className="text-white font-poppins text-sm bg-white/20 rounded-xl px-8 py-4 inline-block">
            Thank you for subscribing! 🎉
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="relative flex items-center w-full">
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Your email address"
                required
                className="w-full pl-6 pr-[120px] sm:pr-[140px] py-4 text-sm font-poppins text-gray-700 bg-[#F5CBA8] outline-none border-none rounded-full shadow-sm"
              />
              <button
                type="submit"
                disabled={loading}
                className="absolute right-1.5 top-1/2 -translate-y-1/2 bg-[#F46B03] hover:bg-[#C15300] transition-colors text-white font-bold font-poppins text-[11px] sm:text-xs tracking-wide px-4 sm:px-6 h-10 rounded-full whitespace-nowrap disabled:opacity-70 shadow-sm"
              >
                {loading ? '…' : 'SUBSCRIBE'}
              </button>
            </div>

            {SITE_KEY && (
              <div className="flex justify-center">
                <Turnstile 
                  siteKey={SITE_KEY} 
                  onSuccess={(token) => setToken(token)}
                  onError={() => setError('Turnstile verification failed.')}
                  onExpire={() => setToken('')}
                  options={{ theme: 'light' }}
                />
              </div>
            )}

            {error && (
              <p className="text-white/90 text-xs bg-white/20 rounded-lg px-4 py-2 inline-block">
                {error}
              </p>
            )}
          </form>
        )}
      </div>
    </section>
  );
};

export default NewsletterSection;
