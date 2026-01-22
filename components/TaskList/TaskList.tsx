import React from 'react';
import Icon from '../Icon';
import { Task, TaskStatus } from '../../types';
import { TODAY_STR } from '../../constants';

interface TaskSuggestion {
  title: string;
  description: string;
}

interface TaskListProps {
  isCollapsed: boolean;
  height: number;
  tasks: Task[];
  isFilterActive: boolean;
  isAiLoading: boolean;
  canUseAI: boolean;
  onToggleCollapse: () => void;
  onHeightResize: (e: React.MouseEvent, currentHeight: number) => void;
  onTaskUpdate: (id: string, updates: Partial<Task>) => void;
  onTaskEdit: (e: React.MouseEvent, task: Task) => void;
  onTaskDelete: (e: React.MouseEvent, id: string) => void;
  onAddTask: () => void;
  onAiAssist: () => void;
  onSelectSuggestion: (suggestion: TaskSuggestion) => void;
  suggestions: TaskSuggestion[];
  onLoadSuggestions: () => void;
}

const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; icon: string }> = {
  'todo': { label: '准备', color: 'text-slate-500', bg: 'bg-slate-100', icon: 'bg-slate-300' },
  'in_progress': { label: '进行', color: 'text-blue-500', bg: 'bg-blue-50', icon: 'bg-blue-500' },
  'completed': { label: '完成', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: 'bg-emerald-500' },
  'confirmed': { label: '确认', color: 'text-purple-600', bg: 'bg-purple-50', icon: 'bg-purple-500' },
};

/**
 * 任务列表组件
 */
export const TaskList: React.FC<TaskListProps> = ({
  isCollapsed,
  height,
  tasks,
  isFilterActive,
  isAiLoading,
  canUseAI,
  onToggleCollapse,
  onHeightResize,
  onTaskUpdate,
  onTaskEdit,
  onTaskDelete,
  onAddTask,
  onAiAssist,
  onSelectSuggestion,
  suggestions,
  onLoadSuggestions,
}) => {
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);

  // 点击外部关闭建议列表
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    if (showSuggestions) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSuggestions]);

  const handleShowSuggestions = () => {
    if (suggestions.length === 0) {
      onLoadSuggestions();
    }
    setShowSuggestions(true);
  };

  const handleSelectSuggestion = (suggestion: TaskSuggestion) => {
    onSelectSuggestion(suggestion);
    setShowSuggestions(false);
  };
  return (
    <section
      className={`bg-white rounded-lg border border-[#E9E9E7] overflow-hidden flex flex-col transition-all duration-300 ${
        isCollapsed ? 'p-4' : 'p-0'
      }`}
    >
      <div
        className={`flex justify-between items-center cursor-pointer group ${
          isCollapsed ? '' : 'p-6 border-b border-[#E9E9E7] bg-white'
        }`}
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-100 text-orange-600 flex items-center justify-center">
            <Icon name="check" size={18} />
          </div>
          <div>
            <h3 className="text-xs font-black text-slate-900 uppercase">
              执行清单 (Execution List)
            </h3>
            <p className="text-[9px] text-slate-400 font-medium">
              共 {tasks.length} 项任务 · 实时同步
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 relative">
          {!isCollapsed && (
            <div className="relative">
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  handleShowSuggestions();
                }}
                disabled={isAiLoading}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase flex items-center gap-2 transition-all ${
                  isAiLoading
                    ? 'opacity-50 cursor-not-allowed bg-slate-100 text-slate-400'
                    : 'bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                }`}
              >
                {isAiLoading ? (
                  <span className="animate-spin">...</span>
                ) : (
                  <Icon name="sparkles" size={14} />
                )}{' '}
                快速建议
              </button>
              
              {/* 建议列表下拉菜单 */}
              {showSuggestions && (
                <div 
                  ref={suggestionsRef}
                  className="absolute top-full right-0 mt-2 w-80 bg-white rounded-xl shadow-lg border border-[#E9E9E7] z-50 max-h-96 overflow-y-auto custom-scrollbar"
                  onClick={e => e.stopPropagation()}
                >
                  <div className="p-3 border-b border-[#E9E9E7] bg-[#F7F6F3] sticky top-0">
                    <div className="flex justify-between items-center">
                      <h4 className="text-xs font-semibold text-[#37352F]">执行建议</h4>
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          setShowSuggestions(false);
                        }}
                        className="text-[#9B9A97] hover:text-[#37352F] transition-colors"
                      >
                        <Icon name="close" size={14} />
                      </button>
                    </div>
                    <p className="text-[10px] text-[#787774] mt-1">基于当前策略和周报生成</p>
                  </div>
                  <div className="p-2 space-y-1">
                    {suggestions.length === 0 ? (
                      <div className="p-4 text-center text-[#9B9A97] text-xs">
                        {isAiLoading ? '正在生成建议...' : '暂无建议，点击刷新'}
                      </div>
                    ) : (
                      suggestions.map((suggestion, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={e => {
                            e.stopPropagation();
                            handleSelectSuggestion(suggestion);
                          }}
                          className="w-full text-left p-3 rounded-lg hover:bg-indigo-50 border border-transparent hover:border-indigo-200 transition-all group"
                        >
                          <div className="flex items-start gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold text-[#37352F] group-hover:text-indigo-600 transition-colors">
                                {suggestion.title}
                              </div>
                              {suggestion.description && (
                                <div className="text-[10px] text-[#787774] mt-1 line-clamp-2">
                                  {suggestion.description}
                                </div>
                              )}
                            </div>
                            <Icon name="plus" size={14} className="text-[#9B9A97] group-hover:text-indigo-600 flex-shrink-0 mt-0.5" />
                          </div>
                        </button>
                      ))
                    )}
                    {suggestions.length > 0 && (
                      <button
                        type="button"
                        onClick={e => {
                          e.stopPropagation();
                          onLoadSuggestions();
                        }}
                        disabled={isAiLoading}
                        className="w-full p-2 text-[10px] text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isAiLoading ? '刷新中...' : '🔄 刷新建议'}
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
          <div
            className={`p-1 rounded-full text-slate-300 group-hover:bg-slate-100 transition-all ${
              isCollapsed ? '' : 'rotate-180'
            }`}
          >
            <Icon name="down" size={12} />
          </div>
        </div>
      </div>
      {!isCollapsed && (
        <>
          <div
            style={{ height }}
            className="overflow-auto custom-scrollbar flex flex-col"
          >
            <div className="grid grid-cols-[80px_1fr_100px_120px_120px_60px_100px] gap-4 px-6 py-3 bg-white border-b border-[#E9E9E7] text-[10px] font-medium text-[#787774] uppercase tracking-wider sticky top-0 z-10">
              <div className="text-center">Status</div>
              <div>Task Content</div>
              <div>Priority</div>
              <div>Start</div>
              <div>End</div>
              <div>Owner</div>
              <div className="text-center">Action</div>
            </div>
            <div className="divide-y divide-slate-100">
              {tasks.length === 0 && (
                <div className="py-12 text-center text-[#9B9A97] text-sm italic">
                  {isFilterActive
                    ? '没有符合筛选条件的任务'
                    : '暂无执行任务，请点击右上角 AI 生成或手动添加'}
                </div>
              )}
              {tasks.map(t => {
                const reportCount = t.reports?.length || 0;
                return (
                  <div
                    key={t.id}
                    className="grid grid-cols-[80px_1fr_100px_120px_120px_60px_100px] gap-4 px-6 py-4 items-center hover:bg-[#F7F6F3] transition-colors group border-b border-[#E9E9E7]"
                  >
                    <div className="flex justify-center">
                      <select
                        value={t.status}
                        onChange={e =>
                          onTaskUpdate(t.id, { status: e.target.value as TaskStatus })
                        }
                        className={`text-[10px] font-black uppercase rounded px-2 py-1 border-none outline-none cursor-pointer text-center w-full ${STATUS_CONFIG[t.status]?.color} ${STATUS_CONFIG[t.status]?.bg}`}
                      >
                        <option value="todo">准备</option>
                        <option value="in_progress">进行</option>
                        <option value="completed">完成</option>
                        <option value="confirmed">确认</option>
                      </select>
                    </div>
                    <div className="flex flex-col">
                      <input
                        value={t.text}
                        onChange={e => onTaskUpdate(t.id, { text: e.target.value })}
                        className={`bg-transparent border-none outline-none text-sm font-bold w-full ${
                          t.status === 'completed' || t.status === 'confirmed'
                            ? 'text-[#9B9A97] line-through'
                            : 'text-[#37352F]'
                        }`}
                        placeholder="输入任务内容..."
                      />
                      {(t.status === 'in_progress' ||
                        t.status === 'completed' ||
                        t.status === 'confirmed') && (
                        <div className="w-full h-1 bg-[#E9E9E7] rounded-full mt-1 overflow-hidden">
                          <div
                            className={`h-full ${STATUS_CONFIG[t.status]?.icon}`}
                            style={{ width: `${t.progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                    <select
                      value={t.priority}
                      onChange={e =>
                        onTaskUpdate(t.id, { priority: e.target.value as any })
                      }
                      className={`text-[10px] font-black uppercase bg-transparent outline-none cursor-pointer ${
                        t.priority === 'P0'
                          ? 'text-rose-500'
                          : t.priority === 'P1'
                          ? 'text-orange-500'
                          : 'text-blue-500'
                      }`}
                    >
                      <option value="P0">P0 - Urgent</option>
                      <option value="P1">P1 - High</option>
                      <option value="P2">P2 - Normal</option>
                    </select>
                    <input
                      type="date"
                      value={t.start}
                      onChange={e => onTaskUpdate(t.id, { start: e.target.value })}
                      className="text-[11px] font-normal text-[#37352F] bg-white border border-[#E9E9E7] rounded-md px-2.5 py-1.5 outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2] cursor-pointer hover:border-[#D9D9D7] transition-colors"
                    />
                    <input
                      type="date"
                      value={t.end}
                      onChange={e => onTaskUpdate(t.id, { end: e.target.value })}
                      className={`text-[11px] font-normal bg-white border border-[#E9E9E7] rounded-md px-2.5 py-1.5 outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2] cursor-pointer hover:border-[#D9D9D7] transition-colors ${
                        t.status !== 'completed' &&
                        t.status !== 'confirmed' &&
                        t.end < TODAY_STR
                          ? 'text-rose-500 border-rose-200 bg-rose-50'
                          : 'text-slate-500'
                      }`}
                    />
                    <input
                      value={t.owner}
                      onChange={e => onTaskUpdate(t.id, { owner: e.target.value })}
                      placeholder="--"
                      className="text-[10px] font-medium text-slate-500 bg-transparent outline-none w-full text-center"
                    />
                    <div className="flex justify-center items-center gap-1">
                      <button
                        type="button"
                        onClick={e => onTaskEdit(e, t)}
                        className={`relative p-2 rounded-lg transition-all ${
                          reportCount > 0
                            ? 'text-indigo-500 bg-indigo-50 hover:bg-indigo-100'
                            : 'text-slate-300 hover:text-indigo-500 hover:bg-slate-100'
                        }`}
                        title="汇报与详情"
                      >
                        <Icon name="fileText" size={14} />
                        {reportCount > 0 && (
                          <span className="absolute -top-1 -right-1 h-3.5 min-w-[14px] px-0.5 rounded-full bg-rose-500 text-[9px] text-white font-bold flex items-center justify-center shadow-sm">
                            {reportCount}
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={e => onTaskDelete(e, t.id)}
                        className="text-slate-300 hover:text-rose-500 p-2 rounded-lg hover:bg-rose-50 transition-all"
                        title="删除"
                      >
                        <Icon name="trash" size={14} />
                      </button>
                    </div>
                  </div>
                );
              })}
              <div
                onClick={onAddTask}
                className="px-6 py-4 border-t border-slate-100 cursor-pointer hover:bg-orange-50 group flex items-center justify-center gap-2 text-slate-300 hover:text-orange-600 transition-all"
              >
                <Icon name="plus" size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">
                  添加新任务 / Add Task
                </span>
              </div>
            </div>
          </div>
          <div
            className="h-3 bg-slate-50 border-t border-slate-100 flex items-center justify-center cursor-row-resize hover:bg-slate-100 transition-colors"
            onMouseDown={e => onHeightResize(e, height)}
          >
            <div className="w-8 h-1 bg-slate-300 rounded-full opacity-50" />
          </div>
        </>
      )}
    </section>
  );
};
