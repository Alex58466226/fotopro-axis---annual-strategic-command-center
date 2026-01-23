import React from 'react';
import Icon from '../Icon';
import { ReportItem, ReportTag } from '../../types';

const TAG_STYLES: Record<ReportTag, string> = {
  '进展': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '结果': 'bg-blue-100 text-blue-700 border-blue-200',
  '计划': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  '问题': 'bg-rose-100 text-rose-700 border-rose-200',
  '复盘': 'bg-amber-100 text-amber-700 border-amber-200',
};

interface ReportModalProps {
  isOpen: boolean;
  isGenerating: boolean;
  items: ReportItem[];
  activeTasksCount: number;
  completionRate: number;
  completedCount: number;
  onClose: () => void;
  onAddItem: () => void;
  onUpdateItem: (id: string, field: keyof ReportItem, value: string) => void;
  onDeleteItem: (id: string) => void;
  onCopyToClipboard: () => void;
  onRegenerate?: (customPrompt?: string) => void; // 新增：重新生成周报，支持自定义提示词
}

/**
 * 汇报生成器 Modal 组件
 */
export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  isGenerating,
  items,
  activeTasksCount,
  completionRate,
  completedCount,
  onClose,
  onAddItem,
  onUpdateItem,
  onDeleteItem,
  onCopyToClipboard,
  onRegenerate,
}) => {
  const [showChatInput, setShowChatInput] = React.useState(false);
  const [chatPrompt, setChatPrompt] = React.useState('');
  const chatInputRef = React.useRef<HTMLTextAreaElement>(null);

  React.useEffect(() => {
    if (showChatInput) {
      setTimeout(() => chatInputRef.current?.focus(), 100);
    }
  }, [showChatInput]);

  const handleRegenerate = () => {
    if (onRegenerate) {
      onRegenerate(chatPrompt.trim() || undefined);
      setChatPrompt('');
      setShowChatInput(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-4xl w-full flex flex-col overflow-hidden ring-1 ring-white/20 max-h-[85vh]">
        <div className="p-6 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-indigo-600 text-white rounded-xl flex items-center justify-center shadow-indigo-200 shadow-lg">
              <Icon name="fileText" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">
                智能汇报生成器
              </h3>
              <p className="text-[10px] font-bold text-indigo-400 uppercase">
                AI-Powered Weekly Report Generator
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"
          >
            <Icon name="plus" size={24} className="rotate-45" />
          </button>
        </div>
        <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
          {isGenerating && (
            <div className="absolute inset-0 bg-white/90 backdrop-blur flex flex-col items-center justify-center z-50">
              <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4" />
              <div className="text-xs font-black text-indigo-600 uppercase tracking-widest animate-pulse">
                AI 正在分析数据并整理汇报条目...
              </div>
            </div>
          )}
          <div className="w-full md:w-56 bg-slate-50 border-r border-slate-100 p-6 space-y-6 hidden md:block overflow-y-auto custom-scrollbar">
            <div className="space-y-2">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                本周概览
              </div>
              <div className="text-3xl font-black text-slate-800">
                {activeTasksCount}{' '}
                <span className="text-xs font-bold text-slate-400">Tasks</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                完成率
              </div>
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{ width: `${completionRate}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] font-bold text-slate-500">
                <span>{completedCount} Done</span>
                <span>{completionRate}%</span>
              </div>
            </div>
            <div className="p-4 bg-indigo-100 rounded-xl border border-indigo-200">
              <div className="flex items-center gap-2 text-indigo-700 font-bold text-xs mb-1">
                <Icon name="sparkles" size={12} /> Pro Tips
              </div>
              <p className="text-[10px] text-indigo-600 leading-relaxed">
                您可以自由添加、删除或修改右侧的汇报条目。点击下方按钮复制格式化后的文本。
              </p>
            </div>
            {onRegenerate && (
              <div className="space-y-2">
                {!showChatInput ? (
                  <button
                    onClick={() => setShowChatInput(true)}
                    className="w-full py-2.5 px-4 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-lg text-xs font-bold hover:from-indigo-600 hover:to-purple-600 transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <Icon name="sparkles" size={12} /> AI 微调生成
                  </button>
                ) : (
                  <div className="space-y-2">
                    <textarea
                      ref={chatInputRef}
                      value={chatPrompt}
                      onChange={(e) => setChatPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleRegenerate();
                        }
                        if (e.key === 'Escape') {
                          setShowChatInput(false);
                          setChatPrompt('');
                        }
                      }}
                      placeholder="输入你的需求，例如：&#10;• 重点突出本周完成的关键成果&#10;• 详细说明遇到的问题和解决方案&#10;• 增加下阶段的详细计划"
                      className="w-full p-3 text-xs text-slate-700 bg-white border border-indigo-200 rounded-lg outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 resize-none"
                      rows={4}
                    />
                    <div className="flex gap-2">
                      <button
                        onClick={handleRegenerate}
                        disabled={isGenerating}
                        className="flex-1 py-2 px-3 bg-indigo-500 text-white rounded-lg text-xs font-bold hover:bg-indigo-600 disabled:opacity-50 transition-all flex items-center justify-center gap-1"
                      >
                        <Icon name="sparkles" size={12} /> 生成
                      </button>
                      <button
                        onClick={() => {
                          setShowChatInput(false);
                          setChatPrompt('');
                        }}
                        className="px-3 py-2 bg-slate-200 text-slate-600 rounded-lg text-xs font-bold hover:bg-slate-300 transition-all"
                      >
                        取消
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
          <div className="flex-1 flex flex-col bg-white overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
              {items.length === 0 && !isGenerating && (
                <div className="text-center py-12 text-slate-400 italic text-xs">
                  暂无汇报内容，请点击下方按钮添加。
                </div>
              )}
              {items.map(item => (
                <div
                  key={item.id}
                  className="group flex gap-4 items-start p-4 rounded-xl border border-slate-100 hover:border-slate-300 hover:shadow-sm bg-white transition-all"
                >
                  <div className="flex-shrink-0 pt-1">
                    <select
                      value={item.type}
                      onChange={e => onUpdateItem(item.id, 'type', e.target.value)}
                      className={`appearance-none cursor-pointer text-[10px] font-black px-3 py-1.5 rounded-lg border uppercase tracking-wide outline-none ${TAG_STYLES[item.type]}`}
                    >
                      <option value="计划">计划 Plan</option>
                      <option value="进展">进展 Prog</option>
                      <option value="问题">问题 Issue</option>
                      <option value="结果">结果 Rst</option>
                      <option value="复盘">复盘 Rev</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <textarea
                      value={item.content}
                      onChange={e => onUpdateItem(item.id, 'content', e.target.value)}
                      className="w-full text-sm font-medium text-slate-700 outline-none resize-none bg-transparent placeholder-slate-300 min-h-[40px] leading-relaxed"
                      placeholder="输入汇报内容..."
                      rows={2}
                    />
                  </div>
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              ))}
            </div>
            <div className="p-4 border-t border-slate-100 bg-slate-50/50">
              <button
                onClick={onAddItem}
                className="w-full py-3 border-2 border-dashed border-slate-200 rounded-xl text-slate-400 text-xs font-black uppercase hover:border-indigo-300 hover:text-indigo-500 transition-all flex items-center justify-center gap-2"
              >
                <Icon name="plus" size={12} /> 添加新的汇报条目
              </button>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-end gap-4">
          <button
            onClick={onClose}
            className="px-6 py-3 rounded-xl border border-slate-200 text-slate-500 text-xs font-black uppercase hover:bg-white transition-all"
          >
            关闭
          </button>
          <button
            onClick={onCopyToClipboard}
            className="px-6 py-3 rounded-xl bg-indigo-600 text-white text-xs font-black uppercase shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center gap-2"
          >
            <Icon name="fileText" size={14} /> 复制文本到剪贴板
          </button>
        </div>
      </div>
    </div>
  );
};
