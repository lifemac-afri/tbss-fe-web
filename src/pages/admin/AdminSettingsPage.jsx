import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useAdmin } from '../../context/AdminContext';
import { useToast } from '../../components/Toast';
import api from '../../lib/api';
import Pagination from '../../components/admin/Pagination';

const RefreshBtn = ({ onClick, disabled }) => (
  <button onClick={onClick} disabled={disabled} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30" title="Refresh">
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
  </button>
);

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
    receive_email_notifications: currentUser?.receive_email_notifications ?? true,
    receive_all_notifications: currentUser?.receive_all_notifications ?? true,
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

          {/* Notifications */}
          <div className="pt-4 border-t border-gray-50">
            <h3 className="text-sm font-bold text-gray-800 mb-4">Notifications</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-gray-700">Receive All Notifications</p>
                  <p className="text-xs text-gray-400 mt-0.5">Master switch to turn all notifications on or off.</p>
                </div>
                <button
                  type="button"
                  onClick={() => setProfile(p => ({ 
                    ...p, 
                    receive_all_notifications: !p.receive_all_notifications,
                    // Optionally disable email if all is disabled
                    ...(p.receive_all_notifications ? { receive_email_notifications: false } : {})
                  }))}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${profile.receive_all_notifications ? 'bg-[#F46B03]' : 'bg-gray-200'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${profile.receive_all_notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>

              <div className={`flex items-center justify-between transition-opacity ${!profile.receive_all_notifications ? 'opacity-50' : ''}`}>
                <div>
                  <p className="text-sm font-semibold text-gray-700">Email Notifications</p>
                  <p className="text-xs text-gray-400 mt-0.5">Receive daily summaries and critical alerts via email.</p>
                </div>
                <button
                  type="button"
                  disabled={!profile.receive_all_notifications}
                  onClick={() => setProfile(p => ({ ...p, receive_email_notifications: !p.receive_email_notifications }))}
                  className={`relative inline-flex h-6 w-11 flex-shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${!profile.receive_all_notifications ? 'cursor-not-allowed bg-gray-200' : profile.receive_email_notifications ? 'bg-[#F46B03] cursor-pointer' : 'bg-gray-200 cursor-pointer'}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${profile.receive_email_notifications && profile.receive_all_notifications ? 'translate-x-5' : 'translate-x-0'}`} />
                </button>
              </div>
            </div>
          </div>
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

const ROLE_BADGE = {
  superadmin: 'bg-purple-100 text-purple-700',
  admin: 'bg-orange-100 text-orange-700',
};

function roleLabel(user) {
  if (user.is_superuser) return 'superadmin';
  return 'admin';
}

function StaffTab() {
  const { get, put } = useAdmin();
  const { currentUser, isSuperAdmin } = useAuth();
  const toast = useToast();

  const [staff, setStaff] = useState([]);
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [revoking, setRevoking] = useState(null);
  const [removing, setRemoving] = useState(null);
  const [promoting, setPromoting] = useState(null);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const staffData = await get('/api/admin/users/?is_staff=true&page_size=200');
      setStaff(Array.isArray(staffData) ? staffData : (staffData.results || []));
      if (isSuperAdmin) {
        const inviteRes = await api.get('/api/admin/staff/invites/').then(r => r.json());
        setInvites(Array.isArray(inviteRes) ? inviteRes : (inviteRes.results || []));
      }
    } catch {
      toast.error('Failed to load staff data');
    } finally {
      setLoading(false);
    }
  }, [get, isSuperAdmin]);

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

  const handleToggleSuperAdmin = async (user) => {
    const promote = !user.is_superuser;
    const msg = promote
      ? `Promote ${user.first_name || user.email} to Superadmin? They will have full control including managing other staff.`
      : `Demote ${user.first_name || user.email} from Superadmin? They will retain admin access but lose superadmin privileges.`;
    if (!window.confirm(msg)) return;
    setPromoting(user.id);
    try {
      const updated = await put(`/api/admin/users/${user.id}/`, { is_superuser: promote });
      setStaff(p => p.map(u => u.id === updated.id ? updated : u));
      toast.success(promote ? 'Promoted to Superadmin' : 'Demoted to Admin');
    } catch { toast.error('Failed to update role'); }
    finally { setPromoting(null); }
  };

  const pending = invites.filter(i => !i.used && !i.is_expired);

  return (
    <div className="space-y-6">
      {/* Role legend */}
      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-5 py-4 flex flex-wrap gap-6 text-sm">
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-purple-100 text-purple-700 uppercase mr-2">Superadmin</span>
          <span className="text-blue-700">Full control — can invite/remove staff, manage all settings</span>
        </div>
        <div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-orange-100 text-orange-700 uppercase mr-2">Admin</span>
          <span className="text-blue-700">Can manage products, orders, customers, content</span>
        </div>
      </div>

      {/* Invite — superadmins only */}
      {isSuperAdmin ? (
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
      ) : (
        <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-4 text-sm text-gray-400">
          Only Superadmins can invite new staff members.
        </div>
      )}

      {/* Pending invites — superadmins only */}
      {isSuperAdmin && pending.length > 0 && (
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
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-50">
          <h2 className="font-bold text-gray-800">Current Staff <span className="text-xs font-normal text-gray-400 ml-1">({staff.length})</span></h2>
          <RefreshBtn onClick={fetchAll} disabled={loading} />
        </div>
        {loading ? (
          <div className="flex items-center justify-center h-28">
            <div className="w-6 h-6 border-2 border-[#F46B03] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {staff.map(user => {
              const name = [user.first_name, user.last_name].filter(Boolean).join(' ') || user.username;
              const role = roleLabel(user);
              const isSelf = user.id === currentUser?.id;
              return (
                <div key={user.id} className="flex items-center justify-between px-6 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F46B03]/10 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-[#F46B03]">{initials(user)}</span>
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-semibold text-gray-800">{name}{isSelf && <span className="text-gray-400 font-normal"> (you)</span>}</p>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${ROLE_BADGE[role]}`}>{role}</span>
                      </div>
                      <p className="text-xs text-gray-400">{user.email} · Joined {formatDate(user.date_joined)}</p>
                    </div>
                  </div>
                  {isSuperAdmin && !isSelf && (
                    <div className="flex items-center gap-2">
                      {/* Promote/demote */}
                      <button
                        onClick={() => handleToggleSuperAdmin(user)}
                        disabled={promoting === user.id}
                        className={`text-xs font-medium px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 ${
                          user.is_superuser
                            ? 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {promoting === user.id ? '…' : user.is_superuser ? 'Demote' : 'Make Superadmin'}
                      </button>
                      {/* Remove staff access — can't remove another superadmin */}
                      {!user.is_superuser && (
                        <button onClick={() => handleRemove(user.id)} disabled={removing === user.id}
                          className="text-xs font-medium px-3 py-1.5 rounded-xl border border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-600 hover:bg-red-50 transition-colors disabled:opacity-50">
                          {removing === user.id ? 'Removing…' : 'Remove'}
                        </button>
                      )}
                    </div>
                  )}
                  {(!isSuperAdmin || isSelf) && (
                    <span className="text-xs text-gray-300 italic">{isSelf ? 'You' : 'Protected'}</span>
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
      <div className="flex items-center justify-end gap-2">
        <input placeholder="Filter by action…" value={actionFilter}
          onChange={e => { setActionFilter(e.target.value); setPage(1); }}
          className="px-4 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:border-[#F46B03] transition-colors w-52" />
        <button onClick={fetchLogs} disabled={loading} className="p-2 rounded-xl hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors disabled:opacity-30" title="Refresh">
          <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg>
        </button>
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
        <Pagination page={page} totalPages={totalPages} totalCount={totalCount} pageSize={PAGE_SIZE} onPage={setPage} />
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
      <div data-tour="settings-tabs" className="flex gap-1 bg-gray-100 p-1 rounded-xl w-fit">
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
