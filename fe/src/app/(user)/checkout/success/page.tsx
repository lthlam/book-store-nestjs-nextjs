'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { CheckCircle, Package } from 'lucide-react';

export default function OrderSuccessPage() {
  const [user, setUser] = useState<Record<string, unknown> | null>(null);
  const [orderInfo, setOrderInfo] = useState<{ total: number } | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) Promise.resolve().then(() => setUser(JSON.parse(stored)));

    const info = sessionStorage.getItem('lastOrder');
    if (info) {
      Promise.resolve().then(() => setOrderInfo(JSON.parse(info)));
      sessionStorage.removeItem('lastOrder');
    }
  }, []);

  return (
    <div className="bg-gray-50 min-h-[80vh] flex items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100 transform transition-all">
        
        <div className="bg-red-600 px-6 py-10 text-center">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-white mb-4">
            <CheckCircle className="h-12 w-12 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-1">Order Successful!</h2>
          {user && (
            <p className="text-red-100 font-medium">Thank you, {(user.name as string) || (user.email as string)}</p>
          )}
        </div>

        <div className="px-6 py-8">
          <div className="text-center mb-8">
            <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Your order has been received</p>
            <p className="text-base text-gray-900 mt-2">We&apos;ll process your order as soon as possible.</p>
          </div>

          {orderInfo && (
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="text-sm font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">Payment Summary</h3>
              <div className="flex justify-between items-center">
                <span className="text-base font-bold text-gray-900">Total Amount</span>
                <span className="text-lg font-bold text-red-600">
                  {Number(orderInfo.total).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                </span>
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3">
            <Link 
              href="/orders" 
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-4 text-sm font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
            >
              <Package className="h-5 w-5" /> View My Orders
            </Link>
            <Link 
              href="/" 
              className="w-full flex items-center justify-center rounded-xl bg-white border border-gray-300 px-4 py-4 text-sm font-bold text-gray-700 hover:bg-gray-50 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
