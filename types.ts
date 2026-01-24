
export type Level = 1 | 2 | 3;

export type ReportTag = '计划' | '进展' | '问题' | '结果' | '复盘';

export type TaskFrequency = 'once' | 'weekly' | 'monthly';

export type TaskStatus = 'todo' | 'in_progress' | 'completed' | 'confirmed';

export interface Metric {
  id: string;
  label: string;
  value: string;
  description?: string;
}

export interface ReportItem {
  id: string;
  type: ReportTag;
  content: string;
}

export interface TaskReport {
  id: string;
  type: ReportTag;
  content: string;
  timestamp: string;
}

// 独立的执行任务，不再嵌套在 ProjectItem 中
export interface Task {
  id: string;
  parentId: string; // 关联到 L3 ID
  rootId: string;   // 关联到 L1 ID (方便全局筛选)
  text: string;
  start: string;
  end: string;
  
  // v2.5 Updated Status Workflow
  status: TaskStatus; // 'todo' | 'in_progress' | 'completed' | 'confirmed'
  progress: number;   // 0-100 Completion Degree

  owner: string;    // 执行人
  product: string;
  channel: string;
  priority: 'P0' | 'P1' | 'P2';
  
  // v2.5 Review & Scoring
  reviewer?: string;      // 指定审核人
  score?: number;         // 评分 (0-100)
  reviewComment?: string; // 审核评语

  notes: string;    // 简报/备注
  reports: TaskReport[]; // 多次汇报记录
  
  // v2.6 Drag & Drop
  order?: number;   // 排序顺序（用于拖拽排序）
}

// 策略树节点 (L1-L3)
export interface StrategyNode {
  id: string;
  level: Level;
  name: string;
  parentId: string | null; // 指向父级策略
  group?: string;          // A/B Testing 标识 (e.g. "Plan A", "Plan B")
  start: string;
  end: string;
  owner: string;
  metrics: Metric[];
  status: 'active' | 'completed' | 'delayed';
  
  // v2.2 Added fields for Modal
  channel?: string;
  product?: string;
  tags?: string[];
  description?: string; // 补充说明
  
  // v2.7 Strategy Review & Scoring
  reviewer?: string;      // 审核人
  score?: number;         // 评分 (0-100)
  reviewComment?: string; // 审核评语
}

// v2.4 Authentication & Logging
export interface User {
  id: string;
  username: string; // 登录用户名（唯一标识）
  password: string; // In a real app, this would be hashed
  role: 'Admin' | 'User' | 'Viewer';
  avatarColor: string;
  displayName?: string; // 显示名称（用于 owner 字段，可自定义）
  email?: string; // 注册邮箱（与登录用户名分开）
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE' | 'REPORT';
  targetType: 'STRATEGY' | 'TASK' | 'SYSTEM';
  targetName: string;
  details: string;
  timestamp: string;
}
