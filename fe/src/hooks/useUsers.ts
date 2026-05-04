import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api, adminApi } from '@/lib/axios';
import type { User } from '@/types';

/** [Admin] Lấy danh sách tất cả users */
export function useAllUsers() {
  return useQuery({
    queryKey: ['users', 'all'],
    queryFn: async () => {
      const { data } = await adminApi.get<User[]>('/users');
      return data;
    },
  });
}

/** [User] Tự cập nhật thông tin cá nhân (profile, password...) */
export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & Record<string, unknown>) =>
      api.patch<User>(`/users/${id}`, payload).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users'] }),
  });
}

/** [Admin] Block/unblock user — route riêng, yêu cầu @Roles(Admin) */
export function useAdminUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isBlocked }: { id: string; isBlocked: boolean }) =>
      adminApi.patch<User>(`/users/${id}/block`, { isBlocked }).then((r) => r.data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['users', 'all'] }),
  });
}
