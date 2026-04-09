import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, ExternalLink } from 'lucide-react';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');

  const { forgotPassword } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) { setError('Email is required'); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { setError('Enter a valid email address'); return; }

    setLoading(true);
    const result = await forgotPassword(email);
    setLoading(false);

    if (result.success) {
      setPreviewUrl(result.previewUrl || '');
      setSubmitted(true);
    } else {
      setError(result.error || 'Something went wrong. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-card px-8 pt-8 pb-10 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 font-poppins">Check your inbox</h2>
          <p className="text-sm text-gray-500 mb-1">
            If an account exists for
          </p>
          <p className="text-sm font-bold text-gray-800 mb-4">{email}</p>
          <p className="text-xs text-gray-400 mb-5">
            you will receive a password reset link shortly. Check your spam folder if you don't see it.
          </p>

          {/* Ethereal preview link (dev mode) */}
          {previewUrl && (
            <div className="mb-5 p-3 bg-orange-50 border border-orange-100 rounded-xl text-left">
              <p className="text-[11px] font-bold text-orange-700 uppercase tracking-wide mb-1.5">
                📬 Dev Mode — View email
              </p>
              <a
                href={previewUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-xs text-[#F46B03] hover:underline font-medium break-all"
              >
                <ExternalLink size={12} />
                Open email preview
              </a>
            </div>
          )}

          <Link to="/login">
            <Button variant="solid" className="w-full rounded-full">Back to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-card px-8 pt-8 pb-10 border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Forgot password?</h1>
          <p className="text-sm text-gray-500 mt-1">Enter your email and we'll send you a reset link</p>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="Email address"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError(''); }}
            error={error}
            required
            autoComplete="email"
          />
          <Button type="submit" variant="solid" className="w-full rounded-full py-3 mt-4" loading={loading}>
            Send Reset Link
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Remembered it?{' '}
          <Link to="/login" className="text-[#F46B03] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
