# 快速修复 order 字段错误

## 问题
错误信息："Could not find the 'order' column of 'tasks' in the schema cache"

## 最简单解决方案（3步）

### 步骤 1: 打开 Supabase SQL Editor
1. 访问 https://app.supabase.com
2. 选择你的项目
3. 点击左侧 "SQL Editor"
4. 点击 "New query"

### 步骤 2: 复制并执行以下 SQL
```sql
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS "order" INTEGER;
```

**就这么简单！** 只需要这一行。

### 步骤 3: 刷新应用
1. 完全关闭浏览器标签页
2. 重新打开应用
3. 清除缓存（Cmd/Ctrl + Shift + R）

## 如果还是不行

### 检查字段是否真的添加了
执行这个查询：
```sql
SELECT column_name 
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'tasks'
  AND column_name = 'order';
```

如果返回空结果，说明字段没有添加成功。可能的原因：
- 权限不足（使用 Service Role Key）
- 表名错误
- 数据库连接问题

### 手动检查表结构
1. 在 Supabase Dashboard -> Table Editor
2. 选择 `tasks` 表
3. 查看列列表，确认是否有 `order` 列

### 如果字段已存在但仍然报错
这是 Schema Cache 问题：
1. 等待 2-3 分钟让缓存自动刷新
2. 或者重启 Supabase 项目（Settings -> General -> Restart Project）

## 完整迁移脚本（如果需要设置默认值）
如果你想要为现有任务设置默认 order 值：

```sql
-- 1. 添加字段
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- 2. 为现有任务设置默认值（可选）
UPDATE public.tasks 
SET "order" = sub.row_num
FROM (
  SELECT 
    id,
    ROW_NUMBER() OVER (PARTITION BY COALESCE(parent_id, 'root') ORDER BY created_at) as row_num
  FROM public.tasks
) sub
WHERE public.tasks.id = sub.id 
  AND public.tasks."order" IS NULL;
```

## 验证
执行后，尝试创建新任务，应该不再报错。
