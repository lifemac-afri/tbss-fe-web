import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import api from '../../lib/api';
import Spinner from '../../components/Spinner';

/**
 * Landing page after Google OAuth completes.
 *
 * Flow:
 *   Google → Django social_django callback → GoogleAuthCompleteView
 *   → redirect here with ?access={jwt_access_token}
 *
 * This page reads the token, fetches the user profile, stores everything
 * via AuthContext, then navigates to the app — identical end-state to a
 * normal email/password login.
 */
const GoogleCallbackPage = () => {
  const navigate = useNavigate();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const accessToken = params.get('access');
    const authError = params.get('error');

    // Clear token from URL immediately (don't leave it in browser history)
    window.history.replaceState({}, '', window.location.pathname);

    if (authError || !accessToken) {
      setError('Google sign-in failed. Please try again.');
      setTimeout(() => navigate('/login', { replace: true }), 3000);
      return;
    }

    // Store the access token so api.get('/api/users/me/') is authenticated
    api.setToken(accessToken);

    api.get('/api/users/me/')
      .then(res => {
        if (!res.ok) throw new Error('Failed to load profile');
        return res.json();
      })
      .then(user => {
        loginWithToken(user, accessToken);
        navigate(user.is_staff ? '/admin' : '/', { replace: true });
      })
      .catch(() => {
        setError('Could not load your profile. Please try signing in again.');
        api.setToken(null);
        setTimeout(() => navigate('/login', { replace: true }), 3000);
      });
  }, []);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-3">
          <p className="text-red-500 font-medium">{error}</p>
          <p className="text-sm text-gray-400">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      <div className="text-center space-y-4">
        <Spinner />
        <p className="text-sm text-gray-500">Signing you in with Google...</p>
      </div>
    </div>
  );
};

export default GoogleCallbackPage;
