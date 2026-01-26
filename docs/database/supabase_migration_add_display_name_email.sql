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
