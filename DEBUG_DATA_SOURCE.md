# 调试数据来源问题

如果刷新后仍然看到测试数据，请按以下步骤排查：

## 1. 检查浏览器控制台

打开浏览器开发者工具（F12），查看 Console 标签，应该能看到以下日志：

```
已清理 localStorage: fotopro_axis_v2_strategies
从 Supabase 查询到 X 条策略记录
从 Supabase 加载的策略数据: X 条
策略数据示例: [...]
从 Supabase 查询到 X 条任务记录
从 Supabase 加载的任务数据: X 条
任务数据示例: [...]
```

## 2. 检查数据来源

### 如果看到 "Supabase strategies 表为空"
- 说明 Supabase 中没有数据，这是正常的
- 应该显示空状态，而不是测试数据

### 如果看到 "从 Supabase 查询到 X 条策略记录"
- 说明 Supabase 中有数据
- 检查这些数据是否是测试数据
- 如果是，需要手动删除 Supabase 中的测试数据

## 3. 检查 Supabase 数据库

1. 登录 Supabase Dashboard
2. 进入 Table Editor
3. 检查以下表：
   - `strategies` - 应该为空或只包含真实数据
   - `tasks` - 应该为空或只包含真实数据
   - `task_reports` - 应该为空或只包含真实数据

## 4. 删除 Supabase 中的测试数据

如果 Supabase 中有测试数据（如 "2026 全球品牌心智工程"、"洛杉矶旗舰店落地" 等），需要手动删除：

### 方法 1：通过 Supabase Dashboard
1. 进入 Table Editor
2. 选择 `strategies` 表
3. 找到测试数据行，点击删除
4. 同样删除 `tasks` 表中的测试任务

### 方法 2：通过 SQL Editor
执行以下 SQL：

```sql
-- 删除测试策略（根据实际测试数据调整）
DELETE FROM strategies WHERE name LIKE '%2026 全球品牌%' OR name LIKE '%洛杉矶旗舰店%';
DELETE FROM tasks WHERE text LIKE '%签署租赁合同%' OR text LIKE '%首批装修进场%';
```

## 5. 清理浏览器缓存

如果问题仍然存在，可能是浏览器缓存了旧的 JavaScript 代码：

1. 硬刷新页面：`Ctrl+Shift+R` (Windows/Linux) 或 `Cmd+Shift+R` (Mac)
2. 或者清除浏览器缓存：
   - Chrome: 设置 > 隐私和安全 > 清除浏览数据 > 选择"缓存的图片和文件"
   - Firefox: 设置 > 隐私与安全 > Cookie 和网站数据 > 清除数据

## 6. 检查代码版本

确认使用的是最新代码：
1. 检查 `App.tsx` 中是否还有 `INIT_STRATEGIES` 或 `INIT_TASKS`
2. 检查 `loadAllData` 函数中是否调用了 `clearOldLocalStorage()`
3. 检查是否所有数据都从 `loadStrategies()` 和 `loadTasks()` 加载
