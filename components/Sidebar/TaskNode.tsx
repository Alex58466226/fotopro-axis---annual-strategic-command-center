import React from 'react';
import { Task, TaskStatus } from '../../types';

interface TaskNodeProps {
  task: Task;
  onTaskClick: (e: React.MouseEvent, task: Task) => void;
}

const STATUS_CONFIG: Record<TaskStatus, { icon: string }> = {
  'todo': { icon: 'bg-slate-300' },
  'in_progress': { icon: 'bg-blue-500' },
  'completed': { icon: 'bg-emerald-500' },
  'confirmed': { icon: 'bg-purple-500' },
};

/**
 * 侧边栏任务节点组件
 */
export const TaskNode: React.FC<TaskNodeProps> = ({ task, onTaskClick }) => {
  return (
    <div className="relative pl-4">
      <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200" />
      <div className="absolute left-0 top-3 w-4 h-px bg-slate-200" />
      <div
        onClick={(e) => onTaskClick(e, task)}
        className="relative group flex items-center gap-2 p-2 my-1 ml-1 rounded-lg hover:bg-white border border-transparent hover:border-slate-200 cursor-pointer transition-all"
      >
        <div
          className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${
            STATUS_CONFIG[task.status]?.icon || 'bg-slate-300'
          }`}
        />
        <span
          className={`text-[10px] truncate ${
            task.status === 'completed' || task.status === 'confirmed'
              ? 'text-slate-400 line-through'
              : 'text-slate-500 group-hover:text-indigo-600'
          }`}
        >
          {task.text}
        </span>
      </div>
    </div>
  );
};
