import React from 'react';
import Icon from '../Icon';
import { StrategyNode, Metric } from '../../types';

interface HeaderProps {
  activeNode: StrategyNode;
  stats: {
    total: number;
    completed: number;
    remaining: number;
    rate: number;
    timeUsedRate: number;
    daysElapsed: number;
    totalDurationDays: number;
    deviation: number;
    isBehind: boolean;
  };
  onNodeEdit: () => void;
  onReportModalOpen: () => void;
  onQuickAction?: (action: 'add-strategy' | 'add-sub-strategy' | 'add-task') => void;
}

/**
 * 页面头部组件
 */
export const Header: React.FC<HeaderProps> = ({
  activeNode,
  stats,
  onNodeEdit,
  onReportModalOpen,
  onQuickAction,
}) => {
  const [showQuickActions, setShowQuickActions] = React.useState(false);
  return (
    <header className="bg-white border-b border-[#E9E9E7] px-6 sm:px-8 py-4 sm:py-5 flex items-center justify-between z-10 flex-shrink-0 min-w-0">
      <div className="flex-1 min-w-0 mr-3 sm:mr-6 overflow-hidden">
        <div className="flex items-center gap-2 mb-1">
          {/* 快速操作按钮 */}
          {onQuickAction && (
            <div className="relative">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowQuickActions(!showQuickActions);
                }}
                className="p-1.5 hover:bg-[#F7F6F3] rounded-md transition-colors group"
                title="快速操作"
              >
                <Icon 
                  name="plus" 
                  size={16} 
                  className={`transition-colors ${
                    showQuickActions ? 'text-[#2383E2]' : 'text-[#9B9A97] group-hover:text-[#2383E2]'
                  }`} 
                />
              </button>
              
              {/* 快速操作下拉菜单 */}
              {showQuickActions && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setShowQuickActions(false)}
                  />
                  <div className="absolute top-full left-0 mt-2 w-48 bg-white border border-[#E9E9E7] rounded-lg shadow-lg z-50 overflow-hidden">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onQuickAction('add-strategy');
                        setShowQuickActions(false);
                      }}
                      className="w-full px-4 py-2.5 text-left text-sm text-[#37352F] hover:bg-[#F7F6F3] transition-colors flex items-center gap-2"
                    >
                      <Icon name="plus" size={14} className="text-[#2383E2]" />
                      <span>创建 L1 策略</span>
                    </button>
                    {activeNode.level < 3 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAction('add-sub-strategy');
                          setShowQuickActions(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#37352F] hover:bg-[#F7F6F3] transition-colors flex items-center gap-2"
                      >
                        <Icon name="plus" size={14} className="text-[#2383E2]" />
                        <span>创建子策略 (L{activeNode.level + 1})</span>
                      </button>
                    )}
                    {activeNode.level === 3 && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAction('add-task');
                          setShowQuickActions(false);
                        }}
                        className="w-full px-4 py-2.5 text-left text-sm text-[#37352F] hover:bg-[#F7F6F3] transition-colors flex items-center gap-2"
                      >
                        <Icon name="plus" size={14} className="text-[#2383E2]" />
                        <span>创建任务</span>
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          )}
          
          <span className="text-[10px] font-semibold bg-[#F1F1EF] text-[#787774] px-2.5 py-1 rounded-md flex-shrink-0">
            L{activeNode.level}
          </span>
          <h2
            className="text-xl font-semibold text-[#37352F] tracking-tight truncate cursor-pointer hover:text-[#2383E2] transition-colors"
            onClick={onNodeEdit}
          >
            {activeNode.name}
          </h2>
          <Icon
            name="edit"
            size={14}
            className="text-[#9B9A97] cursor-pointer hover:text-[#2383E2] transition-colors"
          />
        </div>
        <div className="flex items-center gap-5 text-[11px] font-normal text-[#787774] mt-1">
          <span>
            Owner: <span className="text-[#37352F] font-medium">{activeNode.owner}</span>
          </span>
          {activeNode.group && (
            <span>
              Group: <span className="text-[#2383E2] font-medium">{activeNode.group}</span>
            </span>
          )}
          <span>
            Cycle: {activeNode.start} ~ {activeNode.end}
          </span>
          {activeNode.tags && activeNode.tags.length > 0 && (
            <span className="flex gap-1.5">
              {activeNode.tags.map(t => (
                <span
                  key={t}
                  className="bg-[#F1F1EF] px-2 py-0.5 rounded text-[#787774] text-[10px]"
                >
                  #{t}
                </span>
              ))}
            </span>
          )}
        </div>
        {activeNode.metrics && activeNode.metrics.length > 0 && (
          <div className="flex flex-wrap gap-4 mt-3 pb-1">
            {activeNode.metrics.map(m => (
              <div
                key={m.id}
                className="group relative flex flex-col border-l-2 border-orange-200 pl-3 pr-2 py-1 cursor-help hover:bg-orange-50 rounded-r-xl transition-all"
              >
                <div className="flex items-center gap-1">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                    {m.label}
                  </span>
                  {m.description && (
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 animate-pulse" />
                  )}
                </div>
                <span className="text-sm font-black text-slate-800 mt-0.5">
                  {m.value}
                </span>
                {m.description && (
                  <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-slate-100 p-4 rounded-xl shadow-2xl z-[100] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform translate-y-2 group-hover:translate-y-0 pointer-events-none">
                    <div className="flex items-center gap-2 mb-2 pb-2 border-b border-slate-50">
                      <div className="w-1.5 h-4 bg-orange-500 rounded-full" />
                      <span className="text-[10px] font-black uppercase text-slate-900">
                        KPI Detail
                      </span>
                    </div>
                    <p className="text-xs font-medium text-slate-600 leading-relaxed whitespace-normal break-words">
                      {m.description}
                    </p>
                    <div className="absolute -top-1.5 left-4 w-3 h-3 bg-white border-t border-l border-slate-100 transform rotate-45" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* 统计数据卡片 - Notion 风格 */}
        <div className="hidden lg:flex items-center gap-4 bg-white px-5 py-3 rounded-lg border border-[#E9E9E7]">
          {/* 时间进度 */}
          <div className="flex items-center gap-3 min-w-[100px]">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-[#787774] leading-tight">
                时间进度
              </span>
              <span className="text-[13px] font-semibold text-[#37352F] mt-0.5">
                {stats.daysElapsed}/{stats.totalDurationDays} 天
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-1.5 bg-[#E9E9E7] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all ${
                    stats.timeUsedRate > 100 ? 'bg-[#E16259]' : 'bg-[#2383E2]'
                  }`}
                  style={{ width: `${Math.min(100, stats.timeUsedRate)}%` }}
                />
              </div>
              <span className="text-[9px] font-medium text-[#787774]">
                {stats.timeUsedRate}%
              </span>
            </div>
          </div>
          
          <div className="w-px h-12 bg-[#E9E9E7]" />
          
          {/* 任务进度 */}
          <div className="flex items-center gap-3 min-w-[100px]">
            <div className="flex flex-col">
              <span className="text-[10px] font-medium text-[#787774] leading-tight">
                任务进度
              </span>
              <span
                className={`text-[13px] font-semibold mt-0.5 ${
                  stats.remaining > 0 ? 'text-[#E16259]' : 'text-[#0F7B6C]'
                }`}
              >
                {stats.remaining} 待完成
              </span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <div className="w-14 h-1.5 bg-[#E9E9E7] rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    stats.isBehind ? 'bg-[#E16259]' : 'bg-[#0F7B6C]'
                  }`}
                  style={{ width: `${stats.rate}%` }}
                />
              </div>
              <span
                className={`text-[9px] font-medium ${
                  stats.isBehind ? 'text-[#E16259]' : 'text-[#0F7B6C]'
                }`}
              >
                {stats.rate}%
              </span>
            </div>
          </div>
        </div>

        {/* 主要操作：智能周报 - Notion 风格按钮 */}
        <button
          type="button"
          onClick={onReportModalOpen}
          className="flex items-center gap-2 px-4 py-2 bg-[#2383E2] text-white rounded-md text-xs font-medium hover:bg-[#1A73D1] active:scale-[0.98] transition-all"
          title="生成智能周报"
        >
          <Icon name="fileText" size={15} /> 
          <span className="hidden sm:inline">智能周报</span>
          <span className="sm:hidden">周报</span>
        </button>
      </div>
    </header>
  );
};
