import React from 'react';
import Icon from '../Icon';
import { StrategyNode } from '../../types';

interface StrategyNodeComponentProps {
  node: StrategyNode;
  isSelected: boolean;
  isExpanded: boolean;
  hasChildren: boolean;
  onNodeClick: () => void;
  onEditClick: (e: React.MouseEvent) => void;
  onToggleExpand: (e: React.MouseEvent) => void;
}

/**
 * 侧边栏策略节点组件
 */
export const StrategyNodeComponent: React.FC<StrategyNodeComponentProps> = ({
  node,
  isSelected,
  isExpanded,
  hasChildren,
  onNodeClick,
  onEditClick,
  onToggleExpand,
}) => {
  return (
    <div className="relative pl-4">
      <div className="absolute left-0 top-0 bottom-0 w-px bg-slate-200" />
      {node.parentId && <div className="absolute left-0 top-4 w-4 h-px bg-slate-200" />}
      <div className="relative">
        {hasChildren && (
          <div
            onClick={onToggleExpand}
            className="absolute -left-[5px] top-[14px] z-10 w-3 h-3 bg-white border border-slate-300 text-slate-400 rounded-[2px] flex items-center justify-center cursor-pointer hover:border-indigo-500 hover:text-indigo-500 transition-colors"
          >
            <Icon name={isExpanded ? 'down' : 'right'} size={8} />
          </div>
        )}
        {!hasChildren && node.parentId && (
          <div className="absolute -left-[2px] top-[15px] w-1 h-1 bg-slate-300 rounded-full" />
        )}
        <div
          onClick={onNodeClick}
          className={`group relative p-2 my-0.5 ml-1 rounded-lg cursor-pointer transition-all border ${
            isSelected
              ? 'bg-slate-900 border-slate-900 shadow-md'
              : 'bg-white border-slate-100 hover:border-orange-300'
          }`}
        >
          {/* 标题作为第一行，编辑按钮在右侧 */}
          <div className="flex items-start justify-between gap-2 mb-1">
            <div
              className={`text-[11px] font-bold truncate flex-1 leading-tight ${
                isSelected ? 'text-white' : 'text-slate-700'
              }`}
            >
              {node.name}
            </div>
            <button
              type="button"
              onClick={onEditClick}
              className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all flex-shrink-0 mt-0.5 ${
                isSelected
                  ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                  : 'text-slate-300 hover:text-orange-500 hover:bg-orange-50'
              }`}
              title="编辑策略"
            >
              <Icon name="edit" size={12} />
            </button>
          </div>
          {/* 第二行：显示摘要信息、标签等 */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {/* 层级标签：悬停时显示，完全次要信息 */}
            <span
              className={`text-[7px] font-normal opacity-0 group-hover:opacity-30 transition-opacity duration-200 ${
                isSelected ? 'text-slate-400' : 'text-slate-300'
              }`}
            >
              L{node.level}
            </span>
            {/* Group 标识 */}
            {node.group && (
              <span className="text-[8px] font-black uppercase text-white bg-indigo-500 px-1.5 py-0.5 rounded shadow-sm truncate">
                {node.group}
              </span>
            )}
            {/* 标签 */}
            {node.tags && node.tags.length > 0 && (
              <>
                {node.tags.slice(0, 2).map(t => (
                  <span
                    key={t}
                    className={`text-[8px] font-medium px-1.5 py-0.5 rounded truncate max-w-[60px] ${
                      isSelected
                        ? 'text-slate-200 bg-slate-700'
                        : 'text-indigo-700 bg-indigo-50'
                    }`}
                  >
                    #{t}
                  </span>
                ))}
                {node.tags.length > 2 && (
                  <span
                    className={`text-[8px] font-medium px-1.5 py-0.5 rounded ${
                      isSelected ? 'text-slate-300' : 'text-slate-500'
                    }`}
                  >
                    +{node.tags.length - 2}
                  </span>
                )}
              </>
            )}
            {/* 负责人 */}
            {node.owner && (
              <span
                className={`text-[8px] font-medium flex items-center gap-0.5 truncate max-w-[50px] ${
                  isSelected ? 'text-slate-300' : 'text-slate-500'
                }`}
                title={node.owner}
              >
                <Icon name="user" size={9} />
                {node.owner.length > 4 ? node.owner.slice(0, 4) + '...' : node.owner}
              </span>
            )}
            {/* 结束日期 */}
            {node.end && (
              <span
                className={`text-[8px] font-medium flex items-center gap-0.5 ${
                  isSelected ? 'text-slate-300' : 'text-slate-500'
                }`}
              >
                <Icon name="calendar" size={9} />
                {node.end}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
