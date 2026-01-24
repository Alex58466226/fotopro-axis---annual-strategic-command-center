/**
 * 认证服务 - Supabase Auth 版本
 * 使用 Supabase Auth 处理用户认证，密码自动哈希存储
 */

import { supabase } from './supabaseClient';
import { User, AuditLog } from '../types';
import { AVATAR_COLORS } from '../constants';

/**
 * 生成唯一 ID
 */
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 999)}`;

/**
 * 登录结果
 */
export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * 使用 Supabase Auth 登录
 * 注意：Supabase 使用 email 作为登录标识，这里我们将 username 作为 email 使用
 */
export async function loginWithSupabase(
  username: string,
  password: string
): Promise<LoginResult> {
  if (!username.trim() || !password.trim()) {
    return {
      success: false,
      error: '请输入用户名和密码',
    };
  }

  try {
    // Supabase Auth 使用 email 登录，我们将 username 作为 email
    // 如果用户注册时使用的是 email 格式，直接使用；否则需要确保一致性
    const email = username.includes('@') ? username : `${username}@fotopro.local`;

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return {
        success: false,
        error: error?.message || '用户名或密码错误',
      };
    }

    // 从 profiles 表加载用户扩展信息
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      // PGRST116 表示未找到记录，这是正常的（新用户可能还没有 profile）
      console.error('加载用户信息失败:', profileError);
    }

    // 构建应用用户对象
    const appUser: User = {
      id: data.user.id,
      username: profile?.username || username,
      password: '', // 不再存储密码
      role: (profile?.role as 'Admin' | 'User' | 'Viewer') || 'User',
      avatarColor: profile?.avatar_color || AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      displayName: profile?.display_name || profile?.username || username, // 显示名称，默认使用 username
      email: profile?.email || data.user.email || undefined, // 邮箱
    };

    return {
      success: true,
      user: appUser,
    };
  } catch (error: any) {
    console.error('登录异常:', error);
    return {
      success: false,
      error: error.message || '登录失败，请稍后重试',
    };
  }
}

/**
 * 注册结果
 */
export interface RegisterResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * 使用 Supabase Auth 注册
 */
export async function registerWithSupabase(
  username: string,
  password: string,
  confirmPassword: string,
  displayName?: string, // 显示名称（可选）
  email?: string // 注册邮箱（可选，与登录用户名分开）
): Promise<RegisterResult> {
  if (!username.trim() || !password.trim()) {
    return {
      success: false,
      error: '请填写所有字段',
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: '两次输入的密码不一致',
    };
  }

  // 检查用户名是否已存在
  const loginEmail = email || (username.includes('@') ? username : `${username}@fotopro.local`);
  const { data: existingUsers } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username)
    .limit(1);

  if (existingUsers && existingUsers.length > 0) {
    return {
      success: false,
      error: '用户名已存在',
    };
  }

  try {
    // 使用 Supabase Auth 注册（使用邮箱作为登录标识）
    const { data, error } = await supabase.auth.signUp({
      email: loginEmail,
      password,
    });

    if (error || !data.user) {
      return {
        success: false,
        error: error?.message || '注册失败',
      };
    }

    // 检查是否是第一个用户（自动成为 Admin）
    const { count } = await supabase
      .from('profiles')
      .select('id', { count: 'exact', head: true });

    const role = (count || 0) === 0 ? 'Admin' : 'User';

    // 创建 profile 记录
    const { error: profileError } = await supabase
      .from('profiles')
      .insert({
        id: data.user.id,
        username: username.trim(),
        display_name: displayName?.trim() || username.trim(), // 显示名称，默认使用 username
        email: email?.trim() || undefined, // 注册邮箱
        role,
        avatar_color: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      });

    if (profileError) {
      console.error('创建用户信息失败:', profileError);
      // 即使 profile 创建失败，用户也已经注册成功，可以继续
    }

    // 构建应用用户对象
    const appUser: User = {
      id: data.user.id,
      username: username.trim(),
      password: '', // 不再存储密码
      role,
      avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
      displayName: displayName?.trim() || username.trim(), // 显示名称
      email: email?.trim() || undefined, // 注册邮箱
    };

    return {
      success: true,
      user: appUser,
    };
  } catch (error: any) {
    console.error('注册异常:', error);
    return {
      success: false,
      error: error.message || '注册失败，请稍后重试',
    };
  }
}

/**
 * 重置密码结果
 */
export interface ResetPasswordResult {
  success: boolean;
  error?: string;
}

/**
 * 使用 Supabase Auth 重置密码
 */
export async function resetPasswordWithSupabase(
  username: string,
  password: string,
  confirmPassword: string
): Promise<ResetPasswordResult> {
  if (!username.trim() || !password.trim()) {
    return {
      success: false,
      error: '请填写所有字段',
    };
  }

  if (password !== confirmPassword) {
    return {
      success: false,
      error: '两次输入的密码不一致',
    };
  }

  try {
    const email = username.includes('@') ? username : `${username}@fotopro.local`;

    // Supabase 需要先发送重置密码邮件，然后用户通过邮件链接重置
    // 这里我们提供一个简化的重置流程（需要用户已登录）
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        error: '请先登录',
      };
    }

    const { error } = await supabase.auth.updateUser({
      password: password,
    });

    if (error) {
      return {
        success: false,
        error: error.message || '重置密码失败',
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('重置密码异常:', error);
    return {
      success: false,
      error: error.message || '重置密码失败，请稍后重试',
    };
  }
}

/**
 * 获取当前登录用户
 */
export async function getCurrentUser(): Promise<User | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return null;
    }

    // 从 profiles 表加载用户信息
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return null;
    }

    return {
      id: user.id,
      username: profile.username,
      password: '', // 不再存储密码
      role: profile.role as 'Admin' | 'User' | 'Viewer',
      avatarColor: profile.avatar_color,
    };
  } catch (error) {
    console.error('获取当前用户失败:', error);
    return null;
  }
}

/**
 * 登出
 */
export async function logoutWithSupabase(): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      return {
        success: false,
        error: error.message || '登出失败',
      };
    }

    return { success: true };
  } catch (error: any) {
    console.error('登出异常:', error);
    return {
      success: false,
      error: error.message || '登出失败，请稍后重试',
    };
  }
}

/**
 * 保存登录状态（现在使用 Supabase session，不需要手动保存）
 */
export function saveLoginState(user: User): { success: boolean; error?: string } {
  // Supabase Auth 会自动管理 session，存储在 localStorage 中
  // 这里保留接口兼容性，但不做实际操作
  return { success: true };
}

/**
 * 清除登录状态
 */
export async function clearLoginState(): Promise<{ success: boolean; error?: string }> {
  return await logoutWithSupabase();
}

/**
 * 创建登录审计日志
 */
export function createLoginLog(user: User): AuditLog {
  return {
    id: generateId('log'),
    userId: user.id,
    userName: user.username,
    action: 'LOGIN',
    targetType: 'SYSTEM',
    targetName: 'Auth System',
    details: 'User logged in successfully',
    timestamp: new Date().toISOString(),
  };
}

/**
 * 创建注册审计日志
 */
export function createRegisterLog(user: User): AuditLog {
  return {
    id: generateId('log'),
    userId: user.id,
    userName: user.username,
    action: 'CREATE',
    targetType: 'SYSTEM',
    targetName: 'User Registration',
    details: `New ${user.role} account created`,
    timestamp: new Date().toISOString(),
  };
}

/**
 * 创建登出审计日志
 */
export function createLogoutLog(user: User): AuditLog {
  return {
    id: generateId('log'),
    userId: user.id,
    userName: user.username,
    action: 'LOGIN',
    targetType: 'SYSTEM',
    targetName: 'Auth System',
    details: 'User logged out',
    timestamp: new Date().toISOString(),
  };
}

/**
 * 创建重置密码审计日志
 */
export function createResetPasswordLog(user: User): AuditLog {
  return {
    id: generateId('log'),
    userId: user.id,
    userName: user.username,
    action: 'UPDATE',
    targetType: 'SYSTEM',
    targetName: 'Password Recovery',
    details: 'Password reset via simple recovery',
    timestamp: new Date().toISOString(),
  };
}

/**
 * 兼容性函数：保留旧的接口名称
 */
export const validateLogin = loginWithSupabase;
export const validateRegister = registerWithSupabase;
export const validateResetPassword = resetPasswordWithSupabase;
