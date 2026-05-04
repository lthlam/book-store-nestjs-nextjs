'use client';

import { useState } from 'react';
import { MessageSquare, Mail, CheckCircle2, Clock, Search, User, Copy } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';
import { useAllContacts, useUpdateContactStatus } from '@/hooks/useContacts';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    new:     'bg-rose-100 text-rose-700',
    read:    'bg-blue-100 text-blue-700',
    replied: 'bg-emerald-100 text-emerald-700',
  };
  const labels: Record<string, string> = { new: 'Mới', read: 'Đã xem', replied: 'Đã phản hồi' };
  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${map[status] ?? 'bg-gray-100 text-gray-700'}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default function AdminInquiriesPage() {
  const toast = useToast();
  const [selected, setSelected] = useState<Inquiry | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  const { data: inquiries = [], isLoading } = useAllContacts();
  const updateStatus = useUpdateContactStatus();

  const handleUpdateStatus = async (id: string, status: 'read' | 'replied') => {
    await updateStatus.mutateAsync({ id, status });
    if (selected?.id === id) setSelected((prev) => prev ? { ...prev, status } : prev);
    toast.success('Đã cập nhật trạng thái');
  };

  const filtered = (inquiries as Inquiry[]).filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.email.toLowerCase().includes(search.toLowerCase()) ||
      (item.subject?.toLowerCase().includes(search.toLowerCase()));
    const matchFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchSearch && matchFilter;
  });

  if (isLoading) return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600" />
    </div>
  );

  return (
    <div className="space-y-6 pb-10">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Hỗ trợ khách hàng</h1>
        <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
          <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse" />
          {(inquiries as Inquiry[]).filter((i) => i.status === 'new').length} tin nhắn mới
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-230px)]">
        {/* List */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input type="text" placeholder="Tìm tên, email, tiêu đề..." value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20" />
            </div>
            <div className="flex gap-2">
              {(['all', 'new', 'read', 'replied'] as const).map((s) => (
                <button key={s} onClick={() => setFilterStatus(s)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${filterStatus === s ? 'bg-rose-600 text-white' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                  {s === 'all' ? 'Tất cả' : s === 'new' ? 'Mới' : s === 'read' ? 'Đã xem' : 'Đã phản hồi'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <AnimatePresence mode="popLayout">
              {filtered.length > 0 ? filtered.map((item) => (
                <motion.div layout key={item.id} onClick={() => setSelected(item)}
                  className={`p-4 rounded-2xl cursor-pointer transition-all border ${selected?.id === item.id ? 'bg-rose-50 border-rose-100 shadow-sm' : 'border-transparent hover:bg-gray-50'}`}>
                  <div className="flex justify-between items-start mb-1">
                    <h4 className={`text-sm font-bold truncate pr-2 ${item.status === 'new' ? 'text-gray-900' : 'text-gray-600'}`}>{item.name}</h4>
                    <span className="text-[10px] text-gray-400 whitespace-nowrap">{new Date(item.createdAt).toLocaleDateString('vi-VN')}</span>
                  </div>
                  <p className="text-xs text-gray-500 truncate mb-2">{item.subject || 'Không có tiêu đề'}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] text-gray-400">{item.email}</span>
                    <StatusBadge status={item.status} />
                  </div>
                </motion.div>
              )) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center space-y-2">
                  <MessageSquare className="h-10 w-10 opacity-20" />
                  <p className="text-sm font-medium">Không tìm thấy tin nhắn</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Detail */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {selected ? (
            <>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                    <User className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900">{selected.name}</h2>
                    <div className="flex items-center gap-2">
                      <p className="text-xs text-gray-500">{selected.email}</p>
                      <button onClick={() => { navigator.clipboard.writeText(selected.email); toast.success('Đã sao chép email'); }}
                        className="p-1 hover:bg-gray-100 rounded text-gray-300 hover:text-gray-600">
                        <Copy className="h-3 w-3" />
                      </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selected.status !== 'read' && selected.status !== 'replied' && (
                    <button onClick={() => handleUpdateStatus(selected.id, 'read')}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Đánh dấu đã xem
                    </button>
                  )}
                  <button onClick={() => {
                    const subject = encodeURIComponent(`Phản hồi: ${selected.subject || 'Câu hỏi của bạn'}`);
                    window.location.href = `mailto:${selected.email}?subject=${subject}`;
                    if (selected.status !== 'replied') handleUpdateStatus(selected.id, 'replied');
                  }}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 flex items-center gap-2">
                    <Mail className="h-4 w-4" /> Phản hồi qua Email
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="pb-4 border-b border-gray-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Tiêu đề</p>
                  <h3 className="text-lg font-bold text-gray-900">{selected.subject || 'Không có tiêu đề'}</h3>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nội dung</p>
                    <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                      <Clock className="h-3 w-3" /> {new Date(selected.createdAt).toLocaleString('vi-VN')}
                    </div>
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center">
              <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                <MessageSquare className="h-10 w-10 opacity-10" />
              </div>
              <h3 className="text-lg font-bold text-gray-600 italic">Chọn một tin nhắn để xem</h3>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
