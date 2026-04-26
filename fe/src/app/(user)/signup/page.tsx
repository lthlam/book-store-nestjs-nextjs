'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { Mail, KeyRound, User, Phone } from 'lucide-react';
import { API_URL } from '@/utils/constants';

export default function SignupPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    email: '',
    password: '',
    cpassword: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem('token')) {
      router.push('/');
    }
  }, [router]);

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.cpassword) {
      setError('Mật khẩu không khớp');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/users/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          contact: formData.contact,
          password: formData.password,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || 'Đăng ký thất bại');
        return;
      }

      router.push('/login?registered=1');
    } catch {
      setError('Cannot connect to server');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (e.target.name === 'contact') {
      value = value.replace(/[^0-9]/g, ''); // Chỉ giữ lại số
    }
    setFormData({ ...formData, [e.target.name]: value });
  };


  return (
    <div className="flex min-h-[80vh] flex-col justify-center py-12 sm:px-6 lg:px-8 bg-gray-50">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <div className="flex justify-center">
          <div className="h-16 w-16 relative bg-white rounded-2xl p-2 shadow-sm border border-gray-100">
            <Image 
              src="/logo.png" 
              alt="DreamBook" 
              fill 
              className="object-contain"
            />
          </div>
        </div>
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          ĐĂNG KÝ NGAY
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          Nhập thông tin của bạn để tạo tài khoản
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow sm:rounded-xl sm:px-10 border border-gray-100">
          <form className="space-y-5" onSubmit={handleSignup}>
            {error && (
              <div className="rounded-md bg-red-50 p-3 text-sm text-red-700 border border-red-200">
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="name" className="block text-sm font-medium leading-6 text-gray-900">
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label htmlFor="contact" className="block text-sm font-medium leading-6 text-gray-900">
                Số điện thoại <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Phone className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="contact"
                  name="contact"
                  type="tel"
                  required
                  value={formData.contact}
                  onChange={handleChange}
                  pattern="[0-9]+"
                  title="Chỉ được phép nhập chữ số"
                  className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder="0123456789"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                Địa chỉ Email <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium leading-6 text-gray-900">
                Mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <label htmlFor="cpassword" className="block text-sm font-medium leading-6 text-gray-900">
                Xác nhận mật khẩu <span className="text-red-500">*</span>
              </label>
              <div className="relative mt-2 rounded-md shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <KeyRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="cpassword"
                  name="cpassword"
                  type="password"
                  required
                  value={formData.cpassword}
                  onChange={handleChange}
                  className="block w-full rounded-md border-0 py-2.5 pl-10 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-red-600 sm:text-sm sm:leading-6 transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="flex w-full justify-center rounded-md bg-red-600 px-3 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? 'Đang tạo tài khoản...' : 'Đăng ký'}
              </button>
            </div>
            
            <div className="text-center text-sm pt-2">
              <span className="text-gray-500">Đã có tài khoản? </span>
              <Link href="/login" className="font-medium text-red-600 hover:text-red-500 transition-colors border-b border-transparent hover:border-red-500 pb-0.5">
                Đăng nhập
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
