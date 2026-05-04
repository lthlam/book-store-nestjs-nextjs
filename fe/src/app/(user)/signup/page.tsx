'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, KeyRound, User, Phone } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { api } from '@/lib/axios';

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: '', contact: '', email: '', password: '', cpassword: '' });
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('user')) router.push('/');
  }, [router]);

  const signupMutation = useMutation({
    mutationFn: (data: { name: string; email: string; contact: string; password: string }) =>
      api.post('/users/signup', data).then((r) => r.data),
    onSuccess: () => router.push('/login?registered=1'),
    onError: (err: unknown) => {
      const data = (err as { response?: { data?: { message?: string | string[] } } })?.response?.data;
      const msg = data?.message || 'Đăng ký thất bại';
      setError(Array.isArray(msg) ? msg[0] : (typeof msg === 'string' ? msg : 'Đăng ký thất bại'));
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.cpassword) { setError('Mật khẩu không khớp'); return; }
    signupMutation.mutate({ name: form.name, email: form.email, contact: form.contact, password: form.password });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.name === 'contact' ? e.target.value.replace(/[^0-9]/g, '') : e.target.value;
    setForm({ ...form, [e.target.name]: value });
  };

  const inputCls = 'block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm transition-all';

  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 relative bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
            <Image src="/logo.png" alt="DreamBook" fill className="object-contain" />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">ĐĂNG KÝ NGAY</h2>
        <p className="mt-2 text-center text-sm text-gray-600">Nhập thông tin của bạn để tạo tài khoản</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">{error}</div>}

            {[
              { id: 'name', label: 'Họ và tên', type: 'text', icon: <User className="h-5 w-5 text-gray-400" />, placeholder: 'Nguyễn Văn A' },
              { id: 'contact', label: 'Số điện thoại', type: 'tel', icon: <Phone className="h-5 w-5 text-gray-400" />, placeholder: '0123456789' },
              { id: 'email', label: 'Địa chỉ Email', type: 'email', icon: <Mail className="h-5 w-5 text-gray-400" />, placeholder: 'you@example.com' },
              { id: 'password', label: 'Mật khẩu', type: 'password', icon: <KeyRound className="h-5 w-5 text-gray-400" />, placeholder: '••••••••' },
              { id: 'cpassword', label: 'Xác nhận mật khẩu', type: 'password', icon: <KeyRound className="h-5 w-5 text-gray-400" />, placeholder: '••••••••' },
            ].map(({ id, label, type, icon, placeholder }) => (
              <div key={id}>
                <label htmlFor={id} className="block text-sm font-medium leading-6 text-gray-900">{label} <span className="text-red-500">*</span></label>
                <div className="relative mt-2 rounded-md shadow-sm">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">{icon}</div>
                  <input id={id} name={id} type={type} required value={(form as Record<string, string>)[id]} onChange={handleChange} className={inputCls} placeholder={placeholder} />
                </div>
              </div>
            ))}

            <button type="submit" disabled={signupMutation.isPending}
              className="flex w-full justify-center rounded-md bg-red-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
              {signupMutation.isPending ? 'Đang tạo tài khoản...' : 'Đăng ký'}
            </button>

            <div className="text-center text-sm pt-2">
              <span className="text-gray-500">Đã có tài khoản? </span>
              <Link href="/login" className="font-medium text-red-600 hover:text-red-500 transition-colors">Đăng nhập</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
