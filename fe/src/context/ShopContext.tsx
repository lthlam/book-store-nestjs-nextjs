'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useToast } from './ToastContext';
import { Product, OrderItem as CartItem } from '@/types';

interface ShopContextType {
  cart: CartItem[];
  wishlist: Product[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  toggleWishlist: (product: Product) => void;
  isInWishlist: (productId: string) => boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Product[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  const toast = useToast();

  useEffect(() => {
    Promise.resolve().then(() => {
      setIsMounted(true);
      try {
        const storedCart = localStorage.getItem('cart');
        if (storedCart) setCart(JSON.parse(storedCart));

        const storedWishlist = localStorage.getItem('wishlist');
        if (storedWishlist) setWishlist(JSON.parse(storedWishlist));
      } catch (err) {
        console.error('Error loading shop state', err);
      }
    });
  }, []);

  useEffect(() => {
    if (isMounted) {
      localStorage.setItem('cart', JSON.stringify(cart));
      localStorage.setItem('wishlist', JSON.stringify(wishlist));
    }
  }, [cart, wishlist, isMounted]);

  const addToCart = (product: Product, quantity: number = 1) => {
    const existing = cart.find((item) => item.product.id === product.id);
    if (existing) {
      setCart((prev) =>
        prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        )
      );
      toast.success(`Đã cập nhật số lượng trong giỏ hàng`);
    } else {
      setCart((prev) => [...prev, { id: product.id, product, quantity, price: product.price }]);
      toast.success(`Đã thêm vào giỏ hàng!`);
    }
  };

  const removeFromCart = (productId: string) => {
    const item = cart.find(i => i.product.id === productId);
    setCart((prev) => prev.filter((i) => i.product.id !== productId));
    if (item) toast.info(`Đã xóa khỏi giỏ hàng`);
  };

  const updateQuantity = (productId: string, quantity: number) => {
    setCart((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: Math.max(1, quantity) } : item))
    );
  };

  const clearCart = () => setCart([]);

  const toggleWishlist = (product: Product) => {
    const exists = wishlist.some((item) => item.id === product.id);
    if (exists) {
      setWishlist((prev) => prev.filter((item) => item.id !== product.id));
      toast.info(`Đã xóa khỏi danh sách yêu thích`);
    } else {
      setWishlist((prev) => [...prev, product]);
      toast.success(`Đã thêm vào danh sách yêu thích ❤️`);
    }
  };

  const isInWishlist = (productId: string) => {
    return wishlist.some((item) => item.id === productId);
  };

  return (
    <ShopContext.Provider value={{ cart, wishlist, addToCart, removeFromCart, updateQuantity, clearCart, toggleWishlist, isInWishlist }}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => {
  const context = useContext(ShopContext);
  if (!context) throw new Error('useShop must be used within ShopProvider');
  return context;
};
