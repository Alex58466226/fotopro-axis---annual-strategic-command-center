import React, { useState, useRef, useEffect } from 'react';
import Icon from '../Icon';
import { StrategyNode, Task } from '../../types';
import { chatWithAI } from '../../services/aiService';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  suggestions?: TaskSuggestion[];
  reportItems?: ReportItem[];
}

interface TaskSuggestion {
  title: string;
  description: string;
}

interface ReportItem {
  type: '进展' | '问题' | '计划' | '结果' | '复盘';
  content: string;
}

interface AIChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeNode: StrategyNode;
  strategies: StrategyNode[];
  tasks: Task[];
  onSelectSuggestion?: (suggestion: TaskSuggestion) => void;
  onUseReportItems?: (items: ReportItem[]) => void;
}

/**
 * AI 聊天助手 Modal
 * 整合智能周报、快速建议、项目总结等功能
 */
export const AIChatModal: React.FC<AIChatModalProps> = ({
  isOpen,
  onClose,
  activeNode,
  strategies,
  tasks,
  onSelectSuggestion,
  onUseReportItems,
}) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // 初始化欢迎消息
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{
        id: 'welcome',
        role: 'assistant',
        content: `你好！我是你的 AI 项目管理助手。我可以帮你：

📋 **生成任务建议** - 根据当前策略生成具体执行任务
📊 **生成周报** - 自动总结项目进展和问题
📈 **项目评估** - 分析项目状态和风险
💡 **回答疑问** - 关于项目管理的任何问题

你可以直接问我，比如：
- "帮我生成一些任务建议"
- "总结一下当前项目进展"
- "评估一下这个项目的风险"
- "生成本周的工作周报"

或者直接描述你的需求，我会尽力帮助你！`,
        timestamp: new Date(),
      }]);
    }
  }, [isOpen, messages.length]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 聚焦输入框
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // 发送消息
  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: `msg-${Date.now()}`,
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      // 计算统计数据
      const stats = {
        total: tasks.length,
        completed: tasks.filter((t: Task) => t.status === 'completed' || t.status === 'confirmed').length,
        rate: tasks.length > 0 
          ? Math.round((tasks.filter((t: Task) => t.status === 'completed' || t.status === 'confirmed').length / tasks.length) * 100)
          : 0,
        timeUsedRate: 0, // 可以后续计算
      };

      // 调用 AI 服务
      const data = await chatWithAI(userMessage.content, {
        activeNode,
        strategies,
        tasks,
        stats,
      });
      
      const assistantMessage: Message = {
        id: `msg-${Date.now()}-assistant`,
        role: 'assistant',
        content: data.content || '抱歉，我暂时无法回答这个问题。',
        timestamp: new Date(),
        suggestions: data.suggestions,
        reportItems: data.reportItems,
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('AI 聊天错误:', error);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        role: 'assistant',
        content: '抱歉，AI 服务暂时不可用。请检查 API 配置或稍后重试。',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // 快捷操作
  const quickActions = [
    { label: '生成任务建议', prompt: '帮我生成一些针对当前策略的具体执行任务建议' },
    { label: '生成周报', prompt: '帮我生成本周的工作周报，包括进展、问题和计划' },
    { label: '项目评估', prompt: '评估一下当前项目的整体状态和风险' },
    { label: '进展总结', prompt: '总结一下当前项目的进展情况和完成度' },
  ];

  const handleQuickAction = (prompt: string) => {
    setInput(prompt);
    setTimeout(() => handleSend(), 100);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-[9999] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[2.5rem] shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden ring-1 ring-white/20">
        {/* Header */}
        <div className="p-6 pb-4 border-b border-slate-100 bg-gradient-to-r from-indigo-50 to-purple-50 flex justify-between items-center">
          <div>
            <h3 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Icon name="sparkles" size={20} className="text-indigo-500" />
              AI 项目管理助手
            </h3>
            <p className="text-[10px] font-bold text-slate-400 mt-1">
              当前策略: {activeNode.name}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 bg-white rounded-full text-slate-400 hover:text-slate-900 shadow-sm border border-slate-100 transition-all"
          >
            <Icon name="close" size={20} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 custom-scrollbar space-y-4">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Icon name="sparkles" size={16} className="text-white" />
                </div>
              )}
              <div
                className={`max-w-[80%] rounded-2xl p-4 ${
                  msg.role === 'user'
                    ? 'bg-indigo-500 text-white'
                    : 'bg-slate-50 text-slate-700 border border-slate-200'
                }`}
              >
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {msg.content}
                </div>
                
                {/* 任务建议 */}
                {msg.suggestions && msg.suggestions.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs font-bold text-slate-500 mb-2">建议的任务：</div>
                    {msg.suggestions.map((suggestion, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onSelectSuggestion?.(suggestion)}
                        className="w-full text-left p-3 bg-white border border-indigo-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all"
                      >
                        <div className="font-bold text-sm text-slate-700">{suggestion.title}</div>
                        <div className="text-xs text-slate-500 mt-1">{suggestion.description}</div>
                      </button>
                    ))}
                  </div>
                )}

                {/* 周报条目 */}
                {msg.reportItems && msg.reportItems.length > 0 && (
                  <div className="mt-4 space-y-2">
                    <div className="text-xs font-bold text-slate-500 mb-2">生成的周报：</div>
                    {msg.reportItems.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 bg-white border border-slate-200 rounded-lg"
                      >
                        <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded">
                          {item.type}
                        </span>
                        <div className="text-sm text-slate-700 mt-2">{item.content}</div>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => onUseReportItems?.(msg.reportItems || [])}
                      className="w-full mt-2 px-4 py-2 bg-indigo-500 text-white text-sm font-bold rounded-lg hover:bg-indigo-600 transition-colors"
                    >
                      使用这些周报条目
                    </button>
                  </div>
                )}

                <div className="text-[10px] text-slate-400 mt-2">
                  {msg.timestamp.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <Icon name="user" size={16} className="text-white" />
                </div>
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex gap-3 justify-start">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                <Icon name="sparkles" size={16} className="text-white" />
              </div>
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4">
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Quick Actions */}
        {messages.length === 1 && (
          <div className="px-6 pt-4 pb-2 border-t border-slate-100">
            <div className="text-xs font-bold text-slate-400 mb-2">快捷操作：</div>
            <div className="flex flex-wrap gap-2">
              {quickActions.map((action, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickAction(action.prompt)}
                  className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  {action.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Input */}
        <div className="p-6 border-t border-slate-100 bg-slate-50">
          <div className="flex gap-3 items-end">
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="输入你的问题或需求..."
              className="flex-1 p-3 bg-white border border-slate-200 rounded-xl text-sm text-slate-700 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 resize-none"
              rows={2}
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              <Icon name="right" size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
