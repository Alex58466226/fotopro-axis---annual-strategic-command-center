# Supabase 迁移指南

## 概述

本项目已从 `localStorage` 迁移到 Supabase，实现了：
- ✅ 使用 Supabase Auth 进行用户认证（密码自动哈希）
- ✅ 所有业务数据存储在 Supabase 数据库
- ✅ 支持多用户、跨设备访问
- ✅ 数据持久化和备份

---

## 第一步：在 Supabase 创建数据库表

1. 登录 [Supabase Dashboard](https://app.supabase.com/)
2. 选择你的项目
3. 进入 **SQL Editor**
4. 新建一个查询，复制粘贴 `supabase_schema.sql` 文件的全部内容
5. 点击 **Run** 执行 SQL

> ⚠️ **注意**：执行 SQL 后，会创建以下表：
> - `profiles` - 用户扩展信息
> - `strategies` - 策略数据
> - `tasks` - 任务数据
> - `task_reports` - 任务报告
> - `audit_logs` - 审计日志

---

## 第二步：配置环境变量

### 本地开发（`.env.local`）

在项目根目录创建或更新 `.env.local` 文件：

```bash
VITE_SUPABASE_URL=你的_supabase_project_url
VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

### 获取 Supabase 凭证

1. 在 Supabase Dashboard → **Settings** → **API**
2. 复制：
   - **Project URL** → `VITE_SUPABASE_URL`
   - **anon/public key** → `VITE_SUPABASE_ANON_KEY`

### Vercel 部署

在 Vercel 项目设置中添加环境变量：
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

---

## 第三步：关闭邮件验证（可选，仅开发环境）

1. Supabase Dashboard → **Authentication** → **Settings**
2. 找到 **Email Auth** 部分
3. 取消勾选 **"Confirm email"**（开发阶段可关闭，生产环境建议开启）

---

## 第四步：测试迁移

### 1. 启动开发服务器

```bash
npm run dev
```

### 2. 测试注册新用户

- 访问应用
- 点击"注册"
- 输入用户名和密码
- 第一个注册的用户会自动成为 **Admin**，后续用户为 **User**

### 3. 测试登录

- 使用注册的账号登录
- 确认登录状态持久化（刷新页面后仍保持登录）

### 4. 测试数据操作

- 创建策略、任务
- 编辑数据
- 刷新页面，确认数据已保存到 Supabase

---

## 数据迁移（从 localStorage 到 Supabase）

如果你之前有 `localStorage` 中的数据需要迁移：

### 方法 1：手动导入（推荐）

1. 在浏览器控制台执行：
```javascript
// 导出 localStorage 数据
const strategies = JSON.parse(localStorage.getItem('fotopro-strategies') || '[]');
const tasks = JSON.parse(localStorage.getItem('fotopro-tasks') || '[]');
const logs = JSON.parse(localStorage.getItem('fotopro-logs') || '[]');

console.log('Strategies:', strategies);
console.log('Tasks:', tasks);
console.log('Logs:', logs);
```

2. 使用应用的"导入数据"功能，将导出的 JSON 数据导入

### 方法 2：直接 SQL 插入（高级）

如果你熟悉 SQL，可以直接在 Supabase SQL Editor 中插入数据。

---

## 重要变更说明

### 1. 用户认证

- **之前**：用户名/密码存储在 `localStorage`，明文密码
- **现在**：使用 Supabase Auth，密码自动哈希，存储在 `auth.users` 表

### 2. 用户信息

- **之前**：用户信息存储在 `localStorage` 的 `users` 数组
- **现在**：用户信息存储在 `profiles` 表，与 `auth.users` 关联

### 3. 业务数据

- **之前**：策略、任务、日志存储在 `localStorage`
- **现在**：所有数据存储在 Supabase 数据库表

### 4. 登录状态

- **之前**：登录状态存储在 `localStorage`
- **现在**：Supabase Auth 自动管理 session（存储在 `localStorage` 的 `sb-*` 键中）

---

## 常见问题

### Q1: 为什么删除用户需要 Admin 权限？

A: 删除用户需要调用 Supabase Admin API，普通用户无法删除其他用户。如果需要此功能，需要在 Supabase Dashboard 中配置 Service Role Key，并在后端实现删除逻辑。

**当前方案**：删除用户功能暂时禁用，或仅在前端标记为"已删除"（不实际删除 Supabase 用户）。

### Q2: 如何迁移现有用户？

A: 现有用户需要重新注册。因为密码已哈希，无法直接迁移。建议：
1. 通知用户重新注册
2. 或提供"密码重置"功能，让用户通过邮箱重置密码

### Q3: 数据会丢失吗？

A: 不会。所有数据现在存储在 Supabase 数据库中，即使清除浏览器缓存，数据也不会丢失。

### Q4: 如何备份数据？

A: Supabase 提供自动备份。你也可以：
1. 使用应用的"导出报表"功能导出数据
2. 在 Supabase Dashboard → **Database** → **Backups** 查看自动备份

---

## 下一步

- ✅ 完成 Supabase 迁移
- 🔄 考虑添加数据迁移脚本（从 localStorage 自动导入）
- 🔄 考虑添加用户权限管理（Admin 可以管理其他用户）
- 🔄 考虑添加数据版本控制和迁移机制

---

## 技术支持

如遇到问题，请检查：
1. Supabase 项目是否正常运行
2. 环境变量是否正确配置
3. 数据库表是否已创建
4. RLS（Row Level Security）策略是否正确配置
