'use client';

import React from 'react';
import { ShopProvider } from '../context/ShopContext';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ShopProvider>
      {children}
    </ShopProvider>
  );
}
