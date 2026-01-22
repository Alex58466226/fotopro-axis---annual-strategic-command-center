import React from 'react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import Icon from '../Icon';
import { Task, TaskStatus } from '../../types';
import { TODAY_STR } from '../../constants';
import { TaskItem } from './TaskItem';

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
  onTasksReorder?: (tasks: Task[]) => void; // 新增：拖拽排序回调
  onFullscreen?: () => void; // 新增：全屏回调
}

export const STATUS_CONFIG: Record<TaskStatus, { label: string; color: string; bg: string; icon: string }> = {
  'todo': { label: '准备', color: 'text-slate-500', bg: 'bg-slate-100', icon: 'bg-slate-300' },
  'in_progress': { label: '进行', color: 'text-blue-500', bg: 'bg-blue-50', icon: 'bg-blue-500' },
  'completed': { label: '完成', color: 'text-emerald-500', bg: 'bg-emerald-50', icon: 'bg-emerald-500' },
  'confirmed': { label: '确认', color: 'text-purple-600', bg: 'bg-purple-50', icon: 'bg-purple-500' },
};

// 排序任务：优先按 order，然后按 start 日期
const sortTasks = (tasks: Task[]): Task[] => {
  return [...tasks].sort((a, b) => {
    // 如果都有 order，按 order 排序
    if (a.order !== undefined && b.order !== undefined) {
      return a.order - b.order;
    }
    // 如果只有一个有 order，有 order 的排在前面
    if (a.order !== undefined) return -1;
    if (b.order !== undefined) return 1;
    // 都没有 order，按 start 日期排序
    return a.start.localeCompare(b.start);
  });
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
  onTasksReorder,
  onFullscreen,
}) => {
  const [showSuggestions, setShowSuggestions] = React.useState(false);
  const suggestionsRef = React.useRef<HTMLDivElement>(null);

  // 拖拽传感器配置
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // 移动 8px 后才开始拖拽，避免误触
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // 排序后的任务列表
  const sortedTasks = React.useMemo(() => sortTasks(tasks), [tasks]);

  // 处理拖拽结束
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sortedTasks.findIndex((t) => t.id === active.id);
      const newIndex = sortedTasks.findIndex((t) => t.id === over.id);

      const newTasks = arrayMove(sortedTasks, oldIndex, newIndex);

      // 重新计算 order 值
      const reorderedTasks = newTasks.map((task, index) => ({
        ...task,
        order: index,
      }));

      // 调用回调函数更新任务顺序
      if (onTasksReorder) {
        onTasksReorder(reorderedTasks);
      }
    }
  };

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
          {!isCollapsed && onFullscreen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFullscreen();
              }}
              className="p-1.5 bg-[#F7F6F3] rounded-md hover:bg-[#E9E9E7] transition-colors"
              title="全屏显示"
            >
              <Icon name="maximize" size={14} className="text-[#787774]" />
            </button>
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
            <div className="grid grid-cols-[40px_80px_1fr_100px_120px_120px_60px_100px] gap-4 px-6 py-3 bg-white border-b border-[#E9E9E7] text-[10px] font-medium text-[#787774] uppercase tracking-wider sticky top-0 z-10">
              <div className="text-center">Drag</div>
              <div className="text-center">Status</div>
              <div>Task Content</div>
              <div>Priority</div>
              <div>Start</div>
              <div>End</div>
              <div>Owner</div>
              <div className="text-center">Action</div>
            </div>
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext
                items={sortedTasks.map((t) => t.id)}
                strategy={verticalListSortingStrategy}
              >
                <div className="divide-y divide-slate-100">
                  {sortedTasks.length === 0 && (
                    <div className="py-12 text-center text-[#9B9A97] text-sm italic">
                      {isFilterActive
                        ? '没有符合筛选条件的任务'
                        : '暂无执行任务，请点击右上角 AI 生成或手动添加'}
                    </div>
                  )}
                  {sortedTasks.map((task) => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      isFilterActive={isFilterActive}
                      onTaskUpdate={onTaskUpdate}
                      onTaskEdit={onTaskEdit}
                      onTaskDelete={onTaskDelete}
                    />
                  ))}
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
              </SortableContext>
            </DndContext>
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
