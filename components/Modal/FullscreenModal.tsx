import React from 'react';
import Icon from '../Icon';

interface FullscreenModalProps {
  isOpen: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

/**
 * 全屏模态框组件
 */
export const FullscreenModal: React.FC<FullscreenModalProps> = ({
  isOpen,
  title,
  onClose,
  children,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[10000] flex items-center justify-center animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full h-full max-w-[95vw] max-h-[95vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E9E9E7] flex items-center justify-between bg-[#F7F6F3] flex-shrink-0">
          <h2 className="text-xl font-semibold text-[#37352F]">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-[#E9E9E7] rounded-lg transition-colors"
            title="关闭"
          >
            <Icon name="close" size={20} className="text-[#9B9A97]" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6">{children}</div>
      </div>
    </div>
  );
};
