# Phase 2: 架构重构计划

## 目标

将 `App.tsx`（1516 行）拆分为多个可维护的组件和服务，提升代码质量和可测试性。

## 实施策略

采用**渐进式重构**，分阶段进行，确保每一步都能正常工作。

### 原则
1. **最小化风险**：每次只拆分一个模块，测试通过后再继续
2. **保持功能完整**：重构过程中不改变功能
3. **向后兼容**：确保现有数据和工作流不受影响

---

## 阶段 1: 服务层抽象（优先级最高）

**目标**：将业务逻辑从组件中分离，便于复用和测试

### 1.1 创建业务服务
- `services/strategyService.ts` - 策略相关业务逻辑
- `services/taskService.ts` - 任务相关业务逻辑  
- `services/authService.ts` - 认证相关业务逻辑

**工作量**：2-3 天

---

## 阶段 2: 认证组件拆分

**目标**：将认证相关 UI 和逻辑独立出来

### 2.1 创建 Auth 组件
- `components/Auth/LoginForm.tsx` - 登录表单
- `components/Auth/RegisterForm.tsx` - 注册表单
- `components/Auth/ForgotPasswordForm.tsx` - 重置密码表单
- `components/Auth/AuthContainer.tsx` - 认证容器（统一管理三种表单）

**工作量**：1-2 天

---

## 阶段 3: 侧边栏组件拆分

**目标**：将侧边栏策略树和任务列表独立出来

### 3.1 创建 Sidebar 组件
- `components/Sidebar/Sidebar.tsx` - 侧边栏容器
- `components/Sidebar/StrategyTree.tsx` - 策略树组件
- `components/Sidebar/StrategyNode.tsx` - 策略节点组件
- `components/Sidebar/TaskNode.tsx` - 任务节点组件
- `components/Sidebar/UserProfile.tsx` - 用户信息卡片

**工作量**：2-3 天

---

## 阶段 4: 主内容区组件拆分

**目标**：将主内容区的各个部分独立出来

### 4.1 创建主内容组件
- `components/FilterPanel/FilterPanel.tsx` - 筛选面板
- `components/GanttChart/GanttChart.tsx` - 甘特图组件
- `components/TaskList/TaskList.tsx` - 任务列表组件
- `components/TaskList/TaskItem.tsx` - 任务项组件
- `components/Header/Header.tsx` - 页面头部组件

**工作量**：3-4 天

---

## 阶段 5: 模态框组件拆分

**目标**：将各种模态框独立出来

### 5.1 创建 Modal 组件
- `components/Modals/StrategyModal.tsx` - 策略编辑/创建模态框
- `components/Modals/TaskModal.tsx` - 任务编辑模态框
- `components/Modals/UserManagementModal.tsx` - 用户管理模态框
- `components/Modals/ReportModal.tsx` - 报告生成模态框
- `components/Modals/ArchitectureMapModal.tsx` - 架构图谱模态框
- `components/Modals/AuditLogModal.tsx` - 审计日志模态框
- `components/Modals/ConfirmModal.tsx` - 确认对话框（通用）

**工作量**：3-4 天

---

## 阶段 6: 状态管理优化（可选）

**目标**：使用 Context API 统一管理全局状态

### 6.1 创建 Context
- `contexts/AppContext.tsx` - 应用全局状态（策略、任务、用户等）
- `contexts/AuthContext.tsx` - 认证状态

**工作量**：2-3 天

---

## 实施顺序

1. ✅ **阶段 1**：服务层抽象（最基础，其他组件会依赖）
2. ✅ **阶段 2**：认证组件（相对独立，容易拆分）
3. ✅ **阶段 3**：侧边栏组件（UI 组件，依赖服务层）
4. ✅ **阶段 4**：主内容区组件（核心功能）
5. ✅ **阶段 5**：模态框组件（最后拆分，依赖最多）
6. ⏸️ **阶段 6**：状态管理优化（可选，如果前 5 个阶段完成后还有时间）

---

## 成功指标

- [ ] App.tsx 文件行数 < 500 行
- [ ] 每个组件文件 < 300 行
- [ ] 所有功能正常工作
- [ ] 构建通过，无错误
- [ ] 代码可测试性提升

---

## 风险控制

1. **功能回归**：每次拆分后立即测试所有功能
2. **数据丢失**：确保数据持久化逻辑不受影响
3. **性能下降**：监控组件渲染性能
4. **类型安全**：确保 TypeScript 类型定义完整

---

## 开始实施

让我们从**阶段 1：服务层抽象**开始，这是最基础的工作，其他组件拆分都会依赖它。
