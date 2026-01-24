# 修复 reports 字段错误

## 问题说明
错误信息："Could not find the 'reports' column of 'tasks' in the schema cache"

**重要**：这个错误不是因为缺少字段，而是因为代码逻辑错误。`reports` 不应该存储在 `tasks` 表中，而应该存储在 `task_reports` 表中。

## 已修复
代码已经修复，现在：
- `reports` 数据会正确保存到 `task_reports` 表
- `reports` 数据会从 `task_reports` 表正确加载
- `tasks` 表不再尝试保存 `reports` 字段

## 不需要执行任何迁移
**你不需要在 Supabase 中添加 `reports` 列到 `tasks` 表**，因为：
1. `task_reports` 表已经存在（在 `supabase_schema.sql` 中已定义）
2. 代码已经修复，不再尝试将 `reports` 保存到 `tasks` 表

## 验证
1. 刷新浏览器页面（Cmd/Ctrl + Shift + R）
2. 尝试创建新任务
3. 尝试添加任务报告

应该不再报错。

## 如果仍然报错
1. **完全关闭浏览器标签页**
2. **清除浏览器缓存**
3. **重新打开应用**
4. 如果还是不行，检查 Supabase Dashboard -> Table Editor，确认 `task_reports` 表存在
