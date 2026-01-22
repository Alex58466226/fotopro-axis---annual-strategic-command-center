# 部署指南

## ✅ 已完成

1. **代码测试**
   - ✅ 构建成功
   - ✅ 无 TypeScript 错误
   - ✅ 无 Linter 错误
   - ✅ 所有功能测试通过

2. **代码提交**
   - ✅ 已提交到 Git
   - ✅ 已推送到 GitHub (main 分支)

---

## 📋 部署到 Vercel

### 步骤 1：连接 GitHub 仓库

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 点击 **"Add New Project"**
3. 选择你的 GitHub 仓库：`fotopro-axis---annual-strategic-command-center`
4. 点击 **"Import"**

### 步骤 2：配置项目设置

**Framework Preset**: Vite  
**Root Directory**: `./`  
**Build Command**: `npm run build`  
**Output Directory**: `dist`

### 步骤 3：配置环境变量

**⚠️ 重要**：环境变量配置后必须重新部署才能生效！

在 Vercel 项目设置 → **Environment Variables** 中添加：

#### Supabase 配置（必需）
```
VITE_SUPABASE_URL=你的_supabase_project_url
VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

**注意**：Supabase 环境变量必须以 `VITE_` 开头！

#### AI 配置（可选，如果使用 AI 功能）

**使用 ohmygpt 平台的 Gemini（推荐）**：
```
GEMINI_API_KEY=sk-你的_api_key
GEMINI_BASE_URL=https://api.ohmygpt.com/v1
```

**注意**：AI 环境变量不需要 `VITE_` 前缀！

详细配置说明请查看：[VERCEL_ENV_SETUP.md](./VERCEL_ENV_SETUP.md)

或者使用其他 AI 模型：
```
OPENAI_API_KEY=你的_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1

DEEPSEEK_API_KEY=你的_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

DOUBAO_API_KEY=你的_豆包_api_key
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3

GLM4_API_KEY=你的_glm4_api_key
GLM4_BASE_URL=https://open.bigmodel.cn/api/paas/v4

K2_API_KEY=你的_k2_api_key
K2_BASE_URL=https://api.siliconflow.cn/v1
```

### 步骤 4：部署

1. 点击 **"Deploy"**
2. 等待构建完成（通常 1-2 分钟）
3. 部署成功后，Vercel 会提供一个 URL（如：`https://your-project.vercel.app`）

---

## 🔍 部署后验证

### 1. 检查部署状态

访问 Vercel Dashboard，确认：
- ✅ 部署状态：Ready
- ✅ 构建日志：无错误

### 2. 功能测试

访问部署的 URL，测试：

- [ ] 用户注册功能
- [ ] 用户登录功能
- [ ] 策略创建/编辑
- [ ] 任务创建/编辑
- [ ] 数据保存（刷新后数据保留）
- [ ] 智能周报功能
- [ ] 快速建议功能
- [ ] 数据导入/导出

### 3. 检查浏览器控制台

打开浏览器开发者工具（F12），检查：
- ✅ 无错误信息
- ✅ Supabase 连接正常
- ✅ AI 功能正常（如果配置了 API Key）

---

## ⚠️ 重要注意事项

### 1. Supabase 数据库表

**必须**在 Supabase Dashboard 中执行 `supabase_schema.sql` 创建所有表！

### 2. RLS 策略

确保 Supabase 的 RLS（Row Level Security）策略已正确配置，允许认证用户访问数据。

### 3. 环境变量

- ✅ 所有环境变量必须在 Vercel 中配置
- ✅ `.env.local` 文件不会自动同步到 Vercel
- ✅ 环境变量区分 Production、Preview、Development 环境

### 4. 首次部署

首次部署后，需要：
1. 注册第一个账号（自动成为 Admin）
2. 创建策略和任务
3. 验证数据保存到 Supabase

---

## 🔄 后续更新

### 自动部署

Vercel 会自动检测 GitHub 推送并触发部署：
1. 在本地修改代码
2. `git commit` 和 `git push`
3. Vercel 自动构建和部署

### 手动部署

如果需要手动触发部署：
1. 访问 Vercel Dashboard
2. 选择项目
3. 点击 **"Redeploy"**

---

## 📊 部署检查清单

- [x] 代码已提交到 GitHub
- [x] 构建成功
- [ ] Vercel 项目已创建
- [ ] 环境变量已配置
- [ ] Supabase 数据库表已创建
- [ ] 首次部署成功
- [ ] 功能测试通过
- [ ] 数据持久化正常

---

## 🆘 常见问题

### Q1: 部署后无法登录

**原因**：Supabase 环境变量未配置或配置错误

**解决**：
1. 检查 Vercel 环境变量是否正确
2. 确认 Supabase 项目正常运行
3. 检查浏览器控制台的错误信息

### Q2: 数据保存失败

**原因**：Supabase 数据库表未创建或 RLS 策略未配置

**解决**：
1. 在 Supabase Dashboard 执行 `supabase_schema.sql`
2. 检查 RLS 策略是否正确配置

### Q3: AI 功能不可用

**原因**：AI API Key 未配置或配置错误

**解决**：
1. 检查 Vercel 环境变量中的 AI 配置
2. 确认 API Key 有效
3. 检查浏览器控制台的错误信息

---

## 📝 部署信息

- **GitHub 仓库**: `Alex58466226/fotopro-axis---annual-strategic-command-center`
- **最新提交**: `f01c77a` - feat: 完成 Supabase 迁移和快速建议功能
- **构建状态**: ✅ 成功
- **部署平台**: Vercel（推荐）

---

*最后更新: 2026-01-22*
