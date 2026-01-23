# 策略评分功能实施指南

## Phase 1 实施完成 ✅

### 已完成的工作

1. ✅ **更新 TypeScript 接口**
   - 在 `types.ts` 中为 `StrategyNode` 添加了 `reviewer`、`score`、`reviewComment` 字段

2. ✅ **更新数据库 Schema**
   - 创建了迁移脚本 `supabase_migration_add_strategy_scoring.sql`
   - 添加了 `reviewer`、`score`、`review_comment` 字段到 `strategies` 表

3. ✅ **更新数据服务**
   - 在 `supabaseDataService.ts` 中更新了 `loadStrategies()` 和 `saveStrategies()` 函数
   - 支持评分字段的保存和加载

4. ✅ **更新策略编辑 Modal**
   - 在 `StrategyModal.tsx` 中添加了"Review & Scoring"区域
   - 包含审核人、评分（0-100）、审核评语输入框

5. ✅ **更新策略保存逻辑**
   - 在 `App.tsx` 中更新了 `handleSaveModal()` 和 `openStrategyModal()` 函数
   - 确保评分字段被正确保存和加载

---

## 数据库迁移步骤

**重要：在执行代码之前，需要先在 Supabase 中执行数据库迁移**

1. 登录 Supabase Dashboard
2. 进入 SQL Editor
3. 执行 `supabase_migration_add_strategy_scoring.sql` 文件中的 SQL 语句：

```sql
ALTER TABLE public.strategies 
ADD COLUMN IF NOT EXISTS reviewer TEXT,
ADD COLUMN IF NOT EXISTS score INTEGER CHECK (score >= 0 AND score <= 100),
ADD COLUMN IF NOT EXISTS review_comment TEXT;
```

---

## 功能使用说明

### 如何为策略添加评分

1. **打开策略编辑**
   - 在侧边栏选择要评分的策略（L1/L2/L3）
   - 点击编辑按钮

2. **填写评分信息**
   - 在"Review & Scoring"区域填写：
     - **Reviewer**：审核人姓名
     - **Score (0-100)**：评分（0-100）
     - **Comments**：审核评语

3. **保存**
   - 点击"Save Strategy"保存
   - 评分会保存到 Supabase 数据库

### 评分显示

- 评分信息会保存在策略数据中
- 可以在项目评估看板中使用（Phase 3 将实现）

---

## 测试清单

- [ ] 执行数据库迁移脚本
- [ ] 创建或编辑一个 L2 策略，添加评分
- [ ] 创建或编辑一个 L3 策略，添加评分
- [ ] 刷新页面，确认评分被正确保存和加载
- [ ] 测试评分为 0 的情况
- [ ] 测试评分为空的情况
- [ ] 测试审核人和评语字段

---

## 下一步（Phase 2：自动计算）

Phase 2 将实现自动计算功能：
- L3 策略：基于其下所有任务的平均分自动计算
- L2 策略：基于其下所有 L3 策略的平均分（如果有评分），或所有任务的平均分
- L1 策略：基于其下所有 L2 策略的平均分（如果有评分），或所有任务的平均分

---

## 已知问题

- 暂无

---

## 技术细节

### 字段类型
- `reviewer`: `TEXT` (可选)
- `score`: `INTEGER` (0-100, 可选)
- `review_comment`: `TEXT` (可选)

### 数据验证
- 评分范围：0-100
- 所有字段都是可选的

### 兼容性
- 向后兼容：现有策略没有评分字段时，会显示为空
- 数据库迁移使用 `IF NOT EXISTS`，可以安全地重复执行
