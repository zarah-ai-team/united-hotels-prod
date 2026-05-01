import { useEffect, useState } from 'react';
import { AdminLayout } from '../../components/admin/AdminLayout';
import { adminService, type AdminUser } from '../../services/api';
import { Button } from '../../components/ui/Button';

type Role = 'user' | 'vendor' | 'admin';

export function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | Role>('all');

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
      setFlash({ kind: 'ok', text: `User ${form.email} created as ${form.role}` });
      setForm({ name: '', email: '', password: '', phoneNumber: '', role: 'user' });
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

  const handleDelete = async (id: number) => {
    if (!confirm('Delete this user permanently?')) return;
    try {
      await adminService.deleteUser(id);
      setUsers((prev) => prev.filter((u) => u.id !== id));
    } catch (e: any) {
      setFlash({ kind: 'err', text: e?.data?.error || e?.message || 'Failed to delete user' });
    }
  };

  return (
    <AdminLayout title="Users" breadcrumb="Admin / Users" adminOnly>
      <div className="space-y-6">
        {/* Create form */}
        <div className="rounded-xl border border-[#eaeaea] bg-white p-6">
          <h2 className="text-lg font-semibold text-[#3b3b3b] mb-4">Register a new user</h2>
          <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-6 gap-3">
            <input
              required
              placeholder="Full name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="md:col-span-1 rounded-md border border-[#eaeaea] px-3 py-2 text-sm"
            />
            <input
              required
              type="email"
              placeholder="Email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="md:col-span-2 rounded-md border border-[#eaeaea] px-3 py-2 text-sm"
            />
            <input
              required
              type="password"
              placeholder="Password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="md:col-span-1 rounded-md border border-[#eaeaea] px-3 py-2 text-sm"
            />
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value as Role })}
              className="md:col-span-1 rounded-md border border-[#eaeaea] px-3 py-2 text-sm bg-white"
            >
              <option value="user">User</option>
              <option value="vendor">Vendor</option>
              <option value="admin">Admin</option>
            </select>
            <Button type="submit" variant="primary" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create'}
            </Button>
          </form>
          {flash && (
            <div className={`mt-3 text-sm ${flash.kind === 'ok' ? 'text-emerald-700' : 'text-red-700'}`}>
              {flash.text}
            </div>
          )}
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3">
          {(['all', 'user', 'vendor', 'admin'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-4 py-1.5 text-sm font-medium ${
                filter === f
                  ? 'bg-[#1abc9c] text-white'
                  : 'bg-[#eaeaea] text-[#3b3b3b] hover:bg-[#d4d4d4]'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
          <div className="ml-auto flex gap-2">
            <input
              placeholder="Search name or email"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="rounded-md border border-[#eaeaea] px-3 py-2 text-sm"
            />
            <Button variant="secondary" onClick={refresh}>Search</Button>
          </div>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-[#eaeaea] bg-white overflow-hidden">
          {loading ? (
            <p className="p-6 text-sm text-[#8c8c8c]">Loading users…</p>
          ) : error ? (
            <p className="p-6 text-sm text-red-600">{error}</p>
          ) : (
            <table className="w-full text-sm">
              <thead className="bg-[#fafafa] text-[#8c8c8c]">
                <tr>
                  <th className="px-4 py-3 text-left font-medium">Name</th>
                  <th className="px-4 py-3 text-left font-medium">Email</th>
                  <th className="px-4 py-3 text-left font-medium">Role</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-[#eaeaea]">
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="px-4 py-3 text-[#3b3b3b]">{u.name}</td>
                    <td className="px-4 py-3 text-[#3b3b3b]">{u.email}</td>
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as Role)}
                        className="rounded-md border border-[#eaeaea] px-2 py-1 text-sm bg-white"
                      >
                        <option value="user">user</option>
                        <option value="vendor">vendor</option>
                        <option value="admin">admin</option>
                      </select>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleDelete(u.id)}
                        className="text-sm text-red-600 hover:text-red-800"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
                {users.length === 0 && (
                  <tr><td colSpan={4} className="p-6 text-center text-sm text-[#8c8c8c]">No users found</td></tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
