import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, adminApi } from '@/lib/axios';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

export function useAllContacts() {
  return useQuery({
    queryKey: ['contacts'],
    queryFn: async () => {
      const { data } = await adminApi.get<Inquiry[]>('/contacts');
      return data;
    },
  });
}

export function useCreateContact() {
  return useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      api.post('/contacts', payload).then((r) => r.data),
  });
}

export function useUpdateContactStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: 'new' | 'read' | 'replied' }) =>
      adminApi.patch(`/contacts/${id}/status`, { status }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['contacts'] }),
  });
}
