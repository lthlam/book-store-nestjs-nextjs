'use client';

import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Plus, Minus, MessageSquare, Clock, ShieldCheck } from 'lucide-react';
import { useToast } from '@/context/ToastContext';

export default function ContactPage() {
  const toast = useToast();
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      question: "Bao lâu thì tôi nhận được sách?",
      answer: "Thông thường, đơn hàng nội thành sẽ được giao trong vòng 1-2 ngày làm việc. Các tỉnh thành khác có thể mất từ 3-5 ngày tùy vào đơn vị vận chuyển."
    },
    {
      question: "Tôi có được kiểm tra hàng trước khi thanh toán không?",
      answer: "Có, DreamBook khuyến khích khách hàng kiểm tra ngoại quan gói hàng và sách trước khi nhận để đảm bảo chất lượng tốt nhất."
    },
    {
      question: "Chính sách đổi trả của nhà sách như thế nào?",
      answer: "Chúng tôi hỗ trợ đổi trả trong vòng 7 ngày nếu sách bị lỗi in ấn, rách hoặc nhầm lẫn trong quá trình đóng gói. Sách đổi trả phải còn nguyên tem/mác (nếu có)."
    },
    {
      question: "Nhà sách có hỗ trợ gói quà không?",
      answer: "Tất nhiên! Bạn có thể chọn dịch vụ gói quà và viết thiệp chúc mừng ở bước thanh toán với một khoản phí nhỏ."
    },
    {
      question: "Làm sao để tôi theo dõi đơn hàng của mình?",
      answer: "Sau khi đặt hàng thành công, bạn có thể vào mục 'Đơn hàng của tôi' trong hồ sơ cá nhân để theo dõi trạng thái vận chuyển thời gian thực."
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Vui lòng điền đầy đủ các trường bắt buộc.');
      return;
    }

    if (form.message.length < 10) {
      toast.error('Nội dung tin nhắn phải có ít nhất 10 ký tự.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(`${apiUrl}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      
      const data = await res.json();

      if (res.ok) {
        toast.success('Cảm ơn bạn! Câu hỏi của bạn đã được gửi đi thành công.');
        setForm({ name: '', email: '', subject: '', message: '' });
      } else {
        toast.error(data.message || 'Đã có lỗi xảy ra. Vui lòng thử lại sau.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Không thể kết nối tới máy chủ.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white">
      {/* Hero Section */}
      <div className="relative bg-gray-900 py-24 sm:py-32 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0 bg-gradient-to-br from-red-600 to-purple-800 mix-blend-multiply" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-6xl">
            Liên hệ với chúng tôi
          </h1>
          <p className="mt-6 text-xl text-gray-300 max-w-2xl mx-auto">
            Chúng tôi luôn ở đây để lắng nghe và giải đáp mọi thắc mắc của bạn về sách, đơn hàng hoặc bất kỳ điều gì khác.
          </p>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Contact Info Sidebar */}
          <div className="lg:col-span-1 space-y-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Thông tin liên lạc</h2>
              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 uppercase">Địa chỉ</p>
                    <p className="mt-1 text-gray-600 italic">Số 123, Đường Sách, Toà nhà Trí Tuệ, TP. Hồ Chí Minh</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <Phone className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 uppercase">Điện thoại</p>
                    <p className="mt-1 text-gray-600">+84 000 000 000 (Hotline 24/7)</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 h-10 w-10 flex items-center justify-center rounded-lg bg-red-50 text-red-600">
                    <Mail className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900 uppercase">Email support</p>
                    <p className="mt-1 text-gray-600">support@dreambook.vn</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-red-600" /> Giờ làm việc
              </h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex justify-between"><span>Thứ 2 - Thứ 6:</span> <span className="font-medium text-gray-900">08:00 - 21:00</span></li>
                <li className="flex justify-between"><span>Thứ 7 - CN:</span> <span className="font-medium text-gray-900">09:00 - 18:00</span></li>
              </ul>
            </div>
            
            <div className="bg-red-600 rounded-2xl p-6 text-white text-center shadow-lg shadow-red-200">
               <ShieldCheck className="h-10 w-10 mx-auto mb-3 opacity-80" />
               <p className="font-bold">Đảm bảo hài lòng 100%</p>
               <p className="text-xs text-red-100 mt-2">Chúng tôi cam kết phản hồi mọi yêu cầu trong vòng 24h làm việc.</p>
            </div>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl border border-gray-100 shadow-xl p-8 sm:p-10 relative overflow-hidden">
               <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                  <MessageSquare className="h-40 w-40" />
               </div>
               
               <h2 className="text-2xl font-bold text-gray-900 mb-8">Đặt câu hỏi cho chúng tôi</h2>
               
               <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="group">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 group-focus-within:text-red-600 transition-colors">Họ và tên *</label>
                    <input 
                      type="text" 
                      required
                      value={form.name}
                      onChange={e => setForm({...form, name: e.target.value})}
                      placeholder="Ví dụ: Nguyễn Văn A"
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all"
                    />
                  </div>
                  <div className="group">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2 group-focus-within:text-red-600 transition-colors">Địa chỉ Email *</label>
                    <input 
                      type="email" 
                      required
                      value={form.email}
                      onChange={e => setForm({...form, email: e.target.value})}
                      placeholder="email@example.com"
                      className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all"
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2 group-focus-within:text-red-600 transition-colors">Tiêu đề (Không bắt buộc)</label>
                  <input 
                    type="text" 
                    value={form.subject}
                    onChange={e => setForm({...form, subject: e.target.value})}
                    placeholder="Vấn đề bạn cần hỗ trợ..."
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all"
                  />
                </div>

                <div className="group">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase group-focus-within:text-red-600 transition-colors">
                      Nội dung tin nhắn *
                    </label>
                    <span className={`text-[10px] font-bold ${form.message.length < 10 ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {form.message.length}/10 ký tự tối thiểu
                    </span>
                  </div>
                  <textarea 
                    rows={5}
                    required
                    value={form.message}
                    onChange={e => setForm({...form, message: e.target.value})}
                    placeholder="Nhập nội dung câu hỏi của bạn tại đây..."
                    className="w-full rounded-xl border border-gray-300 bg-gray-50 px-4 py-3 text-sm focus:border-red-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-500/10 transition-all resize-none"
                  ></textarea>
                </div>

                <button 
                  type="submit"
                  disabled={submitting}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-red-600 px-10 py-4 text-base font-bold text-white shadow-xl hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 disabled:bg-gray-400 transition-all active:scale-95"
                >
                  {submitting ? 'Đang gửi...' : (
                    <>
                      Gửi tin nhắn <Send className="h-4 w-4" />
                    </>
                  )}
                </button>
               </form>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Câu hỏi thường gặp</h2>
            <p className="mt-4 text-gray-600">Tìm kiếm câu trả lời nhanh chóng cho những thắc mắc phổ biến nhất.</p>
          </div>
          
          <div className="max-w-3xl mx-auto space-y-4">
            {faqs.map((faq, index) => (
              <div 
                key={index}
                className="group rounded-2xl border border-gray-100 bg-white shadow-sm overflow-hidden transition-all hover:shadow-md"
              >
                <button 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left focus:outline-none"
                >
                  <span className="font-bold text-gray-900 group-hover:text-red-600 transition-colors">{faq.question}</span>
                  {openFaq === index ? (
                    <Minus className="h-5 w-5 text-red-600 flex-shrink-0" />
                  ) : (
                    <Plus className="h-5 w-5 text-gray-400 flex-shrink-0" />
                  )}
                </button>
                <div className={`transition-all duration-300 ease-in-out ${openFaq === index ? 'max-h-40 opacity-100' : 'max-h-0 opacity-0'} overflow-hidden`}>
                  <div className="px-6 pb-6 text-gray-600 text-sm leading-relaxed border-t border-gray-50 pt-4">
                    {faq.answer}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-12 text-center bg-gray-50 rounded-3xl p-8 border border-dashed border-gray-300 max-w-2xl mx-auto">
             <p className="text-gray-600 italic">Vẫn chưa tìm thấy câu trả lời? Hãy trực tiếp gửi lời nhắn phía trên hoặc gọi cho chúng tôi ngay.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
