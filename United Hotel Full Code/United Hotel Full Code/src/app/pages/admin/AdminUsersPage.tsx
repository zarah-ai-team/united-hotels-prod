import { useEffect, useMemo, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService, type AdminUser } from '../../services/api';
import {
  Search,
  UserPlus,
  Trash2,
  ShieldCheck,
  Tag,
  User as UserIcon,
  Mail,
  Phone,
  Lock,
  ChevronDown,
} from 'lucide-react';

type Role = 'user' | 'vendor' | 'admin';

const ROLE_META: Record<Role, { label: string; color: string; bg: string; ring: string }> = {
  admin:  { label: 'Admin',  color: '#1E5FBC', bg: 'rgba(47, 128, 237,0.10)', ring: 'rgba(47, 128, 237,0.35)' },
  vendor: { label: 'Vendor', color: '#1d4ed8', bg: 'rgba(59,130,246,0.10)',  ring: 'rgba(59,130,246,0.35)' },
  user:   { label: 'User',   color: '#52525b', bg: 'rgba(120,120,120,0.08)', ring: 'rgba(120,120,120,0.25)' },
};

const initialOf = (name?: string, email?: string) => {
  const src = (name || email || 'U').trim();
  const parts = src.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return (src[0] + (src[1] || '')).toUpperCase();
};

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | Role>('all');
  const [showCreate, setShowCreate] = useState(false);

  // Create-user form
  const [form, setForm] = useState({ name: '', email: '', password: '', phoneNumber: '', role: 'user' as Role });
  const [submitting, setSubmitting] = useState(false);
  const [flash, setFlash] = useState<{ kind: 'ok' | 'err'; text: string } | null>(null);

  const refresh = async () => {
    setLoading(true);
    try {
      const params: { role?: Role; search?: string } = {};
      if (filter !== 'all') params.role = filter;
      if (search.trim()) params.search = search.trim();
      const res = await adminService.listUsers(params);
      setUsers(res.users);
      setError(null);
    } catch (e: any) {
      setError(e?.data?.error || e?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); /* eslint-disable-next-line react-hooks/exhaustive-deps */ }, [filter]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFlash(null);
    try {
      await adminService.createUser(form);
      setFlash({ kind: 'ok', text: `${form.email} created as ${form.role}` });
      setForm({ name: '', email: '', password: '', phoneNumber: '', role: 'user' });
      setShowCreate(false);
      refresh();
    } catch (e: any) {
      setFlash({ kind: 'err', text: e?.data?.error || e?.message || 'Failed to create user' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleRoleChange = async (id: number, role: Role) => {
    try {
      await adminService.updateUserRole(id, role);
      setUsers((prev) => prev.map((u) => (u.id === id ? { ...u, role, isAdmin: role === 'admin', isManager: role === 'vendor' } : u)));
    } catch (e: any) {
      setFlash({ kind: 'err', text: e?.data?.error || e?.message || 'Failed to update role' });
    }
  };

  const handleDelete = async (id: number, email: string) => {
    if (!confirm(`Permanently delete ${email}?`)) return;
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e: any) {
      setFlash({ kind: 'err', text: e?.data?.error || e?.message || 'Failed to delete user' });
    }
  };

  const counts = useMemo(() => {
    const c = { all: users.length, user: 0, vendor: 0, admin: 0 } as Record<'all' | Role, number>;
    users.forEach((u) => { c[u.role] += 1; });
    return c;
  }, [users]);

  return (
    <AdminLayout title="Users" breadcrumb="Admin / Users" adminOnly>
      <div className="space-y-4">
        {/* Toolbar — counts + filters + search + add */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[12.5px] text-[#6b7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span className="text-[#1f2937] font-semibold">{users.length}</span> users
            {filter !== 'all' && <span> · filtered by <span className="text-[#1f2937]">{filter}</span></span>}
          </p>
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
              <input
                placeholder="Search name or email…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') refresh(); }}
                className="rounded-lg border border-[#eaeaea] bg-white dark:bg-[#11151a] pl-8 pr-3 py-1.5 text-[12.5px] w-60 focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/25 focus:border-[#2F80ED] transition-colors"
                style={{ fontFamily: 'Inter, sans-serif' }}
              />
            </div>
            <button
              onClick={() => setShowCreate((v) => !v)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F80ED] px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[#1E5FBC] transition-colors shadow-[0_4px_12px_-4px_rgba(47, 128, 237,0.55)]"
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              <UserPlus className="w-3.5 h-3.5" />
              {showCreate ? 'Cancel' : 'New User'}
            </button>
          </div>
        </div>

        {/* Filter tabs — segmented control style */}
        <div className="inline-flex items-center gap-0.5 bg-white dark:bg-[#11151a] border border-[#eaeaea] rounded-lg p-0.5">
          {(['all', 'user', 'vendor', 'admin'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`flex items-center gap-1.5 rounded-md px-3 py-1 text-[12px] font-medium transition-colors ${
                filter === f
                  ? 'bg-[#1f2937] text-white shadow-sm'
                  : 'text-[#6b7280] hover:text-[#1f2937]'
              }`}
              style={{ fontFamily: 'Inter, sans-serif' }}
            >
              {f === 'all' ? 'All' : ROLE_META[f].label}
              <span
                className={`text-[10px] rounded-full px-1.5 py-px font-semibold ${
                  filter === f ? 'bg-white/15 text-white/85' : 'bg-[#f1f1f1] text-[#9aa0a6]'
                }`}
              >
                {counts[f]}
              </span>
            </button>
          ))}
        </div>

        {/* Create form — collapsible card */}
        {showCreate && (
          <div className="admin-card">
            <div className="px-4 py-3 border-b border-[#eaeaea] flex items-center justify-between">
              <div>
                <h2 className="text-[13.5px] font-semibold text-[#1f2937]" style={{ fontFamily: 'Poppins, sans-serif' }}>
                  Register a new user
                </h2>
                <p className="text-[11px] text-[#9aa0a6] mt-0.5" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Send a welcome email or share the credentials directly.
                </p>
              </div>
            </div>
            <form onSubmit={handleCreate} className="p-4 grid grid-cols-1 md:grid-cols-12 gap-2.5">
              {/* Name */}
              <div className="md:col-span-3">
                <label className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Name
                </label>
                <div className="relative">
                  <UserIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
                  <input
                    required
                    placeholder="Full name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full rounded-lg border border-[#eaeaea] bg-white dark:bg-[#11151a] pl-8 pr-3 py-1.5 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/25 focus:border-[#2F80ED]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>
              {/* Email */}
              <div className="md:col-span-3">
                <label className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
                  <input
                    required
                    type="email"
                    placeholder="name@example.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="w-full rounded-lg border border-[#eaeaea] bg-white dark:bg-[#11151a] pl-8 pr-3 py-1.5 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/25 focus:border-[#2F80ED]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>
              {/* Phone */}
              <div className="md:col-span-2">
                <label className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Phone
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
                  <input
                    placeholder="+1 555 0100"
                    value={form.phoneNumber}
                    onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
                    className="w-full rounded-lg border border-[#eaeaea] bg-white dark:bg-[#11151a] pl-8 pr-3 py-1.5 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/25 focus:border-[#2F80ED]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>
              {/* Password */}
              <div className="md:col-span-2">
                <label className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9aa0a6]" />
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={(e) => setForm({ ...form, password: e.target.value })}
                    className="w-full rounded-lg border border-[#eaeaea] bg-white dark:bg-[#11151a] pl-8 pr-3 py-1.5 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/25 focus:border-[#2F80ED]"
                    style={{ fontFamily: 'Inter, sans-serif' }}
                  />
                </div>
              </div>
              {/* Role + submit */}
              <div className="md:col-span-2 flex items-end gap-2">
                <div className="flex-1">
                  <label className="block text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6] mb-1" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Role
                  </label>
                  <div className="relative">
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
                      className="w-full appearance-none rounded-lg border border-[#eaeaea] bg-white dark:bg-[#11151a] pl-3 pr-7 py-1.5 text-[12.5px] focus:outline-none focus:ring-2 focus:ring-[#2F80ED]/25 focus:border-[#2F80ED]"
                      style={{ fontFamily: 'Inter, sans-serif' }}
                    >
                      <option value="user">User</option>
                      <option value="vendor">Vendor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-1/2 -translate-y-1/2 text-[#9aa0a6] pointer-events-none" />
                  </div>
                </div>
              </div>
              <div className="md:col-span-12 flex items-center justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  className="rounded-lg border border-[#eaeaea] bg-white dark:bg-[#11151a] px-3 py-1.5 text-[12.5px] font-medium text-[#6b7280] hover:text-[#1f2937] hover:border-[#9aa0a6] transition-colors"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#2F80ED] px-3 py-1.5 text-[12.5px] font-semibold text-white hover:bg-[#1E5FBC] transition-colors disabled:opacity-50 shadow-[0_4px_12px_-4px_rgba(47, 128, 237,0.55)]"
                  style={{ fontFamily: 'Inter, sans-serif' }}
                >
                  {submitting ? 'Creating…' : 'Create user'}
                </button>
              </div>
            </form>
          </div>
        )}

        {flash && (
          <div
            className={`text-[12px] rounded-lg px-3 py-2 ${
              flash.kind === 'ok'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
            style={{ fontFamily: 'Inter, sans-serif' }}
          >
            {flash.text}
          </div>
        )}

        {/* Users table */}
        <div className="admin-card overflow-hidden">
          {loading ? (
            <div className="p-6 text-center text-[12.5px] text-[#9aa0a6]">Loading users…</div>
          ) : error ? (
            <div className="p-6 text-center text-[12.5px] text-red-600">{error}</div>
          ) : (
            <table className="w-full">
              <thead className="bg-[#fafafa] border-b border-[#eaeaea]">
                <tr>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    User
                  </th>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Email
                  </th>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Phone
                  </th>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Role
                  </th>
                  <th className="px-4 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.08em] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>
                    Created
                  </th>
                  <th className="px-4 py-2 w-[60px]" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f1f1f1]">
                {users.map((u) => {
                  const meta = ROLE_META[u.role] || ROLE_META.user;
                  const RoleIcon = u.role === 'admin' ? ShieldCheck : u.role === 'vendor' ? Tag : UserIcon;
                  return (
                    <tr key={u.id} className="hover:bg-[#fafafa] transition-colors">
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-2.5">
                          <div
                            className="flex h-8 w-8 items-center justify-center rounded-full text-white text-[11px] font-semibold shrink-0"
                            style={{
                              background: 'linear-gradient(135deg, #2F80ED, #1E5FBC)',
                              boxShadow: '0 4px 10px -4px rgba(47, 128, 237,0.45)',
                            }}
                          >
                            {initialOf(u.name, u.email)}
                          </div>
                          <div className="min-w-0">
                            <div className="text-[12.5px] font-semibold text-[#1f2937] leading-tight truncate" style={{ fontFamily: 'Inter, sans-serif' }}>
                              {u.name || '—'}
                            </div>
                            <div className="text-[10.5px] text-[#9aa0a6] leading-tight">ID #{u.id}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-[12.5px] text-[#3b3b3b]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {u.email}
                      </td>
                      <td className="px-4 py-2.5 text-[12.5px] text-[#6b7280]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {u.phoneNumber || <span className="text-[#d4d4d8]">—</span>}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="relative inline-flex items-center">
                          <span
                            className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[11px] font-medium pr-6 cursor-pointer"
                            style={{
                              color: meta.color,
                              background: meta.bg,
                              boxShadow: `inset 0 0 0 1px ${meta.ring}`,
                              fontFamily: 'Inter, sans-serif',
                            }}
                          >
                            <RoleIcon className="w-3 h-3" strokeWidth={2.2} />
                            {meta.label}
                          </span>
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                            className="absolute inset-0 w-full opacity-0 cursor-pointer"
                            title="Change role"
                          >
                            <option value="user">User</option>
                            <option value="vendor">Vendor</option>
                            <option value="admin">Admin</option>
                          </select>
                          <ChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 w-3 h-3 pointer-events-none" style={{ color: meta.color }} />
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-[11.5px] text-[#9aa0a6]" style={{ fontFamily: 'Inter, sans-serif' }}>
                        {u.createdAt ? new Date(u.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => handleDelete(u.id, u.email)}
                          className="text-[#9aa0a6] hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                          title="Delete user"
                          aria-label="Delete user"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
                {users.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center">
                      <div className="text-[13px] text-[#9aa0a6] mb-1">No users found</div>
                      <div className="text-[11.5px] text-[#d4d4d8]">Try adjusting your filters or invite someone new.</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
