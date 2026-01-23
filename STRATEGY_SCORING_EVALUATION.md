# 策略评分功能评估报告

## 当前状态

### 现有功能
- ✅ **任务（L4）评分**：已实现，支持 0-100 分评分
- ❌ **策略（L1-L3）评分**：未实现，策略节点没有 score 字段

### 用户反馈
- "L2 和 L3 仍然没有得分"
- 期望策略层级也能有评分功能

---

## 产品经理评估

### 1. 需求合理性分析

#### ✅ **支持添加策略评分的理由**

**业务价值：**
1. **策略执行效果评估**：策略是目标导向的，需要评估执行效果
2. **层级化管理**：L2/L3 策略是中间目标，需要独立评估
3. **项目评估看板完整性**：当前看板只显示任务评分，缺少策略评分维度
4. **决策支持**：策略评分有助于识别需要调整的策略方向

**用户场景：**
- 季度/年度策略回顾时，需要评估每个策略的执行效果
- 对比不同策略（A/B 测试）的执行效果
- 识别低效策略，及时调整方向

#### ⚠️ **需要考虑的问题**

1. **评分来源**：
   - 手动评分 vs 自动计算（基于子任务/子策略）
   - 如果自动计算，公式如何设计？

2. **评分时机**：
   - 策略进行中是否可以评分？
   - 还是只有完成后才能评分？

3. **评分维度**：
   - 是否与任务评分一致（0-100）？
   - 是否需要不同的评分标准？

---

## 推荐方案

### 方案 1：手动评分 + 自动计算（推荐）

**设计思路：**
- 策略支持手动评分（0-100）
- 同时提供自动计算选项（基于子任务/子策略的平均分）
- 用户可以选择使用手动评分或自动计算

**实现细节：**
1. 在 `StrategyNode` 接口添加：
   ```typescript
   score?: number;         // 评分 (0-100)
   reviewer?: string;      // 审核人
   reviewComment?: string; // 审核评语
   scoreMode?: 'manual' | 'auto'; // 评分模式
   ```

2. 自动计算逻辑：
   - L3 策略：计算其下所有任务的平均分
   - L2 策略：计算其下所有 L3 策略的平均分（如果有评分），或计算所有任务的平均分
   - L1 策略：计算其下所有 L2 策略的平均分（如果有评分），或计算所有任务的平均分

3. UI 设计：
   - 在策略编辑 Modal 中添加"评分"区域（类似任务评分）
   - 显示自动计算的分数和手动评分选项
   - 在项目评估看板中显示策略评分

**优点：**
- 灵活性高，支持手动和自动两种模式
- 符合用户期望
- 与任务评分保持一致的用户体验

**缺点：**
- 实现复杂度较高
- 需要处理自动计算的实时更新

---

### 方案 2：仅手动评分（简化版）

**设计思路：**
- 策略只支持手动评分
- 不提供自动计算功能

**优点：**
- 实现简单
- 用户完全控制评分

**缺点：**
- 缺少自动计算，用户需要手动维护
- 评分可能不够客观

---

### 方案 3：仅自动计算（不推荐）

**设计思路：**
- 策略评分完全基于子任务/子策略自动计算
- 不支持手动评分

**优点：**
- 客观、一致
- 自动更新

**缺点：**
- 策略执行效果可能无法完全通过任务评分反映
- 缺少人工判断的灵活性

---

## 推荐实施计划

### Phase 1：基础功能（MVP）
1. 在 `StrategyNode` 接口添加 `score`、`reviewer`、`reviewComment` 字段
2. 在策略编辑 Modal 中添加评分输入区域
3. 在 Supabase 数据库中添加对应字段
4. 实现评分保存和加载

### Phase 2：自动计算（增强）
1. 实现自动计算逻辑
2. 在策略编辑 Modal 中添加"自动计算"选项
3. 实时更新自动计算的分数

### Phase 3：项目评估看板集成
1. 在项目评估看板中显示策略评分
2. 添加策略评分相关的图表和分析

---

## 技术实现要点

### 数据库变更
```sql
ALTER TABLE strategies 
ADD COLUMN score INTEGER,
ADD COLUMN reviewer TEXT,
ADD COLUMN review_comment TEXT,
ADD COLUMN score_mode TEXT DEFAULT 'manual';
```

### 自动计算逻辑示例
```typescript
function calculateStrategyScore(
  strategy: StrategyNode,
  strategies: StrategyNode[],
  tasks: Task[]
): number {
  if (strategy.scoreMode === 'manual' && strategy.score !== undefined) {
    return strategy.score;
  }
  
  // 自动计算
  if (strategy.level === 3) {
    // L3: 计算其下所有任务的平均分
    const childTasks = tasks.filter(t => t.parentId === strategy.id);
    const scoredTasks = childTasks.filter(t => t.score !== undefined);
    if (scoredTasks.length === 0) return 0;
    return scoredTasks.reduce((sum, t) => sum + (t.score || 0), 0) / scoredTasks.length;
  } else if (strategy.level === 2) {
    // L2: 计算其下所有 L3 策略的平均分，或所有任务的平均分
    const childStrategies = strategies.filter(s => s.parentId === strategy.id);
    const scoredStrategies = childStrategies.filter(s => s.score !== undefined);
    if (scoredStrategies.length > 0) {
      return scoredStrategies.reduce((sum, s) => sum + (s.score || 0), 0) / scoredStrategies.length;
    }
    // 如果没有策略评分，计算所有任务的平均分
    const allTasks = tasks.filter(t => {
      let rootId = t.rootId;
      // ... 查找逻辑
      return rootId === strategy.id;
    });
    const scoredTasks = allTasks.filter(t => t.score !== undefined);
    if (scoredTasks.length === 0) return 0;
    return scoredTasks.reduce((sum, t) => sum + (t.score || 0), 0) / scoredTasks.length;
  }
  // L1 类似逻辑
  return 0;
}
```

---

## 结论

**建议采用方案 1（手动评分 + 自动计算）**，理由：
1. 满足用户需求
2. 提供灵活性
3. 与现有任务评分功能保持一致
4. 为项目评估看板提供更全面的数据

**优先级：P1（高优先级）**
- 用户明确表达了需求
- 功能对项目评估看板的价值提升明显
- 实现复杂度可控
