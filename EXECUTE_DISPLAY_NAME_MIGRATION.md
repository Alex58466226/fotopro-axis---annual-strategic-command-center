# 执行显示名称和邮箱字段迁移

## 问题
如果看到错误："Could not find the 'display_name' column of 'profiles' in the schema cache"，说明数据库表还没有添加新字段。

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
-- 添加 display_name 和 email 字段到 profiles 表
-- 请在 Supabase Dashboard -> SQL Editor 中执行此脚本

-- 添加 display_name 字段（显示名称，用于 owner 字段）
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS display_name TEXT;

-- 添加 email 字段（注册邮箱，与登录用户名分开）
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

-- 为现有用户设置默认 display_name（使用 username）
UPDATE public.profiles 
SET display_name = username 
WHERE display_name IS NULL;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_profiles_display_name ON public.profiles(display_name);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
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
- 再次尝试编辑用户信息

## 注意事项
- 这个迁移是安全的，不会删除现有数据
- 现有用户的 `display_name` 会自动设置为他们的 `username`
- 如果遇到权限错误，确保你使用的是项目的 Service Role Key（在 Settings -> API 中）

## 如果仍然失败
1. 检查 Supabase 项目是否正确
2. 确认 RLS (Row Level Security) 策略允许更新 profiles 表
3. 查看 Supabase Dashboard -> Table Editor -> profiles 表，确认字段已添加
