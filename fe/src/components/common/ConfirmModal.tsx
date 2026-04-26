'use client';

import { AlertTriangle, Trash2 } from 'lucide-react';

type Variant = 'danger' | 'warning' | 'info';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: Variant;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  if (!open) return null;

  const isDanger = variant === 'danger';
  const isWarning = variant === 'warning';
  const isInfo = variant === 'info';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="p-6">
          {/* Icon */}
          <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full mb-4 
            ${isDanger ? 'bg-red-100' : isWarning ? 'bg-yellow-100' : 'bg-blue-100'}`}>
            {isDanger && <Trash2 className="h-7 w-7 text-red-600" />}
            {isWarning && <AlertTriangle className="h-7 w-7 text-yellow-600" />}
            {isInfo && <div className="h-7 w-7 text-blue-600 font-black text-xl flex items-center justify-center">i</div>}
          </div>

          {/* Text */}
          <h3 className="text-center text-lg font-bold text-gray-900 mb-2">{title}</h3>
          <p className="text-center text-sm text-gray-500">{message}</p>
        </div>

        {/* Actions */}
        <div className="flex border-t border-gray-100">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 py-3.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors border-r border-gray-100 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 py-3.5 text-sm font-semibold transition-colors disabled:opacity-50
              ${isDanger ? 'text-red-600 hover:bg-red-50' : 
                isWarning ? 'text-yellow-600 hover:bg-yellow-50' : 
                'text-blue-600 hover:bg-blue-50'}`}
          >
            {loading ? 'Processing...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
