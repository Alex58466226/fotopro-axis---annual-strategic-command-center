# 数据库文档

本目录包含 Supabase 数据库相关文档和迁移脚本。

## 📋 文档列表

### 1. [数据库迁移指南](./SUPABASE_MIGRATION_GUIDE.md)
**用途**：数据库迁移操作指南  
**内容**：
- 迁移流程说明
- 常见问题处理
- 回滚方法

**使用场景**：执行数据库迁移前必读。

---

### 2. [执行所有迁移](./EXECUTE_ALL_MIGRATIONS.md)
**用途**：一次性执行所有必要的数据库迁移  
**内容**：
- 完整的迁移 SQL 脚本
- 执行步骤
- 验证方法

**使用场景**：首次设置数据库或需要执行所有迁移时使用。

---

### 3. [修复 Reports 列问题](./FIX_REPORTS_COLUMN.md)
**用途**：解决 reports 列相关问题的说明  
**内容**：
- 问题原因分析
- 代码修复说明
- 无需迁移的原因

**使用场景**：遇到 reports 列相关错误时参考。

---

## 📄 数据库文件

### Schema 文件
- **`supabase_schema.sql`** - 完整的数据库 Schema 定义

### 迁移脚本
- **`supabase_migration_add_display_name_email.sql`** - 添加用户显示名称和邮箱字段
- **`supabase_migration_add_order_column.sql`** - 添加任务排序字段
- **`supabase_migration_add_strategy_scoring.sql`** - 添加策略评分字段

---

## 🚀 快速开始

### 首次设置数据库
1. 在 Supabase Dashboard 中创建新项目
2. 执行 `supabase_schema.sql` 创建所有表
3. 如有需要，执行相应的迁移脚本

### 执行迁移
1. 查看 [数据库迁移指南](./SUPABASE_MIGRATION_GUIDE.md) 了解流程
2. 在 Supabase SQL Editor 中执行迁移脚本
3. 验证迁移是否成功

---

## ⚠️ 注意事项

- **备份数据**：执行迁移前务必备份数据库
- **测试环境**：建议先在测试环境验证迁移脚本
- **顺序执行**：按时间顺序执行迁移脚本
- **验证结果**：执行后验证字段是否添加成功

---

## 🔗 相关文档

- [调试文档](../debug/DEBUG_SUPABASE.md) - Supabase 问题排查
- [开发指引](../development/DEVELOPER_GUIDE.md) - 开发环境设置
