'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Search, Eye } from 'lucide-react';
import { Order } from '@/types';
import { removeAccents } from '../../../../utils/slug';
import { API_URL } from '@/utils/constants';
import { formatVND } from '@/utils/format';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch(`${API_URL}/orders`);
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      pending: 'bg-orange-100 text-orange-800',
      confirmed: 'bg-indigo-100 text-indigo-800',
      paid: 'bg-indigo-100 text-indigo-800',
      shipped: 'bg-amber-100 text-amber-800',
      delivered: 'bg-emerald-100 text-emerald-800',
      cancelled: 'bg-rose-100 text-rose-800',
    };
    const s = status?.toLowerCase() || 'pending';
    const labels: Record<string, string> = {
      pending: 'Chờ xử lý',
      confirmed: 'Đã xác nhận',
      paid: 'Đã xác nhận',
      shipped: 'Đang vận chuyển',
      delivered: 'Đã giao hàng',
      cancelled: 'Đã hủy',
    };
    const label = labels[s] || s;
    return (
      <span className={`px-2.5 py-0.5 inline-flex text-xs leading-5 font-bold rounded-full ${map[s] ?? 'bg-gray-100 text-gray-800'}`}>
        {label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="h-12 w-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }


  const filtered = orders.filter(order => {
    const s = removeAccents(search);
    const matchesSearch = !search || 
      order.id.toLowerCase().includes(search.toLowerCase()) || 
      removeAccents(order.user?.name || '').includes(s);
    
    const matchesStatus = !statusFilter || order.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Quản lý đơn hàng</h1>
        <div className="flex gap-2">
          <select 
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium focus:ring-red-500 focus:border-red-500"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="pending">Chờ xử lý</option>
            <option value="confirmed">Đã xác nhận</option>
            <option value="shipped">Đang vận chuyển</option>
            <option value="delivered">Đã giao hàng</option>
            <option value="cancelled">Đã hủy</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-200">
          <div className="relative max-w-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Tìm kiếm theo mã đơn hoặc tên khách hàng..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="block w-full rounded-md border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          {filtered.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Mã đơn hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Khách hàng</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ngày đặt</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tổng tiền</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Trạng thái</th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filtered.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-mono font-medium text-red-600">
                      #{order.id.slice(0, 8).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {order.user?.name || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {formatVND(Number(order.total || 0))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">{statusBadge(order.status)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-900"
                      >
                        <Eye className="h-4 w-4" /> Xem chi tiết
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

