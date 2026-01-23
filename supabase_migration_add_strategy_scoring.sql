-- 策略评分功能迁移脚本
-- 在 Supabase Dashboard -> SQL Editor 中执行此脚本
-- 执行时间：2024年（策略评分功能 Phase 1）

-- 为 strategies 表添加评分相关字段
ALTER TABLE public.strategies 
ADD COLUMN IF NOT EXISTS reviewer TEXT,
ADD COLUMN IF NOT EXISTS score INTEGER CHECK (score >= 0 AND score <= 100),
ADD COLUMN IF NOT EXISTS review_comment TEXT;

-- 添加注释说明
COMMENT ON COLUMN public.strategies.reviewer IS '策略审核人';
COMMENT ON COLUMN public.strategies.score IS '策略评分 (0-100)';
COMMENT ON COLUMN public.strategies.review_comment IS '策略审核评语';
