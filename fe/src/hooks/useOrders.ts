import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, adminApi } from '@/lib/axios';
import type { Order } from '@/types';

/** Lấy đơn hàng của user hiện tại — backend filter theo JWT */
export function useMyOrders() {
  return useQuery({
    queryKey: ['orders', 'mine'],
    queryFn: async () => {
      const { data } = await api.get<Order[]>('/orders/my');
      return data;
    },
  });
}

/** Lấy chi tiết một đơn hàng */
export function useOrder(id: string) {
  return useQuery({
    queryKey: ['order', id],
    queryFn: async () => {
      const { data } = await api.get<Order>(`/orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

/** Lấy tất cả đơn hàng (admin) */
export function useAllOrders() {
  return useQuery({
    queryKey: ['orders', 'all'],
    queryFn: async () => {
      const { data } = await adminApi.get<Order[]>('/orders');
      return data;
    },
  });
}

/** Cập nhật trạng thái đơn hàng (user) */
export function useUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      api.patch(`/orders/${id}`, { status }).then((r) => r.data),
    onSuccess: (data, { id }) => {
      // Cập nhật cache trực tiếp thay vì chỉ invalidate — UI cập nhật ngay lập tức
      qc.setQueryData(['order', id], data);
      qc.setQueryData(['admin-order-detail', id], (old: unknown) =>
        old ? { ...(old as Record<string, unknown>), order: data } : old,
      );
      qc.invalidateQueries({ queryKey: ['orders'] });
    },
  });
}

/** Cập nhật trạng thái đơn hàng (admin) — dùng adminApi */
export function useAdminUpdateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.patch(`/orders/${id}`, { status }).then((r) => r.data),
    onSuccess: (data, { id }) => {
      // setQueryData cập nhật cache ngay lập tức, không cần chờ refetch
      qc.setQueryData(['admin-order-detail', id], (old: unknown) =>
        old ? { ...(old as Record<string, unknown>), order: data } : old,
      );
      qc.invalidateQueries({ queryKey: ['orders', 'all'] });
    },
  });
}

/** Tạo đơn hàng mới */
export function useCreateOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post('/orders', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['orders'] }),
  });
}
