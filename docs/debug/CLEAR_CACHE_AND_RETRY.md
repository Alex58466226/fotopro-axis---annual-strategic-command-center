# 清除缓存并重试

## 问题
如果修复代码后仍然报错，可能是浏览器缓存了旧代码。

## 解决步骤

### 1. 完全清除浏览器缓存
**Chrome/Edge:**
1. 按 `Cmd/Ctrl + Shift + Delete`
2. 选择"缓存的图片和文件"
3. 时间范围选择"全部时间"
4. 点击"清除数据"

**或者使用硬刷新:**
- Windows/Linux: `Ctrl + Shift + R` 或 `Ctrl + F5`
- Mac: `Cmd + Shift + R`

### 2. 关闭所有相关标签页
- 完全关闭所有打开应用的标签页
- 等待 10 秒
- 重新打开应用

### 3. 检查代码是否已更新
打开浏览器开发者工具（F12）：
1. 进入 "Network" 标签
2. 勾选 "Disable cache"
3. 刷新页面
4. 查看 "Sources" 标签，确认代码是否是最新版本

### 4. 如果使用 Vercel 部署
1. 确认代码已推送到 GitHub
2. 在 Vercel Dashboard 检查部署状态
3. 如果部署失败，查看部署日志
4. 如果部署成功，等待 1-2 分钟让 CDN 更新

### 5. 验证修复
1. 打开浏览器控制台（F12 -> Console）
2. 尝试创建新任务
3. 查看是否有错误信息
4. 如果看到 "保存任务数据失败"，检查错误详情

## 如果仍然报错

### 检查 Supabase 表结构
在 Supabase Dashboard -> SQL Editor 执行：

```sql
-- 检查 tasks 表结构
SELECT column_name, data_type 
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'tasks'
ORDER BY ordinal_position;

-- 检查 task_reports 表是否存在
SELECT table_name 
FROM information_schema.tables
WHERE table_schema = 'public' 
  AND table_name = 'task_reports';
```

### 检查代码版本
在浏览器控制台执行：
```javascript
// 检查当前代码版本（如果有版本号）
console.log('App version:', document.querySelector('title')?.textContent);
```

### 查看网络请求
1. 打开开发者工具 -> Network
2. 尝试创建任务
3. 查看对 Supabase 的请求
4. 检查请求的 payload，确认是否包含 `reports` 字段

如果 payload 中包含 `reports` 字段，说明代码还没有更新。
