'use client';

import { useState } from 'react';
import { Plus, Trash2, Ticket, X, Save } from 'lucide-react';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import { useToast } from '../../../../context/ToastContext';
import { useAllCoupons, useCreateCoupon, useDeleteCoupon } from '@/hooks/useCoupons';

const emptyForm = { code: '', discount: '', description: '', minimum: '', startDate: '', expiryDate: '', type: 'percent' };

export default function AdminCouponsPage() {
  const toast = useToast();
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string; code: string }>({ open: false, id: '', code: '' });

  const { data: coupons = [], isLoading } = useAllCoupons();
  const createCoupon = useCreateCoupon();
  const deleteCoupon = useDeleteCoupon();

  const handleSave = async () => {
    await createCoupon.mutateAsync({
      code: form.code, discount: Number(form.discount), type: form.type,
      description: form.description, minimum: Number(form.minimum) || 0,
      startDate: form.startDate, expiryDate: form.expiryDate,
    });
    setShowModal(false);
    setForm(emptyForm);
    toast.success('Tạo coupon thành công!');
  };

  const handleDelete = async () => {
    await deleteCoupon.mutateAsync(confirmDelete.id);
    setConfirmDelete({ open: false, id: '', code: '' });
    toast.success('Đã xóa coupon!');
  };

  const inputCls = 'w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mã giảm giá</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng cộng {coupons.length} mã</p>
        </div>
        <button onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
          <Plus className="h-4 w-4" /> Thêm mã
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-16"><div className="h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>
        ) : coupons.length > 0 ? (
          <table className="min-w-full divide-y divide-gray-100">
            <thead className="bg-gray-50">
              <tr>
                {['Mã', 'Mô tả', 'Chiết khấu', 'Đơn tối thiểu', 'Hết hạn', ''].map((h) => (
                  <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === '' ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3">
                    <span className="inline-flex items-center gap-1.5 rounded-md bg-red-50 px-2.5 py-1 text-sm font-mono font-bold text-red-700 ring-1 ring-red-200">
                      <Ticket className="h-3.5 w-3.5" /> {coupon.code}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{coupon.description || '—'}</td>
                  <td className="px-5 py-3 text-sm font-semibold">
                    {coupon.type === 'fixed'
                      ? <span className="text-emerald-700">-{Number(coupon.discount).toLocaleString('vi-VN')} đ</span>
                      : <span className="text-blue-700 text-xs bg-blue-50 px-2 py-0.5 rounded-full border border-blue-100">{coupon.discount}% OFF</span>}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-500">{Number(coupon.minimum || 0).toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{coupon.expiryDate ? new Date(coupon.expiryDate).toLocaleDateString('vi-VN') : '—'}</td>
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
          <div className="py-16 text-center text-gray-400 text-sm">Không có mã giảm giá nào.</div>
        )}
      </div>

      {/* Create Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-lg font-bold text-gray-900">Mã giảm giá mới</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {(['percent', 'fixed'] as const).map((t) => (
                  <button key={t} onClick={() => setForm((f) => ({ ...f, type: t }))}
                    className={`py-2 text-xs font-bold rounded-lg border-2 transition-all ${form.type === t ? 'border-red-600 bg-red-50 text-red-700' : 'border-gray-200 text-gray-400'}`}>
                    {t === 'percent' ? 'Phần trăm (%)' : 'Số tiền cố định (đ)'}
                  </button>
                ))}
              </div>
              {[
                { label: 'Mã giảm giá *', key: 'code', type: 'text', placeholder: 'SALE50K' },
                { label: form.type === 'percent' ? 'Giảm giá (%) *' : 'Giảm giá (đ) *', key: 'discount', type: 'number', placeholder: form.type === 'percent' ? '10' : '50000' },
                { label: 'Mô tả', key: 'description', type: 'text', placeholder: 'Mô tả ngắn' },
                { label: 'Đơn tối thiểu (đ)', key: 'minimum', type: 'number', placeholder: '100000' },
              ].map(({ label, key, type, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                  <input type={type} placeholder={placeholder} value={(form as Record<string, string>)[key]}
                    onChange={(e) => setForm((f) => ({ ...f, [key]: key === 'code' ? e.target.value.toUpperCase().replace(/\s/g, '') : e.target.value }))}
                    className={inputCls} />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                {[{ label: 'Ngày bắt đầu', key: 'startDate' }, { label: 'Ngày hết hạn', key: 'expiryDate' }].map(({ label, key }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <input type="date" value={(form as Record<string, string>)[key]}
                      onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className={inputCls} />
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
              <button onClick={handleSave} disabled={createCoupon.isPending || !form.code || !form.discount}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                <Save className="h-4 w-4" /> {createCoupon.isPending ? 'Đang lưu...' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmDelete.open}
        title="Xóa mã giảm giá"
        message={`Bạn có chắc muốn xóa mã "${confirmDelete.code}"?`}
        confirmLabel="Xóa"
        loading={deleteCoupon.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: '', code: '' })}
      />
    </div>
  );
}
