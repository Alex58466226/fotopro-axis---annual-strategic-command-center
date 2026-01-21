# 开发指引 (Developer Guide)

## 项目概述

**Fotopro Axis - Annual Strategic Command Center** 是一个基于 React + TypeScript 的企业级战略执行管理系统，采用四层架构（L1-L4）管理策略到任务的完整生命周期。

### 技术栈

- **前端框架**: React 19.2.3
- **构建工具**: Vite 6.2.0
- **语言**: TypeScript 5.8.2
- **样式**: Tailwind CSS (CDN)
- **状态管理**: React Hooks (useState, useMemo, useEffect)
- **数据持久化**: localStorage
- **AI 服务**: 支持 Gemini、OpenAI、DeepSeek、通义千问

## 项目结构

```
fotopro-axis---annual-strategic-command-center/
├── App.tsx                 # 主应用组件（1600+ 行，包含所有业务逻辑）
├── types.ts               # TypeScript 类型定义
├── constants.tsx           # 常量定义（日期、图标、用户等）
├── index.tsx              # 应用入口
├── index.html             # HTML 模板
├── vite.config.ts         # Vite 配置
├── tsconfig.json          # TypeScript 配置
├── components/
│   └── Icon.tsx           # 图标组件
├── services/
│   ├── aiService.ts       # 通用 AI 服务（支持多种模型）
│   └── geminiService.ts   # Gemini 服务（已废弃，保留兼容）
└── dist/                  # 构建输出目录
```

## 核心架构

### 数据模型

#### 1. 策略节点 (StrategyNode) - L1/L2/L3
```typescript
interface StrategyNode {
  id: string;
  level: 1 | 2 | 3;
  name: string;
  parentId: string | null;
  start: string;        // ISO 日期字符串
  end: string;
  owner: string;
  status: 'active' | 'completed' | 'delayed';
  metrics: Metric[];    // KPI 指标
  tags?: string[];      // 标签
  channel?: string;     // 渠道
  product?: string;     // 产品
  group?: string;       // A/B 测试分组
}
```

#### 2. 执行任务 (Task) - L4
```typescript
interface Task {
  id: string;
  parentId: string;     // 关联到 L3
  rootId: string;       // 关联到 L1（用于快速筛选）
  text: string;
  status: 'todo' | 'in_progress' | 'completed' | 'confirmed';
  progress: number;     // 0-100
  priority: 'P0' | 'P1' | 'P2';
  owner: string;
  reports: TaskReport[]; // 汇报记录（最小颗粒度）
  score?: number;       // 评分 0-100
  reviewer?: string;    // 审核人
}
```

#### 3. 任务汇报 (TaskReport)
```typescript
interface TaskReport {
  id: string;
  type: '计划' | '进展' | '问题' | '结果' | '复盘';
  content: string;
  timestamp: string;    // ISO 日期字符串
}
```

### 状态管理

项目使用 React Hooks 进行状态管理，主要状态包括：

```typescript
// 数据状态
const [strategies, setStrategies] = useState<StrategyNode[]>([]);
const [tasks, setTasks] = useState<Task[]>([]);
const [users, setUsers] = useState<User[]>([]);
const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);

// UI 状态
const [activeNodeId, setActiveNodeId] = useState<string>('L1-1');
const [filters, setFilters] = useState<Filters>({...});
const [modal, setModal] = useState<ModalState>({...});
```

**重要原则**: 所有状态更新必须使用函数式更新模式，避免闭包陷阱：
```typescript
// ✅ 正确
setTasks(prev => [...prev, newTask]);

// ❌ 错误
setTasks([...tasks, newTask]);
```

### 数据持久化

#### localStorage 键名
- `fotopro_axis_v2_strategies`: 策略节点数据
- `fotopro_axis_v2_tasks`: 任务数据
- `fotopro_axis_v2_logs`: 审计日志
- `fotopro_axis_v2_user`: 当前登录用户（会话）
- `fotopro_axis_v2_users_db`: 用户数据库

#### 保存机制
```typescript
// 自动保存：当 strategies, tasks, auditLogs, users 变化时
useEffect(() => {
  if (!isInitializedRef.current) return; // 避免初始化时覆盖
  localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(tasks));
  // ...
}, [strategies, tasks, auditLogs, users]);
```

#### 加载机制
```typescript
// 组件挂载时加载
useEffect(() => {
  const tStr = localStorage.getItem(STORAGE_KEY_TASKS);
  if (tStr) {
    const parsed = JSON.parse(tStr);
    // 数据迁移：确保 reports 数组存在
    const migrated = parsed.map(t => ({
      ...t,
      reports: t.reports || []
    }));
    setTasks(migrated);
  }
  isInitializedRef.current = true;
}, []);
```

## 核心功能模块

### 1. 策略管理 (Strategy Management)

**位置**: `App.tsx` 第 750-763 行

**功能**:
- 创建策略节点（L1/L2/L3）
- 编辑策略详情
- 删除策略（级联删除子策略和任务）
- 支持 A/B 测试分组

**关键函数**:
```typescript
openStrategyModal(mode: 'create' | 'edit', level?: Level, parentId?: string)
handleSaveModal() // 保存策略
deleteActiveStrategy() // 删除当前策略
```

### 2. 任务管理 (Task Management)

**位置**: `App.tsx` 第 774-858 行

**功能**:
- 创建任务（L4）
- 编辑任务详情
- 更新任务状态和进度
- 任务审核和评分
- 任务汇报管理

**关键函数**:
```typescript
addTask() // 创建任务
updateTask(id: string, updates: Partial<Task>) // 更新任务
saveTaskFromModal() // 从模态框保存任务
addReportToTask() // 添加汇报
updateTaskReport(rptId, field, value) // 更新汇报
```

**重要**: `updateTask` 必须使用函数式更新，并立即保存到 localStorage。

### 3. 筛选和视图 (Filtering & Views)

**位置**: `App.tsx` 第 494-740 行

**筛选维度**:
- Owner（负责人）
- Channel（渠道）
- Product（产品）
- Tag（标签）
- Time（时间范围：全部/今日/本周/本月）

**计算属性**:
```typescript
const allBranchTasks = useMemo(() => {
  // 获取当前分支的所有任务
}, [tasks, activeBranchIds]);

const activeTasks = useMemo(() => {
  // 应用筛选条件后的任务
}, [allBranchTasks, filters, strategies]);

const filteredStrategies = useMemo(() => {
  // 应用筛选条件后的策略
}, [strategies, filters, activeBranchIds]);
```

### 4. 甘特图 (Gantt Chart)

**位置**: `App.tsx` 第 828-856 行

**功能**:
- 时间轴可视化
- 任务时间线展示
- 可调整时间刻度（`ganttScale`）
- 今日标记线

**关键函数**:
```typescript
getDayOffset(dateStr: string, pxPerDay: number) // 计算日期偏移
calculateGanttPos(start?: string, end?: string) // 计算甘特图位置
```

### 5. AI 辅助功能

**位置**: `services/aiService.ts`

**功能**:
- 自动生成任务建议（L4）
- 自动生成周报内容

**支持的模型**:
1. Google Gemini（默认）
2. OpenAI
3. DeepSeek
4. 通义千问

**配置**: 通过环境变量配置，详见 `AI_CONFIG.md`

**关键函数**:
```typescript
suggestL4Tasks(strategyName: string, parentContext: string)
generateWeeklyReport(strategyName: string, tasks: Task[], stats: Stats)
```

### 6. 数据导出

**位置**: `App.tsx` 第 16-194 行

**功能**:
- 导出 CSV 报表
- 包含 L1-L4 完整层级信息
- Report 作为最小颗粒度（每个 Report 一行）

**导出格式**:
- 策略节点（L1-L3）：每行一个策略
- 任务（L4）：每个任务的每个 Report 一行
- 包含完整的层级关系和所有字段

### 7. 用户管理

**位置**: `App.tsx` 第 400-445 行

**功能**:
- 用户登录/注册
- Admin 用户管理
- 角色权限（Admin/User/Viewer）
- 审计日志

**角色权限**:
- **Admin**: 完整权限，可管理用户
- **User**: 可创建/编辑策略和任务
- **Viewer**: 只读权限

### 8. 审计日志

**位置**: `App.tsx` 第 390-410 行

**功能**:
- 记录所有关键操作
- 支持查看操作历史
- 自动记录用户、时间、操作类型

**操作类型**:
- `LOGIN`: 登录
- `CREATE`: 创建
- `UPDATE`: 更新
- `DELETE`: 删除
- `REPORT`: 生成报告

## 开发规范

### 1. 状态更新规范

**必须使用函数式更新**:
```typescript
// ✅ 正确
setTasks(prev => prev.map(t => t.id === id ? updated : t));
setUsers(prev => [...prev, newUser]);

// ❌ 错误
setTasks(tasks.map(t => t.id === id ? updated : t));
setUsers([...users, newUser]);
```

### 2. 数据持久化规范

**更新任务时必须立即保存**:
```typescript
const updateTask = (id: string, updates: Partial<Task>) => {
  setTasks(prev => {
    // ... 更新逻辑
    const newTasks = prev.map(t => t.id === id ? updated : t);
    
    // 立即保存到 localStorage
    localStorage.setItem(STORAGE_KEY_TASKS, JSON.stringify(newTasks));
    return newTasks;
  });
};
```

### 3. 类型安全

**使用 TypeScript 类型**:
- 所有函数参数和返回值必须有类型
- 使用 `Partial<T>` 表示可选更新
- 使用联合类型表示枚举值

### 4. 错误处理

**数据加载时添加错误处理**:
```typescript
try {
  const parsed = JSON.parse(tStr);
  setTasks(parsed);
} catch (e) {
  console.error('Error loading tasks:', e);
  // 使用默认值或提示用户
}
```

### 5. 性能优化

**使用 useMemo 优化计算**:
```typescript
const activeTasks = useMemo(() => {
  return allBranchTasks.filter(/* 筛选逻辑 */);
}, [allBranchTasks, filters, strategies]);
```

## 扩展开发

### 添加新的筛选维度

1. 在 `Filters` 接口中添加新字段
2. 在 `filterOptions` 中收集选项
3. 在 `activeTasks` 和 `filteredStrategies` 中添加筛选逻辑
4. 在 UI 中添加筛选控件

### 添加新的任务状态

1. 在 `types.ts` 中更新 `TaskStatus` 类型
2. 在 `STATUS_CONFIG` 中添加配置
3. 更新状态选择器 UI

### 添加新的 AI 模型

1. 在 `services/aiService.ts` 的 `getAIConfig()` 中添加检测逻辑
2. 在 `vite.config.ts` 中添加环境变量定义
3. 在 `callOpenAICompatibleAPI` 或创建新的调用函数

### 添加新的导出格式

1. 创建新的导出函数（参考 `exportToCSV`）
2. 在 UI 中添加导出按钮
3. 调用导出函数并处理下载

## 调试技巧

### 1. 检查数据持久化

```javascript
// 浏览器控制台
localStorage.getItem('fotopro_axis_v2_tasks')
JSON.parse(localStorage.getItem('fotopro_axis_v2_tasks'))
```

### 2. 检查状态更新

使用 React DevTools 查看组件状态变化

### 3. 检查 AI 服务

查看浏览器控制台的网络请求，确认 API 调用是否成功

## 常见问题

### Q: 数据刷新后丢失？
A: 检查 `isInitializedRef` 是否正确设置，确保保存逻辑在初始化完成后执行。

### Q: Report 数据丢失？
A: 确保 `updateTask` 中正确处理 `reports` 数组，并在保存时立即写入 localStorage。

### Q: 筛选不生效？
A: 检查 `useMemo` 的依赖项是否包含所有相关状态。

### Q: AI 功能不工作？
A: 检查环境变量配置，确认 API Key 正确设置，查看控制台错误信息。

## 构建和部署

### 开发环境
```bash
npm install
npm run dev
```

### 生产构建
```bash
npm run build
# 输出到 dist/ 目录
```

### 部署
将 `dist/` 目录部署到任何静态文件服务器：
- Nginx
- Apache
- Vercel
- Netlify
- GitHub Pages

## 代码质量

### Linting
项目使用 TypeScript 编译器进行类型检查，无额外 linter 配置。

### 代码组织
- 单一文件架构：主要逻辑集中在 `App.tsx`
- 类型定义分离：`types.ts`
- 常量分离：`constants.tsx`
- 服务分离：`services/` 目录

### 性能考虑
- 使用 `useMemo` 缓存计算结果
- 使用 `useRef` 避免不必要的重渲染
- 延迟保存到 localStorage（100ms 延迟）

## 版本历史

- **v2.5**: 添加任务审核和评分功能
- **v2.4**: 添加用户认证和审计日志
- **v2.2**: 添加策略模态框和标签功能
- **v2.0**: 重构为四层架构（L1-L4）

## 贡献指南

1. 遵循现有的代码风格
2. 使用函数式状态更新
3. 添加适当的错误处理
4. 更新相关文档
5. 测试所有功能
