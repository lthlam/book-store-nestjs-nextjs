import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/axios';
import type { Genre, Author, Publisher } from '@/types';

export function useGenres() {
  return useQuery({
    queryKey: ['genres'],
    queryFn: async () => {
      const { data } = await api.get<Genre[]>('/genres');
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 phút — khớp với cache backend
  });
}

export function useAuthors() {
  return useQuery({
    queryKey: ['authors'],
    queryFn: async () => {
      const { data } = await api.get<Author[]>('/authors');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function usePublishers() {
  return useQuery({
    queryKey: ['publishers'],
    queryFn: async () => {
      const { data } = await api.get<Publisher[]>('/publishers');
      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
