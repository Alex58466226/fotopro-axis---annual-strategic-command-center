# 执行 order 字段迁移（修复新建任务错误）

## 问题
如果看到错误："Could not find the 'order' column of 'tasks' in the schema cache"，说明 `tasks` 表还没有 `order` 字段（用于拖拽排序功能）。

## 解决步骤

### 1. 打开 Supabase Dashboard
访问：https://app.supabase.com
登录你的账户

### 2. 选择项目
在项目列表中选择你的项目

### 3. 打开 SQL Editor
- 点击左侧菜单的 "SQL Editor"
- 点击 "New query" 创建新查询

### 4. 执行迁移脚本
复制以下 SQL 代码并粘贴到 SQL Editor 中：

```sql
-- 添加 order 字段到 tasks 表（用于拖拽排序）
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- 为现有任务设置默认 order 值（基于创建时间）
UPDATE public.tasks 
SET "order" = subquery.row_num
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY parent_id ORDER BY created_at) as row_num
  FROM public.tasks
) AS subquery
WHERE public.tasks.id = subquery.id AND public.tasks."order" IS NULL;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_tasks_order ON public.tasks("order");
```

### 5. 运行查询
- 点击 "Run" 按钮（或按 Cmd/Ctrl + Enter）
- 等待执行完成

### 6. 验证
执行成功后，你应该看到：
- "Success. No rows returned"
- 或者看到 "ALTER TABLE" 和 "UPDATE" 的成功消息

### 7. 刷新应用
- 刷新浏览器页面
- 再次尝试创建任务

## 注意事项
- 这个迁移是安全的，不会删除现有数据
- 现有任务的 `order` 会自动设置为基于创建时间的序号
- 如果遇到权限错误，确保你使用的是项目的 Service Role Key（在 Settings -> API 中）

## 如果仍然失败
1. 检查 Supabase 项目是否正确
2. 确认 RLS (Row Level Security) 策略允许更新 tasks 表
3. 查看 Supabase Dashboard -> Table Editor -> tasks 表，确认字段已添加
