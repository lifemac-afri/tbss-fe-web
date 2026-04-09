import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import Button from '../../components/Button';
import Spinner from '../../components/Spinner';
import { useAuth } from '../../context/AuthContext';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState(token ? 'verifying' : 'pending');
  const [resending, setResending] = useState(false);
  const [resendMsg, setResendMsg] = useState('');
  const [resendEmail, setResendEmail] = useState('');

  const { verifyEmail, resendVerification } = useAuth();

  useEffect(() => {
    if (!token) return;
    verifyEmail(token).then((result) => {
      setStatus(result.success ? 'success' : 'error');
    });
  }, [token, verifyEmail]);

  const handleResend = async () => {
    if (!resendEmail) { setResendMsg('Please enter your email address.'); return; }
    setResending(true);
    setResendMsg('');
    const result = await resendVerification(resendEmail);
    setResending(false);
    setResendMsg(result.success ? '✅ Verification email sent! Check your inbox.' : (result.error || 'Failed to resend.'));
  };

  if (status === 'verifying') {
    return (
      <div className="w-full max-w-md text-center">
        <div className="bg-white rounded-2xl shadow-card px-8 py-12 border border-gray-100">
          <Spinner size="xl" className="mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Verifying your email…</p>
        </div>
      </div>
    );
  }

  if (status === 'success') {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-card px-8 py-10 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <CheckCircle size={32} className="text-green-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 font-poppins">Email Verified!</h2>
          <p className="text-sm text-gray-500 mb-6">
            Your email has been verified successfully. You can now sign in to your account.
          </p>
          <Link to="/login">
            <Button variant="solid" className="w-full rounded-full">Go to Sign In</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-card px-8 py-10 border border-gray-100 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-5">
            <XCircle size={32} className="text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 font-poppins">Verification Failed</h2>
          <p className="text-sm text-gray-500 mb-5">
            This link is invalid or has expired. Enter your email to request a new one.
          </p>

          <input
            type="email"
            value={resendEmail}
            onChange={(e) => setResendEmail(e.target.value)}
            placeholder="Your email address"
            className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-[#F46B03] mb-3"
          />

          {resendMsg && (
            <p className={`text-xs mb-3 ${resendMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
              {resendMsg}
            </p>
          )}

          <Button variant="solid" className="w-full rounded-full mb-3" onClick={handleResend} loading={resending}>
            <RefreshCw size={14} className="mr-1.5" />
            Resend Verification Email
          </Button>
          <Link to="/login" className="text-sm text-gray-500 hover:text-[#F46B03]">Back to Sign In</Link>
        </div>
      </div>
    );
  }

  // status === 'pending' (no token — direct navigation)
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl shadow-card px-8 py-10 border border-gray-100 text-center">
        <div className="text-5xl mb-4">📬</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2 font-poppins">Check your email</h2>
        <p className="text-sm text-gray-500 mb-5">
          Enter your email below to resend the verification link.
        </p>

        <input
          type="email"
          value={resendEmail}
          onChange={(e) => setResendEmail(e.target.value)}
          placeholder="Your email address"
          className="w-full h-11 px-4 rounded-xl border border-gray-200 text-sm text-gray-800 outline-none focus:border-[#F46B03] mb-3"
        />

        {resendMsg && (
          <p className={`text-xs mb-3 ${resendMsg.startsWith('✅') ? 'text-green-600' : 'text-red-500'}`}>
            {resendMsg}
          </p>
        )}

        <Button variant="solid" className="w-full rounded-full mb-3" onClick={handleResend} loading={resending}>
          Send Verification Email
        </Button>
        <Link to="/login" className="text-sm text-gray-500 hover:text-[#F46B03]">Back to Sign In</Link>
      </div>
    </div>
  );
};

export default VerifyEmailPage;
