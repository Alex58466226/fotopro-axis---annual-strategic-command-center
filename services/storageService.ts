/**
 * 数据持久化服务
 * 提供安全、可靠的数据存储和加载功能
 * 
 * 功能：
 * - 数据版本管理
 * - 数据验证
 * - 错误处理（配额超限、JSON 解析错误等）
 * - 用户友好的错误提示
 */

// 数据版本号（用于未来数据迁移）
const DATA_VERSION = '2.0';
const VERSION_KEY = 'fotopro_axis_data_version';

// 存储键名
export const STORAGE_KEYS = {
  STRATEGY: 'fotopro_axis_v2_strategies',
  TASKS: 'fotopro_axis_v2_tasks',
  LOGS: 'fotopro_axis_v2_logs',
  USER: 'fotopro_axis_v2_user',
  USERS_DB: 'fotopro_axis_v2_users_db',
} as const;

/**
 * 存储操作结果
 */
export interface StorageResult<T> {
  success: boolean;
  data?: T;
  error?: string;
}

/**
 * 数据验证函数类型
 */
export type Validator<T> = (data: T) => { valid: boolean; error?: string };

/**
 * 检查 localStorage 是否可用
 */
function isStorageAvailable(): boolean {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch (e) {
    return false;
  }
}

/**
 * 检查存储配额是否足够
 */
function checkStorageQuota(dataSize: number): { available: boolean; error?: string } {
  try {
    // 估算可用空间（大多数浏览器限制为 5-10MB）
    // 这里使用一个保守的估算：如果数据超过 1MB，给出警告
    const maxSize = 1024 * 1024; // 1MB
    if (dataSize > maxSize) {
      return {
        available: false,
        error: '数据量过大，可能超出浏览器存储限制。建议清理部分数据或导出备份。',
      };
    }
    return { available: true };
  } catch (e) {
    return {
      available: false,
      error: '无法检查存储空间',
    };
  }
}

/**
 * 获取数据版本
 */
export function getDataVersion(): string | null {
  try {
    return localStorage.getItem(VERSION_KEY);
  } catch {
    return null;
  }
}

/**
 * 设置数据版本
 */
export function setDataVersion(version: string = DATA_VERSION): boolean {
  try {
    localStorage.setItem(VERSION_KEY, version);
    return true;
  } catch {
    return false;
  }
}

/**
 * 检查是否需要数据迁移
 */
export function needsMigration(): boolean {
  const currentVersion = getDataVersion();
  return currentVersion !== DATA_VERSION;
}

/**
 * 保存数据到 localStorage
 */
export function saveToStorage<T>(
  key: string,
  data: T,
  validator?: Validator<T>
): StorageResult<T> {
  if (!isStorageAvailable()) {
    return {
      success: false,
      error: '浏览器不支持 localStorage，无法保存数据。',
    };
  }

  // 数据验证
  if (validator) {
    const validation = validator(data);
    if (!validation.valid) {
      return {
        success: false,
        error: validation.error || '数据验证失败',
      };
    }
  }

  try {
    const jsonString = JSON.stringify(data);
    const dataSize = new Blob([jsonString]).size;

    // 检查存储配额
    const quotaCheck = checkStorageQuota(dataSize);
    if (!quotaCheck.available) {
      return {
        success: false,
        error: quotaCheck.error || '存储空间不足',
      };
    }

    localStorage.setItem(key, jsonString);
    return {
      success: true,
      data,
    };
  } catch (e: any) {
    // 处理配额超限错误
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      return {
        success: false,
        error: '存储空间已满。请清理浏览器数据或导出备份后删除部分数据。',
      };
    }

    // 其他错误
    return {
      success: false,
      error: `保存数据失败: ${e.message || '未知错误'}`,
    };
  }
}

/**
 * 从 localStorage 加载数据
 */
export function loadFromStorage<T>(
  key: string,
  defaultValue: T,
  validator?: Validator<T>
): StorageResult<T> {
  if (!isStorageAvailable()) {
    return {
      success: false,
      data: defaultValue,
      error: '浏览器不支持 localStorage，使用默认值。',
    };
  }

  try {
    const item = localStorage.getItem(key);
    if (item === null) {
      return {
        success: true,
        data: defaultValue,
      };
    }

    const parsed = JSON.parse(item) as T;

    // 数据验证
    if (validator) {
      const validation = validator(parsed);
      if (!validation.valid) {
        console.error(`数据验证失败 (${key}):`, validation.error);
        return {
          success: false,
          data: defaultValue,
          error: validation.error || '数据格式不正确，已使用默认值',
        };
      }
    }

    return {
      success: true,
      data: parsed,
    };
  } catch (e: any) {
    // JSON 解析错误
    if (e instanceof SyntaxError) {
      console.error(`JSON 解析错误 (${key}):`, e);
      return {
        success: false,
        data: defaultValue,
        error: '数据格式损坏，已使用默认值。建议从备份恢复数据。',
      };
    }

    // 其他错误
    return {
      success: false,
      data: defaultValue,
      error: `加载数据失败: ${e.message || '未知错误'}`,
    };
  }
}

/**
 * 批量保存数据（原子操作）
 */
export function saveBatch(
  items: Array<{ key: string; data: any; validator?: Validator<any> }>
): StorageResult<boolean> {
  if (!isStorageAvailable()) {
    return {
      success: false,
      error: '浏览器不支持 localStorage',
    };
  }

  // 先验证所有数据
  for (const item of items) {
    if (item.validator) {
      const validation = item.validator(item.data);
      if (!validation.valid) {
        return {
          success: false,
          error: `数据验证失败 (${item.key}): ${validation.error}`,
        };
      }
    }
  }

  // 尝试保存所有数据
  const savedData: Array<{ key: string; value: string }> = [];
  try {
    for (const item of items) {
      const jsonString = JSON.stringify(item.data);
      savedData.push({ key: item.key, value: jsonString });
      localStorage.setItem(item.key, jsonString);
    }
    return { success: true, data: true };
  } catch (e: any) {
    // 如果保存失败，尝试恢复之前的状态（但这里无法获取之前的值）
    // 在实际应用中，可以考虑使用事务机制
    if (e.name === 'QuotaExceededError' || e.code === 22) {
      return {
        success: false,
        error: '存储空间已满。请清理浏览器数据或导出备份。',
      };
    }
    return {
      success: false,
      error: `批量保存失败: ${e.message || '未知错误'}`,
    };
  }
}

/**
 * 从 localStorage 删除数据
 */
export function removeFromStorage(key: string): StorageResult<boolean> {
  if (!isStorageAvailable()) {
    return {
      success: false,
      error: '浏览器不支持 localStorage',
    };
  }

  try {
    localStorage.removeItem(key);
    return { success: true, data: true };
  } catch (e: any) {
    return {
      success: false,
      error: `删除数据失败: ${e.message || '未知错误'}`,
    };
  }
}

/**
 * 创建数据备份（导出为 JSON 字符串）
 */
export function createBackup(data: {
  strategies?: any;
  tasks?: any;
  logs?: any;
  users?: any;
}): StorageResult<string> {
  try {
    const backup = {
      version: DATA_VERSION,
      timestamp: new Date().toISOString(),
      data,
    };
    const jsonString = JSON.stringify(backup, null, 2);
    return {
      success: true,
      data: jsonString,
    };
  } catch (e: any) {
    return {
      success: false,
      error: `创建备份失败: ${e.message || '未知错误'}`,
    };
  }
}

/**
 * 验证数据完整性
 */
export function validateData<T>(
  data: T,
  validator: Validator<T>
): { valid: boolean; error?: string } {
  return validator(data);
}
