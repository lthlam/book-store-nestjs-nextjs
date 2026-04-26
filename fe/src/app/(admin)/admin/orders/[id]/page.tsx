'use client';

import { use, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, FileDown } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '../../../../../context/ToastContext';
import { API_URL } from '@/utils/constants';
import { formatVND } from '@/utils/format';


import { Order, EnrichedOrderItem } from '@/types';

export default function AdminOrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<EnrichedOrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();
  const router = useRouter();

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await fetch(`${API_URL}/orders/${id}`);
        if (!res.ok) { router.push('/admin/orders'); return; }
        const data = await res.json();
        setOrder(data);

        const details: EnrichedOrderItem[] = Array.isArray(data.orderDetails) ? data.orderDetails : [];
        const enriched = await Promise.all(
          details.map(async (item: EnrichedOrderItem) => {
            try {
              const pRes = await fetch(`${API_URL}/products/${item.productId}`);
              const product = pRes.ok ? await pRes.json() : null;
              return { ...item, product };
            } catch { return { ...item, product: null }; }
          })
        );
        setItems(enriched);
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchOrder();
  }, [id, router]);

  const handleUpdateStatus = async (newStatus: string) => {
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        const d = await res.json();
        setOrder(d);
        toast.success(`Status updated to "${newStatus}"`);
      } else { toast.error('Failed to update status. Please check the order workflow.'); }
    } catch (e) { console.error(e); toast.error('An error occurred.'); }
    finally { setSaving(false); }
  };

  const handleDownloadInvoice = async () => {
    if (!order) return;
    window.open(`${API_URL}/orders/${order.id}/invoice`, '_blank');
    toast.success('Downloading invoice from server...');
  };

  if (loading) return (
    <div className="flex justify-center py-20">
      <div className="h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!order) return null;

  const finalAmount = Number(order.totalAmount || order.total || 0);
  const itemsTotal = items.reduce((acc, item) => acc + (Number(item.price) * item.quantity), 0);
  const shipping = Number(order.shipping || 0);
  const discount = Number(order.discount || 0);

  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col items-start gap-2">
          <Link href="/admin/orders"
            className="flex items-center gap-1 text-sm font-medium text-gray-500 hover:text-red-600 transition-colors">
            <ChevronLeft className="h-4 w-4" /> Back to Orders
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 mt-1">
            Order #{order.id.substring(0, 8).toUpperCase()}
          </h1>
        </div>
        {order.status === 'delivered' && (
          <button 
            onClick={handleDownloadInvoice}
            className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 disabled:opacity-70 transition-all shadow-sm flex-shrink-0"
          >
            <FileDown className="h-4 w-4" />
            Download Invoice
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100 font-semibold text-gray-900">Order Items</div>
          {items.length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No items</div>
          ) : (
            <ul className="divide-y divide-gray-100">
              {items.map((item, idx) => (
                <li key={idx} className="flex items-center gap-4 px-5 py-4">
                  <div className="h-14 w-14 relative flex-shrink-0">
                    <Image 
                      src={item.product?.image || '/next.svg'} 
                      alt={item.product?.title || 'Product'}
                      fill
                      className="rounded-lg object-contain bg-gray-50 border border-gray-200 p-1"
                      unoptimized
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm truncate">
                      {item.product?.title || `Product #${item.productId?.substring(0, 8)}`}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatVND(Number(item.price))} × {item.quantity}
                    </p>
                  </div>
                  <p className="font-semibold text-gray-900 text-sm">{formatVND(Number(item.price) * item.quantity)}</p>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Info panels */}
        <div className="space-y-4">
          {/* Summary */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-4">Summary</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-gray-500">Customer</dt><dd className="font-medium">{order.user?.name || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Email</dt><dd className="font-medium truncate ml-4">{order.user?.email || '—'}</dd></div>
              <div className="flex justify-between"><dt className="text-gray-500">Date</dt><dd className="font-medium">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</dd></div>
              <div className="flex justify-between border-t border-gray-100 pt-3 mt-3">
                <dt className="text-gray-500 text-xs uppercase tracking-wider font-bold">Chi tiết thanh toán</dt>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Tiền hàng</dt>
                <dd className="font-medium">{formatVND(itemsTotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-gray-500">Phí vận chuyển</dt>
                <dd className="font-medium">{shipping > 0 ? formatVND(shipping) : 'Miễn phí'}</dd>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-emerald-600">
                  <dt>Giảm giá</dt>
                  <dd className="font-medium">-{formatVND(discount)}</dd>
                </div>
              )}
              <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                <dt className="font-bold text-gray-900">Tổng thanh toán</dt>
                <dd className="font-bold text-red-600 text-lg">{formatVND(finalAmount)}</dd>
              </div>
            </dl>
          </div>

          {/* Address */}
          {order.address && (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <h3 className="font-semibold text-gray-900 mb-2">Delivery Address</h3>
              <p className="text-sm text-gray-600">{order.address.street}</p>
              <p className="text-sm text-gray-600">{order.address.ward}, {order.address.province}</p>
            </div>
          )}

          {/* Status update */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center justify-between">
              Update Status 
              <span className="text-sm font-normal text-red-600 bg-red-50 px-2 py-0.5 rounded-full uppercase tracking-wider">{order.status || 'pending'}</span>
            </h3>
            
            <div className="flex flex-col gap-2.5 mt-4">
              {['delivered', 'cancelled'].includes(order.status?.toLowerCase()) ? (
                <div className="text-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <p className="text-sm font-medium text-gray-500">This order is closed and cannot be updated.</p>
                </div>
              ) : (
                <>
                  {(order.status === 'pending') && (
                    <button onClick={() => handleUpdateStatus('confirmed')} disabled={saving}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-orange-600 py-2.5 text-sm font-semibold text-white hover:bg-orange-700 disabled:opacity-60 transition-colors shadow-sm">
                      Confirm Order
                    </button>
                  )}
                  {(order.status === 'confirmed') && (
                    <button onClick={() => handleUpdateStatus('shipped')} disabled={saving}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-blue-600 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:opacity-60 transition-colors shadow-sm">
                      Mark as Shipped
                    </button>
                  )}
                  {order.status === 'shipped' && (
                    <button onClick={() => handleUpdateStatus('delivered')} disabled={saving}
                      className="w-full flex items-center justify-center gap-2 rounded-lg bg-green-600 py-2.5 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-60 transition-colors shadow-sm">
                      Mark as Delivered
                    </button>
                  )}
                  <button onClick={() => handleUpdateStatus('cancelled')} disabled={saving}
                    className="w-full flex items-center justify-center gap-2 rounded-lg bg-white border border-red-200 py-2 text-sm font-medium text-red-600 hover:bg-red-50 disabled:opacity-60 transition-colors">
                    Cancel Order
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
