'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Clock, XCircle, CheckCircle, ChevronRight, Truck, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import ConfirmModal from '../../../components/common/ConfirmModal';
import { useToast } from '../../../context/ToastContext';
import { Order } from '@/types';
import { API_URL } from '@/utils/constants';
import { formatVND } from '@/utils/format';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmCancel, setConfirmCancel] = useState<{ open: boolean; id: string }>({ open: false, id: '' });
  const [cancelling, setCancelling] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchOrders = async () => {
      const stored = localStorage.getItem('user');
      if (!stored) { router.push('/login'); return; }
      const userData = JSON.parse(stored);

      try {
        const res = await fetch(`${API_URL}/orders`);
        if (res.ok) {
          const allOrders: Order[] = await res.json();
          setOrders(allOrders.filter((o) => o.user?.id === userData.id || o.userId === userData.id));
        }
      } catch (err) {
        console.error('Failed to load orders', err);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();
  }, [router]);

  const handleCancelOrder = async () => {
    setCancelling(true);
    try {
      await fetch(`${API_URL}/orders/${confirmCancel.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'cancelled' }),
      });
      setOrders(prev => prev.map(o => o.id === confirmCancel.id ? { ...o, status: 'cancelled' } : o));
      toast.warning('Đơn hàng đã được hủy thành công.');
    } catch (e) { console.error(e); toast.error('Hủy đơn hàng không thành công.'); }
    finally { setCancelling(false); setConfirmCancel({ open: false, id: '' }); }
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-orange-50 px-3 py-1.5 text-xs font-bold text-orange-700 border border-orange-100"><Clock className="h-3.5 w-3.5" /> Chờ xử lý</span>;
      case 'confirmed':
      case 'paid':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-bold text-indigo-700 border border-indigo-100"><CheckCircle className="h-3.5 w-3.5" /> Đã xác nhận</span>;
      case 'shipped':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-xs font-bold text-amber-700 border border-amber-100"><Truck className="h-3.5 w-3.5" /> Đang giao hàng</span>;
      case 'delivered':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700 border border-emerald-100"><CheckCircle className="h-3.5 w-3.5" /> Đã giao hàng</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-50 px-3 py-1.5 text-xs font-bold text-rose-700 border border-rose-100"><XCircle className="h-3.5 w-3.5" /> Đã hủy</span>;
      default:
        return <span className="inline-flex items-center rounded-full bg-gray-50 px-3 py-1.5 text-xs font-bold text-gray-600 border border-gray-100">{status}</span>;
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 mb-6">Lịch sử đơn hàng</h1>

        {orders.length > 0 ? (
          <div className="space-y-3">
            {orders.map((order) => (
              <Link
                key={order.id}
                href={`/orders/${order.id}`}
                className="grid grid-cols-12 items-center gap-4 bg-white rounded-xl border border-gray-200 px-5 py-4 shadow-sm hover:shadow-md hover:border-red-200 transition-all group"
              >
                {/* Left: Order info (Col 5) */}
                <div className="col-span-5 flex items-center gap-5 min-w-0">
                  <div className="h-10 w-10 rounded-lg bg-red-50 flex items-center justify-center flex-shrink-0">
                    <Package className="h-5 w-5 text-red-600" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs text-gray-400 font-mono truncate">#{order.id.substring(0, 16).toUpperCase()}</p>
                    <p className="text-sm font-semibold text-gray-900 mt-0.5">
                      {formatVND(Number(order.total))}
                    </p>
                  </div>
                </div>

                {/* Center: Status + Date (Col 5) */}
                <div className="col-span-5 hidden sm:flex items-center justify-center gap-6 md:gap-12">
                  <div className="w-32 flex justify-center flex-shrink-0">
                    {getStatusBadge(order.status)}
                  </div>
                  <span className="text-sm text-gray-400 w-24 text-center flex-shrink-0">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</span>
                </div>

                {/* Right: Actions + Arrow (Col 2) */}
                <div className="col-span-2 flex items-center justify-end gap-3">
                  {order.status === 'delivered' && (
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        window.open(`${API_URL}/orders/${order.id}/invoice`, '_blank');
                      }}
                      title="Download Invoice"
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Download className="h-5 w-5" />
                    </button>
                  ) || <div className="p-2 w-9 h-9" /* Placeholder */ />}
                  <ChevronRight className="h-5 w-5 text-gray-300 group-hover:text-red-500 transition-colors flex-shrink-0" />
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <Package className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2">Không tìm thấy đơn hàng</h2>
            <p className="mt-2 text-gray-500 mb-8">Bạn chưa thực hiện đơn hàng nào.</p>
            <Link href="/products"
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors">
              Mua sắm ngay
            </Link>
          </div>
        )}
      </div>

      <ConfirmModal
        open={confirmCancel.open}
        variant="warning"
        title="Hủy đơn hàng"
        message="Bạn có chắc chắn muốn hủy đơn hàng này không? Hành động này không thể hoàn tác."
        confirmLabel="Có, Hủy đơn"
        loading={cancelling}
        onConfirm={handleCancelOrder}
        onCancel={() => setConfirmCancel({ open: false, id: '' })}
      />
    </div>
  );
}
