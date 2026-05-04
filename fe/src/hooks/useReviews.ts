import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Review } from '@/types';

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['reviews', productId],
    queryFn: async () => {
      const { data } = await api.get<Review[]>(`/reviews/product/${productId}`);
      return data;
    },
    enabled: !!productId,
  });
}

/** Kiểm tra user hiện tại có thể đánh giá không — userId lấy từ JWT phía backend */
export function useCanReview(productId: string, enabled = false) {
  return useQuery({
    queryKey: ['can-review', productId],
    queryFn: async () => {
      const { data } = await api.get<{ eligible: boolean; reason?: string }>(
        `/reviews/can-review?productId=${productId}`,
      );
      return data;
    },
    enabled: !!productId && enabled,
  });
}

/** Tạo review — không truyền userId, backend lấy từ JWT */
export function useCreateReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { productId: string; rating: number; comment: string }) =>
      api.post('/reviews', payload).then((r) => r.data),
    onSuccess: (_, { productId }) => {
      qc.invalidateQueries({ queryKey: ['reviews', productId] });
      qc.invalidateQueries({ queryKey: ['can-review', productId] });
      qc.invalidateQueries({ queryKey: ['product', productId] });
    },
  });
}

/** Xóa review — không truyền userId, backend lấy từ JWT */
export function useDeleteReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (vars: { id: string; productId: string }) =>
      api.delete(`/reviews/${vars.id}`),
    onSuccess: (_, { productId }) => {
      qc.invalidateQueries({ queryKey: ['reviews', productId] });
      qc.invalidateQueries({ queryKey: ['can-review', productId] });
      qc.invalidateQueries({ queryKey: ['product', productId] });
    },
  });
}
