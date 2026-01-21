import React from 'react';
import Icon from '../Icon';
import { Task, TaskStatus, TaskReport, ReportTag } from '../../types';

const TAG_STYLES: Record<ReportTag, string> = {
  '进展': 'bg-emerald-100 text-emerald-700 border-emerald-200',
  '结果': 'bg-blue-100 text-blue-700 border-blue-200',
  '计划': 'bg-indigo-100 text-indigo-700 border-indigo-200',
  '问题': 'bg-rose-100 text-rose-700 border-rose-200',
  '复盘': 'bg-amber-100 text-amber-700 border-amber-200',
};

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; icon: string }> = {
  'todo': { label: '准备', color: 'text-slate-500', bg: 'bg-slate-100', icon: 'bg-slate-300' },
  'in_progress': { label: '进行', color: 'text-blue-500', bg: 'bg-blue-50', icon: 'bg-blue-500' },
  'completed': { label: '完成', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: 'bg-emerald-500' },
  'confirmed': { label: '确认', color: 'text-purple-600', bg: 'bg-purple-50', icon: 'bg-purple-500' },
};

interface TaskModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onSave: () => void;
  onTaskChange: (updates: Partial<Task>) => void;
  onAddReport: () => void;
  onUpdateReport: (rptId: string, field: keyof TaskReport, value: any) => void;
  onDeleteReport: (rptId: string) => void;
}

/**
 * 任务编辑 Modal 组件
 */
export const TaskModal: React.FC<TaskModalProps> = ({
  isOpen,
  task,
  onClose,
  onSave,
  onTaskChange,
  onAddReport,
  onUpdateReport,
  onDeleteReport,
}) => {
  if (!isOpen || !task) return null;

  const handleStatusChange = (newStatus: TaskStatus) => {
    const updates: Partial<Task> = { status: newStatus };
    if (newStatus === 'todo') updates.progress = 0;
    if (newStatus === 'completed' || newStatus === 'confirmed') updates.progress = 100;
    onTaskChange(updates);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2rem] shadow-2xl max-w-xl w-full flex flex-col overflow-hidden ring-1 ring-white/20">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-black text-slate-900 uppercase italic">
              编辑执行任务详情
            </h3>
            <p className="text-[10px] text-slate-400 font-bold uppercase">
              Task Detail Configuration
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-full text-slate-400 transition-all"
          >
            <Icon name="plus" size={18} className="rotate-45" />
          </button>
        </div>
        <div className="p-6 space-y-5 overflow-y-auto max-h-[70vh] custom-scrollbar">
          <div className="flex gap-4">
            <div className="flex-1 space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Current Status
              </label>
              <select
                value={task.status}
                onChange={e => handleStatusChange(e.target.value as TaskStatus)}
                className={`w-full p-3 rounded-xl text-xs font-bold uppercase outline-none cursor-pointer border-2 transition-all ${STATUS_CONFIG[task.status].color.replace('text-', 'border-').replace('600', '200').replace('500', '200')} ${STATUS_CONFIG[task.status].bg}`}
              >
                <option value="todo">准备 (Preparation)</option>
                <option value="in_progress">进行中 (In Progress)</option>
                <option value="completed">已完成 (Completed)</option>
                <option value="confirmed">已确认 (Confirmed)</option>
              </select>
            </div>
            <div className="flex-1 space-y-2">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1 flex justify-between">
                <span>Completion</span>
                <span>{task.progress}%</span>
              </label>
              <div className="flex items-center h-[46px] px-2">
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="5"
                  value={task.progress}
                  onChange={e => onTaskChange({ progress: parseInt(e.target.value) })}
                  className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Task Content
            </label>
            <input
              className="w-full p-3 bg-slate-50 border border-slate-100 rounded-xl text-sm font-bold text-slate-900 outline-none focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 transition-all"
              value={task.text}
              onChange={e => onTaskChange({ text: e.target.value })}
            />
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
                  value={task.reviewer || ''}
                  onChange={e => onTaskChange({ reviewer: e.target.value })}
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
                  value={task.score || ''}
                  onChange={e => onTaskChange({ score: parseInt(e.target.value) || undefined })}
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
                value={task.reviewComment || ''}
                onChange={e => onTaskChange({ reviewComment: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
              Notes & Description
            </label>
            <textarea
              className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs font-medium text-slate-600 outline-none focus:border-indigo-500 min-h-[60px] resize-y"
              placeholder="在此输入详细的任务备注、执行步骤或交付物说明..."
              value={task.notes}
              onChange={e => onTaskChange({ notes: e.target.value })}
            />
          </div>
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div className="flex justify-between items-end">
              <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest ml-1">
                执行汇报 / Progress Reports
              </label>
              <button
                type="button"
                onClick={onAddReport}
                className="text-[9px] font-bold text-indigo-500 hover:text-indigo-600 flex items-center gap-1 bg-indigo-50 px-2 py-1 rounded-lg transition-colors"
              >
                <Icon name="plus" size={10} /> Add Report
              </button>
            </div>
            <div className="space-y-3 max-h-[150px] overflow-y-auto custom-scrollbar pr-1">
              {(!task.reports || task.reports.length === 0) && (
                <div className="text-center py-4 text-xs text-slate-300 italic bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  暂无汇报记录
                </div>
              )}
              {(task.reports || []).map(rpt => (
                <div
                  key={rpt.id}
                  className="p-3 bg-slate-50 border border-slate-100 rounded-xl space-y-2 group hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <select
                        value={rpt.type}
                        onChange={e => onUpdateReport(rpt.id, 'type', e.target.value as ReportTag)}
                        className={`text-[10px] font-black px-2 py-1 rounded border uppercase outline-none cursor-pointer ${TAG_STYLES[rpt.type]}`}
                      >
                        <option value="计划">计划 Plan</option>
                        <option value="进展">进展 Prog</option>
                        <option value="问题">问题 Issue</option>
                        <option value="结果">结果 Rst</option>
                        <option value="复盘">复盘 Rev</option>
                      </select>
                      <span className="text-[9px] font-medium text-slate-400">
                        {rpt.timestamp}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => onDeleteReport(rpt.id)}
                      className="text-slate-300 hover:text-rose-500 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      <Icon name="trash" size={12} />
                    </button>
                  </div>
                  <textarea
                    className="w-full bg-transparent text-xs text-slate-700 font-medium outline-none resize-none placeholder-slate-300 focus:bg-white focus:ring-2 focus:ring-indigo-50 rounded p-1 transition-all"
                    placeholder="输入具体汇报内容..."
                    rows={2}
                    value={rpt.content}
                    onChange={e => onUpdateReport(rpt.id, 'content', e.target.value)}
                  />
                </div>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 border-t border-slate-100 pt-4">
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-300 uppercase ml-1">
                Priority
              </label>
              <select
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                value={task.priority}
                onChange={e => onTaskChange({ priority: e.target.value as any })}
              >
                <option value="P0">P0 - Urgent</option>
                <option value="P1">P1 - High</option>
                <option value="P2">P2 - Normal</option>
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-[9px] font-bold text-slate-300 uppercase ml-1">
                Owner
              </label>
              <input
                className="w-full p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-bold text-slate-700 outline-none focus:border-indigo-500"
                value={task.owner}
                onChange={e => onTaskChange({ owner: e.target.value })}
              />
            </div>
          </div>
          <div className="p-4 bg-indigo-50/50 rounded-xl border border-indigo-100 space-y-2">
            <label className="text-[9px] font-black text-indigo-300 uppercase tracking-widest ml-1 flex items-center gap-1">
              <Icon name="calendar" size={10} /> Schedule
            </label>
            <div className="flex gap-4">
              <div className="flex-1 space-y-1">
                <span className="text-[9px] text-indigo-300 font-bold block">Start</span>
                <input
                  type="date"
                  className="w-full p-2 bg-white border border-indigo-100 rounded-lg text-xs font-medium outline-none focus:border-indigo-500"
                  value={task.start}
                  onChange={e => onTaskChange({ start: e.target.value })}
                />
              </div>
              <div className="flex-1 space-y-1">
                <span className="text-[9px] text-indigo-300 font-bold block">End</span>
                <input
                  type="date"
                  className="w-full p-2 bg-white border border-indigo-100 rounded-lg text-xs font-medium outline-none focus:border-indigo-500"
                  value={task.end}
                  onChange={e => onTaskChange({ end: e.target.value })}
                />
              </div>
            </div>
          </div>
        </div>
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-slate-200 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:bg-slate-100 transition-all"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onSave}
            className="flex-[2] py-3 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-200 hover:bg-indigo-500 active:scale-95 transition-all"
          >
            Update Task
          </button>
        </div>
      </div>
    </div>
  );
};
