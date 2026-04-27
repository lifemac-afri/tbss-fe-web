import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { X, Cookie } from 'lucide-react';

const CONSENT_KEY = 'tbss_cookie_consent';

export default function CookieConsentBanner() {
  const [visible, setVisible] = useState(false);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(CONSENT_KEY);
    if (!stored) {
      const t = setTimeout(() => setVisible(true), 900);
      return () => clearTimeout(t);
    }
  }, []);

  const dismiss = (value) => {
    setLeaving(true);
    setTimeout(() => {
      localStorage.setItem(CONSENT_KEY, value);
      setVisible(false);
      setLeaving(false);
    }, 300);
  };

  if (!visible) return null;

  return (
    <div
      className={`fixed bottom-0 inset-x-0 z-[90] px-4 pb-4 sm:pb-6 transition-all duration-300 ${
        leaving ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden">
        {/* Orange accent bar */}
        <div className="h-1 bg-gradient-to-r from-[#F46B03] to-[#EFA87A]" />

        <div className="p-5 sm:p-6">
          <div className="flex items-start gap-4">
            {/* Icon */}
            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center flex-shrink-0">
              <Cookie size={20} className="text-[#F46B03]" />
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1.5">
                <p className="font-bold text-gray-900 text-sm font-poppins">We value your privacy</p>
                <button
                  onClick={() => dismiss('rejected')}
                  className="ml-3 flex-shrink-0 w-7 h-7 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 transition-colors"
                  aria-label="Close"
                >
                  <X size={13} />
                </button>
              </div>

              <p className="text-xs text-gray-500 leading-relaxed mb-4">
                We use cookies and similar technologies to enhance your browsing experience, analyse site
                traffic, and personalise content. Essential cookies are always active. By clicking{' '}
                <strong className="text-gray-700">"Accept All"</strong>, you consent to the use of all cookies.
                You can learn more in our{' '}
                <Link to="/privacy" className="text-[#F46B03] hover:underline font-medium">
                  Privacy & Cookie Policy
                </Link>
                .
              </p>

              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => dismiss('accepted')}
                  className="px-5 py-2 bg-[#F46B03] text-white text-xs font-bold rounded-full hover:bg-[#C15300] transition-colors shadow-sm"
                >
                  Accept All Cookies
                </button>
                <button
                  onClick={() => dismiss('rejected')}
                  className="px-5 py-2 border border-gray-200 text-gray-600 text-xs font-semibold rounded-full hover:bg-gray-50 transition-colors"
                >
                  Reject Non-essential
                </button>
                <Link
                  to="/privacy"
                  className="text-xs text-gray-400 hover:text-[#F46B03] transition-colors underline underline-offset-2"
                >
                  Cookie Policy
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
