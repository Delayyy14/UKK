'use client';

import { useToast } from '@/hooks/use-toast';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import { useEffect, useState } from 'react';

export function Toaster() {
  const { toasts } = useToast();

  return (
    <div className="fixed top-0 right-0 p-4 w-full md:max-w-md z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} />
      ))}
    </div>
  );
}

function ToastItem({ toast }: { toast: any }) {
  const { dismiss } = useToast();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      dismiss(toast.id);
    }, 300);
  };

  const variantStyles = {
    default: 'bg-white border-gray-200 text-gray-900',
    success: 'bg-emerald-50 border-emerald-100 text-emerald-900',
    destructive: 'bg-rose-50 border-rose-100 text-rose-900',
  };

  const icons = {
    default: <Info className="h-5 w-5 text-blue-500" />,
    success: <CheckCircle className="h-5 w-5 text-emerald-500" />,
    destructive: <AlertCircle className="h-5 w-5 text-rose-500" />,
  };

  return (
    <div
      className={`
        pointer-events-auto
        flex items-start gap-3 p-4 rounded-xl border shadow-lg 
        transition-all duration-300 transform
        ${isVisible ? 'translate-x-0 opacity-100' : 'translate-x-4 opacity-0'}
        ${variantStyles[toast.variant as keyof typeof variantStyles] || variantStyles.default}
      `}
    >
      <div className="shrink-0 mt-0.5">
        {icons[toast.variant as keyof typeof icons] || icons.default}
      </div>
      <div className="flex-1 min-w-0 pr-4">
        {toast.title && <h5 className="font-bold text-sm leading-tight mb-1">{toast.title}</h5>}
        {toast.description && <p className="text-xs opacity-80 leading-relaxed font-medium">{toast.description}</p>}
      </div>
      <button 
        onClick={handleDismiss}
        className="shrink-0 rounded-lg p-1 hover:bg-black/5 transition-colors"
      >
        <X size={16} className="opacity-40" />
      </button>
    </div>
  );
}
