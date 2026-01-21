# AI 模型配置说明

本项目现在支持多种大模型，你可以选择使用任意一种，或者不配置（项目仍可正常运行，只是 AI 功能不可用）。

## 支持的模型

### 1. Google Gemini（默认）
```bash
# .env.local
GEMINI_API_KEY=your_gemini_api_key
```

### 2. OpenAI
```bash
# .env.local
OPENAI_API_KEY=your_openai_api_key
OPENAI_BASE_URL=https://api.openai.com/v1  # 可选，默认使用官方 API
```

### 3. DeepSeek
```bash
# .env.local
DEEPSEEK_API_KEY=your_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1  # 可选
```

### 4. 通义千问（阿里云）
```bash
# .env.local
QWEN_API_KEY=your_qwen_api_key
QWEN_BASE_URL=https://dashscope.aliyuncs.com/api/v1  # 可选
```

## 优先级

系统会按以下顺序自动选择可用的模型：
1. Gemini（如果配置了 `GEMINI_API_KEY`）
2. OpenAI（如果配置了 `OPENAI_API_KEY`）
3. DeepSeek（如果配置了 `DEEPSEEK_API_KEY`）
4. 通义千问（如果配置了 `QWEN_API_KEY`）
5. 无 AI（如果都没有配置，项目仍可正常运行）

## 不配置 AI 的情况

**即使不配置任何 API Key，项目也可以正常预览和使用！**

- ✅ 所有核心功能（策略管理、任务管理、甘特图等）都可以正常使用
- ✅ 数据会保存在浏览器本地存储中
- ⚠️ 只有 AI 辅助功能（自动生成任务建议、自动生成周报）不可用
- ⚠️ 使用 AI 功能时会显示提示信息

## 本地预览

```bash
# 1. 安装依赖（如果还没安装）
npm install

# 2. 启动开发服务器（不需要配置 API Key 也可以运行）
npm run dev

# 3. 在浏览器中打开 http://localhost:3000
```

## 获取 API Key

- **Gemini**: https://makersuite.google.com/app/apikey
- **OpenAI**: https://platform.openai.com/api-keys
- **DeepSeek**: https://platform.deepseek.com/api_keys
- **通义千问**: https://dashscope.console.aliyun.com/apiKey
