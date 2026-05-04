import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Product } from '@/types';

export interface ProductFilters {
  sort?: string;
  order?: 'ASC' | 'DESC';
  limit?: number;
  page?: number;
  search?: string;
  genreId?: string;
  excludeId?: string;
  genreIds?: string[];
  authorIds?: string[];
  publisherIds?: string[];
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  special?: boolean;
}

async function fetchProducts(filters: ProductFilters) {
  const params = new URLSearchParams();
  if (filters.sort) params.set('sort', filters.sort);
  if (filters.order) params.set('order', filters.order);
  if (filters.limit) params.set('limit', String(filters.limit));
  if (filters.page) params.set('page', String(filters.page));
  if (filters.search) params.set('search', filters.search);
  if (filters.genreId) params.set('genreId', filters.genreId);
  if (filters.excludeId) params.set('excludeId', filters.excludeId);
  filters.genreIds?.forEach((id) => params.append('genreIds', id));
  filters.authorIds?.forEach((id) => params.append('authorIds', id));
  filters.publisherIds?.forEach((id) => params.append('publisherIds', id));
  if (filters.minPrice !== undefined) params.set('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.set('maxPrice', String(filters.maxPrice));
  if (filters.rating !== undefined) params.set('rating', String(filters.rating));
  if (filters.special !== undefined) params.set('special', String(filters.special));

  const { data } = await api.get<{ data: Product[]; total: number }>(
    `/products?${params.toString()}`,
  );
  return data;
}

export function useProducts(filters: ProductFilters = {}) {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: () => fetchProducts(filters),
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      const { data } = await api.get<Product>(`/products/${id}`);
      return data;
    },
    enabled: !!id,
  });
}
