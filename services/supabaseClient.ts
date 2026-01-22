// services/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env.VITE_SUPABASE_ANON_KEY;

// 检查环境变量
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase 环境变量未配置！');
  console.error('请在 .env.local 文件中配置：');
  console.error('VITE_SUPABASE_URL=你的_supabase_url');
  console.error('VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  }
);

// 测试连接
if (supabaseUrl && supabaseAnonKey) {
  supabase.auth.getSession().then(({ data, error }) => {
    if (error) {
      console.warn('⚠️ Supabase 连接测试失败:', error.message);
    } else {
      console.log('✅ Supabase 连接正常');
    }
  });
}