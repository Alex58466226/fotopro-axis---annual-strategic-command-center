# 诊断 order 字段问题

## 快速诊断步骤

### 1. 检查字段是否已添加
在 Supabase Dashboard -> SQL Editor 中执行：

```sql
-- 检查 tasks 表是否有 order 字段
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'tasks'
  AND column_name = 'order';
```

**如果返回空结果**：说明字段还没有添加，需要执行迁移脚本。

**如果返回结果**：说明字段已存在，可能是其他问题。

### 2. 如果字段不存在，执行简单迁移
```sql
-- 最简单的方式：直接添加字段
ALTER TABLE public.tasks ADD COLUMN "order" INTEGER;
```

### 3. 如果字段已存在但仍然报错
可能是 Schema Cache 问题，尝试：

```sql
-- 强制刷新（如果 Supabase 支持）
NOTIFY pgrst, 'reload schema';
```

或者：
- 等待 1-2 分钟让缓存自动刷新
- 完全关闭浏览器标签页
- 清除浏览器缓存（Cmd/Ctrl + Shift + R）
- 重新打开应用

### 4. 检查代码中的字段名
确认代码中使用的是 `"order"`（带引号）还是 `order`（不带引号）。

在 PostgreSQL 中，`order` 是保留字，必须用双引号。

### 5. 测试字段是否可写
```sql
-- 测试更新 order 字段
UPDATE public.tasks 
SET "order" = 1 
WHERE id = (SELECT id FROM public.tasks LIMIT 1);
```

如果这个更新失败，可能是 RLS 策略问题。

## 常见问题

### 问题 1: "column does not exist"
- **原因**：字段确实不存在
- **解决**：执行 `ALTER TABLE public.tasks ADD COLUMN "order" INTEGER;`

### 问题 2: "column exists but still error"
- **原因**：Schema Cache 未刷新
- **解决**：等待几分钟或重启 Supabase 项目

### 问题 3: "permission denied"
- **原因**：RLS 策略不允许更新
- **解决**：检查 RLS 策略，确保允许 UPDATE 操作

### 问题 4: "syntax error"
- **原因**：字段名未加引号
- **解决**：使用 `"order"` 而不是 `order`
