'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Trash2, Minus, Plus, ArrowLeft, Truck } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';

export default function CartPage() {
  const { cart: cartItems, updateQuantity, removeFromCart } = useShop();

  const sum = cartItems.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const freeShipThreshold = 500000;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        
        {cartItems.length > 0 ? (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Giỏ hàng của bạn</h1>
              <span className="text-gray-500 font-medium">{cartItems.length} sản phẩm</span>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <ul role="list" className="divide-y divide-gray-200">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex py-6 px-6 sm:px-8">
                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200 bg-gray-50 p-2 relative">
                      <Image
                        src={item.product.image}
                        alt={item.product.title}
                        fill
                        className="object-contain"
                        unoptimized
                      />
                    </div>

                    <div className="ml-4 flex flex-1 flex-col justify-between">
                      <div>
                        <div className="flex justify-between text-base font-medium text-gray-900">
                          <h3 className="line-clamp-1">
                            <Link href={`/products/${item.product.id}`}>{item.product.title}</Link>
                          </h3>
                          <p className="ml-4 whitespace-nowrap">{(item.product.price * item.quantity).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</p>
                        </div>
                        <p className="mt-1 text-sm text-gray-500">{item.product.genre?.name}</p>
                        <p className="mt-1 text-sm text-red-600 font-medium">{item.product.price.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })} / cuốn</p>
                      </div>
                      
                      <div className="flex flex-1 items-end justify-between text-sm">
                        <div className="flex border border-gray-300 rounded-md">
                          <button 
                            onClick={() => updateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors rounded-l-md"
                          >
                            <Minus className="h-4 w-4" />
                          </button>
                          <input 
                            type="number" 
                            value={item.quantity} 
                            readOnly 
                            className="w-12 text-center border-x border-gray-300 text-gray-900 focus:outline-none"
                          />
                          <button 
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="px-3 py-1 text-gray-600 hover:bg-gray-100 transition-colors rounded-r-md"
                          >
                            <Plus className="h-4 w-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="font-medium text-red-500 hover:text-red-400 flex items-center gap-1"
                        >
                          <Trash2 className="h-4 w-4" /> Xóa
                        </button>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* Footer: total + freeship + checkout */}
            <div className="mt-6 border-t border-gray-200 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <div className="flex items-baseline gap-3">
                  <span className="text-gray-500 text-sm">Tổng cộng</span>
                  <span className="text-2xl font-bold text-gray-900">{sum.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</span>
                </div>
                <p className={`flex items-center gap-1 mt-1 text-xs ${sum >= freeShipThreshold ? 'text-green-600' : 'text-amber-600'}`}>
                  <Truck className="h-3.5 w-3.5" />
                  {sum >= freeShipThreshold
                    ? '🎉 Được miễn phí vận chuyển!'
                    : <>Mua thêm <strong className="mx-1">{(freeShipThreshold - sum).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</strong> để freeship</>
                  }
                </p>
                <Link href="/products" className="inline-flex items-center mt-2 text-sm font-medium text-gray-400 hover:text-gray-600">
                  <ArrowLeft className="h-3.5 w-3.5 mr-1" /> Tiếp tục mua
                </Link>
              </div>
              <Link
                href="/checkout"
                className="flex items-center justify-center rounded-xl bg-red-600 px-8 py-3 text-sm font-bold text-white shadow-sm hover:bg-red-700 transition-colors"
              >
                Thanh toán
              </Link>
            </div>
          </div>
        ) : (
          <div className="text-center py-24 bg-white rounded-2xl border border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">Giỏ hàng rỗng</h2>
            <p className="mt-2 text-gray-500 mb-8">Dường như bạn chưa thêm sản phẩm nào vào giỏ hàng.</p>
            <Link 
              href="/products" 
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-red-500 transition-colors"
            >
              Tiếp tục mua sắm
            </Link>
          </div>
        )}

      </div>
    </div>
  );
}
