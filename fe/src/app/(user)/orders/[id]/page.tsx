'use client';

import { use, useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Package, Truck, CheckCircle2, ChevronRight, Download } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import { downloadInvoice } from '@/utils/downloadInvoice';
import { formatVND } from '@/utils/format';
import type { Order, Product, EnrichedOrderItem } from '@/types';

async function fetchOrderWithItems(id: string) {
  const { data: order } = await api.get<Order>(`/orders/${id}`);
  const details: EnrichedOrderItem[] = (order as Order & { orderDetails?: EnrichedOrderItem[] }).orderDetails || [];
  const enriched = await Promise.all(
    details.map(async (item) => {
      try {
        const { data: product } = await api.get<Product>(`/products/${item.productId}`);
        return { ...item, product };
      } catch {
        return { ...item, product: null };
      }
    }),
  );
  return { order, items: enriched };
}

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    // Use Promise.resolve to avoid synchronous setState warning in effect
    Promise.resolve().then(() => {
      setUserId(JSON.parse(stored).id);
    });
  }, [router]);

  const { data, isLoading } = useQuery({
    queryKey: ['order-detail', id],
    queryFn: () => fetchOrderWithItems(id),
    enabled: !!userId && !!id,
  });

  if (isLoading || !userId) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="h-10 w-10 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );
  if (!data?.order) return <div className="min-h-screen flex items-center justify-center text-xl text-gray-500">Order not found</div>;

  const { order, items } = data;
  const finalAmount = Number(order.totalAmount || order.total || 0);
  const itemsTotal = items.reduce((acc, item) => acc + Number(item.price) * item.quantity, 0);
  const shipping = Number(order.shipping || 0);
  const discount = Number(order.discount || 0);

  const progressWidth: Record<string, string> = { pending: '2%', confirmed: '33%', shipped: '66%', delivered: '100%' };
  const width = progressWidth[order.status] ?? '0%';

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <nav className="flex text-sm font-medium text-gray-500 mb-8">
          <Link href="/orders" className="hover:text-red-600 transition-colors">Order History</Link>
          <ChevronRight className="h-4 w-4 mx-2 flex-shrink-0 text-gray-400 mt-0.5" />
          <span className="text-gray-900">Order #{order.id.substring(0, 8).toUpperCase()}</span>
        </nav>

        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Order Details</h1>
          {order.status === 'delivered' && (
            <button onClick={() => downloadInvoice(order.id)}
              className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
              <Download className="h-4 w-4" /> Download Invoice
            </button>
          )}
        </div>

        <div className="space-y-8">
          {order.status !== 'cancelled' && (
            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
              <h2 className="text-lg font-bold text-gray-900 mb-8">Delivery Track</h2>
              <div className="relative">
                <div className="overflow-hidden h-2 mb-4 rounded-full bg-gray-200">
                  <div style={{ width }} className="h-full bg-red-600 transition-all duration-500 rounded-full" />
                </div>
                <div className="flex justify-between text-sm font-medium">
                  {[
                    { label: 'Pending', icon: <Package className="h-6 w-6" />, active: true },
                    { label: 'Confirmed', icon: <CheckCircle2 className="h-6 w-6" />, active: ['confirmed', 'shipped', 'delivered'].includes(order.status) },
                    { label: 'Shipped', icon: <Truck className="h-6 w-6" />, active: ['shipped', 'delivered'].includes(order.status) },
                    { label: 'Delivered', icon: <CheckCircle2 className="h-6 w-6" />, active: order.status === 'delivered' },
                  ].map(({ label, icon, active }) => (
                    <div key={label} className={`${active ? 'text-red-600' : 'text-gray-400'} flex flex-col items-center gap-2`}>
                      {icon} {label}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-200"><h2 className="text-lg font-bold text-gray-900">Purchased Items</h2></div>
              {items.length === 0 ? (
                <div className="p-8 text-center text-gray-400 text-sm">No items found</div>
              ) : (
                <ul className="divide-y divide-gray-200">
                  {items.map((item, idx) => (
                    <li key={idx} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                      <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50 flex items-center justify-center p-2 relative">
                        <Image src={item.product?.image || '/next.svg'} alt={item.product?.title || 'Product'} fill className="object-contain" unoptimized />
                      </div>
                      <div className="flex-1 text-center sm:text-left">
                        <h3 className="text-base font-bold text-gray-900 leading-tight mb-2">{item.product?.title || `Product #${item.productId?.substring(0, 8)}`}</h3>
                        <div className="flex flex-wrap justify-center sm:justify-start gap-x-6 gap-y-1 text-sm text-gray-600">
                          <p>Giá: <span className="font-medium text-gray-900">{formatVND(Number(item.price))}</span></p>
                          <p>Qty: <span className="font-medium text-gray-900">{item.quantity}</span></p>
                        </div>
                      </div>
                      <div className="text-right flex flex-col items-center sm:items-end gap-3 mt-4 sm:mt-0">
                        <p className="text-lg font-bold text-red-600">{formatVND(Number(item.price) * item.quantity)}</p>
                        {item.product?.id && <Link href={`/products/${item.product.id}`} className="text-sm font-medium text-red-600 hover:text-red-500">Xem sản phẩm</Link>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-bold text-gray-900 mb-6">Payment Summary</h2>
                <dl className="space-y-4 text-sm">
                  <div className="flex justify-between"><dt className="text-gray-500">Status</dt><dd className="font-medium text-red-600 uppercase">{order.status}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">Ordered on</dt><dd className="font-medium text-gray-900">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</dd></div>
                  {order.address && (
                    <div className="flex flex-col gap-1 pb-4 border-b border-gray-100">
                      <dt className="text-gray-500">Delivery to</dt>
                      <dd className="font-medium text-gray-900 text-xs">{order.address.street}, {order.address.ward}, {order.address.province}</dd>
                    </div>
                  )}
                  <div className="flex justify-between pt-2"><dt className="text-gray-500">Tiền hàng</dt><dd className="font-medium text-gray-900">{formatVND(itemsTotal)}</dd></div>
                  <div className="flex justify-between"><dt className="text-gray-500">Phí vận chuyển</dt><dd className="font-medium text-gray-900">{shipping > 0 ? formatVND(shipping) : 'Miễn phí'}</dd></div>
                  {discount > 0 && <div className="flex justify-between text-emerald-600"><dt>Giảm giá</dt><dd className="font-medium">-{formatVND(discount)}</dd></div>}
                  <div className="flex justify-between items-center border-t border-gray-100 pt-4 mt-4">
                    <dt className="text-base font-bold text-gray-900">Tổng thanh toán</dt>
                    <dd className="text-xl font-bold text-red-600">{formatVND(finalAmount)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
