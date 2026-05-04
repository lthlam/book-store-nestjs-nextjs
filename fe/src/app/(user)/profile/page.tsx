'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, KeyRound, Plus, Trash2, Phone, X, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { useMyAddresses, useCreateAddress, useDeleteAddress, useProvinces, useWards } from '@/hooks/useAddresses';
import { useUpdateUser } from '@/hooks/useUsers';
import { api } from '@/lib/axios';
import type { User } from '@/types';

const inputClass = 'mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm py-2.5 px-3';
const selectClass = 'w-full rounded-md border border-gray-300 bg-white text-gray-900 py-2.5 px-3 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500';

export default function ProfilePage() {
  const router = useRouter();
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security'>('profile');
  const [user, setUser] = useState<User | null>(null);
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');

  // Password state
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [showPwCurrent, setShowPwCurrent] = useState(false);
  const [showPwNew, setShowPwNew] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);

  // Address modal state
  const [showModal, setShowModal] = useState(false);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [street, setStreet] = useState('');
  const [contactName, setContactName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (!stored) {
      router.push('/login');
      return;
    }
    const u = JSON.parse(stored);
    // Wrap state updates in Promise.resolve to avoid synchronous setState warning in effect
    Promise.resolve().then(() => {
      setUser(u);
      setFormName(u.name || '');
      setFormContact(u.contact || '');
    });
  }, [router]);

  const { data: addresses = [] } = useMyAddresses();
  const { data: provinces = [] } = useProvinces();
  const { data: wards = [] } = useWards(selectedProvince || undefined);
  const createAddress = useCreateAddress();
  const deleteAddress = useDeleteAddress();
  const updateUser = useUpdateUser();

  const isProfileChanged = formName !== (user?.name || '') || String(formContact) !== String(user?.contact || '');

  const handleSaveProfile = async () => {
    if (!user || !isProfileChanged) return;
    const updated = await updateUser.mutateAsync({ id: user.id, name: formName, contact: formContact });
    const newUser = { ...user, ...updated };
    setUser(newUser);
    localStorage.setItem('user', JSON.stringify(newUser));
    toast.success('Cập nhật thông tin thành công!');
  };

  const handleAddAddress = async () => {
    if (!street || !selectedWard || !contactName || !phoneNumber || !user) {
      toast.error('Vui lòng nhập đầy đủ thông tin giao hàng.');
      return;
    }
    await createAddress.mutateAsync({ street, wardCode: selectedWard, contactName, phoneNumber });
    setShowModal(false);
    setStreet(''); setSelectedProvince(''); setSelectedWard(''); setContactName(''); setPhoneNumber('');
    toast.success('Thêm địa chỉ thành công!');
  };

  const handleDeleteAddress = async (id: string) => {
    await deleteAddress.mutateAsync(id);
    setDeleteConfirmId(null);
    toast.info('Đã xóa địa chỉ.');
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (!pwCurrent) { toast.error('Nhập mật khẩu hiện tại.'); return; }
    if (pwNew.length < 6) { toast.error('Mật khẩu mới tối thiểu 6 ký tự.'); return; }
    if (pwNew !== pwConfirm) { toast.error('Mật khẩu không khớp.'); return; }
    if (pwNew === pwCurrent) { toast.error('Mật khẩu mới phải khác mật khẩu cũ.'); return; }
    setPwSaving(true);
    try {
      await api.post('/users/login', { email: user.email, password: pwCurrent });
      await updateUser.mutateAsync({ id: user.id, password: pwNew });
      toast.success('Đổi mật khẩu thành công!');
      setPwCurrent(''); setPwNew(''); setPwConfirm('');
    } catch {
      toast.error('Mật khẩu hiện tại không đúng.');
    } finally {
      setPwSaving(false);
    }
  };

  if (!user) return null;

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-2">
            {([
              { id: 'profile', label: 'Profile Details', icon: <UserIcon className="h-5 w-5" /> },
              { id: 'addresses', label: 'Address Book', icon: <MapPin className="h-5 w-5" /> },
              { id: 'security', label: 'Change Password', icon: <KeyRound className="h-5 w-5" /> },
            ] as const).map((tab) => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-red-50 text-red-700 border border-red-100' : 'text-gray-700 hover:bg-gray-100'}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          <div className="flex-1">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                <div className="space-y-5 max-w-2xl">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Họ tên</label>
                    <input type="text" value={formName} onChange={(e) => setFormName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số điện thoại</label>
                    <input type="tel" value={formContact} onChange={(e) => setFormContact(e.target.value.replace(/[^0-9]/g, ''))} className={inputClass} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                    <input type="email" value={user.email} disabled className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-100 text-gray-500 shadow-sm sm:text-sm py-2.5 px-3 cursor-not-allowed" />
                  </div>
                  <div className="flex justify-end pt-2 border-t border-gray-100">
                    <button onClick={handleSaveProfile} disabled={updateUser.isPending || !isProfileChanged}
                      className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60 transition-colors">
                      {updateUser.isPending ? 'Đang lưu...' : 'Lưu thay đổi'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-gray-900">Address Book</h2>
                  <button onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-500 transition-colors">
                    <Plus className="h-4 w-4" /> Thêm mới
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <MapPin className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">Chưa có địa chỉ nào.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                      <div key={address.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">Nhà riêng</span>
                          <button onClick={() => setDeleteConfirmId(address.id)} className="text-gray-400 hover:text-red-500 p-1 transition-colors">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                        <div className="space-y-1 text-sm text-gray-700">
                          <p className="font-semibold text-gray-900 flex items-center gap-2">
                            <UserIcon className="h-4 w-4 text-gray-400" /> {address.contactName || user.name}
                          </p>
                          <p className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-gray-400" /> {address.phoneNumber || user.contact || 'N/A'}
                          </p>
                          <p className="pt-1 text-xs">{address.street}</p>
                          <p className="text-xs">{address.ward?.name || address.wardCode}, {address.ward?.province?.name}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Security Tab */}
            {activeTab === 'security' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sm:p-8">
                <h2 className="text-xl font-semibold text-gray-900 mb-1">Đổi mật khẩu</h2>
                <p className="text-sm text-gray-500 mb-6">Mật khẩu mới tối thiểu 6 ký tự.</p>
                <div className="space-y-5 max-w-lg">
                  {([
                    { label: 'Mật khẩu hiện tại', value: pwCurrent, set: setPwCurrent, show: showPwCurrent, toggle: () => setShowPwCurrent((v) => !v) },
                    { label: 'Mật khẩu mới', value: pwNew, set: setPwNew, show: showPwNew, toggle: () => setShowPwNew((v) => !v) },
                    { label: 'Xác nhận mật khẩu mới', value: pwConfirm, set: setPwConfirm, show: showPwConfirm, toggle: () => setShowPwConfirm((v) => !v) },
                  ]).map(({ label, value, set, show, toggle }) => (
                    <div key={label}>
                      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                      <div className="relative">
                        <input type={show ? 'text' : 'password'} value={value} onChange={(e) => set(e.target.value)}
                          placeholder="••••••••" className={`${inputClass} pr-10`} />
                        <button type="button" onClick={toggle}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600">
                          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                  ))}
                  <button onClick={handleChangePassword} disabled={pwSaving || !pwCurrent || !pwNew || !pwConfirm}
                    className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60 transition-colors">
                    {pwSaving ? 'Đang cập nhật...' : 'Cập nhật mật khẩu'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Address Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Thêm địa chỉ mới</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Họ tên người nhận</label>
                  <input type="text" value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Nguyễn Văn A" className={inputClass} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Số điện thoại</label>
                  <input type="tel" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))} placeholder="0987654321" className={inputClass} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Tỉnh / Thành phố</label>
                <select value={selectedProvince} onChange={(e) => setSelectedProvince(e.target.value)} className={selectClass}>
                  <option value="">-- Chọn Tỉnh/Thành --</option>
                  {provinces.map((p) => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Phường / Xã</label>
                <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} disabled={!selectedProvince}
                  className={`${selectClass} disabled:bg-gray-50 disabled:text-gray-400`}>
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wards.map((w) => <option key={w.code} value={w.code}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Địa chỉ chi tiết</label>
                <input type="text" value={street} onChange={(e) => setStreet(e.target.value)} placeholder="123 Đường ABC" className={inputClass} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Huỷ</button>
              <button onClick={handleAddAddress} disabled={!street || !selectedWard || !contactName || !phoneNumber || createAddress.isPending}
                className="rounded-lg bg-red-600 px-6 py-2 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60">
                {createAddress.isPending ? 'Đang lưu...' : 'Lưu địa chỉ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
              <Trash2 className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Xóa địa chỉ</h3>
            <p className="text-sm text-gray-500 text-center mb-6">Bạn có chắc muốn xóa địa chỉ này?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirmId(null)} className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
              <button onClick={() => handleDeleteAddress(deleteConfirmId)} disabled={deleteAddress.isPending}
                className="flex-1 rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-500 disabled:opacity-60">
                {deleteAddress.isPending ? 'Đang xóa...' : 'Xóa'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
