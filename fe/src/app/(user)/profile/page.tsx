'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, KeyRound, Plus, Trash2, Phone, X, Eye, EyeOff, User as UserIcon } from 'lucide-react';
import { useToast } from '../../../context/ToastContext';
import { API_URL } from '@/utils/constants';
import { Address, User, Province, Ward } from '@/types';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security'>('profile');
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formContact, setFormContact] = useState('');
  // Password change state
  const [pwCurrent, setPwCurrent] = useState('');
  const [pwNew, setPwNew] = useState('');
  const [pwConfirm, setPwConfirm] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  // Show/hide password toggles
  const [showPwCurrent, setShowPwCurrent] = useState(false);
  const [showPwNew, setShowPwNew] = useState(false);
  const [showPwConfirm, setShowPwConfirm] = useState(false);
  const toast = useToast();
  const router = useRouter();

  // Address modal state
  const [showModal, setShowModal] = useState(false);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [wards, setWards] = useState<Ward[]>([]);
  const [selectedProvince, setSelectedProvince] = useState('');
  const [selectedWard, setSelectedWard] = useState('');
  const [street, setStreet] = useState('');
  const [formContactName, setFormContactName] = useState('');
  const [formPhoneNumber, setFormPhoneNumber] = useState('');
  const [addingAddress, setAddingAddress] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      const stored = localStorage.getItem('user');
      if (!stored) { router.push('/login'); return; }
      const userData = JSON.parse(stored);
      setUser(userData);
      setFormName(userData.name || '');
      setFormContact(userData.contact || '');

      try {
        const res = await fetch(`${API_URL}/addresses`);
        if (res.ok) {
          const all: Address[] = await res.json();
          setAddresses(all.filter((a) => a.user?.id === userData.id));
        }
      } catch (err) { console.error(err); }
    };
    fetchProfileData();
  }, [router]);

  useEffect(() => {
    if (!showModal) return;
    fetch(`${API_URL}/addresses/provinces`)
      .then(r => r.json())
      .then(data => setProvinces(Array.isArray(data) ? data : []))
      .catch(console.error);
  }, [showModal]);

  useEffect(() => {
    if (!selectedProvince) { Promise.resolve().then(() => { setWards([]); setSelectedWard(''); }); return; }
    fetch(`${API_URL}/addresses/wards?provinceCode=${selectedProvince}`)
      .then(r => r.json())
      .then(data => { setWards(Array.isArray(data) ? data : []); setSelectedWard(''); })
      .catch(console.error);
  }, [selectedProvince]);

  const isProfileChanged = formName !== (user?.name || '') || formContact !== (user?.contact || '');

  const handleSaveProfile = async () => {
    if (!isProfileChanged) return;
    setSaving(true);
    try {
      const res = await fetch(`${API_URL}/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: formName, contact: formContact }),
      });
      if (res.ok) {
        const updated = await res.json();
        const newUser = { ...user, name: updated.name, contact: updated.contact } as User;
        setUser(newUser);
        localStorage.setItem('user', JSON.stringify(newUser));
        toast.success('Profile updated successfully!');
      } else { toast.error('Failed to update profile.'); }
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const handleAddAddress = async () => {
    if (!street || !selectedWard || !formContactName || !formPhoneNumber || !user) {
      toast.error('Vui lòng nhập đầy đủ thông tin giao hàng.');
      return;
    }
    setAddingAddress(true);
    try {
      const res = await fetch(`${API_URL}/addresses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          userId: user.id, 
          street, 
          wardCode: selectedWard,
          contactName: formContactName,
          phoneNumber: formPhoneNumber
        }),
      });
      if (res.ok) {
        const listRes = await fetch(`${API_URL}/addresses`);
        if (listRes.ok) {
          const all: Address[] = await listRes.json();
          setAddresses(all.filter((a) => a.user?.id === user?.id));
        }
        setShowModal(false);
        setStreet('');
        setSelectedProvince('');
        setSelectedWard('');
        setFormContactName('');
        setFormPhoneNumber('');
        toast.success('Address added successfully!');
      } else { toast.error('Failed to add address.'); }
    } catch (err) { console.error(err); }
    finally { setAddingAddress(false); }
  };

  const handleChangePassword = async () => {
    if (!user) return;
    if (!pwCurrent) { toast.error('Please enter your current password.'); return; }
    if (pwNew.length < 6) { toast.error('New password must be at least 6 characters.'); return; }
    if (pwNew !== pwConfirm) { toast.error('Passwords do not match.'); return; }
    if (pwNew === pwCurrent) { toast.error('New password must be different from current password.'); return; }
    setPwSaving(true);
    try {
      // Verify current password by attempting login
      const verifyRes = await fetch(`${API_URL}/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: user.email, password: pwCurrent }),
      });
      if (!verifyRes.ok) { toast.error('Current password is incorrect.'); return; }

      // Update password
      const res = await fetch(`${API_URL}/users/${user?.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: pwNew }),
      });
      if (res.ok) {
        toast.success('Password changed successfully!');
        setPwCurrent(''); setPwNew(''); setPwConfirm('');
      } else { toast.error('Failed to change password.'); }
    } catch (e) { console.error(e); toast.error('An error occurred.'); }
    finally { setPwSaving(false); }
  };

  const handleDeleteAddress = async (id: string) => {
    try {
      const res = await fetch(`${API_URL}/addresses/${id}`, { method: 'DELETE' });
      if (res.ok) { setAddresses(prev => prev.filter(a => a.id !== id)); toast.info('Address removed.'); }
      else { toast.error('Failed to delete address.'); }
    } catch { toast.error('An error occurred.'); }
    finally { setDeleteConfirmId(null); }
  };

  if (!user) return null;

  const inputClass = "mt-1 block w-full rounded-md border border-gray-300 bg-white text-gray-900 placeholder-gray-400 shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500 sm:text-sm py-2.5 px-3";
  const selectClass = "w-full rounded-md border border-gray-300 bg-white text-gray-900 py-2.5 px-3 text-sm shadow-sm focus:border-red-500 focus:outline-none focus:ring-1 focus:ring-red-500";

  return (
    <div className="bg-gray-50 min-h-screen py-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">My Account</h1>

        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-64 space-y-2">
            {[
              { id: 'profile' as const, label: 'Profile Details', icon: <UserIcon className="h-5 w-5" /> },
              { id: 'addresses' as const, label: 'Address Book', icon: <MapPin className="h-5 w-5" /> },
              { id: 'security' as const, label: 'Change password', icon: <KeyRound className="h-5 w-5" /> },
            ].map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${activeTab === tab.id ? 'bg-red-50 text-red-700 border border-red-100' : 'text-gray-700 hover:bg-gray-100'}`}>
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1">

            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-6">Personal Information</h2>
                  <div className="space-y-5 max-w-2xl">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input type="text" value={formName} onChange={e => setFormName(e.target.value)}
                        placeholder="Enter your full name"
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input type="tel" value={formContact} onChange={e => setFormContact(e.target.value.replace(/[^0-9]/g, ''))}
                        placeholder="Enter your phone number"
                        pattern="[0-9]+" title="Chỉ được phép nhập chữ số"
                        className={inputClass} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input type="email" value={user.email} disabled
                        className="mt-1 block w-full rounded-md border border-gray-200 bg-gray-100 text-gray-500 shadow-sm sm:text-sm py-2.5 px-3 cursor-not-allowed" />
                      <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
                    </div>
                    <div className="flex justify-end items-center gap-4 pt-2 border-t border-gray-100">
                      <button type="button" onClick={handleSaveProfile} disabled={saving || !isProfileChanged}
                        className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-60 disabled:cursor-not-allowed transition-colors">
                        {saving ? 'Saving...' : 'Save Changes'}
                      </button>
                    </div>
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
                    className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors">
                    <Plus className="h-4 w-4" /> Add New
                  </button>
                </div>

                {addresses.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <MapPin className="mx-auto h-10 w-10 text-gray-300 mb-3" />
                    <p className="text-gray-500 text-sm">No addresses yet. Add your first address!</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map(address => (
                      <div key={address.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-200">
                        <div className="flex justify-between items-start mb-4">
                          <span className="inline-flex items-center rounded-md bg-red-50 px-2 py-1 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-700/10">Address</span>
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
              <div className="bg-white rounded-xl shadow-sm border border-gray-200">
                <div className="p-6 sm:p-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-1">Change Password</h2>
                  <p className="text-sm text-gray-500 mb-6">Make sure your new password is at least 6 characters.</p>
                  <div className="space-y-5 max-w-lg">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                      <div className="relative">
                        <input type={showPwCurrent ? 'text' : 'password'} value={pwCurrent} onChange={e => setPwCurrent(e.target.value)}
                          placeholder="••••••••" className={`${inputClass} pr-10`} />
                        <button type="button" onClick={() => setShowPwCurrent(v => !v)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors">
                          {showPwCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                      <div className="relative">
                        <input type={showPwNew ? 'text' : 'password'} value={pwNew} onChange={e => setPwNew(e.target.value)}
                          placeholder="••••••••" className={`${inputClass} pr-10`} />
                        <button type="button" onClick={() => setShowPwNew(v => !v)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors">
                          {showPwNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {pwNew && pwNew.length < 6 && (
                        <p className="mt-1 text-xs text-red-500">At least 6 characters required</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                      <div className="relative">
                        <input type={showPwConfirm ? 'text' : 'password'} value={pwConfirm} onChange={e => setPwConfirm(e.target.value)}
                          placeholder="••••••••" className={`${inputClass} pr-10`} />
                        <button type="button" onClick={() => setShowPwConfirm(v => !v)}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors">
                          {showPwConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      {pwConfirm && pwNew !== pwConfirm && (
                        <p className="mt-1 text-xs text-red-500">Passwords do not match</p>
                      )}
                    </div>
                    <div className="pt-2">
                      <button type="button" onClick={handleChangePassword}
                        disabled={pwSaving || !pwCurrent || !pwNew || !pwConfirm}
                        className="rounded-md bg-red-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-60 transition-colors">
                        {pwSaving ? 'Updating...' : 'Update Password'}
                      </button>
                    </div>
                  </div>
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
              <h3 className="text-lg font-semibold text-gray-900">Add New Address</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Họ tên người nhận</label>
                  <input 
                    type="text" 
                    value={formContactName} 
                    onChange={e => setFormContactName(e.target.value)}
                    placeholder="Nguyễn Văn A"
                    className={inputClass} 
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Số điện thoại</label>
                  <input 
                    type="tel" 
                    value={formPhoneNumber} 
                    onChange={e => setFormPhoneNumber(e.target.value.replace(/[^0-9]/g, ''))}
                    placeholder="0987654321"
                    className={inputClass} 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Tỉnh / Thành phố</label>
                <select value={selectedProvince} onChange={e => setSelectedProvince(e.target.value)} className={selectClass}>
                  <option value="">-- Chọn Tỉnh/Thành --</option>
                  {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                </select>
                {provinces.length === 0 && (
                  <p className="mt-1 text-xs text-amber-600">⚠ Dữ liệu tỉnh thành chưa được khởi tạo.</p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Quận / Huyện / Phường / Xã</label>
                <select value={selectedWard} onChange={e => setSelectedWard(e.target.value)}
                  disabled={!selectedProvince}
                  className={`${selectClass} disabled:bg-gray-50 disabled:text-gray-400`}>
                  <option value="">-- Chọn Phường/Xã --</option>
                  {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Địa chỉ chi tiết (Số nhà, tên đường)</label>
                <input type="text" value={street} onChange={e => setStreet(e.target.value)}
                  placeholder="Ví dụ: 123 Đường ABC"
                  className={inputClass} />
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)}
                className="rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Cancel
              </button>
              <button onClick={handleAddAddress}
                disabled={!street || !selectedWard || !formContactName || !formPhoneNumber || addingAddress}
                className="rounded-md bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 disabled:opacity-60 transition-colors">
                {addingAddress ? 'Đang lưu...' : 'Lưu địa chỉ'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Address Confirm Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-50 mx-auto mb-4">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 text-center mb-2">Delete Address</h3>
              <p className="text-sm text-gray-500 text-center mb-6">Are you sure you want to remove this address? This action cannot be undone.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  className="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancel
                </button>
                <button
                  onClick={() => handleDeleteAddress(deleteConfirmId)}
                  className="flex-1 rounded-md bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 transition-colors">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
