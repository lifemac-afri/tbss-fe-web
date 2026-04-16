import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../components/Toast';
import api from '../../lib/api';

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
    {children}
  </div>
);

const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F46B03]/20 focus:border-[#F46B03] transition-colors";

export default function AdminSettingsPage() {
  const { currentUser, updateProfile } = useAuth();
  const toast = useToast();

  const [profile, setProfile] = useState({
    first_name: currentUser?.first_name || '',
    last_name: currentUser?.last_name || '',
  });
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwords, setPasswords] = useState({ old_password: '', new_password: '', confirm: '' });
  const [savingPw, setSavingPw] = useState(false);
  const [pwError, setPwError] = useState('');

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSavingProfile(true);
    const result = await updateProfile(profile);
    setSavingProfile(false);
    if (result.success) toast.success('Profile updated');
    else toast.error(result.error || 'Update failed');
  };

  const handlePasswordSave = async (e) => {
    e.preventDefault();
    setPwError('');
    if (passwords.new_password !== passwords.confirm) {
      setPwError('New passwords do not match.');
      return;
    }
    if (passwords.new_password.length < 8) {
      setPwError('Password must be at least 8 characters.');
      return;
    }
    setSavingPw(true);
    const res = await api.post('/api/users/me/change-password/', {
      old_password: passwords.old_password,
      new_password: passwords.new_password,
    });
    const data = await res.json();
    setSavingPw(false);
    if (res.ok) {
      toast.success('Password changed');
      setPasswords({ old_password: '', new_password: '', confirm: '' });
    } else {
      setPwError(data.detail || data.old_password?.[0] || 'Failed to change password');
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your admin profile and account security.</p>
      </div>

      {/* Profile */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-1">Profile</h2>
        <p className="text-xs text-gray-400 mb-5">Your name as it appears across the admin panel.</p>
        <form onSubmit={handleProfileSave} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="First Name">
              <input className={inputCls} value={profile.first_name}
                onChange={e => setProfile(p => ({ ...p, first_name: e.target.value }))} />
            </Field>
            <Field label="Last Name">
              <input className={inputCls} value={profile.last_name}
                onChange={e => setProfile(p => ({ ...p, last_name: e.target.value }))} />
            </Field>
          </div>
          <Field label="Email Address">
            <input className={`${inputCls} bg-gray-50 text-gray-400 cursor-not-allowed`}
              value={currentUser?.email || ''} readOnly />
            <p className="text-xs text-gray-400 mt-1">Email cannot be changed here.</p>
          </Field>
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingProfile}
              className="px-5 py-2.5 bg-[#F46B03] text-white text-sm font-semibold rounded-xl hover:bg-[#C15300] disabled:opacity-50 transition-colors">
              {savingProfile ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        </form>
      </div>

      {/* Password */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-1">Change Password</h2>
        <p className="text-xs text-gray-400 mb-5">Use a strong password you don't use elsewhere.</p>
        <form onSubmit={handlePasswordSave} className="space-y-4">
          <Field label="Current Password">
            <input type="password" className={inputCls} value={passwords.old_password}
              onChange={e => setPasswords(p => ({ ...p, old_password: e.target.value }))} autoComplete="current-password" />
          </Field>
          <Field label="New Password">
            <input type="password" className={inputCls} value={passwords.new_password}
              onChange={e => setPasswords(p => ({ ...p, new_password: e.target.value }))} autoComplete="new-password" />
          </Field>
          <Field label="Confirm New Password">
            <input type="password" className={inputCls} value={passwords.confirm}
              onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} autoComplete="new-password" />
          </Field>
          {pwError && <p className="text-sm text-red-500">{pwError}</p>}
          <div className="flex justify-end pt-2">
            <button type="submit" disabled={savingPw || !passwords.old_password || !passwords.new_password}
              className="px-5 py-2.5 bg-gray-900 text-white text-sm font-semibold rounded-xl hover:bg-gray-700 disabled:opacity-50 transition-colors">
              {savingPw ? 'Saving…' : 'Change Password'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
