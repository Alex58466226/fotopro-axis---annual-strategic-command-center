import React from 'react';
import Icon from '../Icon';
import { StrategyNode, Task, TaskStatus } from '../../types';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core';
import {
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';

const STATUS_CONFIG: Record<TaskStatus, { icon: string }> = {
  'todo': { icon: 'bg-slate-300' },
  'in_progress': { icon: 'bg-blue-500' },
  'completed': { icon: 'bg-emerald-500' },
  'confirmed': { icon: 'bg-purple-500' },
};

interface MapModalProps {
  isOpen: boolean;
  strategies: StrategyNode[];
  tasks: Task[];
  expandedNodes: Set<string>;
  activeNodeId: string;
  onClose: () => void;
  onNodeClick: (nodeId: string) => void;
  onTaskClick: (e: React.MouseEvent, task: Task) => void;
  onToggleExpand: (e: React.MouseEvent, nodeId: string) => void;
  onStrategyUpdate?: (id: string, updates: Partial<StrategyNode>) => void; // 新增：策略更新回调（用于拖拽）
  onDragSuccess?: (draggedName: string, targetName: string, newParentName?: string) => void; // 新增：拖拽成功回调
}

/**
 * 架构地图 Modal 组件
 */
export const MapModal: React.FC<MapModalProps> = ({
  isOpen,
  strategies,
  tasks,
  expandedNodes,
  activeNodeId,
  onClose,
  onNodeClick,
  onTaskClick,
  onToggleExpand,
  onStrategyUpdate,
  onDragSuccess,
  isFullscreen = false,
}) => {
  if (!isOpen) return null;

  const renderLargeMapTask = (t: Task) => (
    <div key={t.id} className="relative pl-8 mb-1.5">
      <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200" />
      <div className="absolute left-0 top-3 w-6 h-px bg-slate-200" />
      <div
        onClick={e => onTaskClick(e, t)}
        className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-xl hover:shadow-md hover:border-indigo-300 cursor-pointer transition-all group"
      >
        <div className="flex items-center gap-3">
          <div
            className={`w-2 h-2 rounded-full flex-shrink-0 ${STATUS_CONFIG[t.status]?.icon}`}
          />
          <span
            className={`text-xs font-bold ${
              t.status === 'completed' || t.status === 'confirmed'
                ? 'text-slate-400 line-through'
                : 'text-slate-700'
            }`}
          >
            {t.text}
          </span>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-400">
          <span className="font-mono bg-slate-50 px-1.5 py-0.5 rounded">
            {t.priority}
          </span>
          <span className="hidden md:inline">{t.owner}</span>
          <span>{t.end}</span>
        </div>
      </div>
    </div>
  );

  // 拖拽状态
  const [activeId, setActiveId] = React.useState<string | null>(null);
  
  // 缩放状态（全屏模式下）
  const [zoomLevel, setZoomLevel] = React.useState(1);
  const [nodeSize, setNodeSize] = React.useState<'small' | 'medium' | 'large'>('medium');
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor)
  );

  const handleDragStart = (event: DragStartEvent) => {
    const draggedId = event.active.id as string;
    setActiveId(draggedId);
    const draggedStrategy = strategies.find(s => s.id === draggedId);
    console.log('🚀 拖拽开始:', draggedStrategy?.name, 'Level:', draggedStrategy?.level);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    console.log('🎯 拖拽结束:', { active: active.id, over: over?.id });

    if (!over || !onStrategyUpdate) {
      console.log('❌ 拖拽失败: 没有目标或更新函数');
      return;
    }

    const draggedStrategy = strategies.find(s => s.id === active.id);
    const targetStrategy = strategies.find(s => s.id === over.id);

    if (!draggedStrategy) {
      console.log('❌ 拖拽失败: 找不到被拖拽的策略');
      return;
    }

    console.log('📋 拖拽信息:', {
      dragged: draggedStrategy.name,
      target: targetStrategy?.name,
      draggedLevel: draggedStrategy.level,
      targetLevel: targetStrategy?.level,
    });

    // 只允许拖拽 L2-L3 策略节点
    if (draggedStrategy.level < 2 || draggedStrategy.level > 3) {
      console.log('❌ 拖拽失败: 只允许拖拽 L2-L3 节点');
      if (onDragSuccess) {
        onDragSuccess('', '', ''); // 触发错误提示
      }
      return;
    }

    // 不能拖拽到自己
    if (active.id === over.id) return;

    // 不能拖拽到自己的子节点
    const isDescendant = (parentId: string, childId: string): boolean => {
      const children = strategies.filter(s => s.parentId === parentId);
      if (children.some(c => c.id === childId)) return true;
      return children.some(c => isDescendant(c.id, childId));
    };
    if (isDescendant(draggedStrategy.id, over.id as string)) {
      if (onDragSuccess) {
        onDragSuccess('', '', ''); // 触发错误提示
      }
      return;
    }

    // 确定新的 parentId
    let newParentId: string | null = null;
    let relationship = '';
    if (targetStrategy) {
      // 如果拖拽到策略节点上，根据目标节点的层级决定
      if (targetStrategy.level < draggedStrategy.level) {
        // 可以成为目标节点的子节点
        newParentId = targetStrategy.id;
        relationship = '子节点';
      } else if (targetStrategy.parentId) {
        // 成为目标节点的兄弟节点
        newParentId = targetStrategy.parentId;
        relationship = '兄弟节点';
      }
    }

    if (newParentId !== null && newParentId !== draggedStrategy.parentId) {
      const oldParent = strategies.find(s => s.id === draggedStrategy.parentId);
      const newParent = strategies.find(s => s.id === newParentId);
      
      console.log('✅ 拖拽成功:', {
        from: oldParent?.name || '根节点',
        to: newParent?.name || '根节点',
        relationship,
      });
      
      onStrategyUpdate(draggedStrategy.id, { parentId: newParentId });
      
      // 显示成功提示
      if (onDragSuccess) {
        onDragSuccess(
          draggedStrategy.name,
          targetStrategy?.name || '',
          newParent?.name
        );
      }
    } else {
      console.log('⚠️ 拖拽取消: 没有有效的目标位置或位置未改变');
    }
  };

  // 可拖拽的策略节点组件
  const DraggableStrategyNode: React.FC<{ node: StrategyNode }> = ({ node }) => {
    const canDrag = node.level >= 2 && node.level <= 3;
    
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
      id: node.id,
      disabled: !canDrag, // 只允许拖拽 L2-L3
    });

    const style = transform
      ? {
          transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
        }
      : undefined;

    const childStrategies = strategies.filter(s => s.parentId === node.id);
    const childTasks = tasks.filter(t => t.parentId === node.id);
    const hasChildren = childStrategies.length > 0 || childTasks.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    
    // 根据 nodeSize 计算节点样式
    const sizeStyles = {
      small: { padding: 'p-3', textSize: 'text-xs', gap: 'gap-4' },
      medium: { padding: 'p-4', textSize: 'text-sm', gap: 'gap-6' },
      large: { padding: 'p-5', textSize: 'text-base', gap: 'gap-8' },
    };
    const currentSize = sizeStyles[nodeSize];

    return (
      <div
        ref={setNodeRef}
        style={style}
        className={`relative pl-8 mb-4 ${isDragging ? 'opacity-50' : ''}`}
      >
        <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-300" />
        {node.parentId && <div className="absolute left-0 top-6 w-6 h-px bg-slate-300" />}
        <div className="relative">
          {hasChildren && (
            <button
              onClick={e => onToggleExpand(e, node.id)}
              className="absolute -left-[9px] top-[18px] z-10 w-4 h-4 bg-white border border-slate-400 text-slate-500 rounded-full flex items-center justify-center cursor-pointer hover:bg-indigo-50 hover:border-indigo-500 hover:text-indigo-500 transition-all shadow-sm"
            >
              <Icon name={isExpanded ? 'down' : 'right'} size={10} />
            </button>
          )}
          {!hasChildren && node.parentId && (
            <div className="absolute -left-[3px] top-[22px] w-1.5 h-1.5 bg-slate-300 rounded-full" />
          )}
          <div
            className={`${currentSize.padding} bg-white border rounded-2xl transition-all shadow-sm hover:shadow-md group ${
              activeNodeId === node.id
                ? 'border-slate-900 ring-2 ring-slate-100'
                : 'border-slate-200 hover:border-indigo-300'
            } ${canDrag ? 'cursor-move hover:border-indigo-500 hover:ring-2 hover:ring-indigo-200' : 'cursor-pointer'}`}
            onClick={(e) => {
              if (!canDrag) {
                onNodeClick(node.id);
              }
            }}
            onMouseDown={(e) => {
              if (canDrag) {
                console.log('🖱️ 鼠标按下，准备拖拽:', node.name, 'Level:', node.level);
              }
            }}
            {...(canDrag ? { ...attributes, ...listeners } : {})}
          >
            {/* 标签移到标题下方，更核心的位置 */}
            <div className="flex justify-between items-start mb-1.5">
              <div className="flex items-center gap-1.5 flex-wrap">
                {/* 层级标签：悬停时显示，完全次要信息 */}
                <span
                  className={`text-[7px] font-normal text-slate-300 opacity-0 group-hover:opacity-40 transition-opacity duration-200 ${
                    node.level === 1
                      ? 'text-slate-300'
                      : node.level === 2
                      ? 'text-indigo-200'
                      : 'text-orange-200'
                  }`}
                >
                  L{node.level}
                </span>
                {node.group && (
                  <span className="text-[9px] font-bold uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                    {node.group}
                  </span>
                )}
                {/* 标签移到更核心位置 */}
                {node.tags && node.tags.length > 0 && (
                  <div className="flex gap-1.5 flex-wrap">
                    {node.tags.map(t => (
                      <span
                        key={t}
                        className="text-[9px] font-medium text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md"
                      >
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
              {/* 可拖拽标识移到右上角，不重叠 */}
              {canDrag && (
                <div className="text-[8px] text-indigo-500 bg-indigo-50 border border-indigo-200 px-1.5 py-0.5 rounded font-medium flex-shrink-0">
                  ✨
                </div>
              )}
            </div>
            <h4 className={`${currentSize.textSize} font-black text-slate-800 mb-1.5`}>{node.name}</h4>
            <div className={`flex items-center ${currentSize.gap} text-[10px] text-slate-500 font-medium pt-1.5 border-t border-slate-50`}>
              <span className="flex items-center gap-1">
                <Icon name="user" size={12} /> {node.owner || 'Unassigned'}
              </span>
              <span className="flex items-center gap-1">
                <Icon name="calendar" size={12} /> {node.end}
              </span>
              {childTasks.length > 0 && (
                <span className="flex items-center gap-1 text-emerald-600">
                  <Icon name="check" size={12} />{' '}
                  {childTasks.filter(
                    t => t.status === 'completed' || t.status === 'confirmed'
                  ).length}
                  /{childTasks.length} Tasks
                </span>
              )}
            </div>
          </div>
        </div>
        {isExpanded && hasChildren && (
          <div className="mt-3 ml-2 space-y-1.5">
            {childStrategies.map(child => (
              <DroppableArea key={child.id} node={child}>
                <DraggableStrategyNode node={child} />
              </DroppableArea>
            ))}
            {childTasks.map(renderLargeMapTask)}
          </div>
        )}
      </div>
    );
  };

  // 可放置区域组件 - 扩大接收区域
  const DroppableArea: React.FC<{ node: StrategyNode; children: React.ReactNode }> = ({
    node,
    children,
  }) => {
    const { setNodeRef, isOver } = useDroppable({
      id: node.id,
    });

    // 检查当前拖拽的节点是否可以放置到这里
    const canDrop = React.useMemo(() => {
      if (!activeId) return false;
      const draggedStrategy = strategies.find(s => s.id === activeId);
      if (!draggedStrategy) return false;
      
      // 只允许拖拽 L2-L3
      if (draggedStrategy.level < 2 || draggedStrategy.level > 3) return false;
      
      // 不能拖拽到自己
      if (activeId === node.id) return false;
      
      // 不能拖拽到自己的子节点
      const isDescendant = (parentId: string, childId: string): boolean => {
        const children = strategies.filter(s => s.parentId === parentId);
        if (children.some(c => c.id === childId)) return true;
        return children.some(c => isDescendant(c.id, childId));
      };
      if (isDescendant(activeId, node.id)) return false;
      
      // 检查层级关系
      if (draggedStrategy.level > node.level) {
        // 可以成为目标节点的子节点
        return true;
      } else if (node.parentId) {
        // 可以成为目标节点的兄弟节点
        return true;
      }
      
      return false;
    }, [activeId, node, strategies]);

    return (
      <div
        ref={setNodeRef}
        className={`relative transition-all duration-200 ${
          isOver && canDrop
            ? 'ring-4 ring-indigo-500 bg-indigo-100/80 rounded-2xl scale-105 shadow-lg'
            : isOver
            ? 'ring-2 ring-rose-400 bg-rose-50/50 rounded-2xl'
            : ''
        }`}
        style={{
          // 扩大可放置区域：添加 padding 和 margin
          padding: isOver && canDrop ? '16px' : '8px',
          margin: '8px 0',
          minHeight: '120px', // 确保有足够的接收区域
        }}
      >
        {isOver && canDrop && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-50">
            <div className="bg-indigo-500 text-white px-6 py-3 rounded-lg shadow-xl font-bold text-base animate-pulse border-2 border-white">
              ✓ 放置到这里
            </div>
          </div>
        )}
        {children}
      </div>
    );
  };

  const renderLargeMapNode = (node: StrategyNode): React.ReactNode => {
    return (
      <DroppableArea key={node.id} node={node}>
        <DraggableStrategyNode node={node} />
      </DroppableArea>
    );
  };

  return (
    <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[9998] flex items-center justify-center p-6 animate-in fade-in duration-300">
      <div className="bg-slate-50 rounded-[2.5rem] shadow-2xl w-full h-full flex flex-col overflow-hidden ring-4 ring-white/10">
        <div className="p-8 border-b border-slate-200 bg-white flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-white shadow-lg">
              <Icon name="layers" size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-black uppercase tracking-tight text-slate-900">
                Fotopro AMZ 项目管理器
              </h2>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-1">
                架构视图 (L1 - L4)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* 全屏模式下的缩放控制 */}
            {isFullscreen && (
              <>
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.max(0.5, prev - 0.1))}
                    className="p-1.5 hover:bg-white rounded transition-colors"
                    title="缩小"
                  >
                    <Icon name="down" size={14} className="text-slate-600" />
                  </button>
                  <span className="text-xs font-medium text-slate-600 px-2 min-w-[3rem] text-center">
                    {Math.round(zoomLevel * 100)}%
                  </span>
                  <button
                    type="button"
                    onClick={() => setZoomLevel(prev => Math.min(2, prev + 0.1))}
                    className="p-1.5 hover:bg-white rounded transition-colors rotate-180"
                    title="放大"
                  >
                    <Icon name="down" size={14} className="text-slate-600" />
                  </button>
                </div>
                <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
                  <button
                    type="button"
                    onClick={() => setNodeSize('small')}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      nodeSize === 'small' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                    title="小尺寸"
                  >
                    小
                  </button>
                  <button
                    type="button"
                    onClick={() => setNodeSize('medium')}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      nodeSize === 'medium' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                    title="中尺寸"
                  >
                    中
                  </button>
                  <button
                    type="button"
                    onClick={() => setNodeSize('large')}
                    className={`px-2 py-1 text-xs font-medium rounded transition-colors ${
                      nodeSize === 'large' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
                    }`}
                    title="大尺寸"
                  >
                    大
                  </button>
                </div>
              </>
            )}
            <button
              onClick={onClose}
              className="p-4 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-all transform hover:rotate-90"
            >
              <Icon name="plus" size={24} className="rotate-45" />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-auto p-12 custom-scrollbar bg-slate-50">
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <div 
              className="mx-auto" 
              style={{ 
                minHeight: '100%',
                maxWidth: isFullscreen ? '100%' : '80rem',
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'top center',
                transition: 'transform 0.2s ease',
              }}
            >
              {strategies.filter(s => s.level === 1).map(renderLargeMapNode)}
            </div>
            <DragOverlay>
              {activeId ? (() => {
                const draggedStrategy = strategies.find(s => s.id === activeId);
                if (!draggedStrategy) return null;
                return (
                  <div className="p-4 bg-gradient-to-br from-indigo-500 to-indigo-600 border-4 border-white rounded-2xl shadow-2xl transform rotate-3 scale-110">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <Icon name="layers" size={20} className="text-white" />
                      </div>
                      <div>
                        <div className="text-xs font-bold text-white/80 uppercase tracking-wider">
                          L{draggedStrategy.level} 策略
                        </div>
                        <div className="text-base font-black text-white">
                          {draggedStrategy.name}
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-white/90 font-medium">
                      ← 拖拽到目标位置
                    </div>
                  </div>
                );
              })() : null}
            </DragOverlay>
          </DndContext>
        </div>
      </div>
    </div>
  );
};
