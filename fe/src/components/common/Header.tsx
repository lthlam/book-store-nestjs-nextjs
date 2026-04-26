'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Heart, User, LogOut, Package, ChevronDown, LayoutGrid, Menu, X, Home, Info, ShoppingBag, Headset } from 'lucide-react';
import { useShop } from '../../context/ShopContext';
import { signOut } from 'next-auth/react';
import SessionSync from '../auth/SessionSync';
import { API_URL } from '@/utils/constants';

interface UserData {
  id?: string;
  name?: string;
  email?: string;
  contact?: string | number;
}

interface GenreData {
  id: string | number;
  name: string;
}

export default function Header() {
  const [user, setUser] = useState<UserData | null>(null);
  const [genres, setGenres] = useState<GenreData[]>([]);
  const [genreOpen, setGenreOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileGenreOpen, setMobileGenreOpen] = useState(false);
  const { cart, wishlist } = useShop();

  const genreRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);
  const wishlistCount = wishlist.length;

  useEffect(() => {
    Promise.resolve().then(() => {
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        try { setUser(JSON.parse(storedUser)); } catch (err) { console.error(err); }
      }
    });
    fetch(`${API_URL}/genres`)
      .then(r => r.json())
      .then(data => setGenres(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: Event) => {
      if (genreRef.current && !genreRef.current.contains(e.target as Node)) setGenreOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  // Close mobile menu on route change
  const closeMobileMenu = () => { setMobileMenuOpen(false); setMobileGenreOpen(false); };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    signOut({ callbackUrl: '/login' });
  };

  const COLS = 4;
  const genreColumns: GenreData[][] = Array.from({ length: COLS }, () => []);
  genres.forEach((g, i) => genreColumns[i % COLS].push(g));

  return (
    <>
      <SessionSync />
      <header className="sticky top-0 z-50 w-full bg-red-600 shadow-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-white flex-shrink-0">
            <div className="h-8 w-8 relative flex-shrink-0 bg-white rounded-lg p-1">
              <Image 
                src="/logo.png" 
                alt="DreamBook" 
                fill 
                className="object-contain"
              />
            </div>
            <span>DreamBook</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6 ml-6">
            {/* Genres dropdown */}
            <div
              className="relative"
              ref={genreRef}
              onMouseEnter={() => setGenreOpen(true)}
              onMouseLeave={() => setGenreOpen(false)}
            >
              <button
                onClick={() => { setGenreOpen(v => !v); setProfileOpen(false); }}
                className="flex items-center gap-1.5 text-sm font-medium text-white bg-red-700 hover:bg-red-800 px-3 py-2 rounded-lg transition-colors"
              >
                <LayoutGrid className="h-4 w-4" />
                Danh mục
                <ChevronDown className={`h-3.5 w-3.5 transition-transform duration-200 ${genreOpen ? 'rotate-180' : ''}`} />
              </button>

              {genreOpen && (
                <div className="absolute left-0 top-full pt-2 z-50 w-max">
                  <div className="bg-white rounded-2xl shadow-2xl ring-1 ring-gray-100 overflow-hidden p-5">
                    {genres.length === 0 ? (
                      <p className="text-sm text-gray-400 px-4 py-2">Đang tải...</p>
                    ) : (
                      <div className="grid gap-x-8 gap-y-1" style={{ gridTemplateColumns: `repeat(${Math.min(COLS, genreColumns.filter(c => c.length > 0).length)}, minmax(140px, 1fr))` }}>
                        {genreColumns.filter(col => col.length > 0).map((col, ci) => (
                          <div key={ci} className="space-y-1">
                            {col.map((genre: GenreData) => (
                              <Link
                                key={genre.id}
                                href={`/products?genre=${genre.id}`}
                                onClick={() => setGenreOpen(false)}
                                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 rounded-lg hover:bg-red-50 hover:text-red-600 transition-colors whitespace-nowrap"
                              >
                                <span className="h-1.5 w-1.5 rounded-full bg-red-400 flex-shrink-0" />
                                {genre.name}
                              </Link>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                    <div className="border-t border-gray-100 mt-3 pt-3">
                      <Link href="/products" onClick={() => setGenreOpen(false)}
                        className="flex items-center justify-center gap-2 text-sm font-semibold text-red-600 hover:text-red-700 transition-colors">
                        Xem tất cả sản phẩm →
                      </Link>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {[
              { href: '/products', label: 'Sản phẩm' },
              { href: '/about', label: 'Giới thiệu' },
              { href: '/contact', label: 'Liên hệ' },
            ].map(({ href, label }) => (
              <Link key={href} href={href}
                className="text-sm font-medium text-red-100 hover:text-white transition-colors relative group">
                {label}
                <span className="absolute -bottom-1 left-0 h-0.5 w-0 bg-white group-hover:w-full transition-all duration-200" />
              </Link>
            ))}
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1 ml-auto">

            <Link href="/wishlist" className="relative text-red-100 hover:text-white hover:bg-red-700 p-2 rounded-lg transition-colors">
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute top-1 right-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-white text-[8px] font-bold text-red-600">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link href="/cart" className="relative text-red-100 hover:text-white hover:bg-red-700 p-2 rounded-lg transition-colors">
              <ShoppingCart className="h-5 w-5" />
              {cartCount > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-white text-[9px] font-bold text-red-600">
                  {cartCount}
                </span>
              )}
            </Link>

            {/* Desktop profile */}
            {user ? (
              <div
                className="relative ml-1 hidden md:block"
                ref={profileRef}
                onMouseEnter={() => setProfileOpen(true)}
                onMouseLeave={() => setProfileOpen(false)}
              >
                <button
                  onClick={() => { setProfileOpen(v => !v); setGenreOpen(false); }}
                  className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white hover:bg-red-700 transition-colors"
                >
                  <User className="h-5 w-5 flex-shrink-0" />
                  <span className="hidden sm:block whitespace-nowrap max-w-[120px] truncate">{user.name || 'User'}</span>
                </button>
                {profileOpen && (
                  <div className="absolute right-0 top-full pt-2 z-50">
                    <div className="w-48 rounded-xl bg-white shadow-xl ring-1 ring-gray-200 overflow-hidden py-1">
                      <Link href="/profile" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <User className="h-4 w-4" /> Trang cá nhân
                      </Link>
                      <Link href="/orders" onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Package className="h-4 w-4" /> Đơn hàng của tôi
                      </Link>
                      <div className="border-t border-gray-100 mt-1 pt-1">
                        <button onClick={handleLogout}
                          className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                          <LogOut className="h-4 w-4" /> Đăng xuất
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login"
                className="ml-1 hidden md:flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-white bg-red-700 hover:bg-red-800 transition-colors">
                <User className="h-5 w-5" />
                <span>Đăng nhập</span>
              </Link>
            )}

            {/* Hamburger - mobile only */}
            <button
              onClick={() => setMobileMenuOpen(v => !v)}
              className="md:hidden ml-1 p-2 rounded-lg text-white hover:bg-red-700 transition-colors"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-red-700 border-t border-red-500 overflow-y-auto max-h-[calc(100vh-4rem)] overscroll-contain">
            <div className="px-4 py-3 space-y-1">

              <Link href="/" onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-white rounded-lg hover:bg-red-600 active:bg-red-800 transition-colors">
                <Home className="h-5 w-5" /> Trang chủ
              </Link>

              <Link href="/products" onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-white rounded-lg hover:bg-red-600 active:bg-red-800 transition-colors">
                <ShoppingBag className="h-5 w-5" /> Sản phẩm
              </Link>

              {/* Genre accordion */}
              <div>
                <button
                  onClick={() => setMobileGenreOpen(v => !v)}
                  className="w-full flex items-center justify-between gap-3 px-3 py-3 text-sm font-medium text-white rounded-lg hover:bg-red-600 active:bg-red-800 transition-colors"
                >
                  <span className="flex items-center gap-3"><LayoutGrid className="h-5 w-5" /> Danh mục</span>
                  <ChevronDown className={`h-4 w-4 transition-transform ${mobileGenreOpen ? 'rotate-180' : ''}`} />
                </button>
                {mobileGenreOpen && (
                  <div className="mt-1 ml-4 border-l-2 border-red-500 pl-3 space-y-1">
                    {genres.map((genre: GenreData) => (
                      <Link key={genre.id} href={`/products?genre=${genre.id}`} onClick={closeMobileMenu}
                        className="flex items-center gap-2 px-3 py-2 text-sm text-red-100 hover:text-white rounded-lg hover:bg-red-600 transition-colors">
                        <span className="h-1.5 w-1.5 rounded-full bg-red-300 flex-shrink-0" />
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              <Link href="/about" onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-white rounded-lg hover:bg-red-600 active:bg-red-800 transition-colors">
                <Info className="h-5 w-5" /> Giới thiệu
              </Link>

              <Link href="/contact" onClick={closeMobileMenu}
                className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-white rounded-lg hover:bg-red-600 active:bg-red-800 transition-colors">
                <Headset className="h-5 w-5" /> Liên hệ
              </Link>

              <div className="border-t border-red-500 pt-2 mt-2">
                {user ? (
                  <>
                    <Link href="/profile" onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-white rounded-lg hover:bg-red-600 transition-colors">
                      <User className="h-5 w-5" /> {user.name || 'Trang cá nhân'}
                    </Link>
                    <Link href="/orders" onClick={closeMobileMenu}
                      className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-white rounded-lg hover:bg-red-600 transition-colors">
                      <Package className="h-5 w-5" /> Đơn hàng của tôi
                    </Link>
                    <button onClick={() => { handleLogout(); closeMobileMenu(); }}
                      className="w-full flex items-center gap-3 px-3 py-3 text-sm font-medium text-red-200 rounded-lg hover:bg-red-600 transition-colors">
                      <LogOut className="h-5 w-5" /> Đăng xuất
                    </button>
                  </>
                ) : (
                  <Link href="/login" onClick={closeMobileMenu}
                    className="flex items-center gap-3 px-3 py-3 text-sm font-medium text-white rounded-lg hover:bg-red-600 transition-colors">
                    <User className="h-5 w-5" /> Đăng nhập
                  </Link>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
