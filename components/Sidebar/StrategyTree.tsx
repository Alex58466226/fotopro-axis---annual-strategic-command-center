import React from 'react';
import { StrategyNode, Task } from '../../types';
import { StrategyNodeComponent } from './StrategyNode';
import { TaskNode } from './TaskNode';

interface StrategyTreeProps {
  node: StrategyNode;
  strategies: StrategyNode[];
  tasks: Task[];
  expandedNodes: Set<string>;
  activeNodeId: string;
  onNodeClick: (nodeId: string) => void;
  onNodeEdit: (e: React.MouseEvent, node: StrategyNode) => void;
  onTaskClick: (e: React.MouseEvent, task: Task) => void;
  onToggleExpand: (e: React.MouseEvent, nodeId: string) => void;
  getOwnerDisplayName?: (owner: string) => string; // 新增：获取 owner 显示名称
}

/**
 * 策略树组件（递归渲染）
 */
export const StrategyTree: React.FC<StrategyTreeProps> = ({
  node,
  strategies,
  tasks,
  expandedNodes,
  activeNodeId,
  onNodeClick,
  onNodeEdit,
  onTaskClick,
  onToggleExpand,
  getOwnerDisplayName,
}) => {
  const childStrategies = strategies.filter(s => s.parentId === node.id);
  const childTasks = tasks.filter(t => t.parentId === node.id);
  const hasChildren = childStrategies.length > 0 || childTasks.length > 0;
  const isExpanded = expandedNodes.has(node.id);
  const isSelected = activeNodeId === node.id;

  return (
    <>
      <StrategyNodeComponent
        node={node}
        isSelected={isSelected}
        isExpanded={isExpanded}
        hasChildren={hasChildren}
        onNodeClick={() => onNodeClick(node.id)}
        onEditClick={(e) => onNodeEdit(e, node)}
        onToggleExpand={(e) => onToggleExpand(e, node.id)}
        getOwnerDisplayName={getOwnerDisplayName}
      />
      {isExpanded && hasChildren && (
        <div className="border-l border-slate-100 ml-2">
          {childStrategies.map(childNode => (
            <StrategyTree
              key={childNode.id}
              node={childNode}
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
          {childTasks.map(task => (
            <TaskNode key={task.id} task={task} onTaskClick={onTaskClick} />
          ))}
        </div>
      )}
    </>
  );
};
