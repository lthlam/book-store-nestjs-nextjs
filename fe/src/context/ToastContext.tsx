'use client';

import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react';

type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastContextValue {
  success: (msg: string) => void;
  error: (msg: string) => void;
  warning: (msg: string) => void;
  info: (msg: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const CONFIGS = {
  success: { icon: CheckCircle, bg: 'bg-green-50', border: 'border-green-200', iconColor: 'text-green-500', textColor: 'text-green-800' },
  error:   { icon: XCircle,      bg: 'bg-red-50',   border: 'border-red-200',   iconColor: 'text-red-500',   textColor: 'text-red-800' },
  warning: { icon: AlertTriangle, bg: 'bg-yellow-50', border: 'border-yellow-200', iconColor: 'text-yellow-500', textColor: 'text-yellow-800' },
  info:    { icon: Info,          bg: 'bg-blue-50',  border: 'border-blue-200',  iconColor: 'text-blue-500',  textColor: 'text-blue-800' },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const remove = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const add = useCallback((type: ToastType, message: string) => {
    const id = Math.random().toString(36).slice(2);
    setToasts(prev => [...prev, { id, type, message }]);
    setTimeout(() => remove(id), 3500);
  }, [remove]);

  const ctx: ToastContextValue = {
    success: (msg) => add('success', msg),
    error:   (msg) => add('error', msg),
    warning: (msg) => add('warning', msg),
    info:    (msg) => add('info', msg),
  };

  return (
    <ToastContext.Provider value={ctx}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => {
          const cfg = CONFIGS[toast.type];
          const Icon = cfg.icon;
          return (
            <div
              key={toast.id}
              className={`
                pointer-events-auto flex items-start gap-3 min-w-[280px] max-w-sm
                rounded-xl border px-4 py-3 shadow-lg
                animate-in slide-in-from-right-5 fade-in duration-300
                ${cfg.bg} ${cfg.border}
              `}
            >
              <Icon className={`h-5 w-5 flex-shrink-0 mt-0.5 ${cfg.iconColor}`} />
              <p className={`flex-1 text-sm font-medium ${cfg.textColor}`}>{toast.message}</p>
              <button
                onClick={() => remove(toast.id)}
                className={`flex-shrink-0 rounded-md p-0.5 hover:opacity-70 transition-opacity ${cfg.iconColor}`}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
