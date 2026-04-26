'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  ShoppingCart, 
  Package, 
  DollarSign, 
  Plus, 
  ArrowUpRight,
  ExternalLink,
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  PieChart, 
  Pie, 
  Cell, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
} from 'recharts';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { API_URL } from '@/utils/constants';
import { formatVND } from '@/utils/format';

interface Order {
  id: string;
  total: number;
  status: string;
  createdAt: string;
}

interface Product {
  id: string;
  title: string;
  image: string;
  price: number;
  soldCount: number;
  genre?: { name: string };
}

export default function AdminDashboardPage() {
  const [data, setData] = useState({
    userCount: 0,
    orderCount: 0,
    productCount: 0,
    totalRevenue: 0,
    recentOrders: [] as Order[],
    allOrders: [] as Order[],
    topProducts: [] as Product[],
    genreData: [] as { name: string, value: number, revenue: number }[]
  });
  const [loading, setLoading] = useState(true);
  const [chartTab, setChartTab] = useState<'revenue' | 'orders'>('revenue');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [usersRes, ordersRes, productsRes] = await Promise.all([
          fetch(`${API_URL}/users`),
          fetch(`${API_URL}/orders`),
          fetch(`${API_URL}/products`)
        ]);

        const users = await usersRes.json();
        const orders = await ordersRes.json();
        const productsData = await productsRes.json();
        const products = Array.isArray(productsData.data) ? productsData.data : (Array.isArray(productsData) ? productsData : []);

        const revenue = Array.isArray(orders) 
          ? orders.reduce((sum: number, order: Order) => sum + (Number(order.total) || 0), 0)
          : 0;

        // Process Top Products
        const sortedProducts = Array.isArray(products) 
          ? [...products].sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0)).slice(0, 5)
          : [];

        // Process Genre Distribution
        const genreMap: Record<string, { name: string, value: number, revenue: number }> = {};
        if (Array.isArray(products)) {
          products.forEach(p => {
            const gName = p.genre?.name || 'Other';
            if (!genreMap[gName]) {
              genreMap[gName] = { name: gName, value: 0, revenue: 0 };
            }
            genreMap[gName].value += 1;
            // Approximate genre revenue (this is a simplified calculation)
            genreMap[gName].revenue += (Number(p.price) || 0) * (p.soldCount || 0);
          });
        }
        const genreData = Object.values(genreMap).sort((a, b) => b.revenue - a.revenue);

        setData({
          userCount: Array.isArray(users) ? users.length : 0,
          orderCount: Array.isArray(orders) ? orders.length : 0,
          productCount: productsData.total ?? products.length,
          totalRevenue: revenue,
          recentOrders: Array.isArray(orders) ? orders.slice(0, 5) : [],
          allOrders: Array.isArray(orders) ? orders : [],
          topProducts: sortedProducts,
          genreData
        });
      } catch (error) {
        console.error('Dashboard fetch error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = [
    { name: 'Tổng người dùng', value: data.userCount.toLocaleString(), icon: Users, color: 'text-blue-600', bg: 'bg-blue-50/50', border: 'border-blue-100' },
    { name: 'Tổng đơn hàng', value: data.orderCount.toLocaleString(), icon: ShoppingCart, color: 'text-indigo-600', bg: 'bg-indigo-50/50', border: 'border-indigo-100' },
    { name: 'Tổng sản phẩm', value: data.productCount.toLocaleString(), icon: Package, color: 'text-rose-600', bg: 'bg-rose-50/50', border: 'border-rose-100' },
    { name: 'Tổng doanh thu', value: formatVND(data.totalRevenue), icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-50/50', border: 'border-emerald-100' },
  ];

  const COLORS = ['#8b5cf6', '#0ea5e9', '#f43f5e', '#10b981', '#f59e0b', '#ec4899'];

  const salesData = useMemo(() => {
    if (!data.allOrders || data.allOrders.length === 0) return [];
    const months = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'T8', 'T9', 'T10', 'T11', 'T12'];
    const monthlyData: Record<string, { name: string, revenue: number, orders: number }> = {};
    
    // Fill all months to ensure a continuous line
    months.forEach(m => monthlyData[m] = { name: m, revenue: 0, orders: 0 });

    data.allOrders.forEach(order => {
      const date = new Date(order.createdAt || 0);
      const monthName = months[date.getMonth()];
      if (monthlyData[monthName]) {
        monthlyData[monthName].revenue += Number(order.total || 0);
        monthlyData[monthName].orders += 1;
      }
    });

    return Object.values(monthlyData);
  }, [data.allOrders]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="relative">
          <div className="h-16 w-16 border-4 border-rose-100 rounded-full"></div>
          <div className="absolute top-0 h-16 w-16 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="space-y-8 pb-10"
    >
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Tổng quan</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Số liệu thực tế cửa hàng
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link href="/admin/products" className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white rounded-xl text-sm font-semibold hover:bg-gray-800 transition-all shadow-sm">
            <Plus className="h-4 w-4" />
            Thêm sản phẩm
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {stats.map((stat, idx) => (
          <motion.div 
            key={idx} 
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className={`bg-white p-5 rounded-3xl shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] border ${stat.border} flex flex-col justify-between h-full group transition-all`}
          >
            <div className="flex items-start justify-between">
              <div className={`p-3 rounded-2xl ${stat.bg} ${stat.color} transition-colors group-hover:bg-white group-hover:shadow-inner`}>
                <stat.icon className="h-6 w-6" />
              </div>
            </div>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-500">{stat.name}</p>
              <p className="text-2xl font-black text-gray-900 mt-1">{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Revenue Performance */}
        <motion.div 
          variants={itemVariants}
          className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 lg:col-span-2"
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-black text-gray-900">Hiệu quả doanh thu</h2>
              <p className="text-sm text-gray-500 font-medium">Mục tiêu doanh thu và số lượng đơn hàng hàng tháng</p>
            </div>
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button 
                onClick={() => setChartTab('revenue')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${chartTab === 'revenue' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Doanh thu
              </button>
              <button 
                onClick={() => setChartTab('orders')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${chartTab === 'orders' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-900'}`}
              >
                Đơn hàng
              </button>
            </div>
          </div>
          <div className="h-[340px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={salesData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorChart" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={chartTab === 'revenue' ? '#8b5cf6' : '#10b981'} stopOpacity={0.2}/>
                    <stop offset="95%" stopColor={chartTab === 'revenue' ? '#8b5cf6' : '#10b981'} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 600 }} tickFormatter={(val) => chartTab === 'revenue' ? (val >= 1000000 ? (val/1000000).toFixed(1) + 'M' : val) : val} />
                <Tooltip 
                  cursor={{ stroke: chartTab === 'revenue' ? '#8b5cf6' : '#10b981', strokeWidth: 2, strokeDasharray: '5 5' }}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)', padding: '12px' }}
                />
                <Area type="monotone" dataKey={chartTab} name={chartTab === 'revenue' ? 'Doanh thu' : 'Đơn hàng'} stroke={chartTab === 'revenue' ? '#8b5cf6' : '#10b981'} strokeWidth={4} fillOpacity={1} fill="url(#colorChart)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Sales by Category (Small Chart) */}
        <motion.div 
          variants={itemVariants}
          className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 flex flex-col"
        >
          <div className="mb-8">
            <h2 className="text-xl font-black text-gray-900">Phân phối thể loại</h2>
            <p className="text-sm text-gray-500 font-medium">Các danh mục hàng đầu theo doanh thu</p>
          </div>
          <div className="flex-1 min-h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.genreData.slice(0, 5)}
                  cx="50%"
                  cy="45%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={8}
                  dataKey="revenue"
                  stroke="none"
                >
                  {data.genreData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -1px rgb(0 0 0 / 0.1)' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-3">
            {(() => {
              const totalGenreWeight = data.genreData.reduce((sum, g) => sum + g.revenue, 0) || 1;
              return data.genreData.slice(0, 3).map((genre, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: COLORS[idx] }}></div>
                    <span className="text-sm font-semibold text-gray-700">{genre.name}</span>
                  </div>
                  <span className="text-xs font-bold text-gray-500">
                    {Math.round((genre.revenue / totalGenreWeight) * 100)}%
                  </span>
                </div>
              ));
            })()}
          </div>
        </motion.div>
      </div>

      {/* Bottom Insights Row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Top Selling Books */}
        <motion.div 
          variants={itemVariants}
          className="bg-white p-8 rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 xl:col-span-1"
        >
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-black text-gray-900">Sản phẩm bán chạy</h2>
            <Link href="/admin/products" className="text-xs font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1">
              Xem tất cả <ExternalLink className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-6">
            {data.topProducts.map((product, idx) => (
              <div key={idx} className="flex items-center gap-4 group cursor-default">
                <div className="relative h-14 w-14 rounded-2xl overflow-hidden bg-gray-100 border border-gray-100 flex-shrink-0">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={product.image || '/next.svg'} 
                    alt={product.title} 
                    className="w-full h-full object-cover" 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-bold text-gray-900 truncate uppercase">{product.title}</h4>
                  <p className="text-xs text-gray-500 font-medium">{product.genre?.name || 'Novel'}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-black text-gray-900">{product.soldCount || 0}</p>
                  <p className="text-[10px] font-bold text-gray-400">ĐÃ BÁN</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Recent Orders Enhanced */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-[2rem] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden xl:col-span-2"
        >
          <div className="px-8 py-7 border-b border-gray-100 flex items-center justify-between bg-gray-50/30">
            <h2 className="text-xl font-black text-gray-900">Giao dịch gần đây</h2>
            <Link href="/admin/orders" className="text-xs font-bold text-gray-500 hover:text-gray-900 px-3 py-1 bg-white rounded-lg border border-gray-200">Lịch sử</Link>
          </div>
          <div className="overflow-x-auto">
            {data.recentOrders.length > 0 ? (
              <table className="min-w-full">
                <thead>
                  <tr className="border-b border-gray-50">
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Khách hàng & ID</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Ngày</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Thành tiền</th>
                    <th className="px-8 py-5 text-left text-[10px] font-black text-gray-400 uppercase tracking-[0.1em]">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {data.recentOrders.map((order, index) => (
                    <tr key={index} className="hover:bg-gray-50/50 transition-colors cursor-default">
                      <td className="px-8 py-5 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold text-xs">
                            <ArrowUpRight className="h-4 w-4" />
                          </div>
                          <div>
                            <p className="text-xs font-black text-gray-900">ORD-#{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-[10px] font-medium text-gray-400">Order Ref</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-xs font-bold text-gray-600">
                        {new Date(order.createdAt || 0).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap text-sm font-black text-gray-900">
                        {formatVND(Number(order.total || 0))}
                      </td>
                      <td className="px-8 py-5 whitespace-nowrap">
                        {(() => {
                          const s = (order.status || 'pending').toLowerCase();
                          const map: Record<string, { color: string, label: string }> = {
                            pending: { color: 'bg-orange-100 text-orange-700', label: 'Chờ xử lý' },
                            confirmed: { color: 'bg-indigo-100 text-indigo-700', label: 'Đã xác nhận' },
                            paid: { color: 'bg-indigo-100 text-indigo-700', label: 'Đã xác nhận' },
                            shipped: { color: 'bg-amber-100 text-amber-700', label: 'Đang vận chuyển' },
                            delivered: { color: 'bg-emerald-100 text-emerald-700', label: 'Đã hoàn thành' },
                            cancelled: { color: 'bg-rose-100 text-rose-700', label: 'Đã hủy' },
                          };
                          const meta = map[s] ?? { color: 'bg-gray-100 text-gray-700', label: s };
                          return (
                            <span className={`px-3 py-1 inline-flex text-[10px] font-black uppercase tracking-wider rounded-lg ${meta.color}`}>
                              {meta.label}
                            </span>
                          );
                        })()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="p-10 text-center flex flex-col items-center gap-2">
                <ShoppingCart className="h-10 w-10 text-gray-200" />
                <p className="text-sm font-bold text-gray-400">Chưa có giao dịch nào được ghi lại.</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
