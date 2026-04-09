import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { CheckCircle, Mail, ExternalLink, RefreshCw } from 'lucide-react';

const GOOGLE_ICON = (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

const passwordRules = [
  { label: 'At least 8 characters', test: (v) => v.length >= 8 },
  { label: 'At least one uppercase letter', test: (v) => /[A-Z]/.test(v) },
  { label: 'At least one number', test: (v) => /[0-9]/.test(v) },
];

const PasswordStrength = ({ password }) => {
  if (!password) return null;
  return (
    <div className="mt-2 space-y-1 pl-1">
      {passwordRules.map((rule) => (
        <div key={rule.label} className={`flex items-center gap-2 text-xs ${rule.test(password) ? 'text-green-600' : 'text-gray-400'}`}>
          <CheckCircle size={12} className={rule.test(password) ? 'text-green-500' : 'text-gray-300'} />
          {rule.label}
        </div>
      ))}
    </div>
  );
};

const RegisterPage = () => {
  const [form, setForm] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');

  const { register, resendVerification } = useAuth();

  const validate = () => {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = 'Full name is required';
    if (!form.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Enter a valid email address';
    if (!form.password) newErrors.password = 'Password is required';
    else {
      if (form.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
      else if (!/[A-Z]/.test(form.password)) newErrors.password = 'Password must contain an uppercase letter';
      else if (!/[0-9]/.test(form.password)) newErrors.password = 'Password must contain a number';
    }
    if (!form.confirmPassword) newErrors.confirmPassword = 'Please confirm your password';
    else if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field) => (e) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: '' }));
    setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    const result = await register({ name: form.name, email: form.email, password: form.password });
    setLoading(false);

    if (result.success) {
      setPreviewUrl(result.previewUrl || '');
      setRegistered(true);
    } else {
      setApiError(result.error || 'Registration failed. Please try again.');
    }
  };

  const handleResend = async () => {
    setResending(true);
    setResendMessage('');
    const result = await resendVerification(form.email);
    setResending(false);
    if (result.previewUrl) setPreviewUrl(result.previewUrl);
    setResendMessage(result.success ? 'Verification email resent!' : (result.error || 'Failed to resend.'));
  };

  if (registered) {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-card px-8 pt-8 pb-10 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <Mail size={32} className="text-[#F46B03]" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 font-poppins">Check your email</h2>
          <p className="text-sm text-gray-500 mb-1">
            We sent a verification link to
          </p>
          <p className="text-sm font-bold text-gray-800 mb-4">{form.email}</p>
          <p className="text-xs text-gray-400 mb-5">
            Click the link in your inbox to activate your account. Check your spam folder if you don't see it.
          </p>

          {/* Ethereal preview link (dev convenience) */}
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

          {resendMessage && (
            <p className={`text-xs mb-3 ${resendMessage.includes('resent') ? 'text-green-600' : 'text-red-500'}`}>
              {resendMessage}
            </p>
          )}

          <Button
            type="button"
            variant="outline"
            className="w-full rounded-full mb-4"
            onClick={handleResend}
            loading={resending}
          >
            <RefreshCw size={14} className="mr-1.5" />
            Resend Verification Email
          </Button>

          <p className="text-sm text-gray-400">
            Already verified?{' '}
            <Link to="/login" className="text-[#F46B03] font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-card px-8 pt-8 pb-10 border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Create your account</h1>
          <p className="text-sm text-gray-500 mt-1">Join TBSS and start discovering great books</p>
        </div>

        <button
          type="button"
          className="w-full flex items-center justify-center gap-3 border border-gray-200 rounded-lg py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors mb-5"
        >
          {GOOGLE_ICON}
          Sign up with Google
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="flex-1 h-px bg-gray-200" />
          <span className="text-xs text-gray-400 font-medium">or sign up with email</span>
          <div className="flex-1 h-px bg-gray-200" />
        </div>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Input label="Full Name" type="text" value={form.name} onChange={handleChange('name')} error={errors.name} required autoComplete="name" />
          <Input label="Email address" type="email" value={form.email} onChange={handleChange('email')} error={errors.email} required autoComplete="email" />
          <Input label="Password" type="password" value={form.password} onChange={handleChange('password')} error={errors.password} required autoComplete="new-password" />
          <PasswordStrength password={form.password} />
          <Input label="Confirm Password" type="password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} error={errors.confirmPassword} required autoComplete="new-password" />

          <p className="text-xs text-gray-400 mt-3 mb-4">
            By creating an account you agree to our{' '}
            <Link to="/terms" className="text-[#F46B03] hover:underline">Terms of Service</Link>
            {' '}and{' '}
            <Link to="/privacy" className="text-[#F46B03] hover:underline">Privacy Policy</Link>.
          </p>

          <Button type="submit" variant="solid" className="w-full rounded-full py-3" loading={loading}>
            Create Account
          </Button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-[#F46B03] font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
};

export default RegisterPage;
