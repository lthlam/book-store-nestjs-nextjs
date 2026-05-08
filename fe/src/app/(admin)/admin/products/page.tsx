'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Plus, Search, Edit, Trash2, X, Save, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import { useToast } from '../../../../context/ToastContext';
import { useGenres } from '@/hooks/useCatalog';
import { useAuthors } from '@/hooks/useCatalog';
import { usePublishers } from '@/hooks/useCatalog';
import {
  useAdminProducts, useCreateProduct, useUpdateProduct, useDeleteProduct,
  useBulkUploadProducts, useUploadImage, useCreateGenre, useCreateAuthor, useCreatePublisher,
} from '@/hooks/useAdminProducts';
import { formatVND } from '@/utils/format';
import type { Product } from '@/types';

const emptyForm = { title: '', authorId: '', price: '', year: '', description: '', genreId: '', publisherId: '', image: '', special: false, stock: '1000' };

export default function AdminProductsPage() {
  const toast = useToast();
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [filterGenre, setFilterGenre] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterPublisher, setFilterPublisher] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string; title: string }>({ open: false, id: '', title: '' });
  const [quickAdd, setQuickAdd] = useState<'genre' | 'author' | 'publisher' | null>(null);
  const [quickVal, setQuickVal] = useState('');
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const itemsPerPage = 20;

  useEffect(() => {
    const h = setTimeout(() => { setDebouncedSearch(search); setPage(1); }, 500);
    return () => clearTimeout(h);
  }, [search]);

  const { data: productsData, isLoading } = useAdminProducts({
    page, search: debouncedSearch,
    genreId: filterGenre, authorId: filterAuthor, publisherId: filterPublisher,
  });
  const { data: genres = [] } = useGenres();
  const { data: authors = [] } = useAuthors();
  const { data: publishers = [] } = usePublishers();

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const bulkUpload = useBulkUploadProducts();
  const uploadImage = useUploadImage();
  const createGenre = useCreateGenre();
  const createAuthor = useCreateAuthor();
  const createPublisher = useCreatePublisher();

  const products = productsData?.data ?? [];
  const total = productsData?.total ?? 0;

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setPreviewUrl(null); setSelectedFile(null); setShowModal(true); };
  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({ title: p.title || '', authorId: p.author?.id || '', price: String(p.price || ''), year: String(p.year || ''), description: p.description || '', genreId: p.genre?.id || '', publisherId: p.publisher?.id || '', image: p.image || '', special: p.special || false, stock: String(p.stock ?? 1000) });
    setPreviewUrl(null); setSelectedFile(null);
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 1. Kiểm tra kích thước và nén ảnh
    const processImage = (file: File): Promise<File | null> => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
          const img = new window.Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const width = img.width;
            const height = img.height;

            // Kiểm tra tối thiểu 700px cho ít nhất 1 chiều
            if (width < 700 && height < 700) {
              toast.error('Ảnh quá nhỏ! Ít nhất một chiều phải đạt tối thiểu 700px.');
              resolve(null);
              return;
            }

            const canvas = document.createElement('canvas');
            let targetWidth = width;
            let targetHeight = height;
            const MAX_SIZE = 1200;

            // Chỉ resize nếu ảnh quá lớn (> 1200px)
            if (width > MAX_SIZE || height > MAX_SIZE) {
              if (width > height) {
                targetHeight = Math.round(height * (MAX_SIZE / width));
                targetWidth = MAX_SIZE;
              } else {
                targetWidth = Math.round(width * (MAX_SIZE / height));
                targetHeight = MAX_SIZE;
              }
            }

            canvas.width = targetWidth;
            canvas.height = targetHeight;
            const ctx = canvas.getContext('2d');
            ctx?.drawImage(img, 0, 0, targetWidth, targetHeight);

            canvas.toBlob((blob) => {
              if (blob) {
                resolve(new File([blob], file.name, { type: 'image/jpeg' }));
              } else {
                resolve(file);
              }
            }, 'image/jpeg', 0.6); // Nén chất lượng 60%
          };
        };
      });
    };

    const processedFile = await processImage(file);
    if (!processedFile) return;

    setSelectedFile(processedFile);
    setPreviewUrl(URL.createObjectURL(processedFile));
  };

  const handleSave = async () => {
    try {
      let imageUrl = form.image;

      // Nếu có chọn file mới -> Upload lên Cloudinary trước khi save product
      if (selectedFile) {
        const fd = new FormData();
        fd.append('file', selectedFile);
        const uploadRes = await uploadImage.mutateAsync(fd);
        imageUrl = uploadRes.url;
      }

      const body = { 
        title: form.title, 
        authorId: form.authorId, 
        publisherId: form.publisherId, 
        price: Number(form.price), 
        year: Number(form.year), 
        description: form.description, 
        genreId: form.genreId, 
        image: imageUrl, 
        special: form.special,
        stock: Number(form.stock)
      };

      if (editingId) {
        await updateProduct.mutateAsync({ id: editingId, ...body });
        toast.success('Cập nhật sản phẩm thành công!');
      } else {
        await createProduct.mutateAsync(body);
        toast.success('Tạo sản phẩm thành công!');
      }
      setShowModal(false);
    } catch (error) {
      console.error('Save error:', error);
      toast.error('Có lỗi xảy ra khi lưu sản phẩm');
    }
  };

  const handleDelete = async () => {
    await deleteProduct.mutateAsync(confirmDelete.id);
    setConfirmDelete({ open: false, id: '', title: '' });
    toast.success('Đã xóa sản phẩm!');
  };

  const handleQuickAdd = async () => {
    if (!quickVal || !quickAdd) return;
    let newItem: { id: string };
    if (quickAdd === 'genre') { newItem = await createGenre.mutateAsync(quickVal); setForm((f) => ({ ...f, genreId: newItem.id })); }
    if (quickAdd === 'author') { newItem = await createAuthor.mutateAsync(quickVal); setForm((f) => ({ ...f, authorId: newItem.id })); }
    if (quickAdd === 'publisher') { newItem = await createPublisher.mutateAsync(quickVal); setForm((f) => ({ ...f, publisherId: newItem.id })); }
    toast.success(`Đã thêm ${quickAdd} mới!`);
    setQuickAdd(null);
    setQuickVal('');
  };

  const handleBulkUpload = async () => {
    if (!bulkFiles.length) return;
    const fd = new FormData();
    bulkFiles.forEach((f) => fd.append('files', f));
    const result = await bulkUpload.mutateAsync(fd);
    toast.success(result.message);
    setShowBulkModal(false);
    setBulkFiles([]);
  };

  const handleDownloadSample = () => {
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + 'title,author,genre,publisher,price,year,description,image,special'], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'bookstore_sample.csv';
    document.body.appendChild(a); a.click();
    URL.revokeObjectURL(url); document.body.removeChild(a);
  };

  const inputCls = 'w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent';
  const isSaving = createProduct.isPending || updateProduct.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
          <p className="text-sm text-gray-500 mt-1">Tổng cộng {total} sản phẩm</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowBulkModal(true)} className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
            <Upload className="h-4 w-4" /> Tải lên hàng loạt
          </button>
          <button onClick={openAdd} className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 transition-colors">
            <Plus className="h-4 w-4" /> Thêm sản phẩm
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input type="text" placeholder="Tìm kiếm theo tiêu đề..." value={search} onChange={(e) => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
              {isLoading && <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />}
            </div>
            <div className="flex flex-wrap items-center gap-3">
              {[
                { label: 'Tất cả thể loại', value: filterGenre, set: setFilterGenre, options: genres.map((g) => ({ id: g.id, name: g.name })) },
                { label: 'Tất cả tác giả', value: filterAuthor, set: setFilterAuthor, options: authors.map((a) => ({ id: a.id, name: a.name })) },
                { label: 'Tất cả NXB', value: filterPublisher, set: setFilterPublisher, options: publishers.map((p) => ({ id: p.id, name: p.name })) },
              ].map(({ label, value, set, options }) => (
                <select key={label} value={value} onChange={(e) => { set(e.target.value); setPage(1); }}
                  className="rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                  <option value="">{label}</option>
                  {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                </select>
              ))}
              {(filterGenre || filterAuthor || filterPublisher || search) && (
                <button onClick={() => { setSearch(''); setFilterGenre(''); setFilterAuthor(''); setFilterPublisher(''); setPage(1); }}
                  className="text-sm font-semibold text-red-600 hover:text-red-700 px-2">Xóa lọc</button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="flex justify-center py-16"><div className="h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" /></div>
          ) : products.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  {['Sản phẩm', 'Thể loại', 'Tác giả', 'Giá', 'Kho', 'Đã bán', ''].map((h) => (
                    <th key={h} className={`px-5 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wider ${h === '' ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {products.map((product) => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 relative flex-shrink-0 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                          <Image src={product.image || '/next.svg'} alt={product.title} fill className="w-full h-full object-contain p-1" unoptimized />
                        </div>
                        <span className="font-medium text-gray-900 text-sm truncate max-w-[160px]">{product.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{product.genre?.name || '—'}</td>
                    <td className="px-5 py-3 text-sm text-gray-500 truncate max-w-[120px]">{product.author?.name || '—'}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">{formatVND(Number(product.price))}</td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">{product.stock ?? 1000}</td>
                    <td className="px-5 py-3 text-sm text-gray-500">{product.soldCount ?? 0}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(product)} className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors"><Edit className="h-4 w-4" /></button>
                        <button onClick={() => setConfirmDelete({ open: true, id: product.id, title: product.title })} disabled={deleteProduct.isPending}
                          className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50"><Trash2 className="h-4 w-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="py-16 text-center text-gray-400 text-sm">Không tìm thấy sản phẩm nào.</div>
          )}
        </div>

        {/* Pagination */}
        <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="text-sm text-gray-500">
            Hiển thị <span className="font-semibold text-gray-900">{Math.min((page - 1) * itemsPerPage + 1, total)}</span> – <span className="font-semibold text-gray-900">{Math.min(page * itemsPerPage, total)}</span> / <span className="font-semibold text-gray-900">{total}</span>
          </div>
          {total > itemsPerPage && (
            <div className="flex items-center gap-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1 || isLoading}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                <ChevronLeft className="h-4 w-4" /> Trước
              </button>
              {[...Array(Math.ceil(total / itemsPerPage))].map((_, i) => {
                const p = i + 1;
                if (p === 1 || p === Math.ceil(total / itemsPerPage) || Math.abs(p - page) <= 1) {
                  return <button key={p} onClick={() => setPage(p)} className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${page === p ? 'bg-red-600 text-white shadow-sm' : 'text-gray-500 hover:bg-gray-100'}`}>{p}</button>;
                }
                if (Math.abs(p - page) === 2) return <span key={p} className="text-gray-300">...</span>;
                return null;
              })}
              <button onClick={() => setPage((p) => Math.min(Math.ceil(total / itemsPerPage), p + 1))} disabled={page >= Math.ceil(total / itemsPerPage) || isLoading}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                Sau <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Product Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">{editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh sản phẩm</label>
                <div className="flex items-center gap-4">
                  {(previewUrl || form.image) && (
                    <div className="h-20 w-20 relative flex-shrink-0 bg-gray-100 border rounded-lg overflow-hidden">
                      <Image 
                        src={previewUrl || form.image} 
                        alt="Preview" 
                        fill 
                        className="w-full h-full object-contain p-1" 
                        unoptimized 
                      />
                    </div>
                  )}
                    <label className="flex items-center gap-2 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-red-400 hover:text-red-500 transition-colors">
                      <Upload className="h-4 w-4" />
                      {selectedFile ? 'Đã chọn ảnh' : 'Tải ảnh lên'}
                      <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                    </label>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                  <input type="text" placeholder="Tên sách" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} className={inputCls} />
                </div>
                {[
                  { label: 'Tác giả *', key: 'authorId', options: authors, qKey: 'author' as const },
                  { label: 'Thể loại', key: 'genreId', options: genres, qKey: 'genre' as const },
                  { label: 'Nhà xuất bản', key: 'publisherId', options: publishers, qKey: 'publisher' as const },
                ].map(({ label, key, options, qKey }) => (
                  <div key={key}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
                    <div className="flex gap-2">
                      <select value={(form as Record<string, unknown>)[key] as string} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className={inputCls}>
                        <option value="">-- Chọn --</option>
                        {options.map((o) => <option key={o.id} value={o.id}>{o.name}</option>)}
                      </select>
                      <button onClick={() => setQuickAdd(qKey)} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors"><Plus className="h-5 w-5" /></button>
                    </div>
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND) *</label>
                  <input type="number" placeholder="150000" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Kho *</label>
                  <input type="number" placeholder="1000" value={form.stock} onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Năm xuất bản</label>
                  <input type="number" placeholder="2024" value={form.year} onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))} className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea rows={3} placeholder="Mô tả cuốn sách..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className={`${inputCls} resize-none`} />
                </div>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="special" checked={form.special} onChange={(e) => setForm((f) => ({ ...f, special: e.target.checked }))} className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <label htmlFor="special" className="text-sm font-medium text-gray-700">Đánh dấu là Sản phẩm đặc biệt / Nổi bật</label>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
                <button onClick={handleSave} disabled={isSaving || uploadImage.isPending || !form.title}
                  className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                  <Save className="h-4 w-4" /> {(isSaving || uploadImage.isPending) ? 'Đang xử lý...' : editingId ? 'Cập nhật' : 'Tạo mới'}
                </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmModal
        open={confirmDelete.open}
        title="Xóa sản phẩm"
        message={`Bạn có chắc muốn xóa "${confirmDelete.title}"?`}
        confirmLabel="Xóa"
        loading={deleteProduct.isPending}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: '', title: '' })}
      />

      {/* Quick Add Modal */}
      {quickAdd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4 capitalize">
              Thêm {quickAdd === 'genre' ? 'thể loại' : quickAdd === 'author' ? 'tác giả' : 'nhà xuất bản'} mới
            </h3>
            <input type="text" autoFocus placeholder="Tên..." value={quickVal} onChange={(e) => setQuickVal(e.target.value)} className={inputCls} onKeyDown={(e) => e.key === 'Enter' && handleQuickAdd()} />
            <div className="flex justify-end gap-2 mt-6">
              <button onClick={() => { setQuickAdd(null); setQuickVal(''); }} className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900">Hủy</button>
              <button onClick={handleQuickAdd} disabled={!quickVal} className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50">Thêm</button>
            </div>
          </div>
        </div>
      )}

      {/* Bulk Upload Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold text-gray-900">Tải lên sản phẩm hàng loạt</h2>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-4">
              <p className="text-sm text-gray-500">Tải lên tệp CSV chứa danh sách sản phẩm.</p>
              <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 font-mono text-[11px] text-red-600">
                title,author,genre,publisher,price,year,description,image,special
              </div>
              <button onClick={handleDownloadSample} className="text-sm font-semibold text-red-600 hover:text-red-700 underline">Tải file mẫu CSV</button>
              <div>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-colors">
                  <Upload className="h-8 w-8 text-gray-400 mb-2" />
                  <span className="text-sm text-gray-500">{bulkFiles.length > 0 ? `${bulkFiles.length} file(s) đã chọn` : 'Chọn CSV + ảnh (nếu có)'}</span>
                  <input type="file" multiple accept=".csv,image/*" className="hidden" onChange={(e) => setBulkFiles(Array.from(e.target.files || []))} />
                </label>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowBulkModal(false)} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">Hủy</button>
              <button onClick={handleBulkUpload} disabled={!bulkFiles.length || bulkUpload.isPending}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60">
                <Upload className="h-4 w-4" /> {bulkUpload.isPending ? 'Đang tải...' : 'Tải lên'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
