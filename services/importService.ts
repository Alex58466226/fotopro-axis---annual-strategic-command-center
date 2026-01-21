/**
 * 数据导入服务
 * 支持从 CSV 和 JSON 文件导入数据
 * 
 * 功能：
 * - CSV 解析（与导出格式对应）
 * - JSON 解析（完整数据备份）
 * - 数据验证
 * - 数据合并策略（覆盖/追加/跳过）
 */

import { StrategyNode, Task, TaskReport, ReportTag } from '../types';

/**
 * 导入结果
 */
export interface ImportResult {
  success: boolean;
  strategies: StrategyNode[];
  tasks: Task[];
  errors: string[];
  warnings: string[];
  stats: {
    strategiesAdded: number;
    strategiesUpdated: number;
    strategiesSkipped: number;
    tasksAdded: number;
    tasksUpdated: number;
    tasksSkipped: number;
    reportsAdded: number;
  };
}

/**
 * 合并策略
 */
export type MergeStrategy = 'overwrite' | 'append' | 'skip';

/**
 * CSV 行数据（与导出格式对应）
 */
interface CSVRow {
  Level: string;
  'L1 Name': string;
  'L2 Name': string;
  'L3 Name': string;
  'L4 Task ID': string;
  'L4 Task Content': string;
  'Task Status': string;
  'Task Progress': string;
  'Task Priority': string;
  'Task Owner': string;
  'Task Start Date': string;
  'Task End Date': string;
  'Task Product': string;
  'Task Channel': string;
  'Task Score': string;
  'Task Reviewer': string;
  'Task Notes': string;
  'Report ID': string;
  'Report Type': string;
  'Report Content': string;
  'Report Timestamp': string;
}

/**
 * 解析 CSV 文件
 */
export function parseCSV(csvText: string): CSVRow[] {
  const lines = csvText.split(/\r?\n/).filter(line => line.trim());
  if (lines.length === 0) {
    throw new Error('CSV 文件为空');
  }

  // 解析表头
  const headers = parseCSVLine(lines[0]);
  const headerMap = new Map<string, number>();
  headers.forEach((h, i) => headerMap.set(h.trim(), i));

  // 验证必需字段
  const requiredFields = ['Level', 'L1 Name'];
  for (const field of requiredFields) {
    if (!headerMap.has(field)) {
      throw new Error(`CSV 文件缺少必需字段: ${field}`);
    }
  }

  // 解析数据行
  const rows: CSVRow[] = [];
  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === 0) continue;

    const row: any = {};
    headers.forEach((header, index) => {
      row[header.trim()] = values[index] || '';
    });
    rows.push(row as CSVRow);
  }

  return rows;
}

/**
 * 解析 CSV 行（处理引号和逗号）
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // 转义的引号
        current += '"';
        i++; // 跳过下一个引号
      } else {
        // 开始或结束引号
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      // 字段分隔符
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current); // 最后一个字段

  return result;
}

/**
 * 从 CSV 数据导入策略和任务
 */
export function importFromCSV(
  csvRows: CSVRow[],
  existingStrategies: StrategyNode[],
  existingTasks: Task[],
  mergeStrategy: MergeStrategy = 'append'
): ImportResult {
  const result: ImportResult = {
    success: true,
    strategies: [...existingStrategies],
    tasks: [...existingTasks],
    errors: [],
    warnings: [],
    stats: {
      strategiesAdded: 0,
      strategiesUpdated: 0,
      strategiesSkipped: 0,
      tasksAdded: 0,
      tasksUpdated: 0,
      tasksSkipped: 0,
      reportsAdded: 0,
    },
  };

  // 创建现有数据的索引
  const strategyMap = new Map<string, StrategyNode>();
  existingStrategies.forEach(s => strategyMap.set(s.id, s));
  
  const taskMap = new Map<string, Task>();
  existingTasks.forEach(t => taskMap.set(t.id, t));

  // 用于构建策略层级关系
  const strategyNameMap = new Map<string, StrategyNode>(); // name -> strategy
  const strategyHierarchy: { [level: number]: Map<string, StrategyNode> } = {
    1: new Map(),
    2: new Map(),
    3: new Map(),
  };

  // 用于收集任务和报告
  const taskReportsMap = new Map<string, TaskReport[]>(); // taskId -> reports[]

  // 第一遍：处理策略（L1-L3）
  for (const row of csvRows) {
    const level = row.Level.trim();
    if (!level.startsWith('L') || level === 'L4') continue;

    const levelNum = parseInt(level.substring(1)) as 1 | 2 | 3;
    if (![1, 2, 3].includes(levelNum)) {
      result.warnings.push(`无效的层级: ${level}`);
      continue;
    }

    const name = row['L1 Name']?.trim() || row['L2 Name']?.trim() || row['L3 Name']?.trim() || '';
    if (!name) {
      result.warnings.push(`层级 ${level} 缺少名称`);
      continue;
    }

    // 构建策略 ID（如果不存在）
    const strategyKey = `${level}-${name}`;
    let strategy = strategyHierarchy[levelNum].get(strategyKey);

    if (!strategy) {
      // 查找是否已存在同名策略
      const existing = Array.from(strategyMap.values()).find(
        s => s.level === levelNum && s.name === name
      );

      if (existing) {
        strategy = existing;
      } else {
        // 创建新策略
        const parentId = levelNum === 1 ? null : 
          levelNum === 2 ? (strategyHierarchy[1].values().next().value?.id || null) :
          (strategyHierarchy[2].values().next().value?.id || null);

        // 找到根节点 ID（L1）
        let rootId: string | null = null;
        if (levelNum === 1) {
          rootId = null; // L1 没有根节点
        } else {
          const l1Strategy = Array.from(strategyHierarchy[1].values()).next().value;
          rootId = l1Strategy?.id || null;
        }

        strategy = {
          id: `L${levelNum}-${Date.now()}-${Math.floor(Math.random() * 999)}`,
          level: levelNum,
          name,
          parentId,
          start: row['Task Start Date'] || new Date().toISOString().split('T')[0],
          end: row['Task End Date'] || new Date().toISOString().split('T')[0],
          owner: row['Task Owner'] || '',
          metrics: [],
          status: 'active',
          channel: row['Task Channel'] || '',
          product: row['Task Product'] || '',
          description: row['Task Notes'] || '',
        };

        result.stats.strategiesAdded++;
      }
    } else if (mergeStrategy === 'overwrite') {
      // 更新现有策略
      strategy.start = row['Task Start Date'] || strategy.start;
      strategy.end = row['Task End Date'] || strategy.end;
      strategy.owner = row['Task Owner'] || strategy.owner;
      strategy.channel = row['Task Channel'] || strategy.channel;
      strategy.product = row['Task Product'] || strategy.product;
      strategy.description = row['Task Notes'] || strategy.description;
      result.stats.strategiesUpdated++;
    } else if (mergeStrategy === 'skip') {
      result.stats.strategiesSkipped++;
      continue;
    }

    strategyHierarchy[levelNum].set(strategyKey, strategy);
    strategyNameMap.set(name, strategy);

    // 添加到结果中（如果不存在）
    if (!strategyMap.has(strategy.id)) {
      result.strategies.push(strategy);
      strategyMap.set(strategy.id, strategy);
    }
  }

  // 第二遍：处理任务（L4）和报告
  for (const row of csvRows) {
    if (row.Level.trim() !== 'L4') continue;

    const taskId = row['L4 Task ID']?.trim();
    const taskContent = row['L4 Task Content']?.trim();

    if (!taskId && !taskContent) {
      result.warnings.push('任务行缺少 ID 和内容');
      continue;
    }

    // 查找或创建任务
    let task = taskId ? taskMap.get(taskId) : undefined;
    
    if (!task) {
      // 需要从策略名称找到对应的 L3 策略
      const l3Name = row['L3 Name']?.trim();
      const l3Strategy = l3Name ? Array.from(strategyMap.values()).find(
        s => s.level === 3 && s.name === l3Name
      ) : null;

      if (!l3Strategy) {
        result.errors.push(`找不到 L3 策略: ${l3Name}，任务 "${taskContent}" 无法导入`);
        continue;
      }

      // 找到根节点 ID（L1）
      let rootId = l3Strategy.id;
      let current: StrategyNode | null = l3Strategy;
      while (current && current.level !== 1) {
        const parent = Array.from(strategyMap.values()).find(s => s.id === current!.parentId);
        if (parent) {
          current = parent;
          if (parent.level === 1) {
            rootId = parent.id;
            break;
          }
        } else {
          break;
        }
      }

      // 创建新任务
      task = {
        id: taskId || `t-${Date.now()}-${Math.floor(Math.random() * 999)}`,
        parentId: l3Strategy.id,
        rootId,
        text: taskContent || '',
        start: row['Task Start Date'] || new Date().toISOString().split('T')[0],
        end: row['Task End Date'] || new Date().toISOString().split('T')[0],
        status: (row['Task Status'] as any) || 'todo',
        progress: parseInt(row['Task Progress']) || 0,
        priority: (row['Task Priority'] as any) || 'P2',
        owner: row['Task Owner'] || '',
        product: row['Task Product'] || '',
        channel: row['Task Channel'] || '',
        score: row['Task Score'] ? parseInt(row['Task Score']) : undefined,
        reviewer: row['Task Reviewer'] || undefined,
        notes: row['Task Notes'] || '',
        reports: [],
      };

      result.stats.tasksAdded++;
      result.tasks.push(task);
      taskMap.set(task.id, task);
    } else if (mergeStrategy === 'overwrite') {
      // 更新现有任务
      task.text = taskContent || task.text;
      task.start = row['Task Start Date'] || task.start;
      task.end = row['Task End Date'] || task.end;
      task.status = (row['Task Status'] as any) || task.status;
      task.progress = parseInt(row['Task Progress']) || task.progress;
      task.priority = (row['Task Priority'] as any) || task.priority;
      task.owner = row['Task Owner'] || task.owner;
      task.product = row['Task Product'] || task.product;
      task.channel = row['Task Channel'] || task.channel;
      task.score = row['Task Score'] ? parseInt(row['Task Score']) : task.score;
      task.reviewer = row['Task Reviewer'] || task.reviewer;
      task.notes = row['Task Notes'] || task.notes;
      result.stats.tasksUpdated++;
    } else if (mergeStrategy === 'skip') {
      result.stats.tasksSkipped++;
    }

    // 处理报告
    const reportId = row['Report ID']?.trim();
    const reportType = row['Report Type']?.trim() as ReportTag;
    const reportContent = row['Report Content']?.trim();
    const reportTimestamp = row['Report Timestamp']?.trim();

    if (reportId && reportType && reportContent) {
      if (!taskReportsMap.has(task.id)) {
        taskReportsMap.set(task.id, []);
      }

      const report: TaskReport = {
        id: reportId,
        type: reportType,
        content: reportContent,
        timestamp: reportTimestamp || new Date().toISOString(),
      };

      taskReportsMap.get(task.id)!.push(report);
      result.stats.reportsAdded++;
    }
  }

  // 将报告添加到任务
  taskReportsMap.forEach((reports, taskId) => {
    const task = taskMap.get(taskId);
    if (task) {
      if (mergeStrategy === 'overwrite') {
        task.reports = reports;
      } else {
        task.reports = [...(task.reports || []), ...reports];
      }
    }
  });

  // 如果有错误，标记为失败
  if (result.errors.length > 0) {
    result.success = false;
  }

  return result;
}

/**
 * 从 JSON 文件导入完整数据
 */
export function importFromJSON(
  jsonData: any,
  existingStrategies: StrategyNode[],
  existingTasks: Task[],
  mergeStrategy: MergeStrategy = 'append'
): ImportResult {
  const result: ImportResult = {
    success: true,
    strategies: [...existingStrategies],
    tasks: [...existingTasks],
    errors: [],
    warnings: [],
    stats: {
      strategiesAdded: 0,
      strategiesUpdated: 0,
      strategiesSkipped: 0,
      tasksAdded: 0,
      tasksUpdated: 0,
      tasksSkipped: 0,
      reportsAdded: 0,
    },
  };

  // 验证 JSON 结构
  if (!jsonData || typeof jsonData !== 'object') {
    result.errors.push('JSON 数据格式无效');
    result.success = false;
    return result;
  }

  const importedStrategies: StrategyNode[] = Array.isArray(jsonData.strategies) ? jsonData.strategies : [];
  const importedTasks: Task[] = Array.isArray(jsonData.tasks) ? jsonData.tasks : [];

  // 创建现有数据索引
  const strategyMap = new Map<string, StrategyNode>();
  existingStrategies.forEach(s => strategyMap.set(s.id, s));

  const taskMap = new Map<string, Task>();
  existingTasks.forEach(t => taskMap.set(t.id, t));

  // 处理策略
  for (const strategy of importedStrategies) {
    const existing = strategyMap.get(strategy.id);

    if (!existing) {
      result.strategies.push(strategy);
      result.stats.strategiesAdded++;
    } else if (mergeStrategy === 'overwrite') {
      Object.assign(existing, strategy);
      result.stats.strategiesUpdated++;
    } else if (mergeStrategy === 'skip') {
      result.stats.strategiesSkipped++;
    }
  }

  // 处理任务
  for (const task of importedTasks) {
    const existing = taskMap.get(task.id);

    if (!existing) {
      result.tasks.push(task);
      result.stats.tasksAdded++;
      if (task.reports) {
        result.stats.reportsAdded += task.reports.length;
      }
    } else if (mergeStrategy === 'overwrite') {
      Object.assign(existing, task);
      result.stats.tasksUpdated++;
      if (task.reports) {
        result.stats.reportsAdded += task.reports.length;
      }
    } else if (mergeStrategy === 'skip') {
      result.stats.tasksSkipped++;
    }
  }

  return result;
}

/**
 * 验证导入的数据
 */
export function validateImportData(
  strategies: StrategyNode[],
  tasks: Task[]
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // 验证策略
  for (const strategy of strategies) {
    if (!strategy.id || !strategy.name || !strategy.level) {
      errors.push(`策略数据不完整: ${strategy.name || strategy.id}`);
    }
    if (![1, 2, 3].includes(strategy.level)) {
      errors.push(`策略层级无效: ${strategy.level}`);
    }
  }

  // 验证任务
  for (const task of tasks) {
    if (!task.id || !task.text || !task.parentId) {
      errors.push(`任务数据不完整: ${task.text || task.id}`);
    }
    if (!Array.isArray(task.reports)) {
      errors.push(`任务报告格式错误: ${task.id}`);
    }
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}
