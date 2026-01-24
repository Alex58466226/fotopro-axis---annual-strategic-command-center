import React from 'react';
import Icon from '../Icon';
import { StrategyNode, Task, User, Level } from '../../types';
import { UserProfile } from './UserProfile';
import { StrategyTree } from './StrategyTree';

interface SidebarProps {
  currentUser: User;
  strategies: StrategyNode[];
  tasks: Task[];
  expandedNodes: Set<string>;
  activeNodeId: string;
  activeNode: StrategyNode;
  onNodeClick: (nodeId: string) => void;
  onNodeEdit: (e: React.MouseEvent, node: StrategyNode) => void;
  onTaskClick: (e: React.MouseEvent, task: Task) => void;
  onToggleExpand: (e: React.MouseEvent, nodeId: string) => void;
  onUserManagementClick: () => void;
  onAuditLogClick: () => void;
  onLogoutClick: () => void;
  onMapModalOpen: () => void;
  onReportModalOpen: () => void;
  onAIChatOpen?: () => void;
  onAddSubStrategy: (level: Level, parentId: string) => void;
  onAddTopStrategy: () => void;
  onImportData: () => void;
  onExportCSV: () => void;
  onDeleteStrategy: () => void;
  getOwnerDisplayName?: (owner: string) => string; // 新增：获取 owner 显示名称
}

/**
 * 侧边栏组件
 */
export const Sidebar: React.FC<SidebarProps> = ({
  currentUser,
  strategies,
  tasks,
  expandedNodes,
  activeNodeId,
  activeNode,
  onNodeClick,
  onNodeEdit,
  onTaskClick,
  onToggleExpand,
  onUserManagementClick,
  onAuditLogClick,
  onLogoutClick,
  onMapModalOpen,
  onReportModalOpen,
  onAIChatOpen,
  onAddSubStrategy,
  onAddTopStrategy,
  onImportData,
  onExportCSV,
  onDeleteStrategy,
  getOwnerDisplayName,
}) => {
  const topLevelStrategies = strategies.filter(s => s.level === 1);

  return (
    <aside className="w-64 sm:w-72 bg-white border-r border-[#E9E9E7] flex flex-col z-20 flex-shrink-0">
      <div className="p-5 border-b border-[#E9E9E7] bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center text-white">
              <Icon name="layers" size={18} />
            </div>
            <div>
              <h1 className="text-sm font-semibold text-[#37352F]">
                富图宝策略看板
              </h1>
              <p className="text-[10px] font-normal text-[#787774]">FOTOPRO STRATEGY AXIS</p>
            </div>
          </div>
          <button
            onClick={onMapModalOpen}
            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
            title="Expand Architecture Map"
          >
            <Icon name="maximize" size={16} />
          </button>
        </div>
        <UserProfile
          user={currentUser}
          onUserManagementClick={onUserManagementClick}
          onAuditLogClick={onAuditLogClick}
          onLogoutClick={onLogoutClick}
        />
      </div>
      <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
        <div className="flex items-center justify-between mb-4">
          <div className="text-[10px] font-medium text-[#787774] uppercase tracking-wider pl-1">
            策略架构图谱
          </div>
          {activeNodeId && (
            <button
              onClick={() => onNodeClick('')}
              className="text-[9px] text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 px-2 py-1 rounded transition-all"
              title="显示全部项目"
            >
              显示全部
            </button>
          )}
        </div>
        {topLevelStrategies.map(node => (
          <StrategyTree
            key={node.id}
            node={node}
            strategies={strategies}
            tasks={tasks}
            expandedNodes={expandedNodes}
            activeNodeId={activeNodeId}
            onNodeClick={onNodeClick}
            onNodeEdit={onNodeEdit}
            onTaskClick={onTaskClick}
            onToggleExpand={onToggleExpand}
          />
        ))}
        {/* 操作按钮区域 - 优化分组和视觉层次 */}
        <div className="mt-6 space-y-4">
          {/* 高频操作：AI 助手 - Notion 风格 */}
          {onAIChatOpen && (
            <button
              onClick={onAIChatOpen}
              className="w-full py-2.5 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-md text-[11px] font-medium hover:from-indigo-600 hover:to-purple-600 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-4 shadow-md"
            >
              <Icon name="sparkles" size={14} /> AI 助手
            </button>
          )}
          <button
            onClick={onReportModalOpen}
            className="w-full py-2.5 bg-[#2383E2] text-white rounded-md text-[11px] font-medium hover:bg-[#1A73D1] active:scale-[0.98] transition-all flex items-center justify-center gap-2 mb-4"
          >
            <Icon name="fileText" size={14} /> 生成智能周报
          </button>
          
          {/* 数据操作组 - Notion 风格 */}
          <div className="space-y-2 mb-4">
            <div className="text-[9px] font-medium text-[#787774] uppercase tracking-wider mb-2 px-1">
              数据操作
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onImportData}
                className="py-2 bg-white border border-[#E9E9E7] rounded-md text-[10px] font-medium text-[#37352F] hover:bg-[#F7F6F3] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                title="导入数据（CSV/JSON）"
              >
                <Icon name="upload" size={12} /> 导入
              </button>
              <button
                onClick={onExportCSV}
                className="py-2 bg-white border border-[#E9E9E7] rounded-md text-[10px] font-medium text-[#37352F] hover:bg-[#F7F6F3] active:scale-[0.98] transition-all flex items-center justify-center gap-1.5"
                title="导出报表（CSV）"
              >
                <Icon name="download" size={12} /> 导出
              </button>
            </div>
          </div>

          {/* 管理操作组 - Notion 风格 */}
          <div className="space-y-2 mb-4">
            <div className="text-[9px] font-medium text-[#787774] uppercase tracking-wider mb-2 px-1">
              管理操作
            </div>
            <button
              onClick={onDeleteStrategy}
              className="w-full py-2 bg-white border border-[#E9E9E7] rounded-md text-[10px] font-medium text-[#E16259] hover:bg-[#F7F6F3] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              title="删除当前策略节点"
            >
              <Icon name="trash" size={12} /> 删除当前策略
            </button>
          </div>

          {/* 创建操作组 - Notion 风格 */}
          <div className="space-y-2">
            <div className="text-[9px] font-medium text-[#787774] uppercase tracking-wider mb-2 px-1">
              创建操作
            </div>
            {activeNode.level < 3 && (
              <button
                onClick={() => onAddSubStrategy((activeNode.level + 1) as Level, activeNode.id)}
                className="w-full py-2.5 border border-dashed border-[#D9D9D7] bg-white rounded-md text-[10px] font-medium text-[#787774] hover:border-[#C9C9C7] hover:bg-[#F7F6F3] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
              >
                <Icon name="plus" size={12} /> 添加 L{activeNode.level + 1} 子策略
              </button>
            )}
            <button
              onClick={onAddTopStrategy}
              className="w-full py-2.5 bg-white border border-[#E9E9E7] rounded-md text-[10px] font-medium text-[#37352F] hover:bg-[#F7F6F3] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <Icon name="layers" size={12} /> 添加 L1 顶级策略
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
