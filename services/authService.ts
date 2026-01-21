/**
 * 认证服务
 * 处理用户认证相关的业务逻辑
 */

import { User, AuditLog } from '../types';
import { AVATAR_COLORS } from '../constants';
import { saveToStorage, removeFromStorage, STORAGE_KEYS } from './storageService';

/**
 * 生成唯一 ID
 */
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.floor(Math.random() * 999)}`;

/**
 * 登录验证
 */
export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

export function validateLogin(
  username: string,
  password: string,
  users: User[]
): LoginResult {
  if (!username.trim() || !password.trim()) {
    return {
      success: false,
      error: '请输入用户名和密码',
    };
  }

  const user = users.find(
    u => u.username.toLowerCase() === username.toLowerCase().trim() && u.password === password
  );

  if (!user) {
    return {
      success: false,
      error: '用户名或密码错误',
    };
  }

  return {
    success: true,
    user,
  };
}

/**
 * 保存登录状态
 */
export function saveLoginState(user: User): { success: boolean; error?: string } {
  const result = saveToStorage(STORAGE_KEYS.USER, user);
  if (!result.success) {
    return {
      success: false,
      error: result.error || '保存登录状态失败',
    };
  }
  return { success: true };
}

/**
 * 清除登录状态
 */
export function clearLoginState(): { success: boolean; error?: string } {
  const result = removeFromStorage(STORAGE_KEYS.USER);
  if (!result.success) {
    return {
      success: false,
      error: result.error || '清除登录状态失败',
    };
  }
  return { success: true };
}

/**
 * 注册验证
 */
export interface RegisterResult {
  success: boolean;
  user?: User;
  error?: string;
}

export function validateRegister(
  username: string,
  password: string,
  confirmPassword: string,
  existingUsers: User[]
): RegisterResult {
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

  if (existingUsers.some(u => u.username.toLowerCase() === username.toLowerCase().trim())) {
    return {
      success: false,
      error: '用户名已存在',
    };
  }

  // 第一个注册的用户自动成为 Admin
  const role = existingUsers.length === 0 ? 'Admin' : 'User';

  const newUser: User = {
    id: generateId('user'),
    username: username.trim(),
    password,
    role,
    avatarColor: AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)],
  };

  return {
    success: true,
    user: newUser,
  };
}

/**
 * 重置密码验证
 */
export interface ResetPasswordResult {
  success: boolean;
  updatedUser?: User;
  error?: string;
}

export function validateResetPassword(
  username: string,
  password: string,
  confirmPassword: string,
  existingUsers: User[]
): ResetPasswordResult {
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

  const userIndex = existingUsers.findIndex(
    u => u.username.toLowerCase() === username.toLowerCase().trim()
  );

  if (userIndex === -1) {
    return {
      success: false,
      error: '用户不存在',
    };
  }

  const updatedUser: User = {
    ...existingUsers[userIndex],
    password,
  };

  return {
    success: true,
    updatedUser,
  };
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
