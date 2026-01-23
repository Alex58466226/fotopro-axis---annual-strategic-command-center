import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { StrategyNode, Task, Level, Metric, ReportItem, ReportTag, TaskReport, User, AuditLog, TaskStatus } from './types';
import { TODAY_STR, PROJECT_START, PROJECT_END, formatDate, getDayOffset, getMonthRange, getWeekRange, MOCK_USERS, AVATAR_COLORS } from './constants';
import Icon from './components/Icon';
import { suggestL4Tasks, generateWeeklyReport, generateTaskSuggestions } from './services/aiService';
import { AuthContainer, type AuthMode } from './components/Auth/AuthContainer';
import { Sidebar } from './components/Sidebar/Sidebar';
import { Header } from './components/Header/Header';
import { FilterPanel } from './components/FilterPanel/FilterPanel';
import { GanttChart } from './components/GanttChart/GanttChart';
import { TaskList } from './components/TaskList/TaskList';
import { MapModal } from './components/Modal/MapModal';
import { UserManagementModal } from './components/Modal/UserManagementModal';
import { AuditLogModal } from './components/Modal/AuditLogModal';
import { StrategyModal } from './components/Modal/StrategyModal';
import { TaskModal } from './components/Modal/TaskModal';
import { ReportModal } from './components/Modal/ReportModal';
import { ProjectDashboardModal } from './components/Modal/ProjectDashboardModal';
import { FullscreenModal } from './components/Modal/FullscreenModal';
import { ImportModal } from './components/Modal/ImportModal';
import { AIChatModal } from './components/Modal/AIChatModal';
import { ToastContainer, type ToastType } from './components/Toast';
import {
  loginWithSupabase,
  registerWithSupabase,
  resetPasswordWithSupabase,
  getCurrentUser,
  logoutWithSupabase,
  saveLoginState,
  clearLoginState,
  createLoginLog,
  createRegisterLog,
  createLogoutLog,
  createResetPasswordLog,
  // 兼容性导出
  validateLogin,
  validateRegister,
  validateResetPassword,
} from './services/authService';
import {
  loadStrategies,
  saveStrategies,
  deleteStrategy as deleteStrategyFromSupabase,
  loadTasks,
  saveTasks,
  deleteTask as deleteTaskFromSupabase,
  loadAuditLogs,
  saveAuditLog,
  saveAuditLogs,
} from './services/supabaseDataService';
import { supabase } from './services/supabaseClient';
import {
  type Validator
} from './services/storageService';

// --- Helper Functions ---
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 999)}`;

const exportToCSV = (tasks: Task[], strategies: StrategyNode[], filteredStrategies: StrategyNode[], showToast?: (type: ToastType, message: string) => void) => {
  // 检查是否有数据
  if ((!tasks || tasks.length === 0) && (!filteredStrategies || filteredStrategies.length === 0)) {
    if (showToast) {
      showToast('error', '没有可导出的数据');
    } else {
      alert('没有可导出的数据');
    }
    return;
  }

  const strategyMap = new Map(strategies.map(s => [s.id, s]));
  
  // 辅助函数：安全地转义 CSV 字段
  const escapeCSV = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    // 如果包含逗号、引号或换行符，需要用引号包裹并转义引号
    if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  // 表头：包含层级信息和 Report 信息
  const headers = [
    'Level',           // L1, L2, L3, L4
    'L1 Name',         // L1 策略名称
    'L2 Name',         // L2 策略名称
    'L3 Name',         // L3 策略名称
    'L4 Task ID',      // L4 任务 ID
    'L4 Task Content', // L4 任务内容
    'Task Status',     // 任务状态
    'Task Progress',   // 任务进度
    'Task Priority',   // 任务优先级
    'Task Owner',      // 任务负责人
    'Task Start Date', // 任务开始日期
    'Task End Date',   // 任务结束日期
    'Task Product',    // 任务产品
    'Task Channel',    // 任务渠道
    'Task Score',      // 任务评分
    'Task Reviewer',   // 任务审核人
    'Task Notes',      // 任务备注
    'Report ID',       // 报告 ID
    'Report Type',     // 报告类型（计划/进展/问题/结果/复盘）
    'Report Content',  // 报告内容
    'Report Timestamp' // 报告时间戳
  ];
  
  const rows: string[] = [];
  
  // 辅助函数：获取策略节点的所有父级
  const getStrategyHierarchy = (strategy: StrategyNode): { l1: StrategyNode | null, l2: StrategyNode | null, l3: StrategyNode | null } => {
    let l1: StrategyNode | null = null;
    let l2: StrategyNode | null = null;
    let l3: StrategyNode | null = null;
    
    if (strategy.level === 1) {
      l1 = strategy;
    } else if (strategy.level === 2) {
      l2 = strategy;
      l1 = strategy.parentId ? strategyMap.get(strategy.parentId) || null : null;
    } else if (strategy.level === 3) {
      l3 = strategy;
      const parent = strategy.parentId ? strategyMap.get(strategy.parentId) : null;
      if (parent) {
        l2 = parent;
        l1 = parent.parentId ? strategyMap.get(parent.parentId) || null : null;
      }
    }
    
    return { l1, l2, l3 };
  };
  
  // 1. 导出策略节点（L1-L3）- 每个策略一行，没有 Report
  filteredStrategies.forEach(strategy => {
    const { l1, l2, l3 } = getStrategyHierarchy(strategy);
    
    rows.push([
      escapeCSV(`L${strategy.level}`),
      escapeCSV(l1?.name || ''),
      escapeCSV(l2?.name || ''),
      escapeCSV(l3?.name || ''),
      '', // L4 Task ID
      '', // L4 Task Content
      '', // Task Status
      '', // Task Progress
      '', // Task Priority
      escapeCSV(strategy.owner || ''),
      escapeCSV(strategy.start || ''),
      escapeCSV(strategy.end || ''),
      escapeCSV(strategy.product || ''),
      escapeCSV(strategy.channel || ''),
      '', // Task Score
      '', // Task Reviewer
      escapeCSV(strategy.description || ''),
      '', // Report ID
      '', // Report Type
      '', // Report Content
      ''  // Report Timestamp
    ].join(','));
  });
  
  // 2. 导出任务（L4）- 每个任务的每个 Report 一行
  tasks.forEach(task => {
    const l3 = strategyMap.get(task.parentId);
    const l2 = l3?.parentId ? strategyMap.get(l3.parentId) : null;
    const l1 = l2?.parentId ? strategyMap.get(l2.parentId) : null;
    
    // 如果任务有 reports，每个 report 一行
    if (task.reports && task.reports.length > 0) {
      task.reports.forEach(report => {
        rows.push([
          escapeCSV('L4'),
          escapeCSV(l1?.name || ''),
          escapeCSV(l2?.name || ''),
          escapeCSV(l3?.name || ''),
          escapeCSV(task.id),
          escapeCSV(task.text),
          escapeCSV(task.status),
          escapeCSV(`${task.progress}%`),
          escapeCSV(task.priority),
          escapeCSV(task.owner),
          escapeCSV(task.start),
          escapeCSV(task.end),
          escapeCSV(task.product),
          escapeCSV(task.channel),
          escapeCSV(task.score || ''),
          escapeCSV(task.reviewer || ''),
          escapeCSV(task.notes || ''),
          escapeCSV(report.id),
          escapeCSV(report.type),
          escapeCSV(report.content),
          escapeCSV(report.timestamp)
        ].join(','));
      });
    } else {
      // 如果任务没有 reports，仍然导出一行（Report 字段为空）
      rows.push([
        escapeCSV('L4'),
        escapeCSV(l1?.name || ''),
        escapeCSV(l2?.name || ''),
        escapeCSV(l3?.name || ''),
        escapeCSV(task.id),
        escapeCSV(task.text),
        escapeCSV(task.status),
        escapeCSV(`${task.progress}%`),
        escapeCSV(task.priority),
        escapeCSV(task.owner),
        escapeCSV(task.start),
        escapeCSV(task.end),
        escapeCSV(task.product),
        escapeCSV(task.channel),
        escapeCSV(task.score || ''),
        escapeCSV(task.reviewer || ''),
        escapeCSV(task.notes || ''),
        '', // Report ID
        '', // Report Type
        '', // Report Content
        ''  // Report Timestamp
      ].join(','));
    }
  });

  // 构建 CSV 内容：BOM + 表头 + 数据行
  const csvContent = "\uFEFF" + [headers.join(','), ...rows].join('\r\n');
  
  // 创建 Blob 并下载
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `fotopro_report_${formatDate(new Date())}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  // 清理 URL 对象
  setTimeout(() => URL.revokeObjectURL(url), 100);
  
  // CSV export completed
};

// --- Initial Data ---
// 已移除测试数据，所有数据从 Supabase 加载

interface ModalState {
  isOpen: boolean;
  mode: 'create' | 'edit';
  data: Partial<StrategyNode> & { tagsString?: string };
}

const DEFAULT_MODAL_DATA = {
  name: '',
  level: 1 as Level,
  parentId: '',
  owner: '',
  group: '',
  channel: '',
  product: '',
  tagsString: '',
  metrics: [] as Metric[],
  start: PROJECT_START,
  end: formatDate(new Date(new Date(PROJECT_START).getTime() + 90 * 86400000)),
};

// 注意：TAG_STYLES 和 STATUS_CONFIG 已移至各个组件内部

// Filter Types
interface Filters {
    owner: string;
    channel: string;
    product: string;
    tag: string;
    time: 'all' | 'today' | 'week' | 'month' | 'custom';
    customStartDate?: string;
    customEndDate?: string;
}

// --- Data Validators (移到组件外部，避免初始化顺序问题) ---
const strategyValidator: Validator<StrategyNode[]> = (data) => {
  if (!Array.isArray(data)) {
    return { valid: false, error: '策略数据必须是数组' };
  }
  for (const s of data) {
    if (!s.id || !s.name || !s.level) {
      return { valid: false, error: '策略数据格式不完整：缺少 id、name 或 level' };
    }
  }
  return { valid: true };
};

const taskValidator: Validator<Task[]> = (data) => {
  if (!Array.isArray(data)) {
    return { valid: false, error: '任务数据必须是数组' };
  }
  for (const t of data) {
    if (!t.id || !t.text || !Array.isArray(t.reports)) {
      return { valid: false, error: '任务数据格式不完整：缺少 id、text 或 reports 数组' };
    }
  }
  return { valid: true };
};

const auditLogValidator: Validator<AuditLog[]> = (data) => {
  if (!Array.isArray(data)) {
    return { valid: false, error: '审计日志数据必须是数组' };
  }
  return { valid: true };
};

const userValidator: Validator<User[]> = (data) => {
  if (!Array.isArray(data)) {
    return { valid: false, error: '用户数据必须是数组' };
  }
  for (const u of data) {
    if (!u.id || !u.username) {
      return { valid: false, error: '用户数据格式不完整：缺少 id 或 username' };
    }
  }
  return { valid: true };
};

const App: React.FC = () => {
  // --- Auth State ---
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register' | 'forgot'>('login');
  
  // Initialize users from Supabase (loaded in useEffect)
  const [users, setUsers] = useState<User[]>([]);

  const [loginUsername, setLoginUsername] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [loginError, setLoginError] = useState('');

  const [registerData, setRegisterData] = useState({
      username: '',
      password: '',
      confirmPassword: ''
  });
  
  // --- Admin User Management State ---
  const [isUserMgmtOpen, setIsUserMgmtOpen] = useState(false);
  const [newUser, setNewUser] = useState({ username: '', password: '' });

  // --- Data State ---
  const [strategies, setStrategies] = useState<StrategyNode[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

  const [activeNodeId, setActiveNodeId] = useState<string>('');
  const [ganttScale, setGanttScale] = useState(10);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [taskSuggestions, setTaskSuggestions] = useState<Array<{ title: string; description: string }>>([]);
  
  // --- UI State ---
  const [filters, setFilters] = useState<Filters>({
    owner: 'all', channel: 'all', product: 'all', tag: 'all', time: 'all'
  });
  const [isFilterCollapsed, setIsFilterCollapsed] = useState(false);
  const [isGanttCollapsed, setIsGanttCollapsed] = useState(false);
  
  // 甘特图折叠切换函数 - 使用 useCallback 避免重复创建
  const handleGanttToggle = useCallback(() => {
    setIsGanttCollapsed(prev => !prev);
  }, []);
  
  const [ganttHeight, setGanttHeight] = useState<number>(320);
  const [isListCollapsed, setIsListCollapsed] = useState(false);
  const [listHeight, setListHeight] = useState<number>(400);

  // Sidebar Tree State
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set());
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isAIChatOpen, setIsAIChatOpen] = useState(false);
  
  // Toast 通知状态
  const [toasts, setToasts] = useState<Array<{ id: string; type: ToastType; message: string }>>([]);

  // Strategy Modal State
  const [modal, setModal] = useState<ModalState>({
    isOpen: false, mode: 'create', data: { ...DEFAULT_MODAL_DATA }
  });

  // Task Edit Modal State
  const [taskModal, setTaskModal] = useState<{ isOpen: boolean; data: Task | null }>({
    isOpen: false, data: null
  });

  // Confirmation Modal State
  const [confirmState, setConfirmState] = useState<{ isOpen: boolean; title: string; message: string; onConfirm: () => void }>({
    isOpen: false, title: '', message: '', onConfirm: () => {}
  });

  // Report Modal State
  const [reportModal, setReportModal] = useState<{ isOpen: boolean; items: ReportItem[]; isGenerating: boolean }>({
    isOpen: false, items: [], isGenerating: false
  });

  // Dashboard Modal State
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  // Fullscreen Modal States
  const [fullscreenMode, setFullscreenMode] = useState<'gantt' | 'filter' | 'tasklist' | null>(null);

  // Resize Ref
  const resizeRef = useRef<{ startY: number, startHeight: number, setter: (h: number) => void } | null>(null);

  // --- Resize Logic ---
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        if (resizeRef.current) {
            const delta = e.clientY - resizeRef.current.startY;
            resizeRef.current.setter(Math.max(150, resizeRef.current.startHeight + delta));
        }
    };
    const handleMouseUp = () => {
        resizeRef.current = null;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = 'auto';
    };
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
    return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
    };
  }, []);

  const startResize = (e: React.MouseEvent, setter: (h: number) => void, currentHeight: number) => {
    e.preventDefault();
    e.stopPropagation();
    resizeRef.current = { startY: e.clientY, startHeight: currentHeight, setter };
    document.body.style.cursor = 'row-resize';
    document.body.style.userSelect = 'none';
  };

  // 使用 ref 跟踪是否已初始化，避免首次加载时覆盖数据
  const isInitializedRef = useRef(false);
  
  // 错误提示状态
  const [storageError, setStorageError] = useState<string | null>(null);

  // 注意：数据验证器已移至组件外部（第 275-318 行），避免初始化顺序问题

  // --- Persistence with Supabase ---
  useEffect(() => {
    // 检查当前登录状态（Supabase Auth）
    const checkAuth = async () => {
      const user = await getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    };
    checkAuth();

    // 清理旧的 localStorage 数据（避免读取测试数据）
    const clearOldLocalStorage = () => {
      try {
        const keysToRemove = [
          'fotopro_axis_v2_strategies',
          'fotopro_axis_v2_tasks',
          'fotopro_axis_v2_logs',
          'fotopro_axis_v2_user',
          'fotopro_axis_v2_users_db',
          'fotopro_axis_data_version',
        ];
        let clearedCount = 0;
        keysToRemove.forEach(key => {
          if (localStorage.getItem(key)) {
            localStorage.removeItem(key);
            clearedCount++;
            console.log('已清理 localStorage:', key);
          }
        });
        if (clearedCount > 0) {
          console.log(`已清理 ${clearedCount} 个 localStorage 键`);
        }
      } catch (error) {
        console.warn('清理 localStorage 失败:', error);
      }
    };

    // 加载所有数据（从 Supabase）
    const loadAllData = async () => {
      try {
        // 首先清理旧的 localStorage 数据
        clearOldLocalStorage();

        // 加载策略数据
        const strategiesData = await loadStrategies();
        console.log('从 Supabase 加载的策略数据:', strategiesData?.length || 0, '条');
        if (strategiesData && strategiesData.length > 0) {
          console.log('策略数据示例:', strategiesData.slice(0, 2).map(s => ({ id: s.id, name: s.name })));
        }
        setStrategies(strategiesData || []);
        
        // 如果加载到数据且当前没有选中节点，设置默认选中的节点（第一个 L1 策略）
        if (strategiesData && strategiesData.length > 0) {
          // 不再自动设置 activeNodeId，保持为空以显示全部项目
          // 只有用户明确点击策略节点时才会设置 activeNodeId
          const firstL1 = strategiesData.find(s => s.level === 1);
          if (firstL1) {
            // 自动展开第一个 L1 策略（但不选中）
            setExpandedNodes(prev => {
              const newSet = new Set(prev);
              newSet.add(firstL1.id);
              return newSet;
            });
          }
        }

        // 加载任务数据
        const tasksData = await loadTasks();
        console.log('从 Supabase 加载的任务数据:', tasksData?.length || 0, '条');
        if (tasksData && tasksData.length > 0) {
          console.log('任务数据示例:', tasksData.slice(0, 2).map(t => ({ id: t.id, text: t.text })));
        }
        setTasks(tasksData || []);

        // 加载审计日志
        const logsData = await loadAuditLogs();
        setAuditLogs(logsData || []);

        // 加载用户列表（从 profiles 表）
        const { data: profiles, error: profilesError } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: true });

        if (!profilesError && profiles) {
          const usersList: User[] = profiles.map((p: any) => ({
            id: p.id,
            username: p.username,
            password: '', // 不再存储密码
            role: p.role as 'Admin' | 'User' | 'Viewer',
            avatarColor: p.avatar_color,
          }));
          setUsers(usersList);
        } else if (profilesError) {
          console.error('加载用户列表失败:', profilesError);
        }
      } catch (error) {
        console.error('加载数据异常:', error);
        setStorageError('加载数据失败，请刷新页面重试');
      }

      // 标记为已初始化
      isInitializedRef.current = true;
    };

    loadAllData();
  }, []);

  // 切换策略节点时清空建议
  useEffect(() => {
    setTaskSuggestions([]);
  }, [activeNodeId]);

  // 保存数据到 Supabase（防抖）
  useEffect(() => {
    if (!isInitializedRef.current) {
      return;
    }

    const saveData = async () => {
      try {
        // 检查用户是否登录
        if (!currentUser) {
          console.warn('用户未登录，跳过数据保存');
          return;
        }

        // 保存策略数据
        const strategiesResult = await saveStrategies(strategies);
        if (!strategiesResult.success) {
          console.error('保存策略数据失败:', strategiesResult.error);
          setStorageError(`保存策略数据失败: ${strategiesResult.error}`);
          setTimeout(() => setStorageError(null), 5000); // 延长显示时间以便查看
          return;
        }

        // 保存任务数据
        const tasksResult = await saveTasks(tasks);
        if (!tasksResult.success) {
          console.error('保存任务数据失败:', tasksResult.error);
          setStorageError(`保存任务数据失败: ${tasksResult.error}`);
          setTimeout(() => setStorageError(null), 5000);
          return;
        }

        // 保存审计日志（只保存最新的，避免过多）
        if (auditLogs.length > 0) {
          const recentLogs = auditLogs.slice(0, 100); // 只保存最近 100 条
          const logsResult = await saveAuditLogs(recentLogs);
          if (!logsResult.success) {
            console.error('保存审计日志失败:', logsResult.error);
            // 日志保存失败不影响主流程
          }
        }

        // 清除错误提示
        if (storageError) {
          setStorageError(null);
        }
      } catch (error: any) {
        console.error('保存数据异常:', error);
        setStorageError(`保存数据失败: ${error.message || '未知错误'}`);
        setTimeout(() => setStorageError(null), 3000);
      }
    };

    // 防抖：1 秒后保存
    const timeoutId = setTimeout(saveData, 1000);
    return () => clearTimeout(timeoutId);
  }, [strategies, tasks, auditLogs]);

  // --- Toast 通知系统 ---
  const showToast = (type: ToastType, message: string) => {
    const id = generateId('toast');
    setToasts(prev => [...prev, { id, type, message }]);
  };

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  // --- Logging System ---
  const addLog = (
      action: 'LOGIN' | 'CREATE' | 'UPDATE' | 'DELETE' | 'REPORT',
      targetType: 'STRATEGY' | 'TASK' | 'SYSTEM',
      targetName: string,
      details: string
  ) => {
      if (!currentUser) return;
      
      const newLog: AuditLog = {
          id: generateId('log'),
          userId: currentUser.id,
          userName: currentUser.username,
          action,
          targetType,
          targetName,
          details,
          timestamp: new Date().toISOString()
      };
      setAuditLogs(prev => [newLog, ...prev].slice(0, 500));
  };

  // --- Auth Actions ---
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 使用 Supabase Auth 登录
    const result = await loginWithSupabase(loginUsername, loginPassword);
    
    if (result.success && result.user) {
      setCurrentUser(result.user);
      
      // Supabase Auth 会自动管理 session，不需要手动保存
      const saveResult = saveLoginState(result.user);
      if (!saveResult.success) {
        console.error('保存登录状态失败:', saveResult.error);
        setStorageError(`保存登录状态失败: ${saveResult.error}`);
      }
      
      // 创建登录日志
      const loginLog = createLoginLog(result.user);
      loginLog.userId = result.user.id;
      setAuditLogs(prev => [loginLog, ...prev]);
      
      // 保存日志到 Supabase
      await saveAuditLog(loginLog);

      setLoginError('');
      setLoginUsername('');
      setLoginPassword('');
    } else {
      setLoginError(result.error || '登录失败');
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 使用 Supabase Auth 注册
    const result = await registerWithSupabase(
      registerData.username,
      registerData.password,
      registerData.confirmPassword
    );

    if (result.success && result.user) {
      // 更新用户列表（从 Supabase 重新加载）
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (profiles) {
        const usersList: User[] = profiles.map((p: any) => ({
          id: p.id,
          username: p.username,
          password: '',
          role: p.role as 'Admin' | 'User' | 'Viewer',
          avatarColor: p.avatar_color,
        }));
        setUsers(usersList);
      }

      setCurrentUser(result.user);
      
      // Supabase Auth 会自动管理 session
      const saveResult = saveLoginState(result.user);
      if (!saveResult.success) {
        console.error('保存登录状态失败:', saveResult.error);
        setStorageError(`保存登录状态失败: ${saveResult.error}`);
      }

      // 创建注册日志
      const registerLog = createRegisterLog(result.user);
      registerLog.userId = result.user.id;
      setAuditLogs(prev => [registerLog, ...prev]);
      
      // 保存日志到 Supabase
      await saveAuditLog(registerLog);

      setRegisterData({ username: '', password: '', confirmPassword: '' });
      setLoginError('');
    } else {
      setLoginError(result.error || '注册失败');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 使用 Supabase Auth 重置密码
    const result = await resetPasswordWithSupabase(
      registerData.username,
      registerData.password,
      registerData.confirmPassword
    );

    if (result.success) {
      if (currentUser) {
        const resetLog = createResetPasswordLog(currentUser);
        resetLog.userId = currentUser.id;
        setAuditLogs(prev => [resetLog, ...prev]);
        await saveAuditLog(resetLog);
      }

      setRegisterData({ username: '', password: '', confirmPassword: '' });
      setLoginError('');
      setLoginUsername(registerData.username);
      setAuthMode('login');
      showToast('success', '密码更新成功，请使用新密码登录');
    } else {
      setLoginError(result.error || '重置密码失败');
    }
  };

  const handleLogout = async () => {
    if (currentUser) {
      const logoutLog = createLogoutLog(currentUser);
      logoutLog.userId = currentUser.id;
      setAuditLogs(prev => [logoutLog, ...prev]);
      await saveAuditLog(logoutLog);
    }
    
    // 使用 Supabase Auth 登出
    await logoutWithSupabase();
    
    setCurrentUser(null);
    const clearResult = await clearLoginState();
    if (!clearResult.success) {
      console.error('清除登录状态失败:', clearResult.error);
    }
    setAuthMode('login'); 
  };
  
  // --- Admin User Management ---
  const handleAddUser = async () => {
    // 获取并清理输入值
    const username = (newUser.username || '').trim();
    const password = (newUser.password || '').trim();
    
    // 验证字段
    if (!username) {
      showToast('error', '请输入用户名');
      return;
    }
    
    if (!password) {
      showToast('error', '请输入密码');
      return;
    }
    
    // 检查用户名是否已存在（从 Supabase profiles 表）
    const { data: existingProfiles } = await supabase
      .from('profiles')
      .select('username')
      .eq('username', username)
      .limit(1);
    
    if (existingProfiles && existingProfiles.length > 0) {
      showToast('error', `用户名 "${username}" 已存在`);
      return;
    }
    
    try {
      // 使用 Supabase Auth 创建用户
      const email = username.includes('@') ? username : `${username}@fotopro.local`;
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError || !authData.user) {
        showToast('error', authError?.message || '创建用户失败');
        return;
      }

      // 创建 profile 记录
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          id: authData.user.id,
          username: username,
          role: 'User',
          avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
        });

      if (profileError) {
        console.error('创建用户信息失败:', profileError);
        showToast('error', '创建用户信息失败');
        return;
      }

      // 重新加载用户列表
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: true });

      if (profiles) {
        const usersList: User[] = profiles.map((p: any) => ({
          id: p.id,
          username: p.username,
          password: '',
          role: p.role as 'Admin' | 'User' | 'Viewer',
          avatarColor: p.avatar_color,
        }));
        setUsers(usersList);
      }

      addLog('CREATE', 'SYSTEM', username, 'Admin manually created user');
      showToast('success', `用户 "${username}" 创建成功！`);
      
      setNewUser({ username: '', password: '' });
    } catch (error: any) {
      console.error('创建用户异常:', error);
      showToast('error', `创建用户失败: ${error.message || '未知错误'}`);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?.id) {
      showToast('error', '不能删除当前登录的用户');
      return;
    }
    const u = users.find(user => user.id === id);
    if (!u) return;
    
    safeConfirm("Delete User", `Are you sure you want to delete user "${u.username}"?`, async () => {
      try {
        // 从 Supabase 删除用户（会级联删除 profile）
        const { error } = await supabase.auth.admin.deleteUser(id);
        
        if (error) {
          console.error('删除用户失败:', error);
          showToast('error', `删除用户失败: ${error.message}`);
          return;
        }

        // 重新加载用户列表
        const { data: profiles } = await supabase
          .from('profiles')
          .select('*')
          .order('created_at', { ascending: true });

        if (profiles) {
          const usersList: User[] = profiles.map((p: any) => ({
            id: p.id,
            username: p.username,
            password: '',
            role: p.role as 'Admin' | 'User' | 'Viewer',
            avatarColor: p.avatar_color,
          }));
          setUsers(usersList);
        }

        setConfirmState(prev => ({...prev, isOpen: false}));
        addLog('DELETE', 'SYSTEM', u.username, 'Admin deleted user');
        showToast('success', `用户 "${u.username}" 已删除`);
      } catch (error: any) {
        console.error('删除用户异常:', error);
        showToast('error', `删除用户失败: ${error.message || '未知错误'}`);
      }
    });
  };

  // --- Derived Data & Functions (Unchanged) ---
  // 获取当前选中的节点，如果没有选中或节点不存在，返回一个默认的空节点结构
  const activeNode = useMemo(() => {
    if (activeNodeId) {
      const found = strategies.find(s => s.id === activeNodeId);
      if (found) return found;
    }
    // 如果没有选中节点，返回一个默认的空节点结构（用于显示全部项目）
    // 不再自动选择第一个 L1，保持 activeNodeId 为空以显示全部项目
    if (!activeNodeId) {
      return {
        id: '',
        level: 1 as Level,
        name: '全部项目',
        parentId: null,
        start: PROJECT_START,
        end: PROJECT_END,
        owner: '',
        metrics: [],
        status: 'active' as const
      } as StrategyNode;
    }
    
    // 如果 activeNodeId 存在但节点不存在，尝试查找第一个 L1 作为后备
    const firstL1 = strategies.find(s => s.level === 1);
    if (firstL1) {
      return firstL1;
    }
    // 如果没有任何策略，返回一个默认的空节点结构
    return {
      id: '',
      level: 1 as Level,
      name: '暂无策略',
      parentId: null,
      start: PROJECT_START,
      end: PROJECT_END,
      owner: '',
      metrics: [],
      status: 'active' as const
    } as StrategyNode;
  }, [strategies, activeNodeId]);
  const getDescendantIds = (nodeId: string): string[] => {
    // 如果 nodeId 为空，返回所有策略的ID（显示全部项目）
    if (!nodeId) {
      return strategies.map(s => s.id);
    }
    const children = strategies.filter(s => s.parentId === nodeId);
    let ids = [nodeId];
    children.forEach(c => { ids = [...ids, ...getDescendantIds(c.id)]; });
    return ids;
  };
  const activeBranchIds = useMemo(() => getDescendantIds(activeNodeId), [activeNodeId, strategies]);
  const allBranchTasks = useMemo(() => {
    // 如果 activeNodeId 为空，显示所有任务（全部项目）
    if (!activeNodeId) {
      return tasks.sort((a,b) => a.start.localeCompare(b.start));
    }
    // 否则只显示当前分支下的任务
    return tasks.filter(t => activeBranchIds.includes(t.parentId)).sort((a,b) => a.start.localeCompare(b.start));
  }, [tasks, activeBranchIds, activeNodeId]);
  const filterOptions = useMemo(() => {
      const owners = new Set<string>(); const channels = new Set<string>(); const products = new Set<string>(); const tags = new Set<string>();
      allBranchTasks.forEach(t => { if(t.owner) owners.add(t.owner); if(t.channel) channels.add(t.channel); if(t.product) products.add(t.product); });
      // 如果 activeNodeId 为空，使用所有策略；否则只使用当前分支的策略
      const branchStrategies = activeNodeId 
        ? strategies.filter(s => activeBranchIds.includes(s.id))
        : strategies;
      branchStrategies.forEach(s => { if (s.owner) owners.add(s.owner); if (s.channel) channels.add(s.channel); if (s.product) products.add(s.product); if (s.tags) s.tags.forEach(t => tags.add(t)); });
      return { owners: Array.from(owners).sort(), channels: Array.from(channels).sort(), products: Array.from(products).sort(), tags: Array.from(tags).sort() };
  }, [allBranchTasks, strategies, activeBranchIds, activeNodeId]);
  
  // 收集所有已使用的标签（用于快捷选择）
  const allUsedTags = useMemo(() => {
    const tagSet = new Set<string>();
    strategies.forEach(s => {
      if (s.tags && s.tags.length > 0) {
        s.tags.forEach(tag => tagSet.add(tag));
      }
    });
    return Array.from(tagSet).sort();
  }, [strategies]);
  const filteredStrategies = useMemo(() => {
    return strategies.filter(s => {
        if (!activeBranchIds.includes(s.id)) return false;
        if (filters.owner !== 'all' && s.owner !== filters.owner) return false;
        if (filters.channel !== 'all' && s.channel !== filters.channel) return false;
        if (filters.product !== 'all' && s.product !== filters.product) return false;
        if (filters.tag !== 'all' && (!s.tags || !s.tags.includes(filters.tag))) return false;
        if (filters.time !== 'all') {
              if (filters.time === 'today') { if (!(s.start <= TODAY_STR && s.end >= TODAY_STR)) return false; } 
              else if (filters.time === 'week') { const { start, end } = getWeekRange(TODAY_STR); if (s.end < start || s.start > end) return false; } 
              else if (filters.time === 'month') { const { start, end } = getMonthRange(TODAY_STR); if (s.end < start || s.start > end) return false; }
              else if (filters.time === 'custom' && filters.customStartDate && filters.customEndDate) {
                // 自定义日期范围：策略的时间范围与自定义范围有重叠
                if (s.end < filters.customStartDate || s.start > filters.customEndDate) return false;
              }
        }
        return true;
    }).sort((a, b) => a.level - b.level || a.start.localeCompare(b.start));
  }, [strategies, filters, activeBranchIds]);
  const activeTasks = useMemo(() => {
      return allBranchTasks.filter(t => {
          if (filters.owner !== 'all' && t.owner !== filters.owner) return false;
          if (filters.channel !== 'all' && t.channel !== filters.channel) return false;
          if (filters.product !== 'all' && t.product !== filters.product) return false;
          if (filters.tag !== 'all') { const parentStrategy = strategies.find(s => s.id === t.parentId); const parentTags = parentStrategy?.tags || []; if (!parentTags.includes(filters.tag)) return false; }
          if (filters.time !== 'all') {
              const start = t.start; const end = t.end;
              if (filters.time === 'today') { if (!(start <= TODAY_STR && end >= TODAY_STR)) return false; } 
              else if (filters.time === 'week') { const { start: wStart, end: wEnd } = getWeekRange(TODAY_STR); if (end < wStart || start > wEnd) return false; } 
              else if (filters.time === 'month') { const { start: mStart, end: mEnd } = getMonthRange(TODAY_STR); if (end < mStart || start > mEnd) return false; }
              else if (filters.time === 'custom' && filters.customStartDate && filters.customEndDate) {
                // 自定义日期范围：任务的时间范围与自定义范围有重叠
                if (end < filters.customStartDate || start > filters.customEndDate) return false;
              }
          }
          return true;
      });
  }, [allBranchTasks, filters, strategies]);
  const stats = useMemo(() => {
    const total = activeTasks.length;
    const completed = activeTasks.filter(t => t.status === 'completed' || t.status === 'confirmed').length;
    const remaining = total - completed;
    const rate = total === 0 ? 0 : Math.round((completed / total) * 100);
    const start = new Date(activeNode.start).getTime(); const end = new Date(activeNode.end).getTime(); const now = new Date(TODAY_STR).getTime();
    const oneDay = 24 * 60 * 60 * 1000; const totalDurationDays = Math.max(1, Math.ceil((end - start) / oneDay)); const daysElapsed = Math.max(0, Math.ceil((now - start) / oneDay));
    const totalTime = end - start; const elapsedTime = Math.max(0, now - start); const timeUsedRate = totalTime <= 0 ? 100 : Math.min(100, Math.round((elapsedTime / totalTime) * 100));
    const deviation = rate - timeUsedRate; const isBehind = deviation < 0;
    return { total, completed, remaining, rate, timeUsedRate, daysElapsed, totalDurationDays, deviation, isBehind };
  }, [activeTasks, activeNode]);

  // --- Modal Helpers & Actions ---
  const addMetric = () => { const newMetric: Metric = { id: generateId('m'), label: '', value: '', description: '' }; setModal(prev => ({ ...prev, data: { ...prev.data, metrics: [...(prev.data.metrics || []), newMetric] } })); };
  const updateMetric = (index: number, field: keyof Metric, value: string) => { setModal(prev => { const newMetrics = [...(prev.data.metrics || [])]; newMetrics[index] = { ...newMetrics[index], [field]: value }; return { ...prev, data: { ...prev.data, metrics: newMetrics } }; }); };
  const removeMetric = (index: number) => { setModal(prev => ({ ...prev, data: { ...prev.data, metrics: (prev.data.metrics || []).filter((_, i) => i !== index) } })); };
  const openStrategyModal = (mode: 'create' | 'edit', level?: Level, parentId?: string | null, targetNode?: StrategyNode) => {
    if (mode === 'create') { 
      setModal({ 
        isOpen: true, 
        mode: 'create', 
        data: { 
          ...DEFAULT_MODAL_DATA, 
          level: level || 1, 
          parentId: parentId || '', 
          start: parentId ? (strategies.find(s => s.id === parentId)?.start || PROJECT_START) : PROJECT_START, 
          end: parentId ? (strategies.find(s => s.id === parentId)?.end || PROJECT_END) : PROJECT_END, 
          owner: currentUser?.username || '' 
        } 
      }); 
    } else { 
      const node = targetNode || activeNode; 
      setModal({ 
        isOpen: true, 
        mode: 'edit', 
        data: { 
          ...node, 
          parentId: node.parentId || '', 
          tagsString: node.tags?.join(', ') || '', 
          metrics: node.metrics ? [...node.metrics] : [],
          start: node.start || PROJECT_START,
          end: node.end || PROJECT_END,
          reviewer: node.reviewer,
          score: node.score,
          reviewComment: node.reviewComment
        } 
      }); 
    }
  };
  const handleSaveModal = () => {
    const { name, level, parentId, owner, group, channel, product, tagsString, start, end, id, metrics, reviewer, score, reviewComment } = modal.data;
    if (!name) {
      showToast('error', '策略名称不能为空');
      return;
    }
    if (level !== 1 && !parentId) {
      showToast('error', 'L2/L3 策略必须选择父节点');
      return;
    }
    const tagsArray = tagsString ? tagsString.split(/[，,;；]/).map(t => t.trim()).filter(Boolean) : [];
    const cleanMetrics = (metrics || []).filter(m => m.label && m.value);
    if (modal.mode === 'create') {
      const newNode: StrategyNode = { 
        id: generateId(`L${level}`), 
        level: level as Level, 
        name: name!, 
        parentId: parentId || null, 
        owner: owner || currentUser?.username || '待定', 
        group: group || '', 
        channel: channel || '', 
        product: product || '', 
        tags: tagsArray, 
        start: start || TODAY_STR, 
        end: end || PROJECT_END, 
        metrics: cleanMetrics, 
        status: 'active',
        reviewer: reviewer,
        score: score,
        reviewComment: reviewComment
      };
      setStrategies(prev => [...prev, newNode]); 
      setActiveNodeId(newNode.id); 
      addLog('CREATE', 'STRATEGY', newNode.name, `Created Level ${level} strategy`);
    } else {
      if (!id) return;
      setStrategies(prev => prev.map(s => s.id === id ? { 
        ...s, 
        name: name!, 
        parentId: parentId || null, 
        owner: owner || '', 
        group: group || '', 
        channel: channel || '', 
        product: product || '', 
        tags: tagsArray, 
        metrics: cleanMetrics, 
        start: start!, 
        end: end!,
        reviewer: reviewer,
        score: score,
        reviewComment: reviewComment
      } : s)); 
      addLog('UPDATE', 'STRATEGY', name!, 'Updated strategy details');
    }
    setModal({ ...modal, isOpen: false });
  };

  // 更新策略（用于拖拽等操作）
  const updateStrategy = (id: string, updates: Partial<StrategyNode>) => {
    setStrategies(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
    const strategy = strategies.find(s => s.id === id);
    if (strategy) {
      addLog('UPDATE', 'STRATEGY', strategy.name, `Updated strategy: ${Object.keys(updates).join(', ')}`);
    }
  };
  const safeConfirm = (title: string, message: string, action: () => void) => { setConfirmState({ isOpen: true, title, message, onConfirm: action }); };
  const deleteActiveStrategy = () => {
    if (activeNode.level === 1 && strategies.filter(s => s.level === 1).length <= 1) {
      showToast('error', '至少保留一个 L1 顶级策略');
      return;
    }
    safeConfirm("删除策略节点", `确定要删除策略 "${activeNode.name}" 及其所有子策略和任务吗？`, () => {
      const nodeName = activeNode.name; const idsToDelete = getDescendantIds(activeNodeId);
      setTasks(prev => prev.filter(t => !idsToDelete.includes(t.parentId))); setStrategies(strategies.filter(s => !idsToDelete.includes(s.id))); setConfirmState(prev => ({...prev, isOpen: false})); addLog('DELETE', 'STRATEGY', nodeName, `Deleted strategy and ${idsToDelete.length} descendants`);
      if (strategies.length > 0) setActiveNodeId(strategies[0].id); else window.location.reload(); 
    });
  };
  const addTask = () => {
    let root = activeNode; while (root.parentId) { const p = strategies.find(s => s.id === root.parentId); if (p) root = p; else break; }
    const newTask: Task = { id: generateId('t'), parentId: activeNodeId, rootId: root.id, text: '新任务', start: TODAY_STR, end: TODAY_STR, status: 'todo', progress: 0, owner: currentUser?.username || '', product: '', channel: '', priority: 'P2', notes: '', reports: [] };
    setTasks(prev => [...prev, newTask]); addLog('CREATE', 'TASK', '新任务', `Added task to ${activeNode.name}`);
  };
  // 处理数据导入
  const handleImportData = async (importedStrategies: StrategyNode[], importedTasks: Task[]) => {
    // 直接替换为导入的数据（importService 已经处理了合并策略）
    setStrategies(importedStrategies);
    setTasks(importedTasks);

    // 保存到 Supabase（不再使用 localStorage）
    const strategiesResult = await saveStrategies(importedStrategies);
    const tasksResult = await saveTasks(importedTasks);
    
    if (!strategiesResult.success) {
      showToast('error', `保存策略数据失败: ${strategiesResult.error}`);
    }
    if (!tasksResult.success) {
      showToast('error', `保存任务数据失败: ${tasksResult.error}`);
    }

    // 记录审计日志
    addLog('CREATE', 'SYSTEM', 'Data Import', `导入了 ${importedStrategies.length} 个策略和 ${importedTasks.length} 个任务`);

    showToast('success', `导入成功！策略: ${importedStrategies.length} 个，任务: ${importedTasks.length} 个`);
  };

  // 处理任务重新排序（拖拽后）
  const handleTasksReorder = (reorderedTasks: Task[]) => {
    setTasks(prev => {
      // 更新所有任务的 order 值
      const updatedTasks = prev.map(task => {
        const reorderedTask = reorderedTasks.find(rt => rt.id === task.id);
        if (reorderedTask) {
          return { ...task, order: reorderedTask.order };
        }
        return task;
      });
      return updatedTasks;
    });
    addLog('UPDATE', 'TASK', 'System', 'Tasks reordered via drag and drop');
  };

  const updateTask = (id: string, updates: Partial<Task>) => {
    setTasks(prev => {
      const task = prev.find(t => t.id === id);
      if (!task) {
        console.warn(`Task with id ${id} not found`);
        return prev;
      }
      
      // 处理状态变化
      const statusChanged = updates.status !== undefined && updates.status !== task.status;
      if (statusChanged) {
        addLog('UPDATE', 'TASK', task.text, `Status changed: ${task.status} -> ${updates.status}`);
        if (updates.progress === undefined) {
          if (updates.status === 'todo') updates.progress = 0;
          else if (updates.status === 'in_progress' && task.progress === 0) updates.progress = 10;
          else if (updates.status === 'completed' || updates.status === 'confirmed') updates.progress = 100;
        }
      }
      
      // 合并更新：使用原有任务作为基础，只更新提供的字段
      // 过滤掉 undefined 值，避免覆盖原有字段
      const cleanUpdates: Partial<Task> = {};
      Object.keys(updates).forEach(key => {
        const value = (updates as any)[key];
        if (value !== undefined) {
          (cleanUpdates as any)[key] = value;
        }
      });
      
      // 构建更新后的任务，确保 reports 数组被正确保存
      const updatedTask: Task = {
        ...task,
        ...cleanUpdates,
        // 确保 reports 数组始终存在且被正确保存
        reports: cleanUpdates.reports !== undefined ? (cleanUpdates.reports || []) : (task.reports || [])
      };
      
      // 确保所有必需字段都存在
      const finalTask: Task = {
        id: updatedTask.id || task.id,
        parentId: updatedTask.parentId || task.parentId,
        rootId: updatedTask.rootId || task.rootId,
        text: updatedTask.text || task.text,
        start: updatedTask.start || task.start,
        end: updatedTask.end || task.end,
        status: updatedTask.status || task.status,
        progress: updatedTask.progress !== undefined ? updatedTask.progress : task.progress,
        owner: updatedTask.owner || task.owner || '',
        product: updatedTask.product || task.product || '',
        channel: updatedTask.channel || task.channel || '',
        priority: updatedTask.priority || task.priority || 'P2',
        notes: updatedTask.notes || task.notes || '',
        reports: updatedTask.reports || [],
        reviewer: updatedTask.reviewer !== undefined ? updatedTask.reviewer : task.reviewer,
        score: updatedTask.score !== undefined ? updatedTask.score : task.score,
        reviewComment: updatedTask.reviewComment !== undefined ? updatedTask.reviewComment : task.reviewComment
      };
      
      const newTasks = prev.map(t => t.id === id ? finalTask : t);
      
      // 立即保存到 Supabase（不再使用 localStorage）
      // 注意：这里不 await，避免阻塞 UI，保存会在 useEffect 中自动触发
      saveTasks(newTasks).then(result => {
        if (!result.success) {
          console.error('立即保存任务失败:', result.error);
          setStorageError(`保存任务失败: ${result.error}`);
          setTimeout(() => setStorageError(null), 3000);
          showToast('error', `保存任务失败: ${result.error}`);
        }
      });
      
      return newTasks;
    });
  };
  const deleteTask = (e: React.MouseEvent, id: string) => { e.stopPropagation(); const task = tasks.find(t => t.id === id); safeConfirm("删除执行任务", "确认删除此任务？该操作无法撤销。", () => { if (task) addLog('DELETE', 'TASK', task.text, 'Deleted task'); setTasks(prev => prev.filter(t => t.id !== id)); setConfirmState(prev => ({...prev, isOpen: false})); }); };
  const openTaskEdit = (e: React.MouseEvent, task: Task) => { e.stopPropagation(); setTaskModal({ isOpen: true, data: { ...task, reports: task.reports || [] } }); };
  const saveTaskFromModal = () => { 
    if (!taskModal.data) return; 
    
    // 确保所有字段都被正确传递，特别是 reports
    const taskData: Partial<Task> = {
      ...taskModal.data,
      reports: taskModal.data.reports || []
    };
    
    updateTask(taskModal.data.id, taskData); 
    addLog('UPDATE', 'TASK', taskModal.data.text, 'Updated task details from modal'); 
    setTaskModal({ isOpen: false, data: null }); 
  };
  const addReportToTask = () => { if (!taskModal.data) return; const newReport: TaskReport = { id: generateId('rpt'), type: '进展', content: '', timestamp: TODAY_STR }; setTaskModal(prev => ({ ...prev, data: prev.data ? { ...prev.data, reports: [newReport, ...(prev.data.reports || [])] } : null })); };
  const updateTaskReport = (rptId: string, field: keyof TaskReport, value: any) => { setTaskModal(prev => ({ ...prev, data: prev.data ? { ...prev.data, reports: (prev.data.reports || []).map(r => r.id === rptId ? { ...r, [field]: value } : r) } : null })); };
  const deleteTaskReport = (rptId: string) => { setTaskModal(prev => ({ ...prev, data: prev.data ? { ...prev.data, reports: (prev.data.reports || []).filter(r => r.id !== rptId) } : null })); };
  const handleAiAssist = async () => {
    if (activeNode.level !== 3) {
      showToast('error', 'AI 仅支持针对 L3 策略层级生成具体执行任务');
      return;
    }
    setIsAiLoading(true); const parent = strategies.find(s => s.id === activeNode.parentId); const suggestions = await suggestL4Tasks(activeNode.name, parent?.name || "");
    if (suggestions) {
      // 找到根策略（L1）
      let root = activeNode;
      while (root.parentId) {
        const p = strategies.find(s => s.id === root.parentId);
        if (p) root = p;
        else break;
      }
      const newTasks: Task[] = suggestions.map((s: any) => ({
        id: generateId('ai'),
        parentId: activeNode.id,
        rootId: root.id,
        text: s.title,
        notes: s.description,
        start: activeNode.start || TODAY_STR,
        end: activeNode.end || TODAY_STR,
        status: 'todo',
        progress: 0,
        owner: 'AI',
        product: '',
        channel: '',
        priority: 'P2',
        reports: []
      }));
      setTasks(prev => [...prev, ...newTasks]);
      addLog('CREATE', 'TASK', 'AI Generation', `AI generated ${newTasks.length} tasks`);
    }
    setIsAiLoading(false);
  };

  // 加载任务建议（基于策略和报告）
  const loadTaskSuggestions = async (customPrompt?: string) => {
    setIsAiLoading(true);
    try {
      // 收集当前策略下的所有任务和报告
      const currentTasks = tasks.filter(t => {
        // 找到任务的根策略
        let rootId = t.rootId;
        if (!rootId && t.parentId) {
          const parentStrategy = strategies.find(s => s.id === t.parentId);
          if (parentStrategy) {
            // 向上查找 L1
            let current = parentStrategy;
            while (current.parentId) {
              const parent = strategies.find(s => s.id === current.parentId);
              if (parent) current = parent;
              else break;
            }
            rootId = current.id;
          }
        }
        return rootId && strategies.find(s => s.id === rootId && activeBranchIds.includes(s.id));
      });

      // 收集所有报告
      const allReports = currentTasks.flatMap(t => t.reports || []);

      // 获取策略上下文
      const parentStrategy = strategies.find(s => s.id === activeNode.parentId);
      const context = parentStrategy ? `${parentStrategy.name} > ${activeNode.name}` : activeNode.name;

      const suggestions = await generateTaskSuggestions(
        activeNode.name,
        context,
        currentTasks,
        allReports,
        customPrompt
      );

      if (suggestions && suggestions.length > 0) {
        setTaskSuggestions(suggestions);
      } else {
        setTaskSuggestions([]);
        showToast('info', '暂无建议，可以手动添加任务');
      }
    } catch (error: any) {
      console.error('加载建议失败:', error);
      console.error('错误详情:', {
        message: error?.message,
        stack: error?.stack,
        customPrompt,
        activeNodeId: activeNode.id,
        activeNodeName: activeNode.name,
      });
      showToast('error', `加载建议失败: ${error?.message || '未知错误'}，请稍后重试`);
      setTaskSuggestions([]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // 选择建议并创建任务
  const handleSelectSuggestion = (suggestion: { title: string; description: string }) => {
    let root = activeNode;
    while (root.parentId) {
      const p = strategies.find(s => s.id === root.parentId);
      if (p) root = p;
      else break;
    }
    
    const newTask: Task = {
      id: generateId('t'),
      parentId: activeNode.id,
      rootId: root.id,
      text: suggestion.title,
      start: activeNode.start || TODAY_STR,
      end: activeNode.end || TODAY_STR,
      status: 'todo',
      progress: 0,
      owner: currentUser?.username || '',
      product: '',
      channel: '',
      priority: 'P2',
      notes: suggestion.description || '',
      reports: []
    };
    
    setTasks(prev => [...prev, newTask]);
    addLog('CREATE', 'TASK', suggestion.title, `从建议创建任务`);
    showToast('success', `任务 "${suggestion.title}" 已创建`);
  };

  // AI 聊天中的任务建议选择（别名）
  const handleAISuggestionSelect = handleSelectSuggestion;

  // 处理 AI 聊天中的周报条目使用
  const handleAIReportItemsUse = (items: Array<{ type: '进展' | '问题' | '计划' | '结果' | '复盘'; content: string }>) => {
    const itemsWithId = items.map(item => ({...item, id: generateId('rpt')}));
    setReportModal({ isOpen: true, items: itemsWithId, isGenerating: false });
    addLog('REPORT', 'SYSTEM', activeNode.name, 'Used AI generated report items');
    showToast('success', '周报条目已加载');
  };

  const openReportModal = async (customPrompt?: string) => { setReportModal({ isOpen: true, items: [], isGenerating: true }); const generatedItems = await generateWeeklyReport(activeNode.name, activeTasks, stats, customPrompt); const itemsWithId = generatedItems.map(item => ({...item, id: generateId('rpt')})); setReportModal({ isOpen: true, items: itemsWithId, isGenerating: false }); addLog('REPORT', 'SYSTEM', activeNode.name, 'Generated AI Weekly Report'); };
  
  // 重新生成周报（支持自定义提示词）
  const regenerateReport = async (customPrompt?: string) => {
    setReportModal(prev => ({ ...prev, isGenerating: true }));
    const generatedItems = await generateWeeklyReport(activeNode.name, activeTasks, stats, customPrompt);
    const itemsWithId = generatedItems.map(item => ({...item, id: generateId('rpt')}));
    setReportModal(prev => ({ isOpen: true, items: itemsWithId, isGenerating: false }));
    addLog('REPORT', 'SYSTEM', activeNode.name, 'Regenerated AI Weekly Report with custom prompt');
  };
  const addReportItem = () => { setReportModal(prev => ({ ...prev, items: [...prev.items, { id: generateId('rpt'), type: '进展', content: '' }] })); };
  const deleteReportItem = (id: string) => { setReportModal(prev => ({ ...prev, items: prev.items.filter(i => i.id !== id) })); };
  const updateReportItem = (id: string, field: keyof ReportItem, value: string) => { setReportModal(prev => ({ ...prev, items: prev.items.map(i => i.id === id ? { ...i, [field]: value } : i) })); };
  const copyReportToClipboard = () => { const groups: Record<string, string[]> = {}; const order: ReportTag[] = ['进展', '结果', '问题', '计划', '复盘']; reportModal.items.forEach(item => { if (!groups[item.type]) groups[item.type] = []; groups[item.type].push(item.content); }); let text = `【${activeNode.name}】周工作汇报\n整体进度: ${stats.rate}%\n----------------\n`; order.forEach(tag => { if (groups[tag] && groups[tag].length > 0) { text += `\n### 【${tag}】\n`; groups[tag].forEach((content, idx) => { text += `${idx + 1}. ${content}\n`; }); } }); navigator.clipboard.writeText(text).then(() => { alert("汇报内容已复制到剪贴板"); }); };
  const toggleNode = (e: React.MouseEvent, nodeId: string) => { e.stopPropagation(); const newSet = new Set(expandedNodes); if (newSet.has(nodeId)) newSet.delete(nodeId); else newSet.add(nodeId); setExpandedNodes(newSet); };

  // --- Render Functions ---
  // 注意：所有 render 函数已被组件替代
  const potentialParents = useMemo(() => { if (!modal.data.level || modal.data.level === 1) return []; return strategies.filter(s => s.level === (modal.data.level! - 1)); }, [strategies, modal.data.level]);
  const isFilterActive = filters.owner !== 'all' || filters.channel !== 'all' || filters.product !== 'all' || filters.tag !== 'all' || (filters.time !== 'all' && !(filters.time === 'custom' && !filters.customStartDate && !filters.customEndDate));

  if (!currentUser) {
      return (
      <AuthContainer
        mode={authMode}
        // Login props
        loginUsername={loginUsername}
        loginPassword={loginPassword}
        loginError={loginError}
        onLoginUsernameChange={setLoginUsername}
        onLoginPasswordChange={setLoginPassword}
        onLogin={handleLogin}
        // Register props
        registerUsername={registerData.username}
        registerPassword={registerData.password}
        registerConfirmPassword={registerData.confirmPassword}
        registerError={loginError}
        onRegisterUsernameChange={(value) => setRegisterData(prev => ({ ...prev, username: value }))}
        onRegisterPasswordChange={(value) => setRegisterData(prev => ({ ...prev, password: value }))}
        onRegisterConfirmPasswordChange={(value) => setRegisterData(prev => ({ ...prev, confirmPassword: value }))}
        onRegister={handleRegister}
        // Forgot password props
        forgotUsername={registerData.username}
        forgotPassword={registerData.password}
        forgotConfirmPassword={registerData.confirmPassword}
        forgotError={loginError}
        onForgotUsernameChange={(value) => setRegisterData(prev => ({ ...prev, username: value }))}
        onForgotPasswordChange={(value) => setRegisterData(prev => ({ ...prev, password: value }))}
        onForgotConfirmPasswordChange={(value) => setRegisterData(prev => ({ ...prev, confirmPassword: value }))}
        onForgotPassword={handleResetPassword}
        // Mode switching
        onModeChange={(mode) => setAuthMode(mode)}
        onErrorClear={() => setLoginError('')}
      />
      );
  }

  return (
    <div className="flex h-screen bg-[#F7F6F3] font-sans text-[#37352F] overflow-hidden w-full max-w-full">
      {/* 存储错误提示 */}
      {storageError && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 max-w-md w-full mx-4">
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 shadow-lg flex items-start gap-3">
            <div className="w-5 h-5 bg-rose-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              </div>
            <div className="flex-1">
              <div className="text-sm font-bold text-rose-900 mb-1">数据存储错误</div>
              <div className="text-xs text-rose-700">{storageError}</div>
          </div>
            <button
              onClick={() => setStorageError(null)}
              className="text-rose-400 hover:text-rose-600 transition-colors"
              aria-label="关闭"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
              </div>
              </div>
      )}
      
      <Sidebar
        currentUser={currentUser}
        strategies={strategies}
        tasks={tasks}
        expandedNodes={expandedNodes}
        activeNodeId={activeNodeId}
        activeNode={activeNode}
        onNodeClick={setActiveNodeId}
        onNodeEdit={(e, node) => {
          e.stopPropagation();
          setActiveNodeId(node.id);
          openStrategyModal('edit', undefined, undefined, node);
        }}
        onTaskClick={openTaskEdit}
        onToggleExpand={toggleNode}
        onUserManagementClick={() => setIsUserMgmtOpen(true)}
        onAuditLogClick={() => setIsLogModalOpen(true)}
        onLogoutClick={handleLogout}
        onMapModalOpen={() => setIsMapModalOpen(true)}
        onReportModalOpen={openReportModal}
        onAIChatOpen={() => setIsAIChatOpen(true)}
        onAddSubStrategy={(level, parentId) => openStrategyModal('create', level, parentId)}
        onAddTopStrategy={() => openStrategyModal('create', 1, null)}
        onImportData={() => setIsImportModalOpen(true)}
        onExportCSV={() => exportToCSV(activeTasks, strategies, filteredStrategies, showToast)}
        onDeleteStrategy={deleteActiveStrategy}
      />

      <main className="flex-1 flex flex-col min-w-0 bg-[#F7F6F3]">
        <Header
          activeNode={activeNode}
          stats={stats}
          onNodeEdit={() => openStrategyModal('edit')}
          onReportModalOpen={openReportModal}
          onDashboardOpen={() => setIsDashboardOpen(true)}
          onQuickAction={(action) => {
            if (action === 'add-strategy') {
              openStrategyModal('create', 1, null);
            } else if (action === 'add-sub-strategy') {
              openStrategyModal('create', (activeNode.level + 1) as Level, activeNode.id);
            } else if (action === 'add-task') {
              addTask();
            }
          }}
        />

        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-6 sm:space-y-8 min-w-0">
          <FilterPanel
            isCollapsed={isFilterCollapsed}
            isFilterActive={isFilterActive}
            filters={filters}
            filterOptions={filterOptions}
            filteredStrategies={filteredStrategies}
            onToggleCollapse={() => setIsFilterCollapsed(!isFilterCollapsed)}
            onFilterChange={setFilters}
            onClearFilters={() =>
              setFilters({
                owner: 'all',
                channel: 'all',
                product: 'all',
                tag: 'all',
                time: 'all',
                customStartDate: undefined,
                customEndDate: undefined,
              })
            }
            onStrategyClick={setActiveNodeId}
          />

          <GanttChart
            isCollapsed={isGanttCollapsed}
            height={ganttHeight}
            scale={ganttScale}
            tasks={activeTasks}
            strategies={filteredStrategies}
            activeBranchIds={activeBranchIds}
            onToggleCollapse={handleGanttToggle}
            onScaleChange={delta => setGanttScale(prev => Math.max(2, Math.min(20, prev + delta)))}
            onHeightResize={(e, currentHeight) => startResize(e, setGanttHeight, currentHeight)}
            onTaskUpdate={updateTask}
            onFullscreen={() => setFullscreenMode('gantt')}
          />

          <TaskList
            isCollapsed={isListCollapsed}
            height={listHeight}
            tasks={activeTasks}
            isFilterActive={isFilterActive}
            isAiLoading={isAiLoading}
            canUseAI={activeNode.level === 3}
            onToggleCollapse={() => setIsListCollapsed(!isListCollapsed)}
            onHeightResize={(e, currentHeight) => startResize(e, setListHeight, currentHeight)}
            onTaskUpdate={updateTask}
            onTaskEdit={openTaskEdit}
            onTaskDelete={deleteTask}
            onAddTask={addTask}
            onAiAssist={handleAiAssist}
            onSelectSuggestion={handleSelectSuggestion}
            suggestions={taskSuggestions}
            onLoadSuggestions={loadTaskSuggestions}
            onTasksReorder={handleTasksReorder}
            onFullscreen={() => setFullscreenMode('tasklist')}
          />
          <footer className="text-center text-[9px] text-slate-300 font-medium py-4">Fotopro AMZ 项目管理器 v2.5 · BUILD {TODAY_STR.replace(/-/g, '')}</footer>
        </div>
      </main>
      
      <MapModal
        isOpen={isMapModalOpen}
        strategies={strategies}
        tasks={tasks}
        expandedNodes={expandedNodes}
        activeNodeId={activeNodeId}
        onClose={() => setIsMapModalOpen(false)}
        onNodeClick={setActiveNodeId}
        onTaskClick={(e, task) => {
          setIsMapModalOpen(false);
          openTaskEdit(e, task);
        }}
        onToggleExpand={toggleNode}
        onStrategyUpdate={updateStrategy}
        onDragSuccess={(draggedName, targetName, newParentName) => {
          if (draggedName && targetName) {
            if (newParentName) {
              showToast('success', `"${draggedName}" 已移动到 "${newParentName}" 下`);
            } else {
              showToast('success', `"${draggedName}" 已移动到 "${targetName}" 的兄弟节点`);
            }
          }
        }}
        isFullscreen={false}
      />

      <UserManagementModal
        isOpen={isUserMgmtOpen}
        currentUser={currentUser}
        users={users}
        newUser={newUser}
        onClose={() => setIsUserMgmtOpen(false)}
        onNewUserChange={(field, value) =>
          setNewUser({ ...newUser, [field]: value })
        }
        onAddUser={handleAddUser}
        onDeleteUser={handleDeleteUser}
      />

      <AuditLogModal
        isOpen={isLogModalOpen}
        auditLogs={auditLogs}
        onClose={() => setIsLogModalOpen(false)}
      />

      <StrategyModal
        isOpen={modal.isOpen}
        mode={modal.mode}
        data={modal.data}
        potentialParents={potentialParents}
        allUsedTags={allUsedTags}
        onClose={() => setModal({ ...modal, isOpen: false })}
        onSave={handleSaveModal}
        onDataChange={data => setModal({ ...modal, data })}
        onAddMetric={addMetric}
        onUpdateMetric={updateMetric}
        onRemoveMetric={removeMetric}
      />

      <TaskModal
        isOpen={taskModal.isOpen}
        task={taskModal.data}
        onClose={() => setTaskModal({ ...taskModal, isOpen: false, data: null })}
        onSave={saveTaskFromModal}
        onTaskChange={updates =>
          setTaskModal({
            ...taskModal,
            data: taskModal.data ? { ...taskModal.data, ...updates } : null,
          })
        }
        onAddReport={addReportToTask}
        onUpdateReport={updateTaskReport}
        onDeleteReport={deleteTaskReport}
      />

      <ImportModal
        isOpen={isImportModalOpen}
        existingStrategies={strategies}
        existingTasks={tasks}
        onClose={() => setIsImportModalOpen(false)}
        onImport={handleImportData}
      />

      <AIChatModal
        isOpen={isAIChatOpen}
        onClose={() => setIsAIChatOpen(false)}
        activeNode={activeNode}
        strategies={strategies}
        tasks={activeTasks}
        onSelectSuggestion={handleAISuggestionSelect}
        onUseReportItems={handleAIReportItemsUse}
      />

      <ReportModal
        isOpen={reportModal.isOpen}
        isGenerating={reportModal.isGenerating}
        items={reportModal.items}
        activeTasksCount={activeTasks.length}
        completionRate={stats.rate}
        completedCount={stats.completed}
        onClose={() => setReportModal({ ...reportModal, isOpen: false })}
        onAddItem={addReportItem}
        onUpdateItem={updateReportItem}
        onDeleteItem={deleteReportItem}
        onCopyToClipboard={copyReportToClipboard}
        onRegenerate={regenerateReport}
      />

      <ProjectDashboardModal
        isOpen={isDashboardOpen}
        activeNode={activeNode}
        strategies={strategies}
        tasks={tasks}
        activeBranchIds={activeBranchIds}
        onClose={() => setIsDashboardOpen(false)}
      />

      {/* 全屏模态框 */}
      <FullscreenModal
        isOpen={fullscreenMode === 'gantt'}
        title="时间作战地图 (Gantt)"
        onClose={() => setFullscreenMode(null)}
      >
        <GanttChart
          isCollapsed={false}
          height={window.innerHeight - 200}
          scale={ganttScale}
          tasks={activeTasks}
          strategies={filteredStrategies}
          activeBranchIds={activeBranchIds}
          onToggleCollapse={() => {}}
          onScaleChange={delta => setGanttScale(prev => Math.max(2, Math.min(20, prev + delta)))}
          onHeightResize={() => {}}
          onTaskUpdate={updateTask}
        />
      </FullscreenModal>

      <FullscreenModal
        isOpen={fullscreenMode === 'filter'}
        title="项目透视 · 快速预览卡片"
        onClose={() => setFullscreenMode(null)}
      >
        <FilterPanel
          isCollapsed={false}
          isFilterActive={isFilterActive}
          filters={filters}
          filterOptions={filterOptions}
          filteredStrategies={filteredStrategies}
          onToggleCollapse={() => {}}
          onFilterChange={setFilters}
          onClearFilters={() =>
            setFilters({
              owner: 'all',
              channel: 'all',
              product: 'all',
              tag: 'all',
              time: 'all',
              customStartDate: undefined,
              customEndDate: undefined,
            })
          }
          onStrategyClick={setActiveNodeId}
        />
      </FullscreenModal>

      <FullscreenModal
        isOpen={fullscreenMode === 'tasklist'}
        title="执行清单 (Execution List)"
        onClose={() => setFullscreenMode(null)}
      >
        <TaskList
          isCollapsed={false}
          height={window.innerHeight - 200}
          tasks={activeTasks}
          isFilterActive={isFilterActive}
          isAiLoading={isAiLoading}
          canUseAI={activeNode.level === 3}
          onToggleCollapse={() => {}}
          onHeightResize={() => {}}
          onTaskUpdate={updateTask}
          onTaskEdit={openTaskEdit}
          onTaskDelete={deleteTask}
          onAddTask={addTask}
          onAiAssist={handleAiAssist}
          onSelectSuggestion={handleSelectSuggestion}
          suggestions={taskSuggestions}
          onLoadSuggestions={loadTaskSuggestions}
          onTasksReorder={handleTasksReorder}
        />
      </FullscreenModal>

      <ToastContainer toasts={toasts} onClose={removeToast} />

      {confirmState.isOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[10000] flex items-center justify-center p-4 animate-in fade-in duration-200">
           <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100 opacity-100">
              <div className="flex flex-col items-center text-center gap-4">
                 <div className="w-12 h-12 bg-rose-100 text-rose-500 rounded-full flex items-center justify-center"><Icon name="trash" size={24} /></div>
                 <div><h3 className="text-lg font-black text-slate-900">{confirmState.title || '确认操作'}</h3><p className="text-xs text-slate-500 mt-1 font-medium leading-relaxed">{confirmState.message}</p></div>
                 <div className="flex gap-3 w-full mt-2"><button type="button" onClick={() => setConfirmState({...confirmState, isOpen: false})} className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase hover:bg-slate-200 transition-all">取消</button><button type="button" onClick={confirmState.onConfirm} className="flex-1 py-3 bg-rose-500 text-white rounded-xl text-xs font-black uppercase shadow-lg shadow-rose-200 hover:bg-rose-600 active:scale-95 transition-all">确认删除</button></div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default App;
