# 任务删除功能问题排查指南

## 问题现象
删除任务后，刷新页面任务重新出现。

## 已修复内容
✅ 代码已修复并提交到本地 Git 仓库
- `App.tsx` - `deleteTask` 函数已修改为异步函数，先调用数据库删除
- `services/supabaseDataService.ts` - `deleteTaskFromSupabase` 函数已改进

## 排查步骤

### 1. 检查代码是否已部署

#### 如果使用 GitHub 自动部署（Vercel/Netlify）
1. **检查 GitHub 推送状态**
   ```bash
   git status
   git log --oneline -5
   ```
   - 如果看到 "fix: 修复任务删除功能" 的提交，说明代码已提交
   - 如果推送失败（网络问题），需要手动推送：
     ```bash
     git push origin main
     ```

2. **检查部署状态**
   - 访问 Vercel/Netlify Dashboard
   - 查看最新的部署是否包含修复代码
   - 如果部署失败，查看部署日志

#### 如果手动部署
1. **确认代码已更新**
   ```bash
   git pull origin main  # 拉取最新代码
   npm run build        # 重新构建
   ```

### 2. 清除浏览器缓存

**重要**：即使代码已更新，浏览器可能仍在使用缓存的旧代码。

#### Chrome/Edge
1. 按 `F12` 打开开发者工具
2. 右键点击刷新按钮
3. 选择"清空缓存并硬性重新加载"（Empty Cache and Hard Reload）

或者：
1. 按 `Ctrl+Shift+Delete` (Windows) 或 `Cmd+Shift+Delete` (Mac)
2. 选择"缓存的图片和文件"
3. 时间范围选择"全部时间"
4. 点击"清除数据"

#### Firefox
1. 按 `Ctrl+Shift+Delete` (Windows) 或 `Cmd+Shift+Delete` (Mac)
2. 选择"缓存"
3. 时间范围选择"全部"
4. 点击"立即清除"

#### Safari
1. 按 `Cmd+Option+E` 清除缓存
2. 或者：Safari > 偏好设置 > 高级 > 勾选"在菜单栏中显示开发菜单"
3. 然后：开发 > 清空缓存

### 3. 检查浏览器控制台

1. 打开浏览器开发者工具（F12）
2. 切换到 Console 标签
3. 尝试删除任务
4. 查看是否有错误信息：
   - ❌ "删除任务失败: ..." - 数据库删除失败
   - ❌ "删除任务异常: ..." - 代码执行异常
   - ✅ "任务已删除" - 删除成功（但可能仍有问题）

### 4. 检查网络请求

1. 打开浏览器开发者工具（F12）
2. 切换到 Network 标签
3. 尝试删除任务
4. 查找对 Supabase 的 DELETE 请求：
   - 请求 URL 应该包含 `/tasks?id=eq.{taskId}`
   - 状态码应该是 204 (No Content) 或 200 (OK)
   - 如果状态码是 4xx 或 5xx，说明删除失败

### 5. 验证数据库删除

#### 方法 1：通过 Supabase Dashboard
1. 登录 Supabase Dashboard
2. 进入 Table Editor
3. 选择 `tasks` 表
4. 查找被删除的任务 ID
5. 如果任务还在，说明数据库删除失败

#### 方法 2：通过 SQL Editor
```sql
-- 查看所有任务
SELECT id, text, created_at FROM public.tasks ORDER BY created_at DESC LIMIT 10;

-- 查看特定任务（替换 {taskId} 为实际任务 ID）
SELECT * FROM public.tasks WHERE id = '{taskId}';
```

### 6. 检查 Supabase 连接

1. 检查环境变量：
   - `VITE_SUPABASE_URL` 是否正确
   - `VITE_SUPABASE_ANON_KEY` 是否正确

2. 检查 Supabase 项目状态：
   - 登录 Supabase Dashboard
   - 确认项目状态为 "Active"
   - 检查是否有配额限制

### 7. 检查 RLS 策略

1. 登录 Supabase Dashboard
2. 进入 Authentication > Policies
3. 选择 `tasks` 表
4. 确认有删除策略：
   ```sql
   -- 应该有这样的策略
   CREATE POLICY "Authenticated users can delete tasks" 
   ON public.tasks 
   FOR DELETE 
   TO authenticated 
   USING (true);
   ```

## 常见问题

### Q1: 代码已修复但网页端仍然无法删除
**可能原因**：
1. 代码未推送到 GitHub（网络问题）
2. 自动部署未触发或失败
3. 浏览器缓存了旧代码

**解决方法**：
1. 手动推送代码到 GitHub：
   ```bash
   git push origin main
   ```
2. 检查部署状态
3. 清除浏览器缓存并硬刷新

### Q2: 删除时显示"删除任务失败"
**可能原因**：
1. Supabase 连接问题
2. RLS 策略不允许删除
3. 网络问题

**解决方法**：
1. 检查浏览器控制台的错误信息
2. 检查 Supabase Dashboard 的日志
3. 验证 RLS 策略

### Q3: 删除成功但刷新后任务又出现
**可能原因**：
1. 数据库删除失败（但前端显示成功）
2. 数据加载时从其他地方恢复了数据

**解决方法**：
1. 检查数据库确认任务是否真的被删除
2. 检查数据加载逻辑（`loadTasks` 函数）

## 验证修复是否生效

### 步骤 1：检查代码版本
在浏览器控制台执行：
```javascript
// 检查 deleteTask 函数是否是异步函数
console.log(typeof window.deleteTask); // 应该是 'function'
```

### 步骤 2：测试删除流程
1. 创建一个测试任务
2. 删除该任务
3. 观察是否显示"任务已删除"提示
4. 打开浏览器控制台，查看是否有错误
5. 刷新页面
6. 检查任务是否还在

### 步骤 3：验证数据库
1. 登录 Supabase Dashboard
2. 查看 `tasks` 表
3. 确认被删除的任务不在列表中

## 如果问题仍然存在

1. **收集信息**：
   - 浏览器控制台的错误信息
   - Network 标签中的请求详情
   - Supabase Dashboard 的日志

2. **检查代码**：
   - 确认 `deleteTask` 函数是 `async` 函数
   - 确认调用了 `deleteTaskFromSupabase`
   - 确认错误处理逻辑正确

3. **联系开发团队**：
   - 提供错误信息
   - 提供复现步骤
   - 提供浏览器和系统信息

---

**最后更新**: 2026-01-25  
**相关文档**: 
- [任务删除功能修复测试报告](../tests/TASK_DELETE_FIX_TEST_REPORT.md)
- [清除缓存重试](./CLEAR_CACHE_AND_RETRY.md)
