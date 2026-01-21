import React from 'react';
import Icon from '../Icon';
import { Task, StrategyNode } from '../../types';
import { PROJECT_START, PROJECT_END, TODAY_STR, getDayOffset } from '../../constants';

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
}) => {
  // 滚动容器引用
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  
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

  // 月份刻度线数据 - 必须在组件顶层，不能在条件渲染内
  const monthMarks = React.useMemo(() => {
    const start = new Date(PROJECT_START);
    const end = new Date(PROJECT_END);
    const marks: { date: Date; offset: number; label: string }[] = [];
    
    // 生成月份刻度
    let current = new Date(start);
    current.setDate(1); // 从月初开始
    while (current <= end) {
      const offset = getDayOffset(current.toISOString().split('T')[0], scale);
      marks.push({
        date: new Date(current),
        offset,
        label: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`
      });
      current.setMonth(current.getMonth() + 1);
    }
    
    return marks;
  }, [scale]);
  return (
    <section
      className={`bg-white rounded-lg border border-[#E9E9E7] overflow-hidden flex flex-col transition-all duration-300 ${
        isCollapsed ? 'p-4' : 'p-0'
      }`}
    >
      <div
        className={`flex justify-between items-center group ${
          isCollapsed ? '' : 'p-6 border-b border-[#E9E9E7]'
        }`}
      >
        <h3 className="text-sm font-semibold text-[#37352F] flex items-center gap-2">
          <Icon name="calendar" size={15} className="text-[#2383E2]" /> 时间作战地图
          (Gantt)
        </h3>
        <div className="flex items-center gap-2">
          {!isCollapsed && (
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
                {/* 时间轴刻度线 */}
                <div className="absolute top-0 left-0 h-8 border-b border-[#E9E9E7] bg-white z-10" style={{ width: `${totalWidth + 200}px` }}>
                  {/* 月份刻度线 */}
                  {monthMarks.map((mark, idx) => (
                    <div key={idx} className="absolute top-0 bottom-0 flex flex-col items-center" style={{ left: `${mark.offset + 140}px` }}>
                      <div className="w-px h-full bg-[#E9E9E7]" />
                      <div className="absolute bottom-0 text-[10px] text-[#787774] font-medium whitespace-nowrap">
                        {mark.label}
                      </div>
                    </div>
                  ))}
                  
                  {/* 今天标记线 */}
                  <div
                    className="absolute top-0 bottom-0 w-px bg-[#E16259] z-20"
                    style={{ left: `${getDayOffset(TODAY_STR, scale)}px` }}
                  >
                    <div className="absolute -top-1 -left-3 bg-[#E16259] text-white text-[9px] px-1.5 py-0.5 rounded-md whitespace-nowrap font-medium">
                      NOW
                    </div>
                  </div>
                </div>
                <div className="pt-10 space-y-2">
                  {ganttItems.map(item => {
                    const offset = getDayOffset(item.start, scale);
                    const width = Math.max(20, getDayOffset(item.end, scale) - offset);
                    const indent = (item.level - 1) * 20; // 层级缩进
                    
                    // 根据层级和类型设置颜色
                    let bgColor = 'bg-blue-50';
                    if (item.type === 'strategy') {
                      if (item.level === 1) bgColor = 'bg-indigo-100';
                      else if (item.level === 2) bgColor = 'bg-indigo-50';
                      else if (item.level === 3) bgColor = 'bg-blue-50';
                    } else {
                      // 任务类型
                      if (item.status === 'completed' || item.status === 'confirmed') {
                        bgColor = 'bg-slate-300';
                      } else if (item.level === 4) {
                        bgColor = 'bg-emerald-50';
                      } else if (item.level === 5) {
                        bgColor = 'bg-amber-50';
                      }
                    }
                    
                    return (
                      <div key={item.id} className="relative h-6 group">
                        <div 
                          className="absolute left-0 truncate text-[11px] pr-2 text-right flex items-center gap-1.5"
                          style={{ width: `${120 + indent}px`, paddingLeft: `${indent}px` }}
                        >
                          <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-md ${
                            item.type === 'strategy' 
                              ? 'bg-[#E3F2FD] text-[#2383E2]' 
                              : 'bg-[#F1F1EF] text-[#787774]'
                          }`}>
                            L{item.level}
                          </span>
                          <span className={`text-[11px] ${
                            item.type === 'strategy' ? 'text-[#37352F] font-medium' : 'text-[#787774]'
                          }`}>
                            {item.text}
                          </span>
                        </div>
                        <div
                          className={`absolute h-4 rounded-md top-1 ${bgColor} hover:opacity-80 transition-all cursor-pointer border ${
                            item.type === 'strategy' ? 'border-[#BBDEFB]' : 'border-[#E9E9E7]'
                          }`}
                          style={{ left: offset + 140 + indent, width }}
                          title={`${item.text} (L${item.level}): ${item.start} ~ ${item.end}`}
                        />
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
