'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, X, Heart } from 'lucide-react';
import { useShop } from '../../../context/ShopContext';
import { Product } from '@/types';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useShop();

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 mb-8 border-b border-gray-200 pb-5">
          <Heart className="h-8 w-8 text-red-500 fill-red-100" />
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">My Wishlist</h1>
        </div>

        {wishlist && wishlist.length > 0 ? (
          <div className="grid grid-cols-1 gap-y-10 gap-x-6 sm:grid-cols-2 lg:grid-cols-4 xl:gap-x-8">
            {wishlist.map((item) => (
              <div key={item.id} className="group relative bg-white rounded-2xl shadow-sm border border-gray-100 p-4 hover:shadow-xl transition-shadow flex flex-col h-full cursor-pointer">
                {/* Full-card link overlay */}
                <Link href={`/products/${item.id}`} className="absolute inset-0 z-10 rounded-2xl" aria-label={item.title} />

                {/* Remove button */}
                <button
                  onClick={(e) => { e.preventDefault(); toggleWishlist(item as Product); }}
                  className="absolute top-2 right-2 z-20 bg-white rounded-full p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 shadow-sm transition-all"
                  title="Remove from wishlist"
                >
                  <X className="h-4 w-4" />
                </button>

                <div className="relative h-64 w-full overflow-hidden rounded-lg bg-gray-100 flex items-center justify-center p-4">
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </div>

                <div className="mt-4 flex-1">
                  <h3 className="text-base font-semibold text-gray-900 leading-tight line-clamp-2 group-hover:text-red-600 transition-colors">
                    {item.title}
                  </h3>
                  <p className="mt-1 text-lg font-bold text-red-600">
                    {Number(item.price).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-gray-100 relative z-20">
                  <button
                    onClick={(e) => { e.preventDefault(); addToCart(item); }}
                    className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors shadow-sm">
                    <ShoppingCart className="h-4 w-4" /> Add to Cart
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-white rounded-2xl border border-gray-200">
            <Heart className="mx-auto h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-semibold text-gray-900">Your wishlist is empty</h2>
            <p className="mt-2 text-gray-500 mb-8">You haven&apos;t added any books to your wishlist yet.</p>
            <Link 
              href="/products" 
              className="inline-flex items-center justify-center rounded-xl bg-red-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-red-500 transition-colors"
            >
              Continue Shopping
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
