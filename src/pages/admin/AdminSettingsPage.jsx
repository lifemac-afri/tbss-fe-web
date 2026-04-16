import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../components/Toast';
import api from '../../lib/api';

// ── Shared helpers ────────────────────────────────────────────────────────────

const inputCls = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F46B03]/20 focus:border-[#F46B03] transition-colors";

const Field = ({ label, children }) => (
  <div>
    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">{label}</label>
    {children}
  </div>
);

const formatDate = (iso) => iso
  ? new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
  : '—';

const formatDateTime = (iso) => iso
  ? new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
  : '—';

const initials = (u) =>
  [u.first_name, u.last_name].filter(Boolean).map(s => s[0]).join('').toUpperCase()
  || u.email?.[0]?.toUpperCase() || '?';

// ── Tab: Profile ──────────────────────────────────────────────────────────────

function ProfileTab() {
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
    if (passwords.new_password !== passwords.confirm) { setPwError('Passwords do not match.'); return; }
    if (passwords.new_password.length < 8) { setPwError('Password must be at least 8 characters.'); return; }
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
    <div className="space-y-6 max-w-xl">
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
          <div className="flex justify-end pt-1">
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
          <div className="flex justify-end pt-1">
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

// ── Tab: Staff ────────────────────────────────────────────────────────────────

function StaffTab() {
  const { get, put } = useAdmin();
  const toast = useToast();

  const [staff, setStaff] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [revoking, setRevoking] = useState(null);
  const [removing, setRemoving] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const [staffData, inviteRes] = await Promise.all([
        get('/api/admin/users/?is_staff=true&page_size=200'),
        api.get('/api/admin/staff/invites/').then(r => r.json()),
      ]);
      setStaff(Array.isArray(staffData) ? staffData : (staffData.results || []));
      setInvites(Array.isArray(inviteRes) ? inviteRes : (inviteRes.results || []));
    } catch {
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

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
        fetchAll();
      } else {
        toast.error(data.detail || 'Failed to send invite');
      }
    } catch { toast.error('Network error'); }
    finally { setSending(false); }
  };

  const handleRevoke = async (id) => {
    setRevoking(id);
    try {
      const res = await api.del(`/api/admin/staff/invites/${id}/`);
      if (res.ok) { toast.success('Invite revoked'); setInvites(p => p.filter(i => i.id !== id)); }
    } catch { toast.error('Failed to revoke'); }
    finally { setRevoking(null); }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Remove staff access for this person?')) return;
    setRemoving(userId);
    try {
      await put(`/api/admin/users/${userId}/`, { is_staff: false });
      toast.success('Staff access removed');
      setStaff(p => p.filter(u => u.id !== userId));
    } catch { toast.error('Failed to remove'); }
    finally { setRemoving(null); }
  };

  const pending = invites.filter(i => !i.used && !i.is_expired);

  return (
    <div className="space-y-6">
      {/* Invite */}
      <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
        <h2 className="font-bold text-gray-800 mb-1">Invite a Staff Member</h2>
        <p className="text-xs text-gray-400 mb-4">They'll receive an email with a 7-day link to set up their account.</p>
        <form onSubmit={handleInvite} className="flex gap-3">
          <input type="email" placeholder="colleague@example.com" required value={inviteEmail}
            onChange={e => setInviteEmail(e.target.value)}
            className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#F46B03]/20 focus:border-[#F46B03] transition-colors" />
          <button type="submit" disabled={sending || !inviteEmail.trim()}
            className="px-5 py-2.5 bg-[#F46B03] text-white text-sm font-semibold rounded-xl hover:bg-[#C15300] disabled:opacity-50 transition-colors whitespace-nowrap">
            {sending ? 'Sending…' : 'Send Invite'}
          </button>
        </form>
      </div>

      {/* Pending invites */}
      {pending.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h2 className="font-bold text-gray-800">Pending Invites <span className="text-xs font-normal text-gray-400 ml-1">({pending.length})</span></h2>
          </div>
          <div className="divide-y divide-gray-50">
            {pending.map(invite => (
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

      {/* Staff list */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-800">Current Staff <span className="text-xs font-normal text-gray-400 ml-1">({staff.length})</span></h2>
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-28">
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
                  {!user.is_superuser ? (
                    <button onClick={() => handleRemove(user.id)} disabled={removing === user.id}
                      className="text-xs font-medium px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                      {removing === user.id ? 'Removing…' : 'Remove Access'}
                    </button>
                  ) : (
                    <span className="text-xs text-gray-300 italic">Protected</span>
                  )}
                </div>
              );
            })}
            {staff.length === 0 && <p className="text-center text-gray-400 text-sm py-10">No staff members found.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

// ── Tab: Audit Log ────────────────────────────────────────────────────────────

const ACTION_COLORS = {
  'order.': 'bg-blue-50 text-blue-700',
  'user.': 'bg-purple-50 text-purple-700',
  'staff.': 'bg-orange-50 text-orange-700',
  'product.': 'bg-green-50 text-green-700',
};
const actionColor = (action) => {
  for (const [prefix, cls] of Object.entries(ACTION_COLORS)) {
    if (action.startsWith(prefix)) return cls;
  }
  return 'bg-gray-100 text-gray-600';
};

function AuditLogTab() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [expanded, setExpanded] = useState(null);
  const [actionFilter, setActionFilter] = useState('');
  const PAGE_SIZE = 30;

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, page_size: PAGE_SIZE });
      if (actionFilter) params.set('action', actionFilter);
      const res = await api.get(`/api/admin/audit-logs/?${params}`);
      const data = await res.json();
      setLogs(data.results || data);
      setTotalCount(data.count || (data.results || data).length);
    } catch { /* silent */ }
    finally { setLoading(false); }
  }, [page, actionFilter]);

  useEffect(() => { fetchLogs(); }, [fetchLogs]);

  const totalPages = Math.ceil(totalCount / PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <input placeholder="Filter by action…" value={actionFilter}
          onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F46B03] transition-colors w-52" />
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-48">
            <div className="w-6 h-6 border-2 border-[#F46B03] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : logs.length === 0 ? (
          <p className="text-center text-gray-400 text-sm py-16">No audit log entries found.</p>
        ) : (
          <div className="divide-y divide-gray-50">
            {logs.map(log => (
              <div key={log.id}>
                <button onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  className="w-full flex items-center gap-4 px-6 py-3.5 hover:bg-gray-50/60 transition-colors text-left">
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase tracking-wide flex-shrink-0 ${actionColor(log.action)}`}>
                    {log.action}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{log.object_repr}</p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      by <span className="font-medium text-gray-600">{log.admin?.name || 'System'}</span>
                      {log.ip_address && <span> · {log.ip_address}</span>}
                    </p>
                  </div>
                  <span className="text-xs text-gray-400 flex-shrink-0">{formatDateTime(log.created_at)}</span>
                  <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"
                    className={`text-gray-300 flex-shrink-0 transition-transform ${expanded === log.id ? 'rotate-180' : ''}`}>
                    <polyline points="6 9 12 15 18 9" />
                  </svg>
                </button>
                {expanded === log.id && (
                  <div className="px-6 pb-4 bg-gray-50/40 border-t border-gray-100">
                    <div className="grid grid-cols-2 gap-4 mt-3">
                      {log.before && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">Before</p>
                          <pre className="text-xs bg-white border border-gray-100 rounded-xl p-3 overflow-x-auto text-gray-700 font-mono">
                            {JSON.stringify(log.before, null, 2)}
                          </pre>
                        </div>
                      )}
                      {log.after && (
                        <div>
                          <p className="text-[10px] font-bold text-gray-400 uppercase mb-1.5">After</p>
                          <pre className="text-xs bg-white border border-gray-100 rounded-xl p-3 overflow-x-auto text-gray-700 font-mono">
                            {JSON.stringify(log.after, null, 2)}
                          </pre>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100">
            <p className="text-xs text-gray-400">{totalCount} entries</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">Previous</button>
              <span className="px-3 py-1.5 text-xs text-gray-500">Page {page} of {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg disabled:opacity-40 hover:bg-gray-50 transition-colors">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Main Settings Page ────────────────────────────────────────────────────────

const TABS = [
  { id: 'profile', label: 'Profile' },
  { id: 'staff', label: 'Staff' },
  { id: 'audit-log', label: 'Audit Log' },
];

export default function AdminSettingsPage() {
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-1">Manage your profile, team, and system activity.</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`px-5 py-2 text-sm font-semibold rounded-lg transition-all ${
              activeTab === tab.id
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'profile' && <ProfileTab />}
      {activeTab === 'staff' && <StaffTab />}
      {activeTab === 'audit-log' && <AuditLogTab />}
    </div>
  );
}
