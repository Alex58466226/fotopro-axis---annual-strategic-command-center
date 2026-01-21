/**
 * 策略服务
 * 处理策略相关的业务逻辑
 */

import { StrategyNode, Level, Metric, AuditLog } from '../types';
import { PROJECT_START, PROJECT_END, TODAY_STR } from '../constants';

/**
 * 生成唯一 ID
 */
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 999)}`;

/**
 * 创建新策略节点
 */
export interface CreateStrategyParams {
  name: string;
  level: Level;
  parentId: string | null;
  owner: string;
  group?: string;
  channel?: string;
  product?: string;
  tags?: string[];
  start?: string;
  end?: string;
  metrics?: Metric[];
}

export function createStrategy(params: CreateStrategyParams): StrategyNode {
  return {
    id: generateId(`L${params.level}`),
    level: params.level,
    name: params.name,
    parentId: params.parentId,
    owner: params.owner || '待定',
    group: params.group || '',
    channel: params.channel || '',
    product: params.product || '',
    tags: params.tags || [],
    start: params.start || TODAY_STR,
    end: params.end || PROJECT_END,
    metrics: params.metrics || [],
    status: 'active',
  };
}

/**
 * 更新策略节点
 */
export interface UpdateStrategyParams {
  id: string;
  name?: string;
  parentId?: string | null;
  owner?: string;
  group?: string;
  channel?: string;
  product?: string;
  tags?: string[];
  start?: string;
  end?: string;
  metrics?: Metric[];
}

export function updateStrategy(
  existing: StrategyNode,
  updates: UpdateStrategyParams
): StrategyNode {
  return {
    ...existing,
    name: updates.name ?? existing.name,
    parentId: updates.parentId !== undefined ? updates.parentId : existing.parentId,
    owner: updates.owner ?? existing.owner,
    group: updates.group ?? existing.group,
    channel: updates.channel ?? existing.channel,
    product: updates.product ?? existing.product,
    tags: updates.tags ?? existing.tags,
    start: updates.start ?? existing.start,
    end: updates.end ?? existing.end,
    metrics: updates.metrics ?? existing.metrics,
  };
}

/**
 * 获取策略节点的所有后代 ID（包括自身）
 */
export function getDescendantIds(
  nodeId: string,
  strategies: StrategyNode[]
): string[] {
  const children = strategies.filter(s => s.parentId === nodeId);
  let ids = [nodeId];
  children.forEach(c => {
    ids = [...ids, ...getDescendantIds(c.id, strategies)];
  });
  return ids;
}

/**
 * 验证策略数据
 */
export interface ValidateStrategyResult {
  valid: boolean;
  error?: string;
}

export function validateStrategy(
  name: string,
  level: Level,
  parentId: string | null,
  strategies: StrategyNode[]
): ValidateStrategyResult {
  if (!name || !name.trim()) {
    return {
      valid: false,
      error: '策略名称不能为空',
    };
  }

  if (level !== 1 && !parentId) {
    return {
      valid: false,
      error: 'L2/L3 策略必须选择父节点',
    };
  }

  // 验证父节点是否存在
  if (parentId) {
    const parent = strategies.find(s => s.id === parentId);
    if (!parent) {
      return {
        valid: false,
        error: '父节点不存在',
      };
    }

    // 验证层级关系
    if (parent.level !== level - 1) {
      return {
        valid: false,
        error: `L${level} 策略的父节点必须是 L${level - 1} 策略`,
      };
    }
  }

  return { valid: true };
}

/**
 * 解析标签字符串为数组
 */
export function parseTags(tagsString: string): string[] {
  if (!tagsString) return [];
  return tagsString
    .split(/[，,;；]/)
    .map(t => t.trim())
    .filter(Boolean);
}

/**
 * 清理指标数据（移除空指标）
 */
export function cleanMetrics(metrics: Metric[]): Metric[] {
  return metrics.filter(m => m.label && m.value);
}

/**
 * 创建策略创建审计日志
 */
export function createStrategyCreateLog(
  strategy: StrategyNode,
  userName: string
): AuditLog {
  return {
    id: generateId('log'),
    userId: '', // 需要从外部传入
    userName,
    action: 'CREATE',
    targetType: 'STRATEGY',
    targetName: strategy.name,
    details: `Created Level ${strategy.level} strategy`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 创建策略更新审计日志
 */
export function createStrategyUpdateLog(
  strategyName: string,
  userName: string
): AuditLog {
  return {
    id: generateId('log'),
    userId: '', // 需要从外部传入
    userName,
    action: 'UPDATE',
    targetType: 'STRATEGY',
    targetName: strategyName,
    details: 'Updated strategy details',
    timestamp: new Date().toISOString(),
  };
}

/**
 * 创建策略删除审计日志
 */
export function createStrategyDeleteLog(
  strategyName: string,
  descendantCount: number,
  userName: string
): AuditLog {
  return {
    id: generateId('log'),
    userId: '', // 需要从外部传入
    userName,
    action: 'DELETE',
    targetType: 'STRATEGY',
    targetName: strategyName,
    details: `Deleted strategy and ${descendantCount} descendants`,
    timestamp: new Date().toISOString(),
  };
}
