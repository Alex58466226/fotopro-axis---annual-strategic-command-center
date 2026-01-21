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
          className={`group relative p-2 my-1 ml-1 rounded-lg cursor-pointer transition-all border ${
            isSelected
              ? 'bg-slate-900 border-slate-900 shadow-md'
              : 'bg-white border-slate-100 hover:border-orange-300'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              <span
                className={`text-[9px] font-black px-1.5 rounded ${
                  isSelected ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'
                }`}
              >
                L{node.level}
              </span>
              {node.group && (
                <span className="text-[8px] font-black uppercase text-white bg-indigo-500 px-1.5 py-0.5 rounded shadow-sm truncate max-w-[60px]">
                  {node.group}
                </span>
              )}
            </div>
            <div className="flex items-center">
              <button
                type="button"
                onClick={onEditClick}
                className={`opacity-0 group-hover:opacity-100 p-1 rounded transition-all ${
                  isSelected
                    ? 'text-slate-400 hover:text-white hover:bg-slate-700'
                    : 'text-slate-300 hover:text-orange-500 hover:bg-orange-50'
                }`}
                title="编辑策略"
              >
                <Icon name="edit" size={12} />
              </button>
            </div>
          </div>
          <div
            className={`text-[11px] font-bold truncate ${
              isSelected ? 'text-white' : 'text-slate-700'
            }`}
          >
            {node.name}
          </div>
        </div>
      </div>
    </div>
  );
};
