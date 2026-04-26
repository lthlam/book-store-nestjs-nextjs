'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, BookOpen, Truck, CreditCard, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
}

const FAQ_DATA = [
  {
    id: 'store-location',
    question: 'Cửa hàng ở đâu?',
    answer: 'Chào bạn! DreamBook hiện có trụ sở tại Hà Nội và hỗ trợ giao hàng toàn quốc nhanh chóng trong 2-4 ngày làm việc.',
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    id: 'shipping-fee',
    question: 'Phí giao hàng bao nhiêu?',
    answer: 'Phí giao hàng là 30.000đ cho mọi đơn hàng dưới 500.000đ. Đơn hàng từ 500.000đ trở lên sẽ được FREESHIP hoàn toàn!',
    icon: <Truck className="h-4 w-4" />
  },
  {
    id: 'payment-methods',
    question: 'Thanh toán như thế nào?',
    answer: 'Chúng tôi hỗ trợ chuyển khoản ngân hàng, ví MoMo, VNPay và thanh toán khi nhận hàng (COD) để bạn yên tâm mua sắm.',
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    id: 'return-policy',
    question: 'Làm sao để đổi trả?',
    answer: 'Bạn có thể đổi trả sách trong vòng 7 ngày kể từ khi nhận hàng nếu có lỗi in ấn hoặc hư hỏng do vận chuyển. Hãy liên hệ hotline 1900xxxx để được hỗ trợ nhé!',
    icon: <RotateCcw className="h-4 w-4" />
  }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome',
      text: 'Xin chào! Tôi có thể giúp gì cho bạn hôm nay?',
      isBot: true,
      timestamp: new Date()
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const handleFaqClick = (question: string, answer: string) => {
    // Add user message
    const userMsg: Message = {
      id: `user-${messages.length}`,
      text: question,
      isBot: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMsg]);

    // Simulate bot typing
    setIsTyping(true);
    setTimeout(() => {
      setMessages(prev => {
        const botMsg: Message = {
          id: `bot-${prev.length}`,
          text: answer,
          isBot: true,
          timestamp: new Date()
        };
        return [...prev, botMsg];
      });
      setIsTyping(false);
    }, 1000);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 h-[500px] bg-white rounded-2xl shadow-2xl border border-gray-100 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-red-600 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="h-8 w-8 bg-white/20 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Hỗ trợ DreamBook</h3>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-red-100">Đang trực tuyến</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {messages.map((msg) => (
                <div 
                  key={msg.id} 
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm ${
                    msg.isBot 
                      ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm' 
                      : 'bg-red-600 text-white rounded-tr-none shadow-md'
                  }`}>
                    {msg.text}
                  </div>
                </div>
              ))}
              
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* FAQ Quick Replies */}
            <div className="p-3 border-t border-gray-100 bg-white">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 ml-1">Câu hỏi gợi ý</p>
              <div className="flex flex-wrap gap-2">
                {FAQ_DATA.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => handleFaqClick(faq.question, faq.answer)}
                    className="flex items-center gap-1.5 py-1.5 px-3 bg-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent rounded-full text-[11px] font-medium text-gray-600 transition-all"
                  >
                    {faq.icon}
                    {faq.question}
                  </button>
                ))}
              </div>
            </div>

            {/* Footer / Input placeholder */}
            <div className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
              <input 
                type="text" 
                placeholder="Gửi tin nhắn cho chúng tôi..."
                disabled
                className="flex-1 bg-gray-50 border-none rounded-lg px-3 py-2 text-xs text-gray-500 cursor-not-allowed"
              />
              <button disabled className="p-2 h-8 w-8 bg-gray-100 text-gray-300 rounded-lg cursor-not-allowed flex items-center justify-center">
                <Send className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-colors
          ${isOpen ? 'bg-gray-800' : 'bg-red-600'}`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7 shadow-red-500/50" />}
      </motion.button>
    </div>
  );
}
