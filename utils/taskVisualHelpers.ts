import { Task, TaskStatus } from '../types';
import { TODAY_STR } from '../constants';

/**
 * 任务视觉编码辅助函数
 */

// 任务状态颜色编码
export const getTaskStatusColor = (status: TaskStatus): string => {
  const colors: Record<TaskStatus, string> = {
    'todo': '#F5F5F5',        // 灰色背景
    'in_progress': '#E3F2FD', // 蓝色背景
    'completed': '#E8F5E9',  // 绿色背景
    'confirmed': '#C8E6C9',   // 深绿色背景
  };
  return colors[status] || colors.todo;
};

// 任务状态边框颜色
export const getTaskStatusBorderColor = (status: TaskStatus): string => {
  const colors: Record<TaskStatus, string> = {
    'todo': '#E0E0E0',
    'in_progress': '#2196F3',
    'completed': '#4CAF50',
    'confirmed': '#2E7D32',
  };
  return colors[status] || colors.todo;
};

// 优先级颜色编码
export const getPriorityColor = (priority: 'P0' | 'P1' | 'P2'): string => {
  const colors = {
    'P0': '#EF4444', // 红色
    'P1': '#F59E0B', // 黄色
    'P2': '#6B7280', // 灰色
  };
  return colors[priority] || colors.P2;
};

// 优先级图标
export const getPriorityIcon = (priority: 'P0' | 'P1' | 'P2'): string => {
  const icons = {
    'P0': '🔴',
    'P1': '🟡',
    'P2': '⚪',
  };
  return icons[priority] || icons.P2;
};

// 得分颜色编码
export const getScoreColor = (score?: number): string | null => {
  if (score === undefined || score === null) return null;
  if (score >= 80) return '#10B981'; // 绿色（高分）
  if (score >= 60) return '#F59E0B'; // 黄色（中分）
  return '#EF4444'; // 红色（低分）
};

// 得分图标
export const getScoreIcon = (score?: number): string | null => {
  if (score === undefined || score === null) return null;
  if (score >= 80) return '✓';
  if (score >= 60) return '⚠';
  return '✗';
};

// 风险标识
export interface TaskRisk {
  hasRisk: boolean;
  reasons: string[];
  level: 'high' | 'medium' | 'low' | 'none';
}

export const getTaskRisk = (task: Task): TaskRisk => {
  const reasons: string[] = [];
  let level: 'high' | 'medium' | 'low' | 'none' = 'none';

  // 低分风险
  if (task.score !== undefined && task.score < 60) {
    reasons.push('低分');
    level = 'high';
  }

  // 进度低且时间已过半
  if (task.progress < 50 && task.start && task.end) {
    const start = new Date(task.start).getTime();
    const end = new Date(task.end).getTime();
    const now = Date.now();
    const totalDuration = end - start;
    const elapsed = now - start;
    if (totalDuration > 0 && elapsed / totalDuration > 0.5) {
      reasons.push('进度滞后');
      if (level === 'none') level = 'medium';
      else if (level === 'low') level = 'medium';
    }
  }

  // 进行中但已超过计划结束时间
  if (task.status === 'in_progress' && task.end) {
    const endTime = new Date(task.end).getTime();
    if (Date.now() > endTime) {
      reasons.push('已延期');
      level = 'high';
    }
  }

  // 未开始但已过开始时间
  if (task.status === 'todo' && task.start && task.start < TODAY_STR) {
    reasons.push('未按时开始');
    if (level === 'none') level = 'low';
  }

  return {
    hasRisk: reasons.length > 0,
    reasons,
    level,
  };
};

// 风险颜色
export const getRiskColor = (risk: TaskRisk): string | null => {
  if (!risk.hasRisk) return null;
  const colors = {
    'high': '#EF4444',   // 红色
    'medium': '#F59E0B', // 黄色
    'low': '#FCD34D',   // 浅黄色
    'none': null,
  };
  return colors[risk.level] || null;
};

// 风险图标
export const getRiskIcon = (risk: TaskRisk): string | null => {
  if (!risk.hasRisk) return null;
  return '⚠';
};

// 组合任务视觉样式（用于甘特图）
export interface TaskVisualStyle {
  backgroundColor: string;
  borderColor: string;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed';
  opacity: number;
}

export const getTaskVisualStyle = (task: Task): TaskVisualStyle => {
  const statusBg = getTaskStatusColor(task.status);
  const statusBorder = getTaskStatusBorderColor(task.status);
  const priorityColor = getPriorityColor(task.priority);
  const scoreColor = getScoreColor(task.score);
  const risk = getTaskRisk(task);
  const riskColor = getRiskColor(risk);

  // 基础样式
  let backgroundColor = statusBg;
  let borderColor = statusBorder;
  let borderWidth = 1;
  let borderStyle: 'solid' | 'dashed' = 'solid';
  let opacity = 1;

  // 优先级影响边框颜色（如果优先级高）
  if (task.priority === 'P0') {
    borderColor = priorityColor;
    borderWidth = 2;
  } else if (task.priority === 'P1') {
    borderColor = priorityColor;
    borderWidth = 1.5;
  }

  // 得分影响边框（叠加）
  if (scoreColor) {
    borderColor = scoreColor;
    if (task.score && task.score < 60) {
      borderWidth = 2;
    }
  }

  // 风险影响边框（最高优先级）
  if (riskColor) {
    borderColor = riskColor;
    borderWidth = risk.level === 'high' ? 3 : 2;
    if (risk.level === 'high') {
      borderStyle = 'dashed'; // 高风险用虚线
    }
  }

  // 已完成任务降低透明度
  if (task.status === 'completed' || task.status === 'confirmed') {
    opacity = 0.7;
  }

  return {
    backgroundColor,
    borderColor,
    borderWidth,
    borderStyle,
    opacity,
  };
};
