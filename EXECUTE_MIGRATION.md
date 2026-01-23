# 执行策略评分字段迁移

## 错误说明

如果看到错误：
```
Could not find the 'review_comment' column of 'strategies' in the schema cache
```

这表示数据库中的 `strategies` 表还没有添加评分相关字段。需要执行迁移脚本。

## 执行步骤

### 方法 1：通过 Supabase Dashboard（推荐）

1. **登录 Supabase Dashboard**
   - 访问 https://app.supabase.com
   - 登录你的账户
   - 选择你的项目

2. **打开 SQL Editor**
   - 在左侧菜单中找到 "SQL Editor"
   - 点击进入

3. **执行迁移脚本**
   - 点击 "New query" 创建新查询
   - 复制以下 SQL 代码并粘贴到编辑器中：

```sql
-- 添加策略评分相关字段
ALTER TABLE public.strategies
ADD COLUMN IF NOT EXISTS reviewer TEXT,
ADD COLUMN IF NOT EXISTS score INTEGER,
ADD COLUMN IF NOT EXISTS review_comment TEXT;

-- 验证字段是否添加成功
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'strategies' 
AND column_name IN ('reviewer', 'score', 'review_comment');
```

4. **运行查询**
   - 点击 "Run" 按钮（或按 Cmd/Ctrl + Enter）
   - 检查结果，应该看到 3 行数据，表示字段已添加

5. **验证**
   - 刷新应用程序页面
   - 尝试编辑一个策略并保存
   - 错误应该消失

### 方法 2：通过 Supabase CLI（如果已安装）

如果你安装了 Supabase CLI，可以在项目根目录运行：

```bash
supabase db push
```

但这需要先配置 Supabase CLI 项目。

## 验证迁移是否成功

执行以下查询来验证字段是否已添加：

```sql
SELECT 
  column_name, 
  data_type, 
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'strategies' 
AND column_name IN ('reviewer', 'score', 'review_comment')
ORDER BY column_name;
```

应该返回 3 行：
- `reviewer` (text, nullable)
- `score` (integer, nullable)
- `review_comment` (text, nullable)

## 如果仍然报错

1. **清除浏览器缓存**
   - 硬刷新页面（Cmd/Ctrl + Shift + R）
   - 或清除浏览器缓存

2. **检查 Supabase 连接**
   - 确认 `.env.local` 中的 `VITE_SUPABASE_URL` 和 `VITE_SUPABASE_ANON_KEY` 正确
   - 确认 Supabase 项目状态正常

3. **检查 RLS 策略**
   - 在 Supabase Dashboard 中，进入 "Authentication" > "Policies"
   - 确认 `strategies` 表的 RLS 策略允许当前用户读写

4. **查看 Supabase 日志**
   - 在 Dashboard 中进入 "Logs" > "Postgres Logs"
   - 查看是否有其他错误信息

## 注意事项

- 执行迁移不会影响现有数据
- 新字段都是可选的（nullable），不会破坏现有功能
- 如果之前有策略数据，它们的 `reviewer`、`score`、`review_comment` 字段将为空（null）
