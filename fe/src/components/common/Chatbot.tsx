'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, X, Send, BookOpen, Truck, CreditCard, RotateCcw, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { API_URL } from '@/utils/constants';

import ReactMarkdown from 'react-markdown';

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
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    id: 'shipping-fee',
    question: 'Phí giao hàng bao nhiêu?',
    icon: <Truck className="h-4 w-4" />
  },
  {
    id: 'payment-methods',
    question: 'Thanh toán như thế nào?',
    icon: <CreditCard className="h-4 w-4" />
  },
  {
    id: 'return-policy',
    question: 'Làm sao để đổi trả?',
    icon: <RotateCcw className="h-4 w-4" />
  }
];

export default function Chatbot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        text: 'Xin chào! Tôi là trợ lý AI của DreamBook. Bạn có thể hỏi tôi về sách, chính sách giao hàng, thanh toán hay bất cứ điều gì! 📚',
        isBot: true,
        timestamp: new Date()
      }
    ]);
  }, []);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  const sendToAI = async (question: string) => {
    // Add user message
    const userMsg: Message = {
      // eslint-disable-next-line react-hooks/purity
      id: `user-${Date.now()}`,
      text: question,
      isBot: false,
      timestamp: new Date()
    };
    
    // Prepare history to send
    const history = messages.map(m => ({
      role: m.isBot ? 'model' : 'user',
      text: m.text
    }));

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    try {
      const res = await axios.post(`${API_URL}/ai/chat`, { 
        message: question,
        history
      });
      const answer = res.data?.answer || 'Xin lỗi, tôi không thể trả lời lúc này.';

      setMessages(prev => [
        ...prev,
        {
          id: `bot-${Date.now()}`,
          text: answer,
          isBot: true,
          timestamp: new Date()
        }
      ]);
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: `bot-err-${Date.now()}`,
          text: 'Xin lỗi, có lỗi xảy ra. Vui lòng thử lại sau.',
          isBot: true,
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || isTyping) return;
    sendToAI(trimmed);
  };

  const handleFaqClick = (question: string) => {
    if (isTyping) return;
    sendToAI(question);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <style>{`
        .markdown-content p { margin-bottom: 0.5rem; }
        .markdown-content p:last-child { margin-bottom: 0; }
        .markdown-content ul { padding-left: 1.2rem; margin-bottom: 0.5rem; list-style-type: disc; }
        .markdown-content ol { padding-left: 1.2rem; margin-bottom: 0.5rem; list-style-type: decimal; }
        .markdown-content li { margin-bottom: 0.25rem; }
        .markdown-content strong { font-weight: 700; }
      `}</style>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="absolute bottom-20 right-0 w-80 sm:w-96 h-[520px] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-gradient-to-r from-red-600 to-red-500 p-4 flex items-center justify-between text-white">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">DreamBook AI</h3>
                  <div className="flex items-center gap-1">
                    <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] text-red-100">Trợ lý AI • Luôn sẵn sàng</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
              {messages.map((msg) => (
                <motion.div 
                  key={msg.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.isBot ? 'justify-start' : 'justify-end'}`}
                >
                  <div className={`max-w-[80%] p-3 rounded-2xl text-sm leading-relaxed ${
                    msg.isBot 
                      ? 'bg-white border border-gray-100 text-gray-800 rounded-tl-none shadow-sm' 
                      : 'bg-red-600 text-white rounded-tr-none shadow-md'
                  }`}>
                    <div className={msg.isBot ? 'markdown-content' : ''}>
                      <ReactMarkdown>{msg.text}</ReactMarkdown>
                    </div>
                  </div>
                </motion.div>
              ))}
              
              {isTyping && (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >
                  <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                    <div className="flex gap-1.5 items-center">
                      <span className="w-2 h-2 bg-red-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                      <span className="w-2 h-2 bg-red-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                      <span className="w-2 h-2 bg-red-200 rounded-full animate-bounce" />
                      <span className="text-[10px] text-gray-400 ml-1">AI đang suy nghĩ...</span>
                    </div>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* FAQ Quick Replies */}
            <div className="px-3 pt-2 pb-1 border-t border-gray-100 bg-white">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 ml-1">Gợi ý</p>
              <div className="flex flex-wrap gap-1.5">
                {FAQ_DATA.map((faq) => (
                  <button
                    key={faq.id}
                    onClick={() => handleFaqClick(faq.question)}
                    disabled={isTyping}
                    className="flex items-center gap-1 py-1 px-2.5 bg-gray-100 hover:bg-red-50 hover:text-red-600 hover:border-red-200 border border-transparent rounded-full text-[11px] font-medium text-gray-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {faq.icon}
                    {faq.question}
                  </button>
                ))}
              </div>
            </div>

            {/* Input */}
            <form onSubmit={handleSubmit} className="p-3 border-t border-gray-100 bg-white flex items-center gap-2">
              <input 
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Hỏi tôi bất cứ điều gì..."
                disabled={isTyping}
                className="flex-1 bg-gray-50 border border-gray-200 focus:border-red-300 focus:ring-1 focus:ring-red-200 rounded-xl px-3 py-2.5 text-sm text-gray-800 placeholder:text-gray-400 outline-none transition-all disabled:opacity-60"
              />
              <button 
                type="submit"
                disabled={!input.trim() || isTyping}
                className="p-2.5 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-colors disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Toggle Button */}
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-14 rounded-full shadow-2xl flex items-center justify-center text-white transition-colors
          ${isOpen ? 'bg-gray-800' : 'bg-red-600 shadow-red-500/30'}`}
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-7 w-7" />}
      </motion.button>
    </div>
  );
}

// Add these styles to your globals.css or keep here if using styled-components/etc.
// For now, I'll assume you can add them to a style tag or your main css file.
const markdownStyles = `
  .markdown-content p { margin-bottom: 0.5rem; }
  .markdown-content p:last-child { margin-bottom: 0; }
  .markdown-content ul, .markdown-content ol { padding-left: 1.25rem; margin-bottom: 0.5rem; }
  .markdown-content li { margin-bottom: 0.25rem; }
  .markdown-content strong { font-weight: 700; }
`;
