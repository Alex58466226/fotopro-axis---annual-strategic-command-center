/**
 * Supabase 数据服务
 * 处理策略、任务、报告、审计日志的数据库操作
 */

import { supabase } from './supabaseClient';
import { StrategyNode, Task, TaskReport, AuditLog, Metric, User, ReportTag } from '../types';

// 生成唯一 ID
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 999)}`;

/**
 * 策略数据操作
 */
export async function loadStrategies(): Promise<StrategyNode[]> {
  try {
    const { data, error } = await supabase
      .from('strategies')
      .select('*')
      .order('level', { ascending: true })
      .order('created_at', { ascending: true });

    if (error) {
      console.error('加载策略数据失败:', error);
      return [];
    }

    if (!data) {
      console.log('Supabase strategies 表为空，返回空数组');
      return [];
    }

    console.log('从 Supabase 查询到', data.length, '条策略记录');

    // 转换数据格式
    return data.map((row: any) => ({
      id: row.id,
      level: row.level as 1 | 2 | 3,
      name: row.name,
      parentId: row.parent_id,
      start: row.start || '',
      end: row.end || '',
      owner: row.owner || '',
      status: row.status || 'active',
      channel: row.channel || '',
      product: row.product || '',
      tags: Array.isArray(row.tags) ? row.tags : [],
      description: row.description || '',
      metrics: Array.isArray(row.metrics) ? row.metrics : [],
      reviewer: row.reviewer || undefined,
      score: row.score !== null && row.score !== undefined ? row.score : undefined,
      reviewComment: row.review_comment || undefined,
    }));
  } catch (error: any) {
    console.error('加载策略数据异常:', error);
    return [];
  }
}

export async function saveStrategies(strategies: StrategyNode[]): Promise<{ success: boolean; error?: string }> {
  try {
    if (strategies.length === 0) {
      console.log('策略数组为空，跳过保存');
      return { success: true };
    }

    const rows = strategies.map(s => ({
      id: s.id,
      level: s.level,
      name: s.name,
      parent_id: s.parentId || null,
      start: s.start || null,
      end: s.end || null,
      owner: s.owner || null,
      status: s.status || 'active',
      channel: s.channel || null,
      product: s.product || null,
      tags: s.tags || [],
      description: s.description || null,
      metrics: s.metrics || [],
      reviewer: s.reviewer || null,
      score: s.score !== null && s.score !== undefined ? s.score : null,
      review_comment: s.reviewComment || null,
    }));

    const { error } = await supabase
      .from('strategies')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('保存策略数据失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('保存策略数据异常:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteStrategy(strategyId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('strategies')
      .delete()
      .eq('id', strategyId);

    if (error) {
      console.error('删除策略失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('删除策略异常:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 任务数据操作
 */
export async function loadTasks(): Promise<Task[]> {
  try {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) {
      console.error('加载任务数据失败:', error);
      return [];
    }

    if (!data) {
      console.log('Supabase tasks 表为空，返回空数组');
      return [];
    }

    console.log('从 Supabase 查询到', data.length, '条任务记录');

    // 获取所有任务的 ID
    const taskIds = data.map((row: any) => row.id);

    // 从 task_reports 表加载所有报告
    let allReports: any[] = [];
    if (taskIds.length > 0) {
      const { data: reportsData, error: reportsError } = await supabase
        .from('task_reports')
        .select('*')
        .in('task_id', taskIds)
        .order('timestamp', { ascending: true });

      if (reportsError) {
        console.error('加载任务报告失败:', reportsError);
      } else if (reportsData) {
        allReports = reportsData;
        console.log('从 Supabase 查询到', allReports.length, '条报告记录');
      }
    }

    // 按 task_id 分组报告
    const reportsByTaskId = new Map<string, TaskReport[]>();
    allReports.forEach((r: any) => {
      if (!reportsByTaskId.has(r.task_id)) {
        reportsByTaskId.set(r.task_id, []);
      }
      reportsByTaskId.get(r.task_id)!.push({
        id: r.id,
        type: r.type as ReportTag,
        content: r.content || '',
        timestamp: r.timestamp || new Date().toISOString(),
      });
    });

    // 转换数据格式
    return data.map((row: any) => {
      // 从分组中获取该任务的报告
      const reports = reportsByTaskId.get(row.id) || [];

      return {
        id: row.id,
        parentId: row.parent_id,
        rootId: row.root_id || row.parent_id,
        text: row.text,
        status: row.status as TaskStatus,
        progress: row.progress || 0,
        priority: row.priority || 'P2',
        owner: row.owner || '',
        start: row.start || '',
        end: row.end || '',
        product: row.product || '',
        channel: row.channel || '',
        score: row.score !== null && row.score !== undefined ? row.score : undefined,
        reviewer: row.reviewer || undefined,
        reviewComment: row.review_comment || undefined,
        notes: row.notes || '',
        reports,
        order: row.order !== null && row.order !== undefined ? row.order : undefined,
      };
    });
  } catch (error: any) {
    console.error('加载任务数据异常:', error);
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<{ success: boolean; error?: string }> {
  try {
    if (tasks.length === 0) {
      console.log('任务数组为空，跳过保存');
      return { success: true };
    }

    // 准备任务数据（不包含 reports）
    const rows = tasks.map(t => ({
      id: t.id,
      parent_id: t.parentId,
      root_id: t.rootId || t.parentId,
      text: t.text,
      status: t.status,
      progress: t.progress || 0,
      priority: t.priority || 'P2',
      owner: t.owner || null,
      start: t.start || null,
      end: t.end || null,
      product: t.product || null,
      channel: t.channel || null,
      score: t.score !== null && t.score !== undefined ? t.score : null,
      reviewer: t.reviewer || null,
      review_comment: t.reviewComment || null,
      notes: t.notes || null,
      // order 字段：如果未定义，不包含该字段
      ...(t.order !== null && t.order !== undefined ? { order: t.order } : {}),
    }));

    // 保存任务数据
    const { error: tasksError } = await supabase
      .from('tasks')
      .upsert(rows, { onConflict: 'id' });

    if (tasksError) {
      console.error('保存任务数据失败:', tasksError);
      return { success: false, error: tasksError.message };
    }

    // 准备报告数据
    const reportRows: Array<{
      id: string;
      task_id: string;
      type: string;
      content: string;
      timestamp: string;
    }> = [];

    tasks.forEach(task => {
      if (task.reports && Array.isArray(task.reports)) {
        task.reports.forEach(report => {
          reportRows.push({
            id: report.id || generateId('rpt'),
            task_id: task.id,
            type: report.type,
            content: report.content || '',
            timestamp: report.timestamp || new Date().toISOString(),
          });
        });
      }
    });

    // 保存报告数据（先删除旧报告，再插入新报告）
    if (reportRows.length > 0) {
      const taskIds = tasks.map(t => t.id);
      
      // 删除这些任务的所有旧报告
      const { error: deleteError } = await supabase
        .from('task_reports')
        .delete()
        .in('task_id', taskIds);

      if (deleteError) {
        console.error('删除旧报告失败:', deleteError);
        // 继续执行，不中断流程
      }

      // 插入新报告
      const { error: reportsError } = await supabase
        .from('task_reports')
        .insert(reportRows);

      if (reportsError) {
        console.error('保存任务报告失败:', reportsError);
        return { success: false, error: reportsError.message };
      }
    } else {
      // 如果没有报告，删除所有相关任务的旧报告
      const taskIds = tasks.map(t => t.id);
      if (taskIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('task_reports')
          .delete()
          .in('task_id', taskIds);

        if (deleteError) {
          console.error('删除旧报告失败:', deleteError);
          // 继续执行，不中断流程
        }
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('保存任务数据异常:', error);
    return { success: false, error: error.message };
  }
}

export async function deleteTask(taskId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (error) {
      console.error('删除任务失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('删除任务异常:', error);
    return { success: false, error: error.message };
  }
}

/**
 * 审计日志数据操作
 */
export async function loadAuditLogs(): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(500);

    if (error) {
      console.error('加载审计日志失败:', error);
      return [];
    }

    if (!data) {
      return [];
    }

    return data.map((row: any) => ({
      id: row.id,
      userId: row.user_id || '',
      userName: row.user_name || '',
      action: row.action,
      targetType: row.target_type,
      targetName: row.target_name,
      details: row.details || '',
      timestamp: row.timestamp,
    }));
  } catch (error: any) {
    console.error('加载审计日志异常:', error);
    return [];
  }
}

export async function saveAuditLog(log: AuditLog): Promise<{ success: boolean; error?: string }> {
  try {
    const row = {
      id: log.id,
      user_id: log.userId || null,
      user_name: log.userName,
      action: log.action,
      target_type: log.targetType,
      target_name: log.targetName,
      details: log.details,
      timestamp: log.timestamp,
    };

    const { error } = await supabase
      .from('audit_logs')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('保存审计日志失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('保存审计日志异常:', error);
    return { success: false, error: error.message || '保存失败' };
  }
}

export async function saveAuditLogs(logs: AuditLog[]): Promise<{ success: boolean; error?: string }> {
  try {
    if (logs.length === 0) return { success: true };

    const rows = logs.map(log => ({
      id: log.id,
      user_id: log.userId || null,
      user_name: log.userName,
      action: log.action,
      target_type: log.targetType,
      target_name: log.targetName,
      details: log.details,
      timestamp: log.timestamp,
    }));

    const { error } = await supabase
      .from('audit_logs')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('保存审计日志失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('保存审计日志异常:', error);
    return { success: false, error: error.message || '保存失败' };
  }
}

/**
 * 更新用户 Profile 信息（显示名称和邮箱）
 */
export async function updateUserProfile(
  userId: string,
  updates: { displayName?: string; email?: string }
): Promise<{ success: boolean; error?: string }> {
  try {
    const updateData: any = {};
    if (updates.displayName !== undefined) {
      updateData.display_name = updates.displayName.trim() || null;
    }
    if (updates.email !== undefined) {
      updateData.email = updates.email.trim() || null;
    }

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', userId);

    if (error) {
      console.error('更新用户信息失败:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error: any) {
    console.error('更新用户信息异常:', error);
    return { success: false, error: error.message };
  }
}
