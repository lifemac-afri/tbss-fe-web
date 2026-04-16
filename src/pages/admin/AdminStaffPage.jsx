import React, { useEffect, useState, useCallback } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../components/Toast';
import api from '../../lib/api';

const initials = (u) =>
  [u.first_name, u.last_name].filter(Boolean).map(s => s[0]).join('').toUpperCase() || u.email?.[0]?.toUpperCase() || '?';

const formatDate = (iso) => iso ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export default function AdminStaffPage() {
  const { get, put } = useAdmin();
  const toast = useToast();

  const [staff, setStaff] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [revoking, setRevoking] = useState(null);
  const [removing, setRemoving] = useState(null);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    try {
      const [staffData, inviteData] = await Promise.all([
        get('/api/admin/users/?is_staff=true&page_size=200'),
        api.get('/api/admin/staff/invites/').then(r => r.json()),
      ]);
      const list = Array.isArray(staffData) ? staffData : (staffData.results || []);
      setStaff(list);
      setInvites(Array.isArray(inviteData) ? inviteData : (inviteData.results || []));
    } catch {
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);

  const handleInvite = async (e) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;
    setSending(true);
    try {
      const res = await api.post('/api/admin/staff/invites/', { email: inviteEmail.trim().toLowerCase() });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Invite sent to ${inviteEmail}`);
        setInviteEmail('');
        fetchStaff();
      } else {
        toast.error(data.detail || 'Failed to send invite');
      }
    } catch {
      toast.error('Network error');
    } finally {
      setSending(false);
    }
  };

  const handleRevoke = async (inviteId) => {
    setRevoking(inviteId);
    try {
      const res = await api.del(`/api/admin/staff/invites/${inviteId}/`);
      if (res.ok) {
        toast.success('Invite revoked');
        setInvites(prev => prev.filter(i => i.id !== inviteId));
      }
    } catch {
      toast.error('Failed to revoke invite');
    } finally {
      setRevoking(null);
    }
  };

  const handleRemoveStaff = async (userId) => {
    if (!window.confirm('Remove this person from staff? They will lose admin access.')) return;
    setRemoving(userId);
    try {
      await put(`/api/admin/users/${userId}/`, { is_staff: false });
      toast.success('Staff access removed');
      setStaff(prev => prev.filter(u => u.id !== userId));
    } catch {
      toast.error('Failed to remove staff access');
    } finally {
      setRemoving(null);
    }
  };

  const pendingInvites = invites.filter(i => !i.used && !i.is_expired);

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Staff</h1>
        <p className="text-sm text-gray-500 mt-1">Manage team members with admin access.</p>
      </div>

      {/* Invite form */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-1">Invite a Staff Member</h2>
        <p className="text-xs text-gray-400 mb-4">They'll receive an email with a link to set up their account.</p>
        <form onSubmit={handleInvite} className="flex gap-3">
          <input
            type="email"
            placeholder="colleague@example.com"
            value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            required
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F46B03]/20 focus:border-[#F46B03] transition-colors"
          />
          <button type="submit" disabled={sending || !inviteEmail.trim()}
            className="px-5 py-2.5 bg-[#F46B03] text-white text-sm font-semibold rounded-xl hover:bg-[#C15300] disabled:opacity-50 transition-colors whitespace-nowrap">
            {sending ? 'Sending…' : 'Send Invite'}
          </button>
        </form>
      </div>

      {/* Pending invites */}
      {pendingInvites.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-800">Pending Invites</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {pendingInvites.map(invite => (
              <div key={invite.id} className="flex items-center justify-between px-6 py-3.5">
                <div>
                  <p className="text-sm font-medium text-gray-800">{invite.email}</p>
                  <p className="text-xs text-gray-400 mt-0.5">
                    Invited by {invite.invited_by_name} · {formatDate(invite.created_at)} · expires {formatDate(invite.expires_at)}
                  </p>
                </div>
                <button onClick={() => handleRevoke(invite.id)} disabled={revoking === invite.id}
                  className="text-xs font-medium px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors disabled:opacity-50">
                  {revoking === invite.id ? 'Revoking…' : 'Revoke'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current staff */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-800">Current Staff ({staff.length})</h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-[#F46B03] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {staff.map(user => {
              const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username;
              return (
                <div key={user.id} className="flex items-center justify-between px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F46B03]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[#F46B03]">{initials(user)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-800">{name}</p>
                        {user.is_superuser && (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 bg-purple-100 text-purple-700 rounded uppercase">Superuser</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-400">{user.email} · Joined {formatDate(user.date_joined)}</p>
                    </div>
                  </div>
                  {!user.is_superuser && (
                    <button onClick={() => handleRemoveStaff(user.id)} disabled={removing === user.id}
                      className="text-xs font-medium px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                      {removing === user.id ? 'Removing…' : 'Remove Access'}
                    </button>
                  )}
                  {user.is_superuser && (
                    <span className="text-xs text-gray-300 italic">Protected</span>
                  )}
                </div>
              );
            })}
            {staff.length === 0 && (
              <p className="text-center text-gray-400 text-sm py-10">No staff members found.</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
