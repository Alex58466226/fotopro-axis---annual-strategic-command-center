# Vercel 环境变量配置指南

## 🎯 问题说明

部署到 Vercel 后，智能周报功能提示"未配置 API Key"，这是因为环境变量需要在 Vercel 中单独配置。

---

## 📋 配置步骤

### 步骤 1：进入 Vercel 项目设置

1. 访问 [Vercel Dashboard](https://vercel.com/dashboard)
2. 选择你的项目：`fotopro-axis---annual-strategic-command-center`
3. 点击 **Settings**（设置）
4. 在左侧菜单选择 **Environment Variables**（环境变量）

### 步骤 2：添加 Supabase 环境变量（必需）

点击 **Add New**，添加以下两个环境变量：

#### 变量 1：Supabase URL
- **Name（名称）**: `VITE_SUPABASE_URL`
- **Value（值）**: `你的_supabase_project_url`
  - 例如：`https://dszhskhbpbhrpsbdgccq.supabase.co`
- **Environment（环境）**: 选择 `Production`、`Preview`、`Development`（全选）

#### 变量 2：Supabase Anon Key
- **Name（名称）**: `VITE_SUPABASE_ANON_KEY`
- **Value（值）**: `你的_supabase_anon_key`
  - 例如：`sb_publishable_Ln3YtnUEGCwkxeATejpaUw_-Yhxvl-N`
- **Environment（环境）**: 选择 `Production`、`Preview`、`Development`（全选）

### 步骤 3：添加 AI 环境变量（可选，用于智能周报）

#### 选项 A：使用 ohmygpt 平台的 Gemini 2.5 Flash Lite（推荐）

点击 **Add New**，添加以下两个环境变量：

- **Name**: `GEMINI_API_KEY`
- **Value**: `sk-WYKb5tHF7D88FE15F8d4T3BLbKFJ78704eee96D640b9B295`
- **Environment**: 全选

- **Name**: `GEMINI_BASE_URL`
- **Value**: `https://api.ohmygpt.com/v1`
- **Environment**: 全选

#### 选项 B：使用其他 AI 模型

**豆包（字节跳动）** - 性价比高：
```
DOUBAO_API_KEY=你的_豆包_api_key
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

**GLM-4（智谱AI）** - 国产优秀模型：
```
GLM4_API_KEY=你的_glm4_api_key
GLM4_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

**K2（昆仑万维）** - 价格便宜：
```
K2_API_KEY=你的_k2_api_key
K2_BASE_URL=https://api.siliconflow.cn/v1
```

**OpenAI**：
```
OPENAI_API_KEY=你的_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1
```

**DeepSeek**：
```
DEEPSEEK_API_KEY=你的_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1
```

**通义千问**：
```
QWEN_API_KEY=你的_qwen_api_key
QWEN_BASE_URL=https://dashscope.aliyuncs.com/api/v1
```

### 步骤 4：保存并重新部署

1. 添加完所有环境变量后，点击 **Save**（保存）
2. 返回项目页面，点击 **Deployments**（部署）
3. 找到最新的部署记录，点击右侧的 **⋯**（三个点）
4. 选择 **Redeploy**（重新部署）
5. 等待部署完成（通常 1-2 分钟）

---

## ✅ 验证配置

### 方法 1：检查部署日志

1. 在 Vercel Dashboard 中，进入 **Deployments**
2. 点击最新的部署记录
3. 查看 **Build Logs**（构建日志）
4. 确认没有环境变量相关的错误

### 方法 2：测试功能

1. 访问部署的网站 URL
2. 登录账号
3. 点击 **智能周报** 按钮
4. 如果配置正确，应该可以正常生成周报
5. 如果仍然提示"未配置 API Key"，检查浏览器控制台（F12）的错误信息

### 方法 3：检查环境变量

在浏览器控制台（F12）中运行：

```javascript
// 注意：环境变量在构建时注入，不会在浏览器中直接暴露
// 但可以通过测试 AI 功能来验证
```

---

## 🔍 常见问题

### Q1: 为什么配置了环境变量还是提示"未配置 API Key"？

**可能原因**：
1. 环境变量名称错误（注意大小写）
2. 环境变量值错误（包含多余空格）
3. 没有重新部署（环境变量修改后必须重新部署）
4. 选择了错误的环境（Production/Preview/Development）

**解决方法**：
1. 检查环境变量名称是否完全匹配（区分大小写）
2. 检查环境变量值是否正确（复制时不要包含空格）
3. 确保选择了正确的环境（建议全选）
4. 重新部署项目

### Q2: 环境变量应该选择哪些环境？

**建议**：全选 `Production`、`Preview`、`Development`，确保所有环境都能正常工作。

### Q3: 为什么 Supabase 环境变量需要 `VITE_` 前缀？

因为 Supabase 客户端在浏览器中运行，需要使用 `import.meta.env.VITE_*` 来访问环境变量。而 AI 相关的环境变量在构建时通过 `vite.config.ts` 注入，不需要 `VITE_` 前缀。

### Q4: 如何确认环境变量已正确配置？

1. 重新部署后，测试智能周报功能
2. 如果功能正常，说明配置成功
3. 如果仍然失败，检查浏览器控制台的错误信息

---

## 📝 完整环境变量列表

### 必需（Supabase）
```
VITE_SUPABASE_URL=你的_supabase_project_url
VITE_SUPABASE_ANON_KEY=你的_supabase_anon_key
```

### 可选（AI 功能）
```
# ohmygpt 平台 Gemini（推荐）
GEMINI_API_KEY=sk-你的_api_key
GEMINI_BASE_URL=https://api.ohmygpt.com/v1

# 或其他 AI 模型（见上方选项 B）
```

---

## 🚀 快速配置模板

如果你使用 ohmygpt 平台的 Gemini，可以直接复制以下配置：

```
VITE_SUPABASE_URL=https://dszhskhbpbhrpsbdgccq.supabase.co
VITE_SUPABASE_ANON_KEY=sb_publishable_Ln3YtnUEGCwkxeATejpaUw_-Yhxvl-N
GEMINI_API_KEY=sk-WYKb5tHF7D88FE15F8d4T3BLbKFJ78704eee96D640b9B295
GEMINI_BASE_URL=https://api.ohmygpt.com/v1
```

**注意**：请将上述值替换为你自己的实际值！

---

*最后更新: 2026-01-22*
