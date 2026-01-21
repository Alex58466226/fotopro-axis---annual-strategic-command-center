/**
 * 任务服务
 * 处理任务相关的业务逻辑
 */

import { Task, TaskReport, TaskStatus, AuditLog } from '../types';
import { TODAY_STR } from '../constants';

/**
 * 生成唯一 ID
 */
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 999)}`;

/**
 * 创建新任务
 */
export interface CreateTaskParams {
  parentId: string;
  rootId: string;
  text?: string;
  owner?: string;
  start?: string;
  end?: string;
  status?: TaskStatus;
  priority?: 'P0' | 'P1' | 'P2';
}

export function createTask(params: CreateTaskParams): Task {
  return {
    id: generateId('t'),
    parentId: params.parentId,
    rootId: params.rootId,
    text: params.text || '新任务',
    start: params.start || TODAY_STR,
    end: params.end || TODAY_STR,
    status: params.status || 'todo',
    progress: params.status === 'completed' || params.status === 'confirmed' ? 100 : 0,
    owner: params.owner || '',
    product: '',
    channel: '',
    priority: params.priority || 'P2',
    notes: '',
    reports: [],
  };
}

/**
 * 更新任务
 */
export interface UpdateTaskParams {
  id: string;
  text?: string;
  status?: TaskStatus;
  progress?: number;
  owner?: string;
  product?: string;
  channel?: string;
  priority?: 'P0' | 'P1' | 'P2';
  notes?: string;
  reports?: TaskReport[];
  reviewer?: string;
  score?: number;
  reviewComment?: string;
  start?: string;
  end?: string;
}

export function updateTask(
  existing: Task,
  updates: UpdateTaskParams
): Task {
  // 处理状态变化时的进度自动调整
  let progress = updates.progress;
  if (updates.status !== undefined && updates.status !== existing.status) {
    if (updates.progress === undefined) {
      if (updates.status === 'todo') {
        progress = 0;
      } else if (updates.status === 'in_progress' && existing.progress === 0) {
        progress = 10;
      } else if (updates.status === 'completed' || updates.status === 'confirmed') {
        progress = 100;
      } else {
        progress = existing.progress;
      }
    }
  }

  // 构建更新后的任务
  const updatedTask: Task = {
    ...existing,
    text: updates.text ?? existing.text,
    status: updates.status ?? existing.status,
    progress: progress ?? existing.progress ?? 0,
    owner: updates.owner ?? existing.owner,
    product: updates.product ?? existing.product,
    channel: updates.channel ?? existing.channel,
    priority: updates.priority ?? existing.priority,
    notes: updates.notes ?? existing.notes,
    reports: updates.reports !== undefined ? (updates.reports || []) : existing.reports,
    reviewer: updates.reviewer ?? existing.reviewer,
    score: updates.score ?? existing.score,
    reviewComment: updates.reviewComment ?? existing.reviewComment,
    start: updates.start ?? existing.start,
    end: updates.end ?? existing.end,
  };

  // 确保所有必需字段都存在
  return {
    id: updatedTask.id || existing.id,
    parentId: updatedTask.parentId || existing.parentId,
    rootId: updatedTask.rootId || existing.rootId,
    text: updatedTask.text || existing.text,
    start: updatedTask.start || existing.start,
    end: updatedTask.end || existing.end,
    status: updatedTask.status || existing.status,
    progress: updatedTask.progress !== undefined ? updatedTask.progress : existing.progress,
    owner: updatedTask.owner || existing.owner || '',
    product: updatedTask.product || existing.product || '',
    channel: updatedTask.channel || existing.channel || '',
    priority: updatedTask.priority || existing.priority || 'P2',
    notes: updatedTask.notes || existing.notes || '',
    reports: updatedTask.reports || [],
    reviewer: updatedTask.reviewer,
    score: updatedTask.score,
    reviewComment: updatedTask.reviewComment,
  };
}

/**
 * 创建任务报告
 */
export function createTaskReport(
  type: '计划' | '进展' | '问题' | '结果' | '复盘',
  content: string,
  timestamp?: string
): TaskReport {
  return {
    id: generateId('rpt'),
    type,
    content,
    timestamp: timestamp || TODAY_STR,
  };
}

/**
 * 迁移任务数据（确保 reports 数组被正确恢复）
 */
export function migrateTask(task: any): Task {
  const reports = Array.isArray(task.reports) ? task.reports : [];
  return {
    ...task,
    reports: reports,
    status: task.status || (task.done ? 'completed' : 'todo'),
    reviewer: task.reviewer || '',
    score: task.score || undefined,
    notes: task.notes || '',
    owner: task.owner || '',
    product: task.product || '',
    channel: task.channel || '',
    priority: task.priority || 'P2',
    progress:
      task.progress !== undefined
        ? task.progress
        : task.status === 'completed' || task.status === 'confirmed'
        ? 100
        : 0,
  };
}

/**
 * 创建任务创建审计日志
 */
export function createTaskCreateLog(
  taskText: string,
  parentStrategyName: string,
  userName: string
): AuditLog {
  return {
    id: generateId('log'),
    userId: '', // 需要从外部传入
    userName,
    action: 'CREATE',
    targetType: 'TASK',
    targetName: taskText,
    details: `Added task to ${parentStrategyName}`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 创建任务更新审计日志
 */
export function createTaskUpdateLog(
  taskText: string,
  oldStatus: TaskStatus,
  newStatus: TaskStatus,
  userName: string
): AuditLog {
  return {
    id: generateId('log'),
    userId: '', // 需要从外部传入
    userName,
    action: 'UPDATE',
    targetType: 'TASK',
    targetName: taskText,
    details: `Status changed: ${oldStatus} -> ${newStatus}`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 创建任务删除审计日志
 */
export function createTaskDeleteLog(
  taskText: string,
  userName: string
): AuditLog {
  return {
    id: generateId('log'),
    userId: '', // 需要从外部传入
    userName,
    action: 'DELETE',
    targetType: 'TASK',
    targetName: taskText,
    details: 'Deleted task',
    timestamp: new Date().toISOString(),
  };
}
