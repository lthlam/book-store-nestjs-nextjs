import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Address, Province, Ward } from '@/types';

/** Lấy địa chỉ của user hiện tại — userId lấy từ JWT phía backend */
export function useMyAddresses() {
  return useQuery({
    queryKey: ['addresses', 'my'],
    queryFn: async () => {
      const { data } = await api.get<Address[]>('/addresses/my');
      return data;
    },
  });
}

export function useProvinces() {
  return useQuery({
    queryKey: ['provinces'],
    queryFn: async () => {
      const { data } = await api.get<Province[]>('/addresses/provinces');
      return data;
    },
    staleTime: Infinity,
  });
}

export function useWards(provinceCode: string | undefined) {
  return useQuery({
    queryKey: ['wards', provinceCode],
    queryFn: async () => {
      const { data } = await api.get<Ward[]>(`/addresses/wards?provinceCode=${provinceCode}`);
      return data;
    },
    enabled: !!provinceCode,
    staleTime: Infinity,
  });
}

/** Tạo địa chỉ — không cần truyền userId, backend lấy từ JWT */
export function useCreateAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: Omit<Record<string, unknown>, 'userId'>) =>
      api.post<Address>('/addresses', payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses', 'my'] }),
  });
}

export function useDeleteAddress() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/addresses/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['addresses', 'my'] }),
  });
}
