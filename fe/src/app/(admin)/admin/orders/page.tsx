'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
import { useAllOrders } from '@/hooks/useOrders';
import { removeAccents } from '../../../../utils/slug';
import { formatVND } from '@/utils/format';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'Chờ xử lý',        cls: 'bg-orange-100 text-orange-800' },
  confirmed: { label: 'Đã xác nhận',      cls: 'bg-indigo-100 text-indigo-800' },
  paid:      { label: 'Đã xác nhận',      cls: 'bg-indigo-100 text-indigo-800' },
  shipped:   { label: 'Đang vận chuyển',  cls: 'bg-amber-100 text-amber-800' },
  delivered: { label: 'Đã giao hàng',     cls: 'bg-emerald-100 text-emerald-800' },
  cancelled: { label: 'Đã hủy',           cls: 'bg-rose-100 text-rose-800' },
};

function StatusBadge({ status }: { status: string }) {
  const { label, cls } = STATUS_MAP[status?.toLowerCase()] ?? { label: status, cls: 'bg-gray-100 text-gray-800' };
  return <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${cls}`}>{label}</span>;
}

export default function AdminOrdersPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const { data: orders = [], isLoading } = useAllOrders();

  const filtered = orders.filter((order) => {
    const s = removeAccents(search);
    const matchSearch = !search || order.id.toLowerCase().includes(search.toLowerCase()) || removeAccents(order.user?.name || '').includes(s);
    const matchStatus = !statusFilter || order.status === statusFilter;
    return matchSearch && matchStatus;
  });

  if (isLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý đơn hàng</h1>
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium focus:ring-red-500 focus:border-red-500">
          <option value="">Tất cả trạng thái</option>
          {Object.entries(STATUS_MAP).filter(([k]) => k !== 'paid').map(([k, v]) => (
            <option key={k} value={k}>{v.label}</option>
          ))}
        </select>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
            <input type="text" placeholder="Tìm theo mã đơn hoặc tên khách..." value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-red-600 sm:text-sm" />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filtered.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {['Mã đơn hàng', 'Khách hàng', 'Ngày đặt', 'Tổng tiền', 'Trạng thái', ''].map((h) => (
                    <th key={h} className={`px-6 py-3 text-xs font-medium text-gray-500 uppercase tracking-wider ${h === '' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-mono font-medium text-red-600">#{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{order.user?.name || '—'}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{formatVND(Number(order.total || 0))}</td>
                    <td className="px-6 py-4"><StatusBadge status={order.status} /></td>
                    <td className="px-6 py-4 text-right text-sm font-medium">
                      <Link href={`/admin/orders/${order.id}`} className="inline-flex items-center gap-1 text-red-600 hover:text-red-900">
                        <Eye className="h-4 w-4" /> Xem
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-500">Không tìm thấy đơn hàng nào.</div>
          )}
        </div>
      </div>
    </div>
  );
}
