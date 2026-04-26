'use client';

import { useState, useEffect } from 'react';
import { Search, Ban } from 'lucide-react';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import { useToast } from '../../../../context/ToastContext';
import { removeAccents } from '../../../../utils/slug';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  isBlocked: boolean;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState<{ open: boolean; userId: string; userName: string; targetStatus: boolean }>({ 
    open: false, userId: '', userName: '', targetStatus: true 
  });
  const [submitting, setSubmitting] = useState(false);

  const toast = useToast();

  useEffect(() => {
    fetch(`${API}/users`)
      .then(r => r.json())
      .then(data => setUsers(Array.isArray(data) ? data : []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggleBlock = async () => {
    setSubmitting(true);
    try {
      const res = await fetch(`${API}/users/${confirm.userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isBlocked: confirm.targetStatus }),
      });
      
      if (!res.ok) throw new Error('Failed to update status');

      setUsers(prev => prev.map(u => u.id === confirm.userId ? { ...u, isBlocked: confirm.targetStatus } : u));
      toast.success(`User "${confirm.userName}" has been ${confirm.targetStatus ? 'blocked' : 'unblocked'}.`);
    } catch (e) { 
      console.error(e); 
      toast.error(`Failed to ${confirm.targetStatus ? 'block' : 'unblock'} user.`); 
    } finally { 
      setSubmitting(false); 
      setConfirm({ open: false, userId: '', userName: '', targetStatus: true }); 
    }
  };

  const filtered = users.filter(u => {
    const s = removeAccents(search);
    return removeAccents(u.name || '').includes(s) ||
           removeAccents(u.email || '').includes(s);
  });

  if (loading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6 text-gray-900">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Người dùng</h1>
          <p className="text-sm text-gray-500 mt-1">{users.length} người dùng</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Tìm kiếm theo tên hoặc email..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filtered.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tên</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Email</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Ngày tham gia</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(user => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-sm font-medium text-gray-900">{user.name || '—'}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{user.email}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{new Date((user.createdAt as string) || 0).toLocaleDateString('vi-VN')}</td>
                    <td className="px-5 py-3">
                      {user.isBlocked
                        ? <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700">Đã chặn</span>
                        : <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Đang hoạt động</span>}
                    </td>
                    <td className="px-5 py-3 text-right">
                      {user.isBlocked ? (
                        <button
                          onClick={() => setConfirm({ open: true, userId: user.id, userName: user.name || user.email, targetStatus: false })}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-blue-600 bg-blue-50 hover:bg-blue-100 transition-colors">
                          Mở chặn tài khoản
                        </button>
                      ) : (
                        <button
                          onClick={() => setConfirm({ open: true, userId: user.id, userName: user.name || user.email, targetStatus: true })}
                          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                          <Ban className="h-3.5 w-3.5" /> Chặn
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center text-gray-400 text-sm">Không tìm thấy người dùng nào.</div>
          )}
        </div>
      </div>

      <ConfirmModal
        open={confirm.open}
        variant={confirm.targetStatus ? 'warning' : 'info'}
        title={confirm.targetStatus ? 'Chặn người dùng' : 'Mở chặn người dùng'}
        message={confirm.targetStatus 
          ? `Bạn có chắc chắn muốn chặn "${confirm.userName}"? Họ sẽ không thể truy cập vào nền tảng.`
          : `Bạn có chắc chắn muốn mở chặn "${confirm.userName}"? Họ sẽ có thể truy cập lại vào nền tảng.`}
        confirmLabel={confirm.targetStatus ? 'Đồng ý' : 'Đồng ý'}
        loading={submitting}
        onConfirm={handleToggleBlock}
        onCancel={() => setConfirm({ open: false, userId: '', userName: '', targetStatus: true })}
      />
    </div>
  );
}
