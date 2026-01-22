import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import Icon from '../Icon';
import { StrategyNode, Task } from '../../types';

interface ProjectDashboardModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeNode: StrategyNode;
  strategies: StrategyNode[];
  tasks: Task[];
  activeBranchIds: string[];
}

interface DashboardMetrics {
  taskScore: {
    average: number;
    total: number;
    scored: number;
    distribution: { range: string; count: number; color: string }[];
  };
  averageProgress: number;
  timeEfficiency: {
    value: number;
    level: '优秀' | '良好' | '需改进';
    completed: number;
    total: number;
  };
  taskBreakdown: {
    status: '良好' | '一般' | '需优化';
    distribution: { level: string; count: number }[];
    averageTasksPerStrategy: number;
  };
  riskTasks: Task[];
}

const COLORS = {
  high: '#10B981', // emerald-500
  medium: '#F59E0B', // amber-500
  low: '#EF4444', // red-500
  neutral: '#6B7280', // gray-500
};

/**
 * 项目评估看板组件
 */
export const ProjectDashboardModal: React.FC<ProjectDashboardModalProps> = ({
  isOpen,
  onClose,
  activeNode,
  strategies,
  tasks,
  activeBranchIds,
}) => {
  // 计算核心指标
  const metrics = useMemo<DashboardMetrics>(() => {
    // 获取当前分支的所有任务
    const branchTasks = tasks.filter((t) => {
      let rootId = t.rootId;
      if (!rootId && t.parentId) {
        const parentStrategy = strategies.find((s) => s.id === t.parentId);
        if (parentStrategy) {
          let current = parentStrategy;
          while (current.parentId) {
            const parent = strategies.find((s) => s.id === current.parentId);
            if (parent) current = parent;
            else break;
          }
          rootId = current.id;
        }
      }
      return rootId && activeBranchIds.includes(rootId);
    });

    // 1. 任务得分计算
    const scoredTasks = branchTasks.filter((t) => t.score !== undefined && t.score !== null);
    const averageScore =
      scoredTasks.length > 0
        ? scoredTasks.reduce((sum, t) => sum + (t.score || 0), 0) / scoredTasks.length
        : 0;

    // 得分分布
    const scoreDistribution = [
      { range: '0-20', min: 0, max: 20, count: 0, color: COLORS.low },
      { range: '21-40', min: 21, max: 40, count: 0, color: COLORS.low },
      { range: '41-60', min: 41, max: 60, count: 0, color: COLORS.medium },
      { range: '61-80', min: 61, max: 80, count: 0, color: COLORS.medium },
      { range: '81-100', min: 81, max: 100, count: 0, color: COLORS.high },
    ];

    scoredTasks.forEach((t) => {
      const score = t.score || 0;
      const range = scoreDistribution.find((r) => score >= r.min && score <= r.max);
      if (range) range.count++;
    });

    // 2. 平均进度计算
    const averageProgress =
      branchTasks.length > 0
        ? branchTasks.reduce((sum, t) => sum + t.progress, 0) / branchTasks.length
        : 0;

    // 3. 时间效率计算
    const completedTasks = branchTasks.filter((t) => t.status === 'completed' || t.status === 'confirmed');
    const timeEfficiencyValue =
      branchTasks.length > 0 ? (completedTasks.length / branchTasks.length) * 100 : 0;
    const timeEfficiencyLevel: '优秀' | '良好' | '需改进' =
      timeEfficiencyValue >= 80 ? '优秀' : timeEfficiencyValue >= 60 ? '良好' : '需改进';

    // 4. 事项拆分分析
    const branchStrategies = strategies.filter((s) => activeBranchIds.includes(s.id));
    const l3Strategies = branchStrategies.filter((s) => s.level === 3);
    const tasksPerStrategy =
      l3Strategies.length > 0
        ? l3Strategies.map((s) => branchTasks.filter((t) => t.parentId === s.id).length)
        : [];
    const averageTasksPerStrategy =
      tasksPerStrategy.length > 0
        ? tasksPerStrategy.reduce((sum, count) => sum + count, 0) / tasksPerStrategy.length
        : 0;

    const breakdownStatus: '良好' | '一般' | '需优化' =
      averageTasksPerStrategy >= 3 && averageTasksPerStrategy <= 10
        ? '良好'
        : averageTasksPerStrategy > 0
        ? '一般'
        : '需优化';

    // 层级分布
    const levelDistribution = [
      { level: 'L1', count: branchStrategies.filter((s) => s.level === 1).length },
      { level: 'L2', count: branchStrategies.filter((s) => s.level === 2).length },
      { level: 'L3', count: branchStrategies.filter((s) => s.level === 3).length },
    ];

    // 5. 风险任务识别
    const riskTasks = branchTasks.filter((t) => {
      // 低分任务
      if (t.score !== undefined && t.score < 60) return true;
      // 进度低且时间已过半
      if (t.progress < 50 && t.start && t.end) {
        const start = new Date(t.start).getTime();
        const end = new Date(t.end).getTime();
        const now = Date.now();
        const totalDuration = end - start;
        const elapsed = now - start;
        if (totalDuration > 0 && elapsed / totalDuration > 0.5) return true;
      }
      // 进行中但长时间未更新（超过计划结束时间）
      if (t.status === 'in_progress' && t.end) {
        const endTime = new Date(t.end).getTime();
        if (Date.now() > endTime) return true;
      }
      return false;
    });

    return {
      taskScore: {
        average: Math.round(averageScore),
        total: branchTasks.length,
        scored: scoredTasks.length,
        distribution: scoreDistribution.map((r) => ({
          range: r.range,
          count: r.count,
          color: r.color,
        })),
      },
      averageProgress: Math.round(averageProgress),
      timeEfficiency: {
        value: Math.round(timeEfficiencyValue),
        level: timeEfficiencyLevel,
        completed: completedTasks.length,
        total: branchTasks.length,
      },
      taskBreakdown: {
        status: breakdownStatus,
        distribution: levelDistribution,
        averageTasksPerStrategy: Math.round(averageTasksPerStrategy * 10) / 10,
      },
      riskTasks: riskTasks.slice(0, 10), // 最多显示 10 个风险任务
    };
  }, [activeNode, strategies, tasks, activeBranchIds]);

  // 导出报告
  const handleExport = () => {
    const reportContent = `
项目评估报告
================

策略名称: ${activeNode.name}
生成时间: ${new Date().toLocaleString('zh-CN')}

核心指标
--------
任务得分: ${metrics.taskScore.average} 分 (${metrics.taskScore.scored}/${metrics.taskScore.total} 已评分)
平均进度: ${metrics.averageProgress}%
时间效率: ${metrics.timeEfficiency.value}% (${metrics.timeEfficiency.level})
事项拆分: ${metrics.taskBreakdown.status} (平均每个 L3 策略 ${metrics.taskBreakdown.averageTasksPerStrategy} 个任务)

风险任务 (${metrics.riskTasks.length} 个)
--------
${metrics.riskTasks.map((t, idx) => `${idx + 1}. ${t.text} (得分: ${t.score || '未评分'}, 进度: ${t.progress}%)`).join('\n')}
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `项目评估报告_${activeNode.name}_${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E9E9E7] flex items-center justify-between bg-[#F7F6F3]">
          <div>
            <h2 className="text-xl font-semibold text-[#37352F]">项目评估看板</h2>
            <p className="text-sm text-[#787774] mt-1">{activeNode.name}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="px-4 py-2 text-sm font-medium text-[#37352F] bg-white border border-[#E9E9E7] rounded-lg hover:bg-[#F7F6F3] transition-colors flex items-center gap-2"
            >
              <Icon name="download" size={16} />
              导出报告
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-[#E9E9E7] rounded-lg transition-colors"
            >
              <Icon name="close" size={20} className="text-[#9B9A97]" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
          {/* 核心指标卡片 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {/* 任务得分 */}
            <div className="bg-white border border-[#E9E9E7] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#787774]">任务得分</span>
                <Icon
                  name="star"
                  size={16}
                  className={
                    metrics.taskScore.average >= 80
                      ? 'text-emerald-500'
                      : metrics.taskScore.average >= 60
                      ? 'text-amber-500'
                      : 'text-red-500'
                  }
                />
              </div>
              <div className="text-3xl font-bold text-[#37352F] mb-1">
                {metrics.taskScore.average}
                <span className="text-lg text-[#787774]"> 分</span>
              </div>
              <div className="text-xs text-[#9B9A97]">
                {metrics.taskScore.scored}/{metrics.taskScore.total} 已评分
              </div>
            </div>

            {/* 平均进度 */}
            <div className="bg-white border border-[#E9E9E7] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#787774]">平均进度</span>
                <Icon name="trending-up" size={16} className="text-indigo-500" />
              </div>
              <div className="text-3xl font-bold text-[#37352F] mb-1">
                {metrics.averageProgress}
                <span className="text-lg text-[#787774]">%</span>
              </div>
              <div className="w-full bg-[#E9E9E7] rounded-full h-2 mt-2">
                <div
                  className="bg-indigo-500 h-2 rounded-full transition-all"
                  style={{ width: `${metrics.averageProgress}%` }}
                />
              </div>
            </div>

            {/* 时间效率 */}
            <div className="bg-white border border-[#E9E9E7] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#787774]">时间效率</span>
                <Icon
                  name="clock"
                  size={16}
                  className={
                    metrics.timeEfficiency.level === '优秀'
                      ? 'text-emerald-500'
                      : metrics.timeEfficiency.level === '良好'
                      ? 'text-amber-500'
                      : 'text-red-500'
                  }
                />
              </div>
              <div className="text-3xl font-bold text-[#37352F] mb-1">
                {metrics.timeEfficiency.value}
                <span className="text-lg text-[#787774]">%</span>
              </div>
              <div className="text-xs text-[#9B9A97]">
                {metrics.timeEfficiency.level} ({metrics.timeEfficiency.completed}/{metrics.timeEfficiency.total} 已完成)
              </div>
            </div>

            {/* 事项拆分 */}
            <div className="bg-white border border-[#E9E9E7] rounded-xl p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[#787774]">事项拆分</span>
                <Icon
                  name="layers"
                  size={16}
                  className={
                    metrics.taskBreakdown.status === '良好'
                      ? 'text-emerald-500'
                      : metrics.taskBreakdown.status === '一般'
                      ? 'text-amber-500'
                      : 'text-red-500'
                  }
                />
              </div>
              <div className="text-3xl font-bold text-[#37352F] mb-1">{metrics.taskBreakdown.status}</div>
              <div className="text-xs text-[#9B9A97]">
                平均每个 L3 策略 {metrics.taskBreakdown.averageTasksPerStrategy} 个任务
              </div>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            {/* 任务得分分布 */}
            <div className="bg-white border border-[#E9E9E7] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#37352F] mb-4">任务得分分布</h3>
              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={metrics.taskScore.distribution}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E9E9E7" />
                  <XAxis dataKey="range" stroke="#9B9A97" fontSize={12} />
                  <YAxis stroke="#9B9A97" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #E9E9E7',
                      borderRadius: '8px',
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {metrics.taskScore.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* 层级分布 */}
            <div className="bg-white border border-[#E9E9E7] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#37352F] mb-4">策略层级分布</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={metrics.taskBreakdown.distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ level, count }) => `${level}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {metrics.taskBreakdown.distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={['#10B981', '#3B82F6', '#8B5CF6'][index]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 风险任务列表 */}
          {metrics.riskTasks.length > 0 && (
            <div className="bg-white border border-[#E9E9E7] rounded-xl p-4">
              <h3 className="text-sm font-semibold text-[#37352F] mb-4">风险任务 ({metrics.riskTasks.length} 个)</h3>
              <div className="space-y-2">
                {metrics.riskTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="text-sm font-medium text-[#37352F]">{task.text}</div>
                      <div className="text-xs text-[#787774] mt-1">
                        负责人: {task.owner || '未分配'} | 进度: {task.progress}%
                        {task.score !== undefined && ` | 得分: ${task.score}`}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.score !== undefined && task.score < 60 && (
                        <span className="px-2 py-1 text-xs font-medium text-red-700 bg-red-100 rounded">
                          低分
                        </span>
                      )}
                      {task.progress < 50 && (
                        <span className="px-2 py-1 text-xs font-medium text-amber-700 bg-amber-100 rounded">
                          进度低
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
