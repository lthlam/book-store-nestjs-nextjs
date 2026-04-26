'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard, Package, Users, ShoppingCart,
  Ticket, LogOut, Menu, X,
  ChevronLeft, ChevronRight, MessageSquare
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const adminData = localStorage.getItem('admin');
    if (!adminData) {
      router.push('/admin-login');
    } else {
      Promise.resolve().then(() => setIsAuthChecking(false));
    }
  }, [router]);

  const handleLogout = (e: React.MouseEvent) => {
    e.preventDefault();
    localStorage.removeItem('admin');
    router.push('/admin-login');
  };

  if (isAuthChecking) {
    return <div className="flex h-screen items-center justify-center bg-gray-950 text-white font-mono">Đang bảo mật khu vực quản trị...</div>;
  }

  const navItems = [
    { name: 'Tổng quan', href: '/admin', icon: LayoutDashboard },
    { name: 'Sản phẩm', href: '/admin/products', icon: Package },
    { name: 'Đơn hàng', href: '/admin/orders', icon: ShoppingCart },
    { name: 'Người dùng', href: '/admin/users', icon: Users },
    { name: 'Mã giảm giá', href: '/admin/coupons', icon: Ticket },
    { name: 'Hỗ trợ', href: '/admin/inquiries', icon: MessageSquare },
  ];

  const renderSidebarContent = (isMobile = false) => (
    <>
      {/* Logo */}
      <div className={`flex items-center h-16 px-4 bg-slate-950 ${collapsed && !isMobile ? 'justify-center' : 'justify-between'}`}>
        {(!collapsed || isMobile) && (
          <Link href="/admin" className="text-lg font-bold text-white flex items-center gap-2 truncate">
            <div className="h-8 w-8 relative flex-shrink-0 bg-white rounded-lg p-1">
              <Image 
                src="/logo.png" 
                alt="DreamBook" 
                fill 
                className="object-contain"
              />
            </div>
            DreamBook Admin
          </Link>
        )}
        {collapsed && !isMobile && (
          <Link href="/admin" className="text-white">
            <div className="h-8 w-8 relative flex-shrink-0 bg-white rounded-lg p-1">
              <Image 
                src="/logo.png" 
                alt="DreamBook" 
                fill 
                className="object-contain"
              />
            </div>
          </Link>
        )}
        {isMobile && (
          <button className="text-gray-400 hover:text-white" onClick={() => setMobileOpen(false)}>
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Nav items */}
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="px-2 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            return (
              <Link key={item.name} href={item.href}
                onClick={() => isMobile && setMobileOpen(false)}
                title={collapsed && !isMobile ? item.name : undefined}
                className={`group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors
                  ${collapsed && !isMobile ? 'justify-center' : 'gap-3'}
                  ${isActive ? 'bg-red-600 text-white' : 'text-gray-300 hover:bg-slate-800 hover:text-white'}`}
              >
                <item.icon className="h-5 w-5 flex-shrink-0" />
                {(!collapsed || isMobile) && <span>{item.name}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom */}
      <div className={`p-3 bg-slate-950 ${collapsed && !isMobile ? 'flex justify-center' : 'space-y-2'}`}>
        <button onClick={handleLogout}
          title={collapsed && !isMobile ? 'Đăng xuất' : undefined}
          className={`w-full flex items-center px-3 py-2.5 text-sm font-medium text-red-500 rounded-lg hover:bg-red-500/10 transition-colors
            ${collapsed && !isMobile ? 'justify-center' : 'gap-3'}`}
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {(!collapsed || isMobile) && <span>Đăng xuất</span>}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">

      {/* Mobile backdrop */}
      {mobileOpen && (
        <div className="fixed inset-0 z-20 bg-gray-900/50 lg:hidden" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-30 w-64 bg-slate-900 flex flex-col transition-transform duration-300 lg:hidden
        ${mobileOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        {renderSidebarContent(true)}
      </aside>

      {/* Desktop sidebar */}
      <aside className={`hidden lg:flex flex-col bg-slate-900 transition-all duration-300 flex-shrink-0
        ${collapsed ? 'w-16' : 'w-64'}`}>
        {renderSidebarContent()}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white shadow-sm flex items-center justify-between px-4 sm:px-6 z-10 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center gap-3">
            {/* Mobile menu button */}
            <button className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </button>
            {/* Desktop collapse button */}
            <button
              className="hidden lg:flex items-center justify-center h-8 w-8 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors"
              onClick={() => setCollapsed(!collapsed)}
              title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {collapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
            </button>
          </div>

          
        </header>

        {/* Content */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
