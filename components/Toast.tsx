import React, { useEffect } from 'react';
import Icon from './Icon';

export type ToastType = 'success' | 'error' | 'info' | 'loading';

interface ToastProps {
  type: ToastType;
  message: string;
  duration?: number;
  onClose: () => void;
}

/**
 * Toast 通知组件
 */
export const Toast: React.FC<ToastProps> = ({
  type,
  message,
  duration = 3000,
  onClose,
}) => {
  useEffect(() => {
    if (type !== 'loading' && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [type, duration, onClose]);

  const config = {
    success: {
      bg: 'bg-emerald-500',
      icon: 'check',
      iconColor: 'text-white',
    },
    error: {
      bg: 'bg-rose-500',
      icon: 'alert',
      iconColor: 'text-white',
    },
    info: {
      bg: 'bg-blue-500',
      icon: 'fileText',
      iconColor: 'text-white',
    },
    loading: {
      bg: 'bg-blue-500',
      icon: null,
      iconColor: 'text-white',
    },
  };

  const style = config[type];

  return (
    <div
      className={`${style.bg} text-white px-4 py-3 rounded-lg shadow-lg z-[100] flex items-center gap-3 min-w-[280px] max-w-md animate-slide-in-right`}
    >
      {type === 'loading' ? (
        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <Icon name={style.icon as any} size={20} className={style.iconColor} />
      )}
      <span className="flex-1 text-sm font-medium">{message}</span>
      {type !== 'loading' && (
        <button
          onClick={onClose}
          className="p-1 hover:bg-white/20 rounded transition-colors"
        >
          <Icon name="close" size={14} className="text-white" />
        </button>
      )}
    </div>
  );
};

/**
 * Toast 容器组件（用于管理多个 Toast）
 */
interface ToastContainerProps {
  toasts: Array<{ id: string; type: ToastType; message: string }>;
  onClose: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({
  toasts,
  onClose,
}) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast
            type={toast.type}
            message={toast.message}
            duration={toast.type === 'error' ? 5000 : 3000}
            onClose={() => onClose(toast.id)}
          />
        </div>
      ))}
    </div>
  );
};
