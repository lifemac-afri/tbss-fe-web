import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import Input from '../../components/Input';
import Button from '../../components/Button';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import { CheckCircle } from 'lucide-react';

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

const ResetPasswordPage = () => {
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [loading, setLoading] = useState(false);
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const toast = useToast();
  const { resetPassword } = useAuth();

  const validate = () => {
    const newErrors = {};
    if (!form.password) newErrors.password = 'Password is required';
    else if (form.password.length < 8) newErrors.password = 'Minimum 8 characters';
    else if (!/[A-Z]/.test(form.password)) newErrors.password = 'Must include an uppercase letter';
    else if (!/[0-9]/.test(form.password)) newErrors.password = 'Must include a number';
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
    const result = await resetPassword({ token, password: form.password });
    setLoading(false);

    if (result.success) {
      toast.success('Password reset successfully! Please sign in.');
      navigate('/login');
    } else {
      setApiError(result.error || 'Password reset failed. The link may have expired.');
    }
  };

  if (!token) {
    return (
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-card px-8 py-10 border border-gray-100">
          <p className="text-red-600 text-sm mb-4">Invalid or expired reset link.</p>
          <Link to="/forgot-password">
            <Button variant="solid" className="rounded-full">Request a new link</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-card px-8 pt-8 pb-10 border border-gray-100">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900 font-poppins">Set new password</h1>
          <p className="text-sm text-gray-500 mt-1">Choose a strong password for your account</p>
        </div>

        {apiError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {apiError}
            {apiError.includes('expired') && (
              <Link to="/forgot-password" className="block mt-1 text-[#F46B03] hover:underline font-medium">
                Request a new reset link →
              </Link>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Input
            label="New Password"
            type="password"
            value={form.password}
            onChange={handleChange('password')}
            error={errors.password}
            required
            autoComplete="new-password"
          />
          <PasswordStrength password={form.password} />
          <Input
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={handleChange('confirmPassword')}
            error={errors.confirmPassword}
            required
            autoComplete="new-password"
          />
          <Button type="submit" variant="solid" className="w-full rounded-full py-3 mt-4" loading={loading}>
            Reset Password
          </Button>
        </form>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
