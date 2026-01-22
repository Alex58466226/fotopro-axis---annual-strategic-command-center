import React from 'react';
import Icon from '../Icon';
import { Task, StrategyNode } from '../../types';
import { PROJECT_START, PROJECT_END, TODAY_STR, getDayOffset } from '../../constants';
import { getTaskVisualStyle, getTaskRisk, getPriorityIcon } from '../../utils/taskVisualHelpers';

interface GanttItem {
  id: string;
  text: string;
  start: string;
  end: string;
  level: number; // 1-5: L1-L3 策略节点, L4-L5 任务
  type: 'strategy' | 'task';
  status?: string;
}

interface GanttChartProps {
  isCollapsed: boolean;
  height: number;
  scale: number;
  tasks: Task[]; // 筛选后的任务
  strategies: StrategyNode[]; // 筛选后的策略
  activeBranchIds: string[];
  onToggleCollapse: () => void;
  onScaleChange: (delta: number) => void;
  onHeightResize: (e: React.MouseEvent, currentHeight: number) => void;
  onTaskUpdate?: (id: string, updates: Partial<Task>) => void; // 新增：任务更新回调
  onFullscreen?: () => void; // 新增：全屏回调
}

/**
 * 甘特图组件
 */
export const GanttChart: React.FC<GanttChartProps> = ({
  isCollapsed,
  height,
  scale,
  tasks,
  strategies,
  activeBranchIds,
  onToggleCollapse,
  onScaleChange,
  onHeightResize,
  onTaskUpdate,
  onFullscreen,
}) => {
  // 滚动容器引用
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
  // 拖拽状态
  const dragState = React.useRef<{
    isDragging: boolean;
    taskId: string | null;
    startX: number;
    originalStart: string;
    originalEnd: string;
    dragType: 'move' | 'resize-start' | 'resize-end' | null;
  }>({
    isDragging: false,
    taskId: null,
    startX: 0,
    originalStart: '',
    originalEnd: '',
    dragType: null,
  });
  
  // 计算总宽度（基于 PROJECT_START 到 PROJECT_END）
  const totalWidth = React.useMemo(() => {
    const start = new Date(PROJECT_START).getTime();
    const end = new Date(PROJECT_END).getTime();
    const days = (end - start) / (1000 * 60 * 60 * 24);
    return days * scale;
  }, [scale]);

  // 默认滚动到今天的位置
  React.useEffect(() => {
    if (!isCollapsed && scrollContainerRef.current) {
      const todayOffset = getDayOffset(TODAY_STR, scale);
      const containerWidth = scrollContainerRef.current.clientWidth;
      // 滚动到今天的位置，让今天在可视区域中间偏左
      const scrollLeft = Math.max(0, todayOffset - containerWidth * 0.3);
      scrollContainerRef.current.scrollLeft = scrollLeft;
    }
  }, [isCollapsed, scale]);

  // 处理拖拽移动
  const handleDragMove = React.useCallback((e: MouseEvent) => {
    if (!dragState.current.isDragging || !dragState.current.taskId || !scrollContainerRef.current) return;
    
    const deltaX = e.clientX - dragState.current.startX;
    const deltaDays = Math.round(deltaX / scale);
    
    if (deltaDays === 0) return; // 没有移动
    
    const task = tasks.find(t => t.id === dragState.current.taskId);
    if (!task || !onTaskUpdate) return;
    
    let newStart: string;
    let newEnd: string;
    
    if (dragState.current.dragType === 'resize-start') {
      // 调整开始时间
      const originalStart = new Date(dragState.current.originalStart);
      originalStart.setDate(originalStart.getDate() + deltaDays);
      newStart = originalStart.toISOString().split('T')[0];
      newEnd = dragState.current.originalEnd;
      
      // 确保开始时间不晚于结束时间
      if (new Date(newStart) >= new Date(newEnd)) {
        const endDate = new Date(newEnd);
        endDate.setDate(endDate.getDate() + 1);
        newEnd = endDate.toISOString().split('T')[0];
      }
    } else if (dragState.current.dragType === 'resize-end') {
      // 调整结束时间
      const originalEnd = new Date(dragState.current.originalEnd);
      originalEnd.setDate(originalEnd.getDate() + deltaDays);
      newStart = dragState.current.originalStart;
      newEnd = originalEnd.toISOString().split('T')[0];
      
      // 确保结束时间不早于开始时间
      if (new Date(newEnd) <= new Date(newStart)) {
        const startDate = new Date(newStart);
        startDate.setDate(startDate.getDate() - 1);
        newStart = startDate.toISOString().split('T')[0];
      }
    } else {
      // 移动整个任务（保持时长不变）
      const originalStart = new Date(dragState.current.originalStart);
      const originalEnd = new Date(dragState.current.originalEnd);
      originalStart.setDate(originalStart.getDate() + deltaDays);
      originalEnd.setDate(originalEnd.getDate() + deltaDays);
      newStart = originalStart.toISOString().split('T')[0];
      newEnd = originalEnd.toISOString().split('T')[0];
    }
    
    // 更新任务时间
    onTaskUpdate(dragState.current.taskId, {
      start: newStart,
      end: newEnd,
    });
    
    // 更新拖拽起始位置，以便连续拖拽
    dragState.current.startX = e.clientX;
    dragState.current.originalStart = newStart;
    dragState.current.originalEnd = newEnd;
  }, [tasks, scale, onTaskUpdate]);

  // 处理拖拽结束
  const handleDragEnd = React.useCallback(() => {
    dragState.current = {
      isDragging: false,
      taskId: null,
      startX: 0,
      originalStart: '',
      originalEnd: '',
      dragType: null,
    };
    document.removeEventListener('mousemove', handleDragMove);
    document.removeEventListener('mouseup', handleDragEnd);
  }, [handleDragMove]);

  // 构建甘特图数据：包含策略节点（L1-L3）和任务（L4-L5）
  const ganttItems: GanttItem[] = React.useMemo(() => {
    const items: GanttItem[] = [];
    
    // 1. 添加策略节点（L1-L3）- 已经是筛选后的数据（filteredStrategies）
    strategies
      .sort((a, b) => a.level - b.level || a.start.localeCompare(b.start))
      .forEach(strategy => {
        items.push({
          id: strategy.id,
          text: strategy.name,
          start: strategy.start,
          end: strategy.end,
          level: strategy.level,
          type: 'strategy',
          status: strategy.status,
        });
      });
    
    // 2. 添加任务（L4-L5）- 已经是筛选后的数据（activeTasks）
    // 构建任务层级关系：L4 任务关联到 L3，L5 任务关联到 L4
    const taskMap = new Map<string, Task>();
    tasks.forEach(t => taskMap.set(t.id, t));
    
    // 构建策略 ID 集合（用于快速查找）- 使用筛选后的策略
    const strategyIds = new Set(strategies.map(s => s.id));
    
    // 先添加 L4 任务（parentId 指向策略节点 L3）
    const l4Tasks = tasks.filter(t => {
      const parentStrategy = strategies.find(s => s.id === t.parentId);
      return parentStrategy && strategyIds.has(t.parentId);
    });
    
    l4Tasks
      .sort((a, b) => a.start.localeCompare(b.start))
      .forEach(task => {
        items.push({
          id: task.id,
          text: task.text,
          start: task.start,
          end: task.end,
          level: 4, // L4
          type: 'task',
          status: task.status,
        });
      });
    
    // 添加 L5 任务（parentId 指向 L4 任务）
    // 检查任务的 parentId 是否指向一个 L4 任务（而不是策略节点）
    const l4TaskIds = new Set(l4Tasks.map(t => t.id));
    
    // 递归查找所有 L5 任务（支持多层级）
    const findL5Tasks = (parentTaskIds: Set<string>, currentLevel: number): Task[] => {
      if (currentLevel > 5) return []; // 限制最大层级
      
      const childTasks = tasks.filter(t => parentTaskIds.has(t.parentId));
      if (childTasks.length === 0) return [];
      
      // 标记这些任务为当前层级
      childTasks.forEach(t => {
        items.push({
          id: t.id,
          text: t.text,
          start: t.start,
          end: t.end,
          level: currentLevel,
          type: 'task',
          status: t.status,
        });
      });
      
      // 递归查找下一层级
      const childTaskIds = new Set(childTasks.map(t => t.id));
      return [...childTasks, ...findL5Tasks(childTaskIds, currentLevel + 1)];
    };
    
    // 从 L4 任务开始查找 L5 及更深层级
    findL5Tasks(l4TaskIds, 5);
    
    return items;
  }, [strategies, tasks, scale]); // strategies 和 tasks 已经是筛选后的数据

  // 月份刻度线数据
  const monthMarks = React.useMemo(() => {
    const start = new Date(PROJECT_START);
    const end = new Date(PROJECT_END);
    const marks: { date: Date; offset: number; label: string; isMonth: boolean }[] = [];
    
    // 生成月份刻度
    let current = new Date(start);
    current.setDate(1); // 从月初开始
    while (current <= end) {
      const offset = getDayOffset(current.toISOString().split('T')[0], scale);
      marks.push({
        date: new Date(current),
        offset,
        label: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
        isMonth: true,
      });
      current.setMonth(current.getMonth() + 1);
    }
    
    return marks;
  }, [scale]);

  // 每日日期刻度线数据 - 优化显示逻辑
  const dayMarks = React.useMemo(() => {
    const start = new Date(PROJECT_START);
    const end = new Date(PROJECT_END);
    const marks: { date: Date; offset: number; label: string; dayOfMonth: number; isWeekStart: boolean }[] = [];
    
    // 根据 scale 决定显示间隔和策略
    // scale >= 10: 显示每天
    // scale >= 5: 显示每周和月初
    // scale >= 2: 只显示月初和月中
    // scale < 2: 只显示月初
    
    let current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split('T')[0];
      const offset = getDayOffset(dateStr, scale);
      const dayOfMonth = current.getDate();
      const dayOfWeek = current.getDay(); // 0 = Sunday, 1 = Monday, ...
      const isWeekStart = dayOfWeek === 1; // 周一
      const isMonthStart = dayOfMonth === 1;
      const isMonthMiddle = dayOfMonth === 15;
      
      let shouldShow = false;
      let label = '';
      
      if (scale >= 10) {
        // 显示每天，但月初和周一更明显
        shouldShow = true;
        if (isMonthStart) {
          label = `${current.getMonth() + 1}/${dayOfMonth}`;
        } else if (isWeekStart) {
          label = String(dayOfMonth);
        } else {
          label = String(dayOfMonth);
        }
      } else if (scale >= 5) {
        // 显示每周和月初
        shouldShow = isMonthStart || isWeekStart;
        if (isMonthStart) {
          label = `${current.getMonth() + 1}/${dayOfMonth}`;
        } else if (isWeekStart) {
          label = String(dayOfMonth);
        }
      } else if (scale >= 2) {
        // 只显示月初和月中
        shouldShow = isMonthStart || isMonthMiddle;
        if (isMonthStart) {
          label = `${current.getMonth() + 1}/${dayOfMonth}`;
        } else if (isMonthMiddle) {
          label = String(dayOfMonth);
        }
      } else {
        // 只显示月初
        shouldShow = isMonthStart;
        if (isMonthStart) {
          label = `${current.getMonth() + 1}/${dayOfMonth}`;
        }
      }
      
      if (shouldShow) {
        marks.push({
          date: new Date(current),
          offset,
          label,
          dayOfMonth,
          isWeekStart,
        });
      }
      
      // 移动到下一天
      current.setDate(current.getDate() + 1);
    }
    
    return marks;
  }, [scale]);
  return (
    <section
      className={`bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col transition-all duration-300 ${
        isCollapsed ? 'p-4' : 'p-0'
      }`}
    >
      <div
        className={`flex justify-between items-center group ${
          isCollapsed ? '' : 'p-6 border-b border-slate-200 bg-gradient-to-r from-white to-slate-50/30'
        }`}
      >
        <h3 className="text-sm font-semibold text-[#37352F] flex items-center gap-2">
          <Icon name="calendar" size={15} className="text-[#2383E2]" /> 时间作战地图
          (Gantt)
        </h3>
        <div className="flex items-center gap-2">
          {!isCollapsed && (
            <>
              <div className="flex gap-2 mr-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onScaleChange(-2);
                  }}
                  className="p-1.5 bg-[#F7F6F3] rounded-md hover:bg-[#E9E9E7] transition-colors"
                  title="缩小"
                >
                  <Icon name="down" size={12} />
                </button>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onScaleChange(2);
                  }}
                  className="p-1.5 bg-[#F7F6F3] rounded-md hover:bg-[#E9E9E7] rotate-180 transition-colors"
                  title="放大"
                >
                  <Icon name="down" size={12} />
                </button>
              </div>
              {onFullscreen && (
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
            </>
          )}
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onToggleCollapse?.();
            }}
            className={`p-1 rounded-md text-[#9B9A97] hover:bg-[#F7F6F3] transition-all ${
              isCollapsed ? '' : 'rotate-180'
            }`}
            title={isCollapsed ? '展开' : '折叠'}
            aria-label={isCollapsed ? '展开甘特图' : '折叠甘特图'}
          >
            <Icon name="down" size={12} />
          </button>
        </div>
      </div>
      {!isCollapsed && (
        <>
          <div
            ref={scrollContainerRef}
            style={{ height }}
            className="overflow-auto custom-scrollbar relative"
            onWheel={(e) => {
              // 按住 Ctrl/Cmd 键时，使用滚轮缩放
              if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const delta = e.deltaY > 0 ? -1 : 1;
                onScaleChange(delta);
              }
            }}
          >
            <div className="p-6 pt-2">
              <div
                className="relative"
                style={{ 
                  height: `${Math.max(100, ganttItems.length * 40)}px`,
                  width: `${Math.max(totalWidth + 200, 800)}px`,
                  minWidth: '800px'
                }}
              >
                {/* 时间轴刻度线 - 优化视觉层次 */}
                <div 
                  className="absolute top-0 left-0 bg-gradient-to-b from-white to-slate-50/30 z-10 border-b-2 border-slate-200" 
                  style={{ 
                    width: `${totalWidth + 200}px`, 
                    height: scale >= 5 ? '56px' : scale >= 2 ? '40px' : '32px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                  }}
                >
                  {/* 月份刻度线（上层，主要刻度） */}
                  <div className="absolute top-0 left-0 right-0 h-8 border-b border-slate-200/50">
                    {monthMarks.map((mark, idx) => {
                      const isFirst = idx === 0;
                      const isLast = idx === monthMarks.length - 1;
                      return (
                        <div 
                          key={`month-${idx}`} 
                          className="absolute top-0 bottom-0 flex flex-col items-center" 
                          style={{ left: `${mark.offset + 140}px` }}
                        >
                          {/* 主要刻度线 */}
                          <div className={`w-0.5 h-full ${isFirst || isLast ? 'bg-slate-300' : 'bg-slate-400'}`} />
                          {/* 月份标签 */}
                          <div className="absolute bottom-1 text-[11px] text-slate-700 font-bold whitespace-nowrap px-1.5 py-0.5 bg-white/80 rounded border border-slate-200/50">
                            {mark.label}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* 每日日期刻度线（下层，次要刻度，仅在 scale >= 2 时显示） */}
                  {scale >= 2 && (
                    <div className="absolute top-8 left-0 right-0 h-6">
                      {dayMarks.map((mark, idx) => {
                        const isMonthStart = mark.dayOfMonth === 1;
                        const isWeekStart = mark.isWeekStart;
                        return (
                          <div 
                            key={`day-${idx}`} 
                            className="absolute top-0 bottom-0 flex flex-col items-center" 
                            style={{ left: `${mark.offset + 140}px` }}
                          >
                            {/* 次要刻度线 */}
                            <div 
                              className={`h-full ${
                                isMonthStart 
                                  ? 'w-0.5 bg-slate-300' 
                                  : isWeekStart 
                                  ? 'w-px bg-slate-200' 
                                  : 'w-px bg-slate-100'
                              }`} 
                            />
                            {/* 日期标签 - 只在月初和周一显示 */}
                            {(isMonthStart || (isWeekStart && scale >= 5)) && (
                              <div 
                                className={`absolute bottom-0.5 text-[9px] whitespace-nowrap px-1 ${
                                  isMonthStart 
                                    ? 'text-slate-600 font-semibold' 
                                    : 'text-slate-400 font-medium'
                                }`}
                              >
                                {mark.label}
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                  
                  {/* 今天标记线 - 更明显的视觉 */}
                  <div
                    className="absolute top-0 bottom-0 w-1 bg-gradient-to-b from-red-500 to-red-600 z-30 shadow-lg"
                    style={{ left: `${getDayOffset(TODAY_STR, scale) + 140}px` }}
                  >
                    <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-red-500 text-white text-[10px] px-2 py-1 rounded-md whitespace-nowrap font-bold shadow-md border-2 border-white">
                      TODAY
                    </div>
                    <div className="absolute top-6 left-1/2 -translate-x-1/2 w-2 h-2 bg-red-500 rounded-full border-2 border-white shadow-sm" />
                  </div>
                </div>
                <div className={`space-y-2 ${scale >= 5 ? 'pt-20' : scale >= 2 ? 'pt-14' : 'pt-10'}`}>
                  {ganttItems.map(item => {
                    const offset = getDayOffset(item.start, scale);
                    const width = Math.max(20, getDayOffset(item.end, scale) - offset);
                    const indent = (item.level - 1) * 20; // 层级缩进
                    
                    // 获取任务对象（如果是任务类型）
                    const task = item.type === 'task' ? tasks.find(t => t.id === item.id) : null;
                    
                    // 根据层级和类型设置颜色
                    let bgColor = 'bg-blue-50';
                    let borderColor = '#E9E9E7';
                    let borderWidth = 1;
                    let borderStyle: 'solid' | 'dashed' = 'solid';
                    let opacity = 1;
                    
                    if (item.type === 'strategy') {
                      // 策略节点
                      if (item.level === 1) bgColor = 'bg-indigo-100';
                      else if (item.level === 2) bgColor = 'bg-indigo-50';
                      else if (item.level === 3) bgColor = 'bg-blue-50';
                      borderColor = '#BBDEFB';
                    } else if (task) {
                      // 任务类型：使用视觉编码
                      const visualStyle = getTaskVisualStyle(task);
                      bgColor = ''; // 使用内联样式
                      borderColor = visualStyle.borderColor;
                      borderWidth = visualStyle.borderWidth;
                      borderStyle = visualStyle.borderStyle;
                      opacity = visualStyle.opacity;
                    } else {
                      // 任务类型但找不到任务对象（fallback）
                      if (item.status === 'completed' || item.status === 'confirmed') {
                        bgColor = 'bg-slate-300';
                      } else if (item.level === 4) {
                        bgColor = 'bg-emerald-50';
                      } else if (item.level === 5) {
                        bgColor = 'bg-amber-50';
                      }
                    }
                    
                    // 构建任务标题（包含优先级图标）
                    const priorityIcon = task ? getPriorityIcon(task.priority) : '';
                    const risk = task ? getTaskRisk(task) : null;
                    const riskIcon = risk && risk.hasRisk ? '⚠' : '';
                    
                    return (
                      <div key={item.id} className="relative h-6 group">
                        <div 
                          className="absolute left-0 truncate text-[11px] pr-2 text-right flex items-center gap-1.5"
                          style={{ width: `${120 + indent}px`, paddingLeft: `${indent}px` }}
                        >
                          <span className={`text-[9px] font-bold px-2 py-0.5 rounded-md border ${
                            item.type === 'strategy' 
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
                              : 'bg-slate-50 text-slate-600 border-slate-200'
                          }`}>
                            L{item.level}
                          </span>
                          {priorityIcon && (
                            <span className="text-[10px] flex-shrink-0" title={`优先级: ${task?.priority}`}>
                              {priorityIcon}
                            </span>
                          )}
                          {riskIcon && (
                            <span 
                              className="text-[10px] flex-shrink-0"
                              style={{ color: risk?.level === 'high' ? '#EF4444' : '#F59E0B' }}
                              title={`风险: ${risk?.reasons.join(', ')}`}
                            >
                              {riskIcon}
                            </span>
                          )}
                          <span className={`text-[11px] ${
                            item.type === 'strategy' ? 'text-[#37352F] font-medium' : 'text-[#787774]'
                          }`}>
                            {item.text}
                          </span>
                        </div>
                        <div
                          className={`absolute h-5 rounded-lg top-0.5 hover:opacity-90 hover:shadow-md transition-all ${
                            item.type === 'task' && task && onTaskUpdate
                              ? 'cursor-move'
                              : 'cursor-pointer'
                          } ${
                            item.type === 'strategy' || !task ? bgColor : ''
                          }`}
                          style={{
                            left: offset + 140 + indent,
                            width,
                            backgroundColor: task ? undefined : bgColor,
                            ...(task ? {
                              backgroundColor: getTaskVisualStyle(task).backgroundColor,
                              borderColor: borderColor,
                              borderWidth: `${borderWidth}px`,
                              borderStyle: borderStyle,
                              opacity: opacity,
                            } : {}),
                            boxShadow: item.type === 'strategy' ? '0 1px 2px rgba(0,0,0,0.05)' : '0 1px 3px rgba(0,0,0,0.08)',
                          }}
                          title={`${item.text} (L${item.level}): ${item.start} ~ ${item.end}${task && task.score !== undefined ? ` | 得分: ${task.score}` : ''}${risk && risk.hasRisk ? ` | 风险: ${risk.reasons.join(', ')}` : ''}${item.type === 'task' && task && onTaskUpdate ? ' | 拖拽移动时间，拖拽边缘调整时长' : ''}`}
                          onMouseDown={(e) => {
                            if (item.type === 'task' && task && onTaskUpdate) {
                              e.preventDefault();
                              e.stopPropagation();
                              const rect = e.currentTarget.getBoundingClientRect();
                              const clickX = e.clientX - rect.left;
                              const isNearStart = clickX < 8; // 左侧 8px 内
                              const isNearEnd = clickX > width - 8; // 右侧 8px 内
                              
                              dragState.current = {
                                isDragging: true,
                                taskId: task.id,
                                startX: e.clientX,
                                originalStart: task.start,
                                originalEnd: task.end,
                                dragType: isNearStart ? 'resize-start' : isNearEnd ? 'resize-end' : 'move',
                              };
                              
                              document.addEventListener('mousemove', handleDragMove);
                              document.addEventListener('mouseup', handleDragEnd);
                            }
                          }}
                        >
                          {/* 调整手柄（仅在任务类型时显示） */}
                          {item.type === 'task' && task && onTaskUpdate && (
                            <>
                              <div
                                className="absolute left-0 top-0 bottom-0 w-1.5 bg-blue-500/50 hover:bg-blue-500 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
                                title="拖拽调整开始时间"
                              />
                              <div
                                className="absolute right-0 top-0 bottom-0 w-1.5 bg-blue-500/50 hover:bg-blue-500 cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
                                title="拖拽调整结束时间"
                              />
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
          <div
            className="h-3 bg-[#F7F6F3] border-t border-[#E9E9E7] flex items-center justify-center cursor-row-resize hover:bg-[#E9E9E7] transition-colors"
            onMouseDown={e => onHeightResize(e, height)}
          >
            <div className="w-8 h-1 bg-[#D9D9D7] rounded-full opacity-60" />
          </div>
        </>
      )}
    </section>
  );
};
