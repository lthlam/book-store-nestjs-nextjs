'use client';

import { useState, useEffect, useCallback } from 'react';
import { Plus, Search, Edit, Trash2, X, Save, Upload, ChevronLeft, ChevronRight } from 'lucide-react';
import ConfirmModal from '../../../../components/common/ConfirmModal';
import { useToast } from '../../../../context/ToastContext';
import { API_URL } from '@/utils/constants';
import { formatVND } from '@/utils/format';


const emptyForm = { title: '', authorId: '', price: '', year: '', description: '', genreId: '', publisherId: '', image: '', special: false };

import { Product, Genre, Author, Publisher } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [genres, setGenres] = useState<Genre[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<typeof emptyForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; id: string; title: string }>({ open: false, id: '', title: '' });
  const [quickAdd, setQuickAdd] = useState<'genre' | 'author' | 'publisher' | null>(null);
  const [quickVal, setQuickVal] = useState('');
  const [authors, setAuthors] = useState<Author[]>([]);
  const [publishers, setPublishers] = useState<Publisher[]>([]);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [uploadingBulk, setUploadingBulk] = useState(false);
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  
  // Pagination & Search states
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterGenre, setFilterGenre] = useState('');
  const [filterAuthor, setFilterAuthor] = useState('');
  const [filterPublisher, setFilterPublisher] = useState('');
  const itemsPerPage = 20;

  const toast = useToast();

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to page 1 on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('limit', itemsPerPage.toString());
      params.append('page', page.toString());
      if (debouncedSearch) params.append('search', debouncedSearch);
      if (filterGenre) params.append('genreIds', filterGenre);
      if (filterAuthor) params.append('authorIds', filterAuthor);
      if (filterPublisher) params.append('publisherIds', filterPublisher);

      const [pRes, gRes, aRes, pubRes] = await Promise.all([
        fetch(`${API_URL}/products?${params.toString()}`),
        fetch(`${API_URL}/genres`),
        fetch(`${API_URL}/authors`),
        fetch(`${API_URL}/publishers`),
      ]);
      const p = await pRes.json();
      const g = await gRes.json();
      const a = await aRes.json();
      const pub = await pubRes.json();
      
      const productData = Array.isArray(p.data) ? p.data : (Array.isArray(p) ? p : []);
      setProducts(productData);
      setTotal(p.total ?? (Array.isArray(p) ? p.length : 0));
      
      setGenres(Array.isArray(g) ? g : []);
      setAuthors(Array.isArray(a) ? a : []);
      setPublishers(Array.isArray(pub) ? pub : []);
    } catch (e) { 
      console.error(e); 
      toast.error('Failed to load data');
    }
    finally { setLoading(false); }
  }, [page, debouncedSearch, filterGenre, filterAuthor, filterPublisher, toast]);

  useEffect(() => { 
    const load = async () => {
      await Promise.resolve();
      fetchAll();
    };
    load();
  }, [fetchAll]);

  const openAdd = () => { setEditingId(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setForm({
      title: p.title || '',
      authorId: p.author?.id || '',
      price: String(p.price || ''),
      year: String(p.year || ''),
      description: p.description || '',
      genreId: p.genre?.id || '',
      publisherId: p.publisher?.id || '',
      image: p.image || '',
      special: p.special || false,
    });
    setShowModal(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch(`${API_URL}/uploads`, { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setForm((f: typeof emptyForm) => ({ ...f, image: url }));
      }
    } catch (e) { console.error(e); }
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const body = {
        title: form.title,
        authorId: form.authorId,
        publisherId: form.publisherId,
        price: Number(form.price), year: Number(form.year),
        description: form.description, genreId: form.genreId,
        image: form.image, special: form.special,
      };
      const url = editingId ? `${API_URL}/products/${editingId}` : `${API_URL}/products`;
      const method = editingId ? 'PATCH' : 'POST';
      const res = await fetch(url, { method, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
      if (res.ok) {
        setShowModal(false);
        fetchAll();
        toast.success(editingId ? 'Product updated successfully!' : 'Product created successfully!');
      } else { toast.error('Failed to save product.'); }
    } catch (e) { console.error(e); toast.error('An error occurred.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeletingId(confirmDelete.id);
    try {
      await fetch(`${API_URL}/products/${confirmDelete.id}`, { method: 'DELETE' });
      fetchAll();
      toast.success('Product deleted successfully!');
    } catch (e) { console.error(e); toast.error('Failed to delete product.'); }
    finally { setDeletingId(null); setConfirmDelete({ open: false, id: '', title: '' }); }
  };

  const handleQuickAddSave = async () => {
    if (!quickVal || !quickAdd) return;
    try {
      let endpoint = '';
      if (quickAdd === 'genre') endpoint = 'genres';
      if (quickAdd === 'author') endpoint = 'authors';
      if (quickAdd === 'publisher') endpoint = 'publishers';

      const res = await fetch(`${API_URL}/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: quickVal })
      });
      if (res.ok) {
        const newItem = await res.json();
        if (quickAdd === 'genre') {
          setGenres(prev => [...prev, newItem]);
          setForm(f => ({ ...f, genreId: newItem.id }));
        }
        if (quickAdd === 'author') {
          setAuthors(prev => [...prev, newItem]);
          setForm(f => ({ ...f, authorId: newItem.id }));
        }
        if (quickAdd === 'publisher') {
          setPublishers(prev => [...prev, newItem]);
          setForm(f => ({ ...f, publisherId: newItem.id }));
        }
        toast.success(`New ${quickAdd} added!`);
        setQuickAdd(null);
        setQuickVal('');
      } else {
        toast.error(`Failed to add ${quickAdd}.`);
      }
    } catch (e) {
      console.error(e);
      toast.error('Error adding new item.');
    }
  };

  const handleBulkUpload = async () => {
    if (bulkFiles.length === 0) return;
    setUploadingBulk(true);
    try {
      const fd = new FormData();
      bulkFiles.forEach(file => {
        fd.append('files', file);
      });
      const res = await fetch(`${API_URL}/products/bulk`, {
        method: 'POST',
        body: fd
      });
      if (res.ok) {
        const result = await res.json();
        toast.success(result.message);
        setShowBulkModal(false);
        setBulkFiles([]);
        fetchAll();
      } else {
        toast.error('Failed to upload products.');
      }
    } catch (e) {
      console.error(e);
      toast.error('An error occurred during upload.');
    } finally {
      setUploadingBulk(false);
    }
  };

  const handleDownloadSample = () => {
    const headers = 'title,author,genre,publisher,price,year,description,image,special';
    // Thêm BOM (Byte Order Mark) để Excel nhận diện đúng UTF-8
    const BOM = '\uFEFF';
    const blob = new Blob([BOM + headers], { type: 'text/csv;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'bookstore_sample.csv';
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const filtered = products; // Already filtered by server


  const inputCls = "w-full rounded-lg border border-gray-300 bg-white text-gray-900 placeholder-gray-400 py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent";

  return (
    <div className="space-y-6">
      {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sản phẩm</h1>
            <p className="text-sm text-gray-500 mt-1">Tổng cộng {total} sản phẩm</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowBulkModal(true)}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">
              <Upload className="h-4 w-4" /> Tải lên hàng loạt
            </button>
            <button onClick={openAdd}
              className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-700 transition-colors">
              <Plus className="h-4 w-4" /> Thêm sản phẩm
            </button>
          </div>
        </div>

      {/* Table card */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-4 border-b border-gray-100 space-y-4">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
              <input type="text" placeholder="Tìm kiếm theo tiêu đề hoặc tác giả..."
                value={search} onChange={e => setSearch(e.target.value)}
                className="w-full rounded-lg border border-gray-200 py-2 pl-9 pr-3 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500" />
              {loading && <div className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <select 
                value={filterGenre} 
                onChange={e => { setFilterGenre(e.target.value); setPage(1); }}
                className="rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Tất cả thể loại</option>
                {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
              </select>

              <select 
                value={filterAuthor} 
                onChange={e => { setFilterAuthor(e.target.value); setPage(1); }}
                className="rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Tất cả tác giả</option>
                {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
              </select>

              <select 
                value={filterPublisher} 
                onChange={e => { setFilterPublisher(e.target.value); setPage(1); }}
                className="rounded-lg border border-gray-200 py-2 px-3 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="">Tất cả NXB</option>
                {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>

              {(filterGenre || filterAuthor || filterPublisher || search) && (
                <button 
                  onClick={() => { setSearch(''); setFilterGenre(''); setFilterAuthor(''); setFilterPublisher(''); setPage(1); }}
                  className="text-sm font-semibold text-red-600 hover:text-red-700 px-2"
                >
                  Xóa lọc
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-8 w-8 border-4 border-red-600 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length > 0 ? (
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Sản phẩm</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Thể loại</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Tác giả</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Giá</th>
                  <th className="px-5 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Đã bán</th>
                  <th className="px-5 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filtered.map(product => (
                  <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 relative flex-shrink-0 bg-gray-100 border border-gray-200 rounded-lg overflow-hidden">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img 
                            src={product.image || '/next.svg'} 
                            alt={product.title}
                            className="w-full h-full object-contain p-1"
                            loading="lazy"
                          />
                        </div>
                        <span className="font-medium text-gray-900 text-sm truncate max-w-[160px]">{product.title}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{product.genre?.name || '—'}</td>
                    <td className="px-5 py-3 text-sm text-gray-500 truncate max-w-[120px]">
                      {(typeof product.author === 'object' ? product.author?.name : product.author) || '—'}
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-gray-900">
                      {formatVND(Number(product.price))}
                    </td>
                    <td className="px-5 py-3 text-sm text-gray-500">{product.soldCount ?? 0}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => openEdit(product)}
                          className="p-2 rounded-lg text-gray-500 hover:bg-blue-50 hover:text-blue-600 transition-colors">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => setConfirmDelete({ open: true, id: product.id, title: product.title })}
                          disabled={deletingId === product.id}
                          className="p-2 rounded-lg text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors disabled:opacity-50">
                          <Trash2 className="h-4 w-4" />
                        </button>
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

        <div className="px-5 py-4 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gray-50/50">
          <div className="text-sm text-gray-500">
            Hiển thị từ <span className="font-semibold text-gray-900">{Math.min((page - 1) * itemsPerPage + 1, total)}</span> đến <span className="font-semibold text-gray-900">{Math.min(page * itemsPerPage, total)}</span> trên tổng số <span className="font-semibold text-gray-900">{total}</span> sản phẩm
          </div>
          
          {total > itemsPerPage && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                <ChevronLeft className="h-4 w-4" /> Trước
              </button>
              
              <div className="flex items-center gap-1">
                {[...Array(Math.ceil(total / itemsPerPage))].map((_, i) => {
                  const p = i + 1;
                  // Show current page, first, last, and neighbors
                  if (p === 1 || p === Math.ceil(total / itemsPerPage) || Math.abs(p - page) <= 1) {
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`h-8 w-8 rounded-lg text-xs font-bold transition-all ${page === p ? 'bg-red-600 text-white shadow-sm shadow-red-200' : 'text-gray-500 hover:bg-gray-100'}`}
                      >
                        {p}
                      </button>
                    );
                  }
                  if (Math.abs(p - page) === 2) return <span key={p} className="text-gray-300">...</span>;
                  return null;
                })}
              </div>

              <button
                onClick={() => setPage(p => Math.min(Math.ceil(total / itemsPerPage), p + 1))}
                disabled={page >= Math.ceil(total / itemsPerPage) || loading}
                className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Sau <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 sticky top-0 bg-white z-10">
              <h2 className="text-lg font-bold text-gray-900">
                {editingId ? 'Chỉnh sửa sản phẩm' : 'Thêm sản phẩm mới'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 p-1">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Ảnh sản phẩm</label>
                <div className="flex items-center gap-4">
                  {form.image && (
                    <div className="h-20 w-20 relative flex-shrink-0 bg-gray-100 border rounded-lg overflow-hidden">
                      <img 
                        src={form.image} 
                        alt="Preview" 
                        className="w-full h-full object-contain p-1" 
                      />
                    </div>
                  )}
                  <label className="flex items-center gap-2 cursor-pointer rounded-lg border-2 border-dashed border-gray-300 px-4 py-3 text-sm text-gray-500 hover:border-red-400 hover:text-red-500 transition-colors">
                    <Upload className="h-4 w-4" />
                    {uploading ? 'Đang tải lên...' : 'Tải ảnh lên'}
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} disabled={uploading} />
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tiêu đề *</label>
                  <input type="text" placeholder="Tên sách" value={form.title}
                    onChange={e => setForm((f: typeof emptyForm) => ({ ...f, title: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tác giả *</label>
                  <div className="flex gap-2">
                    <select value={form.authorId} onChange={e => setForm((f: typeof emptyForm) => ({ ...f, authorId: e.target.value }))} className={inputCls}>
                      <option value="">-- Chọn tác giả --</option>
                      {authors.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                    </select>
                    <button onClick={() => setQuickAdd('author')} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors">
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Thể loại</label>
                  <div className="flex gap-2">
                    <select value={form.genreId} onChange={e => setForm((f: typeof emptyForm) => ({ ...f, genreId: e.target.value }))} className={inputCls}>
                      <option value="">-- Chọn thể loại --</option>
                      {genres.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                    </select>
                    <button onClick={() => setQuickAdd('genre')} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors">
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nhà xuất bản</label>
                  <div className="flex gap-2">
                    <select value={form.publisherId} onChange={e => setForm((f: typeof emptyForm) => ({ ...f, publisherId: e.target.value }))} className={inputCls}>
                      <option value="">-- Chọn NXB --</option>
                      {publishers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                    </select>
                    <button onClick={() => setQuickAdd('publisher')} className="p-2 bg-gray-100 rounded-lg hover:bg-gray-200 text-gray-600 transition-colors">
                      <Plus className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Giá (VND) *</label>
                  <input type="number" placeholder="Ví dụ: 150000" value={form.price}
                    onChange={e => setForm((f: typeof emptyForm) => ({ ...f, price: e.target.value }))} className={inputCls} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Năm xuất bản</label>
                  <input type="number" placeholder="Ví dụ: 2024" value={form.year}
                    onChange={e => setForm((f: typeof emptyForm) => ({ ...f, year: e.target.value }))} className={inputCls} />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Mô tả</label>
                  <textarea rows={3} placeholder="Mô tả cuốn sách..." value={form.description}
                    onChange={e => setForm((f: typeof emptyForm) => ({ ...f, description: e.target.value }))}
                    className={`${inputCls} resize-none`} />
                </div>
                <div className="sm:col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="special" checked={form.special}
                    onChange={e => setForm((f: typeof emptyForm) => ({ ...f, special: e.target.checked }))}
                    className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500" />
                  <label htmlFor="special" className="text-sm font-medium text-gray-700">Đánh dấu là Sản phẩm đặc biệt / Nổi bật</label>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 px-6 pb-6">
              <button onClick={() => setShowModal(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                Hủy
              </button>
              <button onClick={handleSave} disabled={saving || !form.title}
                className="flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2 text-sm font-semibold text-white hover:bg-red-700 disabled:opacity-60 transition-colors">
                <Save className="h-4 w-4" />
                {saving ? 'Đang lưu...' : editingId ? 'Cập nhật' : 'Tạo mới'}
              </button>
            </div>
          </div>
        </div>
      )}
      <ConfirmModal
        open={confirmDelete.open}
        title="Xóa sản phẩm"
        message={`Bạn có chắc chắn muốn xóa "${confirmDelete.title}"? Hành động này không thể hoàn tác.`}
        confirmLabel="Xóa"
        loading={!!deletingId}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete({ open: false, id: '', title: '' })}
      />

      {/* Quick Add Modal */}
      {quickAdd && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 px-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 animate-in zoom-in duration-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 capitalize">Thêm {quickAdd === 'genre' ? 'thể loại' : quickAdd === 'author' ? 'tác giả' : 'nhà xuất bản'} mới</h3>
            <input 
              type="text" 
              placeholder={`Tên ${quickAdd === 'genre' ? 'thể loại' : quickAdd === 'author' ? 'tác giả' : 'nhà xuất bản'}...`} 
              autoFocus
              value={quickVal} 
              onChange={e => setQuickVal(e.target.value)} 
              className={inputCls} 
              onKeyDown={e => e.key === 'Enter' && handleQuickAddSave()}
            />
            <div className="flex justify-end gap-2 mt-6">
              <button 
                onClick={() => { setQuickAdd(null); setQuickVal(''); }}
                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900"
              >
                Hủy
              </button>
              <button 
                onClick={handleQuickAddSave}
                disabled={!quickVal}
                className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-sm hover:bg-red-700 disabled:opacity-50"
              >
                Thêm
              </button>
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
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <p className="text-sm text-gray-500 leading-relaxed">
                  Tải lên tệp CSV chứa danh sách sản phẩm. Cấu trúc tệp cần tuân thủ đúng thứ tự các cột sau:
                </p>
                <div className="bg-gray-50 p-3 rounded-xl border border-gray-200 font-mono text-[11px] break-all text-red-600 leading-normal mb-2">
                  title, author, genre, publisher, price, year, description, image, special
                </div>
                <button 
                  onClick={handleDownloadSample}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-100 hover:text-red-700 transition-all active:scale-95 shadow-sm"
                >
                  <Save className="h-4 w-4" /> Tải file mẫu (.csv)
                </button>

                <div className="bg-red-50 p-4 rounded-xl border border-red-100 flex flex-col gap-2">
                  <p className="text-[12px] font-bold text-red-800 uppercase tracking-wider">Lưu ý:</p>
                  <ul className="text-[11px] text-red-700 list-disc ml-4 space-y-1">
                    <li>Nếu dùng <b>Ảnh trên Web</b>: Điền link URL vào cột <code>image</code>.</li>
                    <li>Nếu dùng <b>Ảnh trên Máy</b>: Điền <b>tên file</b> vào cột <code>image</code> (VD: <i>bia_sach.jpg</i>).</li>
                    <li>Khi chọn file bên dưới, bạn hãy chọn <b>file CSV và tất cả file ảnh</b> tương ứng cùng một lúc.</li>
                  </ul>
                </div>
              </div>
              
              <div className="group relative">
                <label className="flex flex-col items-center justify-center w-full min-h-[120px] border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-red-400 hover:bg-red-50/30 transition-all">
                  <div className="flex flex-col items-center justify-center pt-4 pb-4 px-4 text-center">
                    <Upload className={`h-8 w-8 mb-2 ${bulkFiles.length > 0 ? 'text-red-500' : 'text-gray-400'}`} />
                    <p className="text-xs font-semibold text-gray-700">
                      {bulkFiles.length > 0 ? `Đã chọn ${bulkFiles.length} tệp` : 'Nhấp để chọn file CSV & ảnh'}
                    </p>
                    {bulkFiles.length > 0 && (
                      <p className="text-[10px] text-gray-500 mt-1 line-clamp-2 italic">
                        {bulkFiles.map(f => f.name).join(', ')}
                      </p>
                    )}
                  </div>
                  <input type="file" multiple className="hidden" 
                    onChange={e => setBulkFiles(Array.from(e.target.files || []))} 
                  />
                </label>
              </div>
 
              <div className="flex justify-end gap-3 mt-4">
                <button onClick={() => { setShowBulkModal(false); setBulkFiles([]); }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg">
                  Hủy
                </button>
                <button onClick={handleBulkUpload} disabled={bulkFiles.length === 0 || uploadingBulk}
                  className="bg-red-600 text-white px-6 py-2 rounded-lg text-sm font-bold hover:bg-red-700 disabled:opacity-50 transition-all shadow-md">
                  {uploadingBulk ? 'Đang tải lên...' : 'Bắt đầu tải lên'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
