'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, Ticket, X, Save } from 'lucide-react';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import { useToast } from '../../../../context/ToastContext';

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
const emptyForm = { code: '', discount: '', description: '', minimum: '', startDate: '', expiryDate: '', type: 'percent' };

interface Coupon {
  id: string;
  code: string;
  description?: string;
  discount: number;
  minimum?: number;
  expiryDate?: string;
  type?: string;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string; code: string }>({ open: false, id: '', code: '' });
  const [deleting, setDeleting] = useState(false);

  const toast = useToast();

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API}/coupons`);
      const data = await res.json();
      setCoupons(Array.isArray(data) ? data : []);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  useEffect(() => { Promise.resolve().then(() => fetchCoupons()); }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API}/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: form.code, 
          discount: Number(form.discount),
          type: form.type,
          description: form.description, 
          minimum: Number(form.minimum) || 0,
          startDate: form.startDate, 
          expiryDate: form.expiryDate,
        }),
      });
      if (res.ok) { setShowModal(false); setForm(emptyForm); fetchCoupons(); toast.success('Coupon created successfully!'); }
      else { toast.error('Failed to create coupon.'); }
    } catch (e) { console.error(e); toast.error('An error occurred.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await fetch(`${API}/coupons/${confirmDelete.id}`, { method: 'DELETE' });
      setCoupons(prev => prev.filter(c => c.id !== confirmDelete.id));
      toast.success('Coupon deleted!');
    } catch (e) { console.error(e); toast.error('Failed to delete coupon.'); }
    finally { setDeleting(false); setConfirmDelete({ open: false, id: '', code: '' }); }
  };

  const inputCls = "w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mã giảm giá</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng cộng {coupons.length} mã</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors">
          <Plus className="h-4 w-4" /> Thêm mã giảm giá
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : coupons.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mã</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Mô tả</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Chiết khấu</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Đơn hàng tối thiểu</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Hết hạn</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {coupons.map(coupon => (
                  <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-sm font-mono font-bold text-red-700 ring-1 ring-red-200">
                        <Ticket className="h-3.5 w-3.5" /> {coupon.code}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{coupon.description || '—'}</td>
                    <td className="px-5 py-3 text-sm font-semibold">
                      {coupon.type === 'fixed' ? (
                        <span className="text-emerald-700">
                          -{Number(coupon.discount).toLocaleString('vi-VN')} đ
                        </span>
                      ) : (
                        <span className="text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">
                          {coupon.discount}% OFF
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {Number(coupon.minimum || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">
                      {coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString('vi-VN') : '—'}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button onClick={() => setConfirmDelete({ open: true, id: coupon.id, code: coupon.code })}
                        className="p-2 rounded-lg text-gray-400 hover:bg-red-50 hover:text-red-600 transition-colors">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center text-gray-400 text-sm">Không tìm thấy mã giảm giá nào.</div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Mã giảm giá mới</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3 mb-2">
                <button 
                  onClick={() => setForm(f => ({ ...f, type: 'percent' }))}
                  className={`py-2 text-xs font-bold rounded-lg border-2 transition-all ${form.type === 'percent' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-400'}`}>
                  Phần trăm (%)
                </button>
                <button 
                  onClick={() => setForm(f => ({ ...f, type: 'fixed' }))}
                  className={`py-2 text-xs font-bold rounded-lg border-2 transition-all ${form.type === 'fixed' ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-400'}`}>
                  Số tiền cố định (đ)
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mã giảm giá *</label>
                <input type="text" placeholder="e.g. SALE50K" value={form.code}
                  pattern="[^\s]+" title="Mã không được chứa khoảng trắng"
                  onChange={e => setForm((f: typeof emptyForm) => ({ ...f, code: e.target.value.toUpperCase().replace(/\s/g, '') }))}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {form.type === 'percent' ? 'Giảm giá (%) *' : 'Giảm giá (đ) *'}
                </label>
                <input type="number" placeholder={form.type === 'percent' ? 'e.g. 10' : 'e.g. 50000'} value={form.discount}
                  onChange={e => setForm((f: typeof emptyForm) => ({ ...f, discount: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                <input type="text" placeholder="Short description" value={form.description}
                  onChange={e => setForm((f: typeof emptyForm) => ({ ...f, description: e.target.value }))}
                  className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Đơn hàng tối thiểu (đ)</label>
                <input type="number" placeholder="e.g. 100000" value={form.minimum}
                  onChange={e => setForm((f: typeof emptyForm) => ({ ...f, minimum: e.target.value }))}
                  className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày bắt đầu</label>
                  <input type="date" value={form.startDate}
                    onChange={e => setForm((f: typeof emptyForm) => ({ ...f, startDate: e.target.value }))}
                    className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Ngày hết hạn</label>
                  <input type="date" value={form.expiryDate}
                    onChange={e => setForm((f: typeof emptyForm) => ({ ...f, expiryDate: e.target.value }))}
                    className={inputCls} />
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Hủy
              </button>
              <button onClick={handleSave} disabled={saving || !form.code || !form.discount}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors">
                <Save className="h-4 w-4" /> {saving ? 'Đang lưu...' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        open={confirmDelete.open}
        title="Xóa mã giảm giá"
        message={`Bạn có chắc chắn muốn xóa mã "${confirmDelete.code}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: '', code: '' })}
      />
    </div>
  );
}
