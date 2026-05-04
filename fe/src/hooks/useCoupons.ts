import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, adminApi } from '@/lib/axios';
import type { Coupon } from '@/types';

export function useActiveCoupons() {
  return useQuery({
    queryKey: ['coupons', 'active'],
    queryFn: async () => {
      const { data } = await api.get<Coupon[]>('/coupons/active');
      return data;
    },
  });
}

export function useAllCoupons() {
  return useQuery({
    queryKey: ['coupons', 'all'],
    queryFn: async () => {
      const { data } = await adminApi.get<Coupon[]>('/coupons');
      return data;
    },
  });
}

export function useApplyCoupon() {
  return useMutation({
    mutationFn: ({ code, orderTotal }: { code: string; orderTotal: number }) =>
      api.post('/coupons/apply', { code, orderTotal }).then((r) => r.data),
  });
}

export function useCreateCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      adminApi.post('/coupons', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  });
}

export function useDeleteCoupon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.delete(`/coupons/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  });
}
