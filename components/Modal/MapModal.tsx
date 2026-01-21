import React from 'react';
import Icon from '../Icon';
import { StrategyNode, Task, TaskStatus } from '../../types';

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
}) => {
  if (!isOpen) return null;

  const renderLargeMapTask = (t: Task) => (
    <div key={t.id} className="relative pl-8 mb-2">
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

  const renderLargeMapNode = (node: StrategyNode): React.ReactNode => {
    const childStrategies = strategies.filter(s => s.parentId === node.id);
    const childTasks = tasks.filter(t => t.parentId === node.id);
    const hasChildren = childStrategies.length > 0 || childTasks.length > 0;
    const isExpanded = expandedNodes.has(node.id);

    return (
      <div key={node.id} className="relative pl-8 mb-4">
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
            className={`p-4 bg-white border rounded-2xl transition-all shadow-sm hover:shadow-md ${
              activeNodeId === node.id
                ? 'border-slate-900 ring-2 ring-slate-100'
                : 'border-slate-200 hover:border-indigo-300'
            }`}
            onClick={() => onNodeClick(node.id)}
          >
            <div className="flex justify-between items-start mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={`text-[10px] font-black px-2 py-0.5 rounded text-white ${
                    node.level === 1
                      ? 'bg-slate-800'
                      : node.level === 2
                      ? 'bg-indigo-600'
                      : 'bg-orange-500'
                  }`}
                >
                  L{node.level}
                </span>
                {node.group && (
                  <span className="text-[9px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    {node.group}
                  </span>
                )}
              </div>
              <div className="flex gap-2">
                {node.tags?.map(t => (
                  <span
                    key={t}
                    className="text-[9px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded"
                  >
                    #{t}
                  </span>
                ))}
              </div>
            </div>
            <h4 className="text-sm font-black text-slate-800 mb-2">{node.name}</h4>
            <div className="flex items-center gap-6 text-[10px] text-slate-500 font-medium pt-2 border-t border-slate-50">
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
          <div className="mt-2 ml-2">
            {childStrategies.map(renderLargeMapNode)}
            {childTasks.map(renderLargeMapTask)}
          </div>
        )}
      </div>
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
                Strategy Command Center
              </h2>
              <p className="text-xs font-bold text-orange-500 uppercase tracking-widest mt-1">
                Full Architecture View (L1 - L4)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-4 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 transition-all transform hover:rotate-90"
          >
            <Icon name="plus" size={24} className="rotate-45" />
          </button>
        </div>
        <div className="flex-1 overflow-auto p-12 custom-scrollbar bg-slate-50">
          <div className="max-w-5xl mx-auto">
            {strategies.filter(s => s.level === 1).map(renderLargeMapNode)}
          </div>
        </div>
      </div>
    </div>
  );
};
