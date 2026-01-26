-- 添加 order 字段到 tasks 表（用于拖拽排序）
-- 请在 Supabase Dashboard -> SQL Editor 中执行此脚本

-- 添加 order 字段
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
