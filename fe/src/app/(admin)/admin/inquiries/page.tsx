'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  MessageSquare, 
  Mail, 
  CheckCircle2, 
  Clock, 
  Search, 
  User,
  Copy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '@/context/ToastContext';

interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read' | 'replied';
  createdAt: string;
}

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const toast = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const fetchInquiries = useCallback(async () => {
    try {
      const res = await fetch(`${apiUrl}/contacts`);
      if (res.ok) {
        const data = await res.json();
        setInquiries(data);
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể tải danh sách tin nhắn');
    } finally {
      setLoading(false);
    }
  }, [apiUrl, toast]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchInquiries();
  }, [fetchInquiries]);

  const updateInquiryStatus = async (id: string, status: 'read' | 'replied') => {
    try {
      const res = await fetch(`${apiUrl}/contacts/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setInquiries(prev => prev.map(item => item.id === id ? { ...item, status } : item));
        if (selectedInquiry?.id === id) {
          setSelectedInquiry({ ...selectedInquiry, status });
        }
        toast.success(`Đã cập nhật trạng thái`);
      }
    } catch (err) {
      console.error(err);
      toast.error('Cập nhật thất bại');
    }
  };

  const filteredInquiries = inquiries.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (item.subject && item.subject.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterStatus === 'all' || item.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'new':
        return <span className="px-2.5 py-1 rounded-full bg-rose-100 text-rose-700 text-[10px] font-black uppercase tracking-wider">Mới</span>;
      case 'read':
        return <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 text-[10px] font-black uppercase tracking-wider">Đã xem</span>;
      case 'replied':
        return <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-black uppercase tracking-wider">Đã phản hồi</span>;
      default:
        return null;
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
      </div>
    );
  }

  return (
    <motion.div 
      initial="hidden" animate="visible" variants={containerVariants}
      className="space-y-6 pb-10"
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900">Hỗ trợ khách hàng</h1>
          <p className="text-gray-500 mt-1 flex items-center gap-2 text-sm">
            <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-pulse"></span>
            {inquiries.filter(i => i.status === 'new').length} tin nhắn mới cần xử lý
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-230px)]">
        {/* List View */}
        <div className="lg:col-span-5 xl:col-span-4 flex flex-col bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-4 border-b border-gray-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="text" 
                placeholder="Tìm tên, email, tiêu đề..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-xl text-sm focus:ring-2 focus:ring-rose-500/20"
              />
            </div>
            <div className="flex gap-2">
              {['all', 'new', 'read', 'replied'].map(status => (
                <button
                  key={status}
                  onClick={() => setFilterStatus(status)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    filterStatus === status 
                    ? 'bg-rose-600 text-white' 
                    : 'bg-gray-50 text-gray-500 hover:bg-gray-100'
                  }`}
                >
                  {status === 'all' ? 'Tất cả' : status === 'new' ? 'Mới' : status === 'read' ? 'Đã xem' : 'Đã phản hồi'}
                </button>
              ))}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2 space-y-1">
            <AnimatePresence mode='popLayout'>
              {filteredInquiries.length > 0 ? (
                filteredInquiries.map((inquiry) => (
                  <motion.div
                    layout
                    key={inquiry.id}
                    variants={itemVariants}
                    onClick={() => setSelectedInquiry(inquiry)}
                    className={`p-4 rounded-2xl cursor-pointer transition-all border ${
                      selectedInquiry?.id === inquiry.id 
                      ? 'bg-rose-50 border-rose-100 shadow-sm' 
                      : 'border-transparent hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-1">
                      <h4 className={`text-sm font-bold truncate pr-2 ${inquiry.status === 'new' ? 'text-gray-900' : 'text-gray-600'}`}>
                        {inquiry.name}
                      </h4>
                      <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap">
                        {new Date(inquiry.createdAt).toLocaleDateString('vi-VN')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 truncate mb-2">{inquiry.subject || 'Không có tiêu đề'}</p>
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] text-gray-400 font-medium">{inquiry.email}</span>
                      {getStatusBadge(inquiry.status)}
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-gray-400 p-8 text-center space-y-2">
                  <MessageSquare className="h-10 w-10 opacity-20" />
                  <p className="text-sm font-medium">Không tìm thấy tin nhắn nào</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Detail View */}
        <div className="lg:col-span-7 xl:col-span-8 bg-white rounded-3xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
          {selectedInquiry ? (
            <>
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-white border border-gray-100 flex items-center justify-center shadow-sm">
                    <User className="h-5 w-5 text-rose-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-gray-900 leading-tight">{selectedInquiry.name}</h2>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-gray-500 font-medium">{selectedInquiry.email}</p>
                        <button 
                            onClick={() => {
                                navigator.clipboard.writeText(selectedInquiry.email);
                                toast.success('Đã sao chép địa chỉ Email');
                            }}
                            className="p-1 hover:bg-gray-100 rounded text-gray-300 hover:text-gray-600 transition-colors"
                        >
                            <Copy className="h-3 w-3" />
                        </button>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {selectedInquiry.status !== 'read' && selectedInquiry.status !== 'replied' && (
                    <button 
                      onClick={() => updateInquiryStatus(selectedInquiry.id, 'read')}
                      className="px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-bold hover:bg-gray-50 transition-all flex items-center gap-1.5"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                      Đánh dấu là đã xem
                    </button>
                  )}
                  <button 
                    onClick={() => {
                        const subject = encodeURIComponent(`Phản hồi từ DreamBook: ${selectedInquiry.subject || 'Câu hỏi của bạn'}`);
                        const body = encodeURIComponent(`Chào ${selectedInquiry.name},\n\nCảm ơn bạn đã liên hệ với DreamBook. Về câu hỏi của bạn: "${selectedInquiry.message.slice(0, 50)}${selectedInquiry.message.length > 50 ? '...' : ''}", chúng tôi xin phản hồi như sau:\n\n[Nhập nội dung phản hồi tại đây]\n\nTrân trọng,\nĐội ngũ hỗ trợ DreamBook`);
                        
                        window.location.href = `mailto:${selectedInquiry.email}?subject=${subject}&body=${body}`;
                        
                        if (selectedInquiry.status !== 'replied') {
                            updateInquiryStatus(selectedInquiry.id, 'replied');
                        }
                    }}
                    className="px-4 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold hover:bg-rose-700 transition-all shadow-md shadow-rose-200 flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Phản hồi qua Email
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                <div className="pb-4 border-b border-gray-50">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">Tiêu đề</p>
                  <h3 className="text-lg font-bold text-gray-900">
                    {selectedInquiry.subject || 'Không có tiêu đề'}
                  </h3>
                </div>

                <div className="space-y-3">
                   <div className="flex items-center justify-between">
                     <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Nội dung</p>
                     <div className="flex items-center gap-1.5 text-[10px] text-gray-400 font-bold">
                        <Clock className="h-3 w-3" />
                        {new Date(selectedInquiry.createdAt).toLocaleString('vi-VN')}
                     </div>
                   </div>
                   <div className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap py-2">
                     {selectedInquiry.message}
                   </div>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-400 p-12 text-center">
              <div className="h-24 w-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 border border-gray-100">
                <MessageSquare className="h-10 w-10 opacity-10" />
              </div>
              <h3 className="text-lg font-bold text-gray-600 italic">Chọn một tin nhắn để xem nội dung</h3>
              <p className="text-sm mt-2 max-w-xs mx-auto">Danh sách phía bên trái chứa tất cả các yêu cầu hỗ trợ và câu hỏi từ khách hàng.</p>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
