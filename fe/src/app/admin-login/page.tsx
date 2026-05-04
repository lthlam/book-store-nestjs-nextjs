'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, KeyRound, User } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { useToast } from '../../context/ToastContext';
import { api } from '@/lib/axios';

export default function AdminLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const loginMutation = useMutation({
    mutationFn: (creds: { username: string; password: string }) =>
      api.post('/admins/login', creds).then((r) => r.data),
    onSuccess: (data) => {
      // Token vào httpOnly cookie, chỉ lưu admin info để hiển thị UI
      localStorage.setItem('admin', JSON.stringify({ id: data.admin.id, username: data.admin.username }));
      toast.success('Admin authentication successful');
      setTimeout(() => router.push('/admin'), 1000);
    },
    onError: () => toast.error('Invalid admin credentials'),
  });

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;
    loginMutation.mutate({ username, password });
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-4 ring-1 ring-red-500/20">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">Admin Portal</h2>
          <p className="mt-2 text-center text-sm text-gray-400">Secure access requires specific operational credentials</p>
        </div>

        <div className="bg-gray-900 py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-gray-800">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-300">Username</label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><User className="h-5 w-5 text-gray-500" /></div>
                <input id="username" type="text" required value={username} onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-md border-0 bg-gray-800/50 py-2.5 pl-10 text-white ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm transition-all"
                  placeholder="Enter admin username" />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-300">Password</label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3"><KeyRound className="h-5 w-5 text-gray-500" /></div>
                <input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-md border-0 bg-gray-800/50 py-2.5 pl-10 text-white ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm transition-all"
                  placeholder="••••••••" />
              </div>
            </div>

            <button type="submit" disabled={loginMutation.isPending || !username || !password}
              className="flex w-full justify-center rounded-md bg-red-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
              {loginMutation.isPending ? 'Authenticating...' : 'Secure Login'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
