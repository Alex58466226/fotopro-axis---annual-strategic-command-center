import React from 'react';
import Icon from '../Icon';
import { StrategyNode } from '../../types';

interface FilterOptions {
  owners: string[];
  channels: string[];
  products: string[];
  tags: string[];
}

interface Filters {
  owner: string;
  channel: string;
  product: string;
  tag: string;
  time: 'all' | 'today' | 'week' | 'month' | 'custom';
  customStartDate?: string;
  customEndDate?: string;
}

interface FilterPanelProps {
  isCollapsed: boolean;
  isFilterActive: boolean;
  filters: Filters;
  filterOptions: FilterOptions;
  filteredStrategies: StrategyNode[];
  onToggleCollapse: () => void;
  onFilterChange: (filters: Filters) => void;
  onClearFilters: () => void;
  onStrategyClick: (strategyId: string) => void;
  onFullscreen?: () => void; // 新增：全屏回调
}

/**
 * 筛选面板组件
 */
export const FilterPanel: React.FC<FilterPanelProps> = ({
  isCollapsed,
  isFilterActive,
  filters,
  filterOptions,
  filteredStrategies,
  onToggleCollapse,
  onFilterChange,
  onClearFilters,
  onStrategyClick,
  onFullscreen,
}) => {
  return (
    <section
      className={`bg-white rounded-lg border border-[#E9E9E7] transition-all duration-300 ${
        isCollapsed ? 'p-4' : 'p-6'
      }`}
    >
      <div
        className="flex items-center justify-between cursor-pointer group"
        onClick={onToggleCollapse}
      >
        <div className="flex items-center gap-2">
          <Icon name="search" size={14} className="text-indigo-500" />
          <h3 className="text-sm font-semibold text-[#37352F]">
            项目透视 · 快速预览卡片
          </h3>
          <div
            className={`p-1 rounded-full text-slate-300 group-hover:bg-slate-100 transition-all ${
              isCollapsed ? '' : 'rotate-180'
            }`}
          >
            <Icon name="down" size={12} />
          </div>
        </div>
        <div
          className="flex items-center gap-3"
          onClick={e => e.stopPropagation()}
        >
          {isFilterActive && (
            <>
              <span className="text-[10px] font-medium text-[#2383E2] bg-[#E3F2FD] px-2.5 py-1 rounded-md">
                筛选中
              </span>
              <button
                onClick={onClearFilters}
                className="text-[10px] font-medium text-[#787774] hover:text-[#E16259] transition-colors"
              >
                清除
              </button>
            </>
          )}
          {!isCollapsed && onFullscreen && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onFullscreen();
              }}
              className="p-1.5 bg-[#F7F6F3] rounded-md hover:bg-[#E9E9E7] transition-colors"
              title="全屏显示"
            >
              <Icon name="maximize" size={14} className="text-[#787774]" />
            </button>
          )}
        </div>
      </div>
      {!isCollapsed && (
        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-4">
            <div className="flex-shrink-0 w-[120px] sm:w-[140px]">
              <label className="text-[10px] font-medium text-[#787774] ml-1 block mb-1.5">
                Owner
              </label>
              <select
                className="w-full p-2.5 bg-white border border-[#E9E9E7] rounded-md text-[12px] font-normal text-[#37352F] outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2] cursor-pointer hover:border-[#D9D9D7] transition-colors"
                value={filters.owner}
                onChange={e =>
                  onFilterChange({ ...filters, owner: e.target.value })
                }
              >
                <option value="all">全部</option>
                {filterOptions.owners.map(o => (
                  <option key={o} value={o}>
                    {o}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-shrink-0 w-[120px] sm:w-[140px]">
              <label className="text-[10px] font-medium text-[#787774] ml-1 block mb-1.5">
                Channel
              </label>
              <select
                className="w-full p-2.5 bg-white border border-[#E9E9E7] rounded-md text-[12px] font-normal text-[#37352F] outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2] cursor-pointer hover:border-[#D9D9D7] transition-colors"
                value={filters.channel}
                onChange={e =>
                  onFilterChange({ ...filters, channel: e.target.value })
                }
              >
                <option value="all">全部</option>
                {filterOptions.channels.map(c => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-shrink-0 w-[120px] sm:w-[140px]">
              <label className="text-[10px] font-medium text-[#787774] ml-1 block mb-1.5">
                Product
              </label>
              <select
                className="w-full p-2.5 bg-white border border-[#E9E9E7] rounded-md text-[12px] font-normal text-[#37352F] outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2] cursor-pointer hover:border-[#D9D9D7] transition-colors"
                value={filters.product}
                onChange={e =>
                  onFilterChange({ ...filters, product: e.target.value })
                }
              >
                <option value="all">全部</option>
                {filterOptions.products.map(p => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-shrink-0 w-[120px] sm:w-[140px]">
              <label className="text-[10px] font-medium text-[#787774] ml-1 block mb-1.5">
                Strategy Tag
              </label>
              <select
                className="w-full p-2.5 bg-white border border-[#E9E9E7] rounded-md text-[12px] font-normal text-[#37352F] outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2] cursor-pointer hover:border-[#D9D9D7] transition-colors"
                value={filters.tag}
                onChange={e =>
                  onFilterChange({ ...filters, tag: e.target.value })
                }
              >
                <option value="all">全部</option>
                {filterOptions.tags.map(t => (
                  <option key={t} value={t}>
                    #{t}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-shrink-0 w-[150px] sm:w-[170px]">
              <label className="text-[10px] font-medium text-[#787774] ml-1 block mb-1.5">
                Time Range
              </label>
              <select
                className="w-full p-2.5 bg-[#E3F2FD] border border-[#BBDEFB] rounded-md text-[12px] font-normal text-[#2383E2] outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2] cursor-pointer hover:border-[#90CAF9] transition-colors"
                value={filters.time}
                onChange={e => {
                  const newTime = e.target.value as any;
                  if (newTime === 'custom') {
                    // 切换到自定义日期时，保持当前日期范围或使用默认值
                    onFilterChange({
                      ...filters,
                      time: 'custom',
                      customStartDate: filters.customStartDate || '',
                      customEndDate: filters.customEndDate || '',
                    });
                  } else {
                    // 切换到预设选项时，清除自定义日期
                    onFilterChange({
                      ...filters,
                      time: newTime,
                      customStartDate: undefined,
                      customEndDate: undefined,
                    });
                  }
                }}
              >
                <option value="all">全部</option>
                <option value="today">今日</option>
                <option value="week">本周</option>
                <option value="month">本月</option>
                <option value="custom">自定义</option>
              </select>
            </div>
          </div>
          {/* 自定义日期范围 - 单独一行显示 */}
          {filters.time === 'custom' && (
            <div className="flex flex-wrap gap-2 mt-3 animate-in fade-in slide-in-from-top-2">
              <div className="flex-shrink-0 w-[150px] sm:w-[170px]">
                <label className="text-[10px] font-medium text-[#787774] mb-1.5 block">
                  开始日期
                </label>
                <input
                  type="date"
                  value={filters.customStartDate || ''}
                  onChange={e =>
                    onFilterChange({
                      ...filters,
                      customStartDate: e.target.value,
                    })
                  }
                  className="w-full p-2.5 bg-white border border-[#E9E9E7] rounded-md text-[12px] font-normal text-[#37352F] outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2] cursor-pointer hover:border-[#D9D9D7] transition-colors"
                />
              </div>
              <div className="flex-shrink-0 w-[150px] sm:w-[170px]">
                <label className="text-[10px] font-medium text-[#787774] mb-1.5 block">
                  结束日期
                </label>
                <input
                  type="date"
                  value={filters.customEndDate || ''}
                  onChange={e =>
                    onFilterChange({
                      ...filters,
                      customEndDate: e.target.value,
                    })
                  }
                  min={filters.customStartDate || undefined}
                  className="w-full p-2.5 bg-white border border-[#E9E9E7] rounded-md text-[12px] font-normal text-[#37352F] outline-none focus:border-[#2383E2] focus:ring-1 focus:ring-[#2383E2] cursor-pointer hover:border-[#D9D9D7] transition-colors"
                />
              </div>
            </div>
          )}
          <div className="mt-4 border-t border-slate-100 pt-4">
            <h4 className="text-[11px] font-medium text-[#787774] uppercase tracking-wider mb-3">
              Strategy Projects ({filteredStrategies.length})
            </h4>
            <div className="space-y-2">
              {filteredStrategies.map(s => (
                <div
                  key={s.id}
                  onClick={() => onStrategyClick(s.id)}
                  className="flex items-center justify-between p-4 bg-white hover:bg-[#F7F6F3] border border-[#E9E9E7] rounded-md cursor-pointer transition-all group"
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`text-[10px] font-medium px-2 py-1 rounded-md text-white ${
                        s.level === 1
                          ? 'bg-[#37352F]'
                          : s.level === 2
                          ? 'bg-[#2383E2]'
                          : 'bg-[#E16259]'
                      }`}
                    >
                      L{s.level}
                    </span>
                    <div>
                      <div className="text-sm font-medium text-[#37352F] group-hover:text-[#2383E2] transition-colors">
                        {s.name}
                      </div>
                      <div className="text-[11px] text-[#787774] flex gap-2 mt-0.5">
                        <span>{s.owner}</span>
                        <span>·</span>
                        <span>
                          {s.start} ~ {s.end}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {s.tags?.map(t => (
                      <span
                        key={t}
                        className="text-[9px] bg-[#F7F6F3] border border-[#E9E9E7] px-1.5 py-0.5 rounded-md text-[#787774]"
                      >
                        #{t}
                      </span>
                    ))}
                    <Icon
                      name="right"
                      size={12}
                      className="text-[#9B9A97] group-hover:text-[#2383E2] transition-colors"
                    />
                  </div>
                </div>
              ))}
              {filteredStrategies.length === 0 && (
                <div className="text-center text-[10px] text-slate-400 italic py-2">
                  No projects match the filters
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
