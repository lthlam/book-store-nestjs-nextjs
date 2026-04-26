'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldAlert, KeyRound, User } from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export default function AdminLoginPage() {
  const router = useRouter();
  const toast = useToast();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username || !password) return;

    setLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
      const res = await fetch(`${apiUrl}/admins/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('admin', JSON.stringify({
          id: data.admin.id,
          username: data.admin.username,
          token: data.access_token
        }));
        
        toast.success('Admin authentication successful');
        
        // Wait a bit before redirecting for smoother UX
        setTimeout(() => {
          router.push('/admin');
        }, 1000);
      } else {
        toast.error('Invalid admin credentials');
      }
    } catch (err) {
      toast.error('Connection failed, please try again');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-950 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 mb-4 ring-1 ring-red-500/20">
            <ShieldAlert className="h-8 w-8 text-red-500" />
          </div>
          <h2 className="text-center text-3xl font-bold tracking-tight text-white">
            Admin Portal
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            Secure access requires specific operational credentials
          </p>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-gray-900 py-8 px-4 shadow-2xl sm:rounded-xl sm:px-10 border border-gray-800">
            <form className="space-y-6" onSubmit={handleLogin}>
              <div>
                <label htmlFor="username" className="block text-sm font-medium leading-6 text-gray-300">
                  Username
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="block w-full rounded-md border-0 bg-gray-800/50 py-2.5 pl-10 text-white ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6 transition-all"
                    placeholder="Enter admin username"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-300">
                  Password
                </label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <KeyRound className="h-5 w-5 text-gray-500" />
                  </div>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md border-0 bg-gray-800/50 py-2.5 pl-10 text-white ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-red-500 sm:text-sm sm:leading-6 transition-all"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={loading || !username || !password}
                  className="flex w-full justify-center rounded-md bg-red-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Authenticating...' : 'Secure Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
