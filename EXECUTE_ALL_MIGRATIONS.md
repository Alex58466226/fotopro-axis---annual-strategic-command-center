# 执行所有数据库迁移

## 问题
如果遇到以下错误：
- "Could not find the 'display_name' column of 'profiles'"
- "Could not find the 'order' column of 'tasks'"

说明数据库表结构需要更新。

## 一次性执行所有迁移

### 1. 打开 Supabase Dashboard
访问：https://app.supabase.com
登录你的账户

### 2. 进入 SQL Editor
- 点击左侧菜单的 "SQL Editor"
- 点击 "New query" 创建新查询

### 3. 执行完整迁移脚本
复制以下**完整 SQL 代码**并粘贴到 SQL Editor 中：

```sql
-- ============================================
-- 完整数据库迁移脚本
-- 一次性添加所有缺失的字段
-- ============================================

-- 1. 添加 profiles 表的 display_name 和 email 字段
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 为现有用户设置默认 display_name（使用 username）
UPDATE public.profiles 
SET display_name = username 
WHERE display_name IS NULL;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- 2. 添加 tasks 表的 order 字段（用于拖拽排序）
ALTER TABLE public.tasks 
ADD COLUMN IF NOT EXISTS "order" INTEGER;

-- 为现有任务设置默认 order 值（基于创建时间）
DO $$
DECLARE
  task_record RECORD;
  order_counter INTEGER;
  current_parent_id TEXT;
BEGIN
  -- 为每个 parent_id 分组设置 order
  FOR task_record IN 
    SELECT id, parent_id, created_at
    FROM public.tasks
    WHERE "order" IS NULL
    ORDER BY parent_id, created_at
  LOOP
    -- 如果 parent_id 改变，重置计数器
    IF current_parent_id IS NULL OR current_parent_id != task_record.parent_id THEN
      order_counter := 1;
      current_parent_id := task_record.parent_id;
    END IF;
    
    -- 更新 order 值
    UPDATE public.tasks
    SET "order" = order_counter
    WHERE id = task_record.id;
    
    order_counter := order_counter + 1;
  END LOOP;
END $$;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_tasks_order ON public.tasks("order");

-- 3. 验证迁移结果
SELECT 
  'profiles 表字段检查' as check_type,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'profiles'
  AND column_name IN ('display_name', 'email')
UNION ALL
SELECT 
  'tasks 表字段检查' as check_type,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'tasks'
  AND column_name = 'order';
```

### 4. 运行查询
- 点击 "Run" 按钮（或按 Cmd/Ctrl + Enter）
- 等待执行完成

### 5. 检查结果
执行成功后，你应该看到：
- 最后会显示一个查询结果，列出已添加的字段
- 应该看到 `display_name`, `email`, `order` 三个字段

### 6. 刷新应用
- **完全关闭浏览器标签页**
- 重新打开应用
- 清除浏览器缓存（可选：Cmd/Ctrl + Shift + R）
- 再次尝试创建任务或编辑用户信息

## 如果仍然失败

### 检查步骤：
1. **确认字段已添加**：
   - 在 Supabase Dashboard -> Table Editor
   - 查看 `profiles` 表，应该看到 `display_name` 和 `email` 列
   - 查看 `tasks` 表，应该看到 `order` 列

2. **刷新 Schema Cache**：
   - 在 Supabase Dashboard -> Settings -> API
   - 点击 "Refresh Schema Cache"（如果有这个选项）
   - 或者等待几分钟让缓存自动刷新

3. **检查 RLS 策略**：
   - 在 Supabase Dashboard -> Authentication -> Policies
   - 确认 `profiles` 和 `tasks` 表的 RLS 策略允许更新操作

4. **查看详细错误**：
   - 打开浏览器开发者工具（F12）
   - 查看 Console 标签页
   - 查看 Network 标签页中的 API 请求
   - 复制完整的错误信息

## 单独执行迁移（如果完整脚本失败）

如果完整脚本执行失败，可以分别执行：

### 只添加 profiles 字段：
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
UPDATE public.profiles SET display_name = username WHERE display_name IS NULL;
```

### 只添加 tasks 字段：
```sql
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS "order" INTEGER;
```
