'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, XCircle, Loader2, ArrowRight, ShoppingBag } from 'lucide-react';
import { useShop } from '../../../../context/ShopContext';

function MomoReturnContent() {
  const searchParams = useSearchParams();
  const { clearCart } = useShop();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [orderId, setOrderId] = useState('');

  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  useEffect(() => {
    const verifyPayment = async () => {
      try {
        const params = Object.fromEntries(searchParams.entries());
        const queryString = new URLSearchParams(params).toString();
        
        const res = await fetch(`${apiUrl}/orders/momo-return?${queryString}`);
        const data = await res.json();

        if (data.success) {
          setStatus('success');
          setOrderId(data.orderId);
          clearCart();
        } else {
          setStatus('error');
          setMessage(data.message || 'Giao dịch MoMo không thành công.');
        }
      } catch (error) {
        console.error('Verify error:', error);
        setStatus('error');
        setMessage('Lỗi kết nối máy chủ.');
      }
    };

    if (searchParams.get('orderId')) {
      verifyPayment();
    }
  }, [searchParams, apiUrl, clearCart]);

  if (status === 'loading') {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 text-pink-600 animate-spin mb-4" />
        <h2 className="text-xl font-semibold text-gray-900">Đang xác thực giao dịch MoMo...</h2>
        <p className="text-gray-500 mt-2 text-center text-sm">Vui lòng không tắt hoặc tải lại trang này.</p>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4 bg-gray-50/50">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-gray-100 p-8 text-center">
        {status === 'success' ? (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-pink-100 mb-6">
              <CheckCircle2 className="h-12 w-12 text-pink-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Thanh toán MoMo thành công!</h2>
            <p className="text-gray-600 mb-6 px-4">Đơn hàng của bạn đã được thanh toán qua ví MoMo.</p>
            
            <div className="bg-gray-50 rounded-2xl p-4 mb-8 text-left border border-gray-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-500">Mã đơn hàng:</span>
                <span className="font-mono font-bold text-gray-900">#{orderId.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Phương thức:</span>
                <span className="text-pink-600 font-bold">Ví MoMo</span>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Link
                href={`/orders/${orderId}`}
                className="flex items-center justify-center gap-2 rounded-xl bg-gray-900 px-6 py-3 text-sm font-semibold text-white hover:bg-gray-800 transition-all"
              >
                Xem chi tiết đơn hàng
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link href="/" className="text-sm font-medium text-gray-500 hover:text-pink-600 py-2">
                Quay về trang chủ
              </Link>
            </div>
          </>
        ) : (
          <>
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 mb-6">
              <XCircle className="h-12 w-12 text-red-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Thanh toán thất bại</h2>
            <p className="text-gray-600 mb-8 px-4">{message}</p>
            
            <div className="flex flex-col gap-3">
              <Link
                href="/cart"
                className="flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-6 py-3 text-sm font-semibold text-white hover:bg-pink-500 transition-all"
              >
                <ShoppingBag className="h-4 w-4" />
                Quay lại giỏ hàng
              </Link>
              <Link href="/" className="text-sm font-medium text-gray-500 hover:text-pink-600 py-2">
                Quay về trang chủ
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function MomoReturnPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[80vh] flex flex-col items-center justify-center p-4">
        <Loader2 className="h-12 w-12 text-pink-600 animate-spin mb-4" />
      </div>
    }>
      <MomoReturnContent />
    </Suspense>
  );
}
