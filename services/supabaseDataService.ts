/**
 * Supabase 数据服务
 * 处理策略、任务、报告、审计日志的数据库操作
 */

import { supabase } from './supabaseClient';
import { StrategyNode, Task, TaskReport, AuditLog, Metric } from '../types';

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
    }));
  } catch (error) {
    console.error('加载策略数据异常:', error);
    return [];
  }
}

export async function saveStrategies(strategies: StrategyNode[]): Promise<{ success: boolean; error?: string }> {
  try {
    // 检查 Supabase 配置
    const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
    const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return { 
        success: false, 
        error: 'Supabase 环境变量未配置。请在 .env.local 中配置 VITE_SUPABASE_URL 和 VITE_SUPABASE_ANON_KEY' 
      };
    }

    // 检查用户是否登录
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      return { 
        success: false, 
        error: '用户未登录。请先登录后再保存数据。' 
      };
    }

    // 转换数据格式
    const rows = strategies.map(s => ({
      id: s.id,
      level: s.level,
      name: s.name,
      parent_id: s.parentId,
      start: s.start || null,
      end: s.end || null,
      owner: s.owner || '',
      status: s.status || 'active',
      channel: s.channel || '',
      product: s.product || '',
      tags: s.tags || [],
      description: s.description || '',
      metrics: Array.isArray(s.metrics) ? s.metrics : [],
      created_by: session.user.id, // 添加创建者 ID
    }));

    // 使用 upsert 操作（如果存在则更新，不存在则插入）
    const { error } = await supabase
      .from('strategies')
      .upsert(rows, { onConflict: 'id' });

    if (error) {
      console.error('保存策略数据失败:', error);
      console.error('错误详情:', {
        message: error.message,
        details: error.details,
        hint: error.hint,
        code: error.code,
      });
      return { success: false, error: error.message || '保存失败' };
    }

    return { success: true };
  } catch (error: any) {
    console.error('保存策略数据异常:', error);
    return { success: false, error: error.message || '保存失败' };
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
    return { success: false, error: error.message || '删除失败' };
  }
}

/**
 * 任务数据操作
 */
export async function loadTasks(): Promise<Task[]> {
  try {
    // 加载任务
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .order('created_at', { ascending: true });

    if (tasksError) {
      console.error('加载任务数据失败:', tasksError);
      return [];
    }

    if (!tasksData || tasksData.length === 0) return [];

    // 加载所有报告
    const { data: reportsData, error: reportsError } = await supabase
      .from('task_reports')
      .select('*');

    if (reportsError) {
      console.error('加载报告数据失败:', reportsError);
    }

    // 构建报告映射
    const reportsMap = new Map<string, TaskReport[]>();
    if (reportsData) {
      reportsData.forEach((r: any) => {
        if (!reportsMap.has(r.task_id)) {
          reportsMap.set(r.task_id, []);
        }
        reportsMap.get(r.task_id)!.push({
          id: r.id,
          type: r.type as any,
          content: r.content,
          timestamp: r.timestamp,
        });
      });
    }

    // 转换任务数据格式
    return tasksData.map((row: any) => ({
      id: row.id,
      parentId: row.parent_id,
      rootId: row.root_id,
      text: row.text,
      start: row.start || '',
      end: row.end || '',
      status: row.status,
      progress: row.progress || 0,
      owner: row.owner || '',
      product: row.product || '',
      channel: row.channel || '',
      priority: row.priority || 'P2',
      reviewer: row.reviewer || '',
      score: row.score || undefined,
      reviewComment: row.review_comment || '',
      notes: row.notes || '',
      reports: reportsMap.get(row.id) || [],
    }));
  } catch (error) {
    console.error('加载任务数据异常:', error);
    return [];
  }
}

export async function saveTasks(tasks: Task[]): Promise<{ success: boolean; error?: string }> {
  try {
    // 转换任务数据格式
    const taskRows = tasks.map(t => ({
      id: t.id,
      parent_id: t.parentId,
      root_id: t.rootId,
      text: t.text,
      start: t.start || null,
      end: t.end || null,
      status: t.status,
      progress: t.progress || 0,
      owner: t.owner || '',
      product: t.product || '',
      channel: t.channel || '',
      priority: t.priority || 'P2',
      reviewer: t.reviewer || '',
      score: t.score !== undefined && t.score !== null ? t.score : null,
      review_comment: t.reviewComment || '',
      notes: t.notes || '',
    }));

    // 保存任务
    const { error: tasksError } = await supabase
      .from('tasks')
      .upsert(taskRows, { onConflict: 'id' });

    if (tasksError) {
      console.error('保存任务数据失败:', tasksError);
      return { success: false, error: tasksError.message };
    }

    // 保存报告（先删除所有报告，再重新插入）
    const allReports: any[] = [];
    tasks.forEach(task => {
      if (task.reports && task.reports.length > 0) {
        task.reports.forEach(report => {
          allReports.push({
            id: report.id,
            task_id: task.id,
            type: report.type,
            content: report.content,
            timestamp: report.timestamp,
          });
        });
      }
    });

    // 删除所有现有报告
    const { error: deleteError } = await supabase
      .from('task_reports')
      .delete()
      .neq('id', ''); // 删除所有

    if (deleteError) {
      console.error('删除报告失败:', deleteError);
      // 继续执行，不中断
    }

    // 插入新报告
    if (allReports.length > 0) {
      const { error: reportsError } = await supabase
        .from('task_reports')
        .insert(allReports);

      if (reportsError) {
        console.error('保存报告数据失败:', reportsError);
        return { success: false, error: reportsError.message };
      }
    }

    return { success: true };
  } catch (error: any) {
    console.error('保存任务数据异常:', error);
    return { success: false, error: error.message || '保存失败' };
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
    return { success: false, error: error.message || '删除失败' };
  }
}

/**
 * 审计日志操作
 */
export async function loadAuditLogs(): Promise<AuditLog[]> {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('timestamp', { ascending: false })
      .limit(500); // 限制最多 500 条

    if (error) {
      console.error('加载审计日志失败:', error);
      return [];
    }

    if (!data) return [];

    return data.map((row: any) => ({
      id: row.id,
      userId: row.user_id || '',
      userName: row.user_name || '',
      action: row.action,
      targetType: row.target_type || '',
      targetName: row.target_name || '',
      details: row.details || '',
      timestamp: row.timestamp,
    }));
  } catch (error) {
    console.error('加载审计日志异常:', error);
    return [];
  }
}

export async function saveAuditLog(log: AuditLog): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('audit_logs')
      .insert({
        id: log.id,
        user_id: log.userId || null,
        user_name: log.userName,
        action: log.action,
        target_type: log.targetType,
        target_name: log.targetName,
        details: log.details,
        timestamp: log.timestamp,
      });

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
