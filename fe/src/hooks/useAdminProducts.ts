import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, api } from '@/lib/axios';
import type { Product, Genre, Author, Publisher } from '@/types';

export interface AdminProductFilters {
  page?: number;
  search?: string;
  genreId?: string;
  authorId?: string;
  publisherId?: string;
}

export function useAdminProducts(filters: AdminProductFilters = {}) {
  const { page = 1, search, genreId, authorId, publisherId } = filters;
  const params = new URLSearchParams();
  params.set('limit', '20');
  params.set('page', String(page));
  if (search) params.set('search', search);
  if (genreId) params.append('genreIds', genreId);
  if (authorId) params.append('authorIds', authorId);
  if (publisherId) params.append('publisherIds', publisherId);

  return useQuery({
    queryKey: ['admin-products', filters],
    queryFn: async () => {
      const { data } = await api.get<{ data: Product[]; total: number }>(`/products?${params.toString()}`);
      return data;
    },
  });
}

export function useCreateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      adminApi.post<Product>('/products', body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
}

export function useUpdateProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: string } & Record<string, unknown>) =>
      adminApi.patch<Product>(`/products/${id}`, body).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
}

export function useDeleteProduct() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminApi.delete(`/products/${id}`),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
}

export function useBulkUploadProducts() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) =>
      adminApi.post('/products/bulk', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['admin-products'] }),
  });
}

export function useUploadImage() {
  return useMutation({
    mutationFn: (formData: FormData) =>
      adminApi.post<{ url: string }>('/uploads', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      }).then((r) => r.data),
  });
}

export function useCreateGenre() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      adminApi.post<Genre>('/genres', { name }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['genres'] }),
  });
}

export function useCreateAuthor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      adminApi.post<Author>('/authors', { name }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['authors'] }),
  });
}

export function useCreatePublisher() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (name: string) =>
      adminApi.post<Publisher>('/publishers', { name }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['publishers'] }),
  });
}
