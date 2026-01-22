import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import Icon from '../Icon';
import { Task, TaskStatus } from '../../types';
import { STATUS_CONFIG } from './TaskList';

interface TaskItemProps {
  task: Task;
  isFilterActive: boolean;
  onTaskUpdate: (id: string, updates: Partial<Task>) => void;
  onTaskEdit: (e: React.MouseEvent, task: Task) => void;
  onTaskDelete: (e: React.MouseEvent, id: string) => void;
}

/**
 * 可拖拽的任务项组件
 */
export const TaskItem: React.FC<TaskItemProps> = ({
  task,
  isFilterActive,
  onTaskUpdate,
  onTaskEdit,
  onTaskDelete,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const reportCount = task.reports?.length || 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-[40px_80px_1fr_100px_120px_120px_60px_100px] gap-4 px-6 py-4 items-center hover:bg-[#F7F6F3] transition-colors group border-b border-[#E9E9E7]"
    >
      {/* 拖拽手柄 */}
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab active:cursor-grabbing flex items-center justify-center text-[#9B9A97] hover:text-[#37352F] transition-colors"
        title="拖拽排序"
      >
        <Icon name="menu" size={16} />
      </div>

      {/* Status */}
      <div className="flex justify-center">
        <select
          value={task.status}
          onChange={e =>
            onTaskUpdate(task.id, { status: e.target.value as TaskStatus })
          }
          onClick={(e) => e.stopPropagation()}
          className={`text-[10px] font-black uppercase rounded px-2 py-1 border-none outline-none cursor-pointer text-center w-full ${STATUS_CONFIG[task.status]?.color} ${STATUS_CONFIG[task.status]?.bg}`}
        >
          <option value="todo">准备</option>
          <option value="in_progress">进行</option>
          <option value="completed">完成</option>
          <option value="confirmed">确认</option>
        </select>
      </div>

      {/* Task Content */}
      <div className="flex flex-col">
        <input
          value={task.text}
          onChange={e => onTaskUpdate(task.id, { text: e.target.value })}
          onClick={(e) => e.stopPropagation()}
          className={`bg-transparent border-none outline-none text-sm font-bold w-full ${
            task.status === 'completed' || task.status === 'confirmed'
              ? 'text-[#9B9A97] line-through'
              : 'text-[#37352F]'
          }`}
          placeholder="输入任务内容..."
        />
        {(task.status === 'in_progress' ||
          task.status === 'completed' ||
          task.status === 'confirmed') && (
          <div className="w-full h-1 bg-[#E9E9E7] rounded-full mt-1 overflow-hidden">
            <div
              className={`h-full ${STATUS_CONFIG[task.status]?.icon}`}
              style={{ width: `${task.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Priority */}
      <select
        value={task.priority}
        onChange={e =>
          onTaskUpdate(task.id, { priority: e.target.value as any })
        }
        onClick={(e) => e.stopPropagation()}
        className={`text-[10px] font-black uppercase bg-transparent outline-none cursor-pointer ${
          task.priority === 'P0'
            ? 'text-rose-500'
            : task.priority === 'P1'
            ? 'text-orange-500'
            : 'text-blue-500'
        }`}
      >
        <option value="P0">P0 - Urgent</option>
        <option value="P1">P1 - High</option>
        <option value="P2">P2 - Normal</option>
      </select>

      {/* Start Date */}
      <input
        type="date"
        value={task.start}
        onChange={e => onTaskUpdate(task.id, { start: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        className="text-[11px] bg-transparent border-none outline-none text-[#37352F] w-full"
      />

      {/* End Date */}
      <input
        type="date"
        value={task.end}
        onChange={e => onTaskUpdate(task.id, { end: e.target.value })}
        onClick={(e) => e.stopPropagation()}
        className="text-[11px] bg-transparent border-none outline-none text-[#37352F] w-full"
      />

      {/* Owner */}
      <div className="text-[11px] text-[#787774] truncate">{task.owner || '-'}</div>

      {/* Actions */}
      <div className="flex items-center justify-center gap-2">
        {reportCount > 0 && (
          <span className="text-[10px] text-indigo-600 font-medium">
            {reportCount} 汇报
          </span>
        )}
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onTaskEdit(e, task);
          }}
          className="p-1.5 hover:bg-[#E9E9E7] rounded transition-colors opacity-0 group-hover:opacity-100"
          title="编辑任务"
        >
          <Icon name="edit" size={14} className="text-[#9B9A97]" />
        </button>
        <button
          type="button"
          onClick={e => {
            e.stopPropagation();
            onTaskDelete(e, task.id);
          }}
          className="p-1.5 hover:bg-rose-100 rounded transition-colors opacity-0 group-hover:opacity-100"
          title="删除任务"
        >
          <Icon name="trash" size={14} className="text-rose-500" />
        </button>
      </div>
    </div>
  );
};
