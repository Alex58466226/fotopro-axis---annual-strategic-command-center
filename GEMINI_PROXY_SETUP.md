# 聚合平台 Gemini 配置指南

## 说明

如果你从聚合平台（如 SiliconFlow、OpenRouter 等）获取的 Gemini API Key，格式通常是 `sk-` 开头（OpenAI 兼容格式），而不是 Gemini 官方的 `AIzaSy` 格式。

本项目已自动识别并支持这种格式！

---

## 配置步骤

### 1. 确认你的 API Key 格式

如果你的 Key 是 `sk-` 开头，说明是聚合平台的 Key，需要配置 `GEMINI_BASE_URL`。

### 2. 更新 `.env.local` 文件

根据你使用的聚合平台，添加对应的配置：

#### 方案 A：SiliconFlow（推荐，价格便宜）

```bash
GEMINI_API_KEY=sk-WYKb5tHF7D88FE15F8d4T3BLbKFJ78704eee96D640b9B295
GEMINI_BASE_URL=https://api.siliconflow.cn/v1
```

#### 方案 B：OpenRouter

```bash
GEMINI_API_KEY=sk-WYKb5tHF7D88FE15F8d4T3BLbKFJ78704eee96D640b9B295
GEMINI_BASE_URL=https://openrouter.ai/api/v1
```

#### 方案 C：其他聚合平台

```bash
GEMINI_API_KEY=sk-WYKb5tHF7D88FE15F8d4T3BLbKFJ78704eee96D640b9B295
GEMINI_BASE_URL=你的聚合平台API地址
```

---

## 模型名称

系统会自动使用以下模型名称（根据你的聚合平台可能需要调整）：

- **SiliconFlow**: `google/gemini-2.0-flash-exp` 或 `google/gemini-2.5-lite`
- **OpenRouter**: `google/gemini-2.0-flash-exp` 或 `google/gemini-2.5-lite`

如果默认模型名称不对，可以告诉我你使用的聚合平台，我可以帮你调整。

---

## 验证配置

### 1. 检查配置

```bash
cat .env.local | grep GEMINI
```

应该看到：
```
GEMINI_API_KEY=sk-...
GEMINI_BASE_URL=https://api.siliconflow.cn/v1
```

### 2. 重启开发服务器

```bash
npm run dev
```

### 3. 测试 AI 功能

1. 打开应用：http://localhost:3000
2. 登录账号
3. 点击"智能周报"按钮
4. 如果配置正确，应该能正常生成周报

---

## 常见聚合平台

### SiliconFlow（推荐）

- **官网**: https://www.siliconflow.cn/
- **Base URL**: `https://api.siliconflow.cn/v1`
- **模型名称**: `google/gemini-2.0-flash-exp` 或 `google/gemini-2.5-lite`
- **特点**: 价格便宜，国内访问快

### OpenRouter

- **官网**: https://openrouter.ai/
- **Base URL**: `https://openrouter.ai/api/v1`
- **模型名称**: `google/gemini-2.0-flash-exp` 或 `google/gemini-2.5-lite`
- **特点**: 支持多种模型，价格透明

### 其他平台

如果你使用的是其他聚合平台，请告诉我平台名称，我可以帮你配置。

---

## 如果遇到问题

### 问题 1：模型名称错误

如果看到错误信息提示模型不存在，可能需要调整模型名称。

**解决方法**：
1. 查看你的聚合平台文档，确认正确的模型名称
2. 告诉我平台名称，我可以帮你更新代码中的模型名称

### 问题 2：API 调用失败

**可能原因**：
- Base URL 配置错误
- API Key 无效
- 网络连接问题

**解决方法**：
1. 检查 `.env.local` 中的 `GEMINI_BASE_URL` 是否正确
2. 确认 API Key 是否有效
3. 查看浏览器控制台的详细错误信息

---

## 当前配置

根据你的 `.env.local`，你当前配置的是：

```bash
GEMINI_API_KEY=sk-WYKb5tHF7D88FE15F8d4T3BLbKFJ78704eee96D640b9B295
```

**需要添加**：
```bash
GEMINI_BASE_URL=https://api.siliconflow.cn/v1
```

（如果你使用的是 SiliconFlow，如果是其他平台，请告诉我）

---

## 下一步

1. 告诉我你使用的聚合平台名称
2. 我会帮你确认正确的 Base URL 和模型名称
3. 更新 `.env.local` 文件
4. 重启服务器测试
