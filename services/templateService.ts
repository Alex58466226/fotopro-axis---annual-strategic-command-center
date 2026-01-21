/**
 * 模板生成服务
 * 用于生成导入数据的模板文件（CSV 和 JSON）
 */

import { StrategyNode, Task, TaskReport } from '../types';

/**
 * 生成 CSV 导入模板
 */
export function generateCSVTemplate(): string {
  // CSV 表头（与导出格式一致）
  const headers = [
    'Level',
    'L1 Name',
    'L2 Name',
    'L3 Name',
    'L4 Task ID',
    'L4 Task Content',
    'Task Status',
    'Task Progress',
    'Task Priority',
    'Task Owner',
    'Task Start Date',
    'Task End Date',
    'Task Product',
    'Task Channel',
    'Task Score',
    'Task Reviewer',
    'Task Notes',
    'Report ID',
    'Report Type',
    'Report Content',
    'Report Timestamp',
  ];

  // 示例数据行
  const exampleRows = [
    // L1 策略示例
    [
      'L1',
      '年度战略目标示例',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      'admin',
      '2026-01-01',
      '2026-12-31',
      '核心产品',
      '主要渠道',
      '',
      '',
      '这是 L1 策略的描述',
      '',
      '',
      '',
      '',
    ],
    // L2 策略示例
    [
      'L2',
      '年度战略目标示例',
      'Q1 业务策略',
      '',
      '',
      '',
      '',
      '',
      '',
      'admin',
      '2026-01-01',
      '2026-03-31',
      '核心产品',
      '主要渠道',
      '',
      '',
      '这是 L2 策略的描述',
      '',
      '',
      '',
      '',
    ],
    // L3 策略示例
    [
      'L3',
      '年度战略目标示例',
      'Q1 业务策略',
      '产品功能优化项目',
      '',
      '',
      '',
      '',
      '',
      'admin',
      '2026-01-01',
      '2026-02-28',
      '核心产品',
      '主要渠道',
      '',
      '',
      '这是 L3 策略的描述',
      '',
      '',
      '',
      '',
    ],
    // L4 任务示例（无报告）
    [
      'L4',
      '年度战略目标示例',
      'Q1 业务策略',
      '产品功能优化项目',
      't-example-1',
      '完成用户界面优化',
      'in_progress',
      '50',
      'P1',
      'admin',
      '2026-01-15',
      '2026-02-15',
      '核心产品',
      '主要渠道',
      '',
      '',
      '任务备注说明',
      '',
      '',
      '',
      '',
    ],
    // L4 任务示例（有报告）
    [
      'L4',
      '年度战略目标示例',
      'Q1 业务策略',
      '产品功能优化项目',
      't-example-1',
      '完成用户界面优化',
      'in_progress',
      '50',
      'P1',
      'admin',
      '2026-01-15',
      '2026-02-15',
      '核心产品',
      '主要渠道',
      '',
      '',
      '任务备注说明',
      'rpt-1',
      '进展',
      '已完成 50% 的界面优化工作，预计下周完成剩余部分',
      '2026-01-20T10:00:00.000Z',
    ],
    // L4 任务的第二个报告
    [
      'L4',
      '年度战略目标示例',
      'Q1 业务策略',
      '产品功能优化项目',
      't-example-1',
      '完成用户界面优化',
      'in_progress',
      '50',
      'P1',
      'admin',
      '2026-01-15',
      '2026-02-15',
      '核心产品',
      '主要渠道',
      '',
      '',
      '任务备注说明',
      'rpt-2',
      '问题',
      '遇到技术难点，需要额外时间',
      '2026-01-25T14:30:00.000Z',
    ],
  ];

  // 转义 CSV 字段
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // 构建 CSV 内容
  const csvLines = [
    headers.join(','),
    ...exampleRows.map(row => row.map(escapeCSV).join(',')),
  ];

  return csvLines.join('\r\n');
}

/**
 * 生成 JSON 导入模板
 */
export function generateJSONTemplate(): string {
  const template: {
    strategies: StrategyNode[];
    tasks: Task[];
  } = {
    strategies: [
      {
        id: 'L1-example-1',
        level: 1,
        name: '年度战略目标示例',
        parentId: null,
        start: '2026-01-01',
        end: '2026-12-31',
        owner: 'admin',
        metrics: [],
        status: 'active',
        channel: '主要渠道',
        product: '核心产品',
        description: '这是 L1 策略的描述',
      },
      {
        id: 'L2-example-1',
        level: 2,
        name: 'Q1 业务策略',
        parentId: 'L1-example-1',
        start: '2026-01-01',
        end: '2026-03-31',
        owner: 'admin',
        metrics: [],
        status: 'active',
        channel: '主要渠道',
        product: '核心产品',
        description: '这是 L2 策略的描述',
      },
      {
        id: 'L3-example-1',
        level: 3,
        name: '产品功能优化项目',
        parentId: 'L2-example-1',
        start: '2026-01-01',
        end: '2026-02-28',
        owner: 'admin',
        metrics: [],
        status: 'active',
        channel: '主要渠道',
        product: '核心产品',
        description: '这是 L3 策略的描述',
      },
    ],
    tasks: [
      {
        id: 't-example-1',
        parentId: 'L3-example-1',
        rootId: 'L1-example-1',
        text: '完成用户界面优化',
        start: '2026-01-15',
        end: '2026-02-15',
        status: 'in_progress',
        progress: 50,
        priority: 'P1',
        owner: 'admin',
        product: '核心产品',
        channel: '主要渠道',
        notes: '任务备注说明',
        reports: [
          {
            id: 'rpt-1',
            type: '进展',
            content: '已完成 50% 的界面优化工作，预计下周完成剩余部分',
            timestamp: '2026-01-20T10:00:00.000Z',
          },
          {
            id: 'rpt-2',
            type: '问题',
            content: '遇到技术难点，需要额外时间',
            timestamp: '2026-01-25T14:30:00.000Z',
          },
        ],
      },
    ],
  };

  return JSON.stringify(template, null, 2);
}

/**
 * 下载模板文件
 */
export function downloadTemplate(type: 'csv' | 'json'): void {
  let content: string;
  let filename: string;
  let mimeType: string;

  if (type === 'csv') {
    content = generateCSVTemplate();
    filename = `fotopro_import_template_${new Date().toISOString().split('T')[0]}.csv`;
    mimeType = 'text/csv;charset=utf-8;';
  } else {
    content = generateJSONTemplate();
    filename = `fotopro_import_template_${new Date().toISOString().split('T')[0]}.json`;
    mimeType = 'application/json;charset=utf-8;';
  }

  // 添加 BOM 以支持中文（仅 CSV）
  const blob = type === 'csv'
    ? new Blob(['\uFEFF' + content], { type: mimeType })
    : new Blob([content], { type: mimeType });

  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
