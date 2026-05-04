'use client';

import React from 'react';
import { ShopProvider } from '../context/ShopContext';

/**
 * Providers cho (user) route group.
 * QueryClientProvider và ToastProvider đã được đặt ở RootProviders (root layout).
 * Chỉ cần ShopProvider ở đây vì cart/wishlist chỉ dùng trong user routes.
 */
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ShopProvider>
      {children}
    </ShopProvider>
  );
}
