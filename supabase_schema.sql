-- Supabase 数据库表结构
-- 请在 Supabase Dashboard -> SQL Editor 中执行此脚本

-- 1. 用户扩展信息表（与 Supabase Auth 关联）
-- 注意：Supabase Auth 会自动创建 auth.users 表，我们只需要创建 profiles 表
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL DEFAULT 'User' CHECK (role IN ('Admin', 'User', 'Viewer')),
  avatar_color TEXT NOT NULL DEFAULT 'bg-slate-500',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS 策略：用户可以查看所有 profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT USING (true);

-- RLS 策略：用户可以更新自己的 profile
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- RLS 策略：用户可以插入自己的 profile
CREATE POLICY "Users can insert own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 2. 策略表（对应 StrategyNode）
CREATE TABLE IF NOT EXISTS public.strategies (
  id TEXT PRIMARY KEY,
  level INTEGER NOT NULL CHECK (level IN (1, 2, 3)),
  name TEXT NOT NULL,
  parent_id TEXT REFERENCES public.strategies(id) ON DELETE CASCADE,
  start DATE,
  "end" DATE,
  owner TEXT,
  status TEXT DEFAULT 'active',
  channel TEXT,
  product TEXT,
  tags TEXT[], -- PostgreSQL 数组类型
  description TEXT,
  metrics JSONB DEFAULT '[]'::jsonb, -- 存储指标数组
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.strategies ENABLE ROW LEVEL SECURITY;

-- RLS 策略：所有认证用户可以查看所有策略
CREATE POLICY "Authenticated users can view strategies" ON public.strategies
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS 策略：所有认证用户可以创建策略
CREATE POLICY "Authenticated users can create strategies" ON public.strategies
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS 策略：所有认证用户可以更新策略
CREATE POLICY "Authenticated users can update strategies" ON public.strategies
  FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS 策略：所有认证用户可以删除策略
CREATE POLICY "Authenticated users can delete strategies" ON public.strategies
  FOR DELETE USING (auth.role() = 'authenticated');

-- 3. 任务表（对应 Task）
CREATE TABLE IF NOT EXISTS public.tasks (
  id TEXT PRIMARY KEY,
  parent_id TEXT, -- 指向 L3 策略或另一条任务
  root_id TEXT REFERENCES public.strategies(id) ON DELETE CASCADE,
  text TEXT NOT NULL,
  start DATE,
  "end" DATE,
  status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'in_progress', 'completed', 'confirmed')),
  progress INTEGER DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
  owner TEXT,
  product TEXT,
  channel TEXT,
  priority TEXT DEFAULT 'P2' CHECK (priority IN ('P0', 'P1', 'P2')),
  reviewer TEXT,
  score INTEGER,
  review_comment TEXT,
  notes TEXT,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- RLS 策略：所有认证用户可以查看所有任务
CREATE POLICY "Authenticated users can view tasks" ON public.tasks
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS 策略：所有认证用户可以创建任务
CREATE POLICY "Authenticated users can create tasks" ON public.tasks
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS 策略：所有认证用户可以更新任务
CREATE POLICY "Authenticated users can update tasks" ON public.tasks
  FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS 策略：所有认证用户可以删除任务
CREATE POLICY "Authenticated users can delete tasks" ON public.tasks
  FOR DELETE USING (auth.role() = 'authenticated');

-- 4. 任务报告表（对应 TaskReport）
CREATE TABLE IF NOT EXISTS public.task_reports (
  id TEXT PRIMARY KEY,
  task_id TEXT REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('计划', '进展', '问题', '结果', '复盘')),
  content TEXT NOT NULL,
  timestamp TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.task_reports ENABLE ROW LEVEL SECURITY;

-- RLS 策略：所有认证用户可以查看所有报告
CREATE POLICY "Authenticated users can view reports" ON public.task_reports
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS 策略：所有认证用户可以创建报告
CREATE POLICY "Authenticated users can create reports" ON public.task_reports
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- RLS 策略：所有认证用户可以更新报告
CREATE POLICY "Authenticated users can update reports" ON public.task_reports
  FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS 策略：所有认证用户可以删除报告
CREATE POLICY "Authenticated users can delete reports" ON public.task_reports
  FOR DELETE USING (auth.role() = 'authenticated');

-- 5. 审计日志表（AuditLog）
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  user_name TEXT,
  action TEXT NOT NULL,
  target_type TEXT,
  target_name TEXT,
  details TEXT,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- 启用 RLS
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- RLS 策略：所有认证用户可以查看所有日志
CREATE POLICY "Authenticated users can view logs" ON public.audit_logs
  FOR SELECT USING (auth.role() = 'authenticated');

-- RLS 策略：所有认证用户可以创建日志
CREATE POLICY "Authenticated users can create logs" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- 创建索引以提升查询性能
CREATE INDEX IF NOT EXISTS idx_strategies_parent_id ON public.strategies(parent_id);
CREATE INDEX IF NOT EXISTS idx_strategies_level ON public.strategies(level);
CREATE INDEX IF NOT EXISTS idx_tasks_parent_id ON public.tasks(parent_id);
CREATE INDEX IF NOT EXISTS idx_tasks_root_id ON public.tasks(root_id);
CREATE INDEX IF NOT EXISTS idx_task_reports_task_id ON public.task_reports(task_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON public.audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_timestamp ON public.audit_logs(timestamp DESC);

-- 创建触发器：自动更新 updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_strategies_updated_at BEFORE UPDATE ON public.strategies
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON public.tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
