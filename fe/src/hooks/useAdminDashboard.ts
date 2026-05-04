import { useQuery } from '@tanstack/react-query';
import { adminApi, api } from '@/lib/axios';

interface DashboardOrder {
  id: string;
  total: number;
  status: string;
  createdAt: string;
  user?: { name?: string };
}

interface DashboardProduct {
  id: string;
  title: string;
  image: string;
  price: number;
  soldCount: number;
  genre?: { name: string };
}

interface DashboardUser {
  id: string;
}

export function useAdminDashboard() {
  return useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const [usersRes, ordersRes, productsRes] = await Promise.all([
        adminApi.get<DashboardUser[]>('/users'),
        adminApi.get<DashboardOrder[]>('/orders'),
        api.get<{ data: DashboardProduct[]; total: number }>('/products?limit=100'),
      ]);

      const users = usersRes.data;
      const orders = ordersRes.data;
      const productsData = productsRes.data;
      const products = Array.isArray(productsData.data) ? productsData.data : [];

      const revenue = orders.reduce((sum, o) => sum + (Number(o.total) || 0), 0);

      const topProducts = [...products]
        .sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0))
        .slice(0, 5);

      const genreMap: Record<string, { name: string; value: number; revenue: number }> = {};
      products.forEach((p) => {
        const gName = p.genre?.name || 'Other';
        if (!genreMap[gName]) genreMap[gName] = { name: gName, value: 0, revenue: 0 };
        genreMap[gName].value += 1;
        genreMap[gName].revenue += (Number(p.price) || 0) * (p.soldCount || 0);
      });
      const genreData = Object.values(genreMap).sort((a, b) => b.revenue - a.revenue);

      return {
        userCount: users.length,
        orderCount: orders.length,
        productCount: productsData.total ?? products.length,
        totalRevenue: revenue,
        recentOrders: orders.slice(0, 5),
        allOrders: orders,
        topProducts,
        genreData,
      };
    },
    staleTime: 60_000, // 1 phút
  });
}
