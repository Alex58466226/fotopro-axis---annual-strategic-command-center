import React from 'react';
import Icon from '../Icon';
import { DatePicker } from '../DatePicker/DatePicker';
import { StrategyNode, Metric, Level, ReportTag } from '../../types';
import { PROJECT_START, PROJECT_END } from '../../constants';

const TAG_STYLES: Record<ReportTag, string> = {
  '进展': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '结果': 'bg-blue-100 text-blue-700 border-blue-200',
  '计划': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  '问题': 'bg-rose-100 text-rose-700 border-rose-200',
  '复盘': 'bg-amber-100 text-amber-700 border-amber-200',
};

interface StrategyModalProps {
  isOpen: boolean;
  mode: 'create' | 'edit';
  data: Partial<StrategyNode> & { tagsString?: string };
  potentialParents: StrategyNode[];
  allUsedTags: string[];
  onClose: () => void;
  onSave: () => void;
  onDataChange: (data: Partial<StrategyNode> & { tagsString?: string }) => void;
  onAddMetric: () => void;
  onUpdateMetric: (index: number, field: keyof Metric, value: string) => void;
  onRemoveMetric: (index: number) => void;
}

/**
 * 策略编辑/创建 Modal 组件
 */
export const StrategyModal: React.FC<StrategyModalProps> = ({
  isOpen,
  mode,
  data,
  potentialParents,
  allUsedTags,
  onClose,
  onSave,
  onDataChange,
  onAddMetric,
  onUpdateMetric,
  onRemoveMetric,
}) => {
  if (!isOpen) return null;

  const handleTagToggle = (tag: string) => {
    const currentTags = data.tagsString
      ? data.tagsString.split(/[，,;；]/).map(t => t.trim()).filter(Boolean)
      : [];
    const isSelected = currentTags.includes(tag);
    
    if (isSelected) {
      const newTags = currentTags.filter(t => t !== tag);
      onDataChange({ ...data, tagsString: newTags.join(', ') });
    } else {
      const newTags = [...currentTags, tag];
      onDataChange({ ...data, tagsString: newTags.join(', ') });
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-white/20">
        <div className="p-8 pb-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight uppercase italic">
              {mode === 'create' ? '创建新策略节点' : '编辑策略节点'}
            </h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase">
              Strategy Configuration Node
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100 transition-all"
          >
            <Icon name="plus" size={20} className="rotate-45" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Strategy Level
              </label>
              <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-black text-slate-700">
                L{data.level}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Parent Node
              </label>
              {data.level === 1 ? (
                <div className="p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-400 italic">
                  Root Level (无父级)
                </div>
              ) : (
                <select
                  className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-sm font-bold text-slate-700 outline-none focus:bg-white focus:border-orange-200 transition-all cursor-pointer"
                  value={data.parentId || ''}
                  onChange={e => onDataChange({ ...data, parentId: e.target.value })}
                  disabled={mode === 'edit'}
                >
                  <option value="" disabled>
                    选择父级节点...
                  </option>
                  {potentialParents.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Strategy Name (Objective)
            </label>
            <input
              className="w-full p-4 bg-slate-50 border border-slate-100 rounded-2xl text-base font-bold text-slate-900 outline-none focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-50 transition-all shadow-inner"
              placeholder="输入策略名称，例如：北美市场第一季度攻坚"
              value={data.name || ''}
              onChange={e => onDataChange({ ...data, name: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-300 uppercase ml-1">
                Owner
              </label>
              <input
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
                placeholder="负责人"
                value={data.owner || ''}
                onChange={e => onDataChange({ ...data, owner: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-300 uppercase ml-1">
                Group (A/B)
              </label>
              <input
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
                placeholder="分组标识"
                value={data.group || ''}
                onChange={e => onDataChange({ ...data, group: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-300 uppercase ml-1">
                Channel
              </label>
              <input
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
                placeholder="渠道"
                value={data.channel || ''}
                onChange={e => onDataChange({ ...data, channel: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[8px] font-black text-slate-300 uppercase ml-1">
                Product
              </label>
              <input
                className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-bold outline-none focus:border-orange-500"
                placeholder="产品线"
                value={data.product || ''}
                onChange={e => onDataChange({ ...data, product: e.target.value })}
              />
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                KPI / Key Results
              </label>
              <button
                type="button"
                onClick={onAddMetric}
                className="text-[9px] font-bold text-orange-500 hover:text-orange-600 flex items-center gap-1"
              >
                <Icon name="plus" size={10} /> Add KPI
              </button>
            </div>
            <div className="space-y-2">
              {(data.metrics || []).map((m, idx) => (
                <div key={m.id || idx} className="flex gap-2 items-center group">
                  <input
                    className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-orange-500"
                    placeholder="指标名称 (e.g. Revenue)"
                    value={m.label}
                    onChange={e => onUpdateMetric(idx, 'label', e.target.value)}
                  />
                  <input
                    className="w-24 p-2 bg-white border border-slate-200 rounded-lg text-xs font-black text-slate-800 outline-none focus:border-orange-500 text-center"
                    placeholder="数值"
                    value={m.value}
                    onChange={e => onUpdateMetric(idx, 'value', e.target.value)}
                  />
                  <input
                    className="flex-1 p-2 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-500 outline-none focus:border-orange-500"
                    placeholder="补充描述..."
                    value={m.description || ''}
                    onChange={e => onUpdateMetric(idx, 'description', e.target.value)}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveMetric(idx)}
                    className="p-2 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg transition-all"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              ))}
              {(data.metrics || []).length === 0 && (
                <div className="p-4 border border-dashed border-slate-200 rounded-xl text-center text-xs text-slate-400 italic">
                  暂无 KPI 指标，点击上方按钮添加
                </div>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Tags (Comma Separated)
            </label>
            <input
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs font-medium text-slate-600 outline-none focus:bg-white focus:border-orange-300 transition-all"
              placeholder="标签1, 标签2, 标签3..."
              value={data.tagsString || ''}
              onChange={e => onDataChange({ ...data, tagsString: e.target.value })}
            />
            {allUsedTags.length > 0 && (
              <div className="mt-2 space-y-1.5">
                <div className="text-[8px] font-bold text-slate-400 uppercase ml-1">
                  快捷选择 (Quick Select)
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {allUsedTags.map(tag => {
                    const currentTags = data.tagsString
                      ? data.tagsString.split(/[，,;；]/).map(t => t.trim()).filter(Boolean)
                      : [];
                    const isSelected = currentTags.includes(tag);
                    return (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => handleTagToggle(tag)}
                        className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                          isSelected
                            ? 'bg-orange-500 text-white shadow-sm hover:bg-orange-600'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200 hover:text-slate-800'
                        }`}
                      >
                        #{tag}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
          <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 space-y-3">
            <label className="text-[9px] font-black text-orange-400 uppercase tracking-widest ml-1 flex items-center gap-2">
              <Icon name="calendar" size={12} /> Execution Cycle
            </label>
            <div className="flex items-center gap-4">
              <DatePicker
                value={data.start || ''}
                onChange={(date) => onDataChange({ ...data, start: date })}
                placeholder="选择开始日期"
                minDate={PROJECT_START}
                maxDate={data.end || PROJECT_END}
                className="flex-1"
              />
              <span className="text-orange-300 font-black">~</span>
              <DatePicker
                value={data.end || ''}
                onChange={(date) => onDataChange({ ...data, end: date })}
                placeholder="选择结束日期"
                minDate={data.start || PROJECT_START}
                maxDate={PROJECT_END}
                className="flex-1"
              />
            </div>
          </div>

          {/* Review & Scoring Section */}
          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 space-y-3">
            <div className="flex justify-between items-center">
              <label className="text-[9px] font-black text-purple-400 uppercase tracking-widest ml-1 flex items-center gap-1">
                <Icon name="check" size={10} /> Review & Scoring
              </label>
              <div className="text-[9px] text-purple-300 font-bold uppercase">
                Auditor Only
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2 space-y-1">
                <label className="text-[8px] font-bold text-purple-300 uppercase ml-1">
                  Reviewer
                </label>
                <input
                  className="w-full p-2.5 bg-white border border-purple-200/50 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-purple-500 placeholder-purple-200"
                  placeholder="审核人姓名"
                  value={data.reviewer || ''}
                  onChange={e => onDataChange({ ...data, reviewer: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <label className="text-[8px] font-bold text-purple-300 uppercase ml-1">
                  Score (0-100)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="w-full p-2.5 bg-white border border-purple-200/50 rounded-lg text-xs font-black text-purple-600 outline-none focus:border-purple-500 text-center placeholder-purple-200"
                  placeholder="-"
                  value={data.score !== undefined ? data.score : ''}
                  onChange={e => onDataChange({ ...data, score: e.target.value ? parseInt(e.target.value) : undefined })}
                />
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-[8px] font-bold text-purple-300 uppercase ml-1">
                Comments
              </label>
              <textarea
                className="w-full p-2.5 bg-white border border-purple-200/50 rounded-lg text-xs font-medium text-slate-600 outline-none focus:border-purple-500 resize-none h-16 placeholder-purple-200"
                placeholder="审核评语..."
                value={data.reviewComment || ''}
                onChange={e => onDataChange({ ...data, reviewComment: e.target.value })}
              />
            </div>
          </div>
        </div>
        <div className="p-8 border-t border-slate-100 bg-slate-50 flex gap-4">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-4 bg-white border border-slate-200 rounded-2xl text-[11px] font-black uppercase text-slate-400 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-[2] py-4 bg-slate-900 text-white rounded-2xl text-[11px] font-black uppercase shadow-xl shadow-slate-200 hover:bg-slate-800 hover:scale-[1.02] active:scale-95 transition-all"
          >
            Save Strategy
          </button>
        </div>
      </div>
    </div>
  );
};
