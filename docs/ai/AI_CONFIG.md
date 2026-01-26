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

### 5. 豆包（字节跳动）⭐ 推荐 - 性价比高
```bash
# .env.local
DOUBAO_API_KEY=your_doubao_api_key
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3  # 可选，默认使用官方 API
```

**获取 API Key**: https://console.volcengine.com/ark/region:ark+cn-beijing/api

### 6. GLM-4（智谱AI）⭐ 推荐 - 国产优秀模型
```bash
# .env.local
GLM4_API_KEY=your_glm4_api_key
GLM4_BASE_URL=https://open.bigmodel.cn/api/paas/v4  # 可选，默认使用官方 API
```

**获取 API Key**: https://open.bigmodel.cn/

### 7. K2（昆仑万维）⭐ 推荐 - 价格便宜
```bash
# .env.local
K2_API_KEY=your_k2_api_key
K2_BASE_URL=https://api.siliconflow.cn/v1  # 可选，如果使用 SiliconFlow 代理
```

**获取 API Key**: 
- 直接使用：https://www.siliconflow.cn/ （推荐，价格便宜）
- 或昆仑万维官方 API

## 优先级

系统会按以下顺序自动选择可用的模型：
1. Gemini（如果配置了 `GEMINI_API_KEY`）
2. OpenAI（如果配置了 `OPENAI_API_KEY`）
3. DeepSeek（如果配置了 `DEEPSEEK_API_KEY`）
4. 通义千问（如果配置了 `QWEN_API_KEY`）
5. 豆包（如果配置了 `DOUBAO_API_KEY`）⭐ 推荐
6. GLM-4（如果配置了 `GLM4_API_KEY`）⭐ 推荐
7. K2（如果配置了 `K2_API_KEY`）⭐ 推荐
8. 无 AI（如果都没有配置，项目仍可正常运行）

## 中国模型推荐（性价比高）

### 豆包（字节跳动）
- ✅ **价格便宜**：比 OpenAI 便宜很多
- ✅ **响应速度快**：国内访问速度快
- ✅ **中文理解好**：专门针对中文优化
- 📍 **获取方式**：https://console.volcengine.com/ark/

### GLM-4（智谱AI）
- ✅ **国产优秀模型**：清华大学背景
- ✅ **中文能力强**：在中文任务上表现优秀
- ✅ **价格合理**：比 OpenAI 便宜
- 📍 **获取方式**：https://open.bigmodel.cn/

### K2（昆仑万维）
- ✅ **价格最便宜**：通过 SiliconFlow 使用，价格非常低
- ✅ **性能不错**：72B 参数模型
- ✅ **易于使用**：OpenAI 兼容 API
- 📍 **获取方式**：https://www.siliconflow.cn/

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

### 国际模型
- **Gemini**: https://makersuite.google.com/app/apikey
- **OpenAI**: https://platform.openai.com/api-keys
- **DeepSeek**: https://platform.deepseek.com/api_keys
- **通义千问**: https://dashscope.console.aliyun.com/apiKey

### 中国模型（推荐）⭐
- **豆包（字节跳动）**: https://console.volcengine.com/ark/region:ark+cn-beijing/api
- **GLM-4（智谱AI）**: https://open.bigmodel.cn/
- **K2（昆仑万维/SiliconFlow）**: https://www.siliconflow.cn/

## 价格对比（仅供参考）

| 模型 | 价格（每 1M tokens） | 特点 |
|------|---------------------|------|
| K2 (SiliconFlow) | ~$0.1 | 最便宜，性价比高 |
| 豆包 | ~$0.12 | 中文优化好，速度快 |
| DeepSeek | ~$0.14 | 价格便宜，性能好 |
| GLM-4 | ~$0.15 | 国产优秀模型 |
| 通义千问 | ~$0.12 | 阿里云，稳定 |
| Gemini | 免费额度 | 有免费额度 |
| OpenAI | ~$0.15-0.60 | 性能最好但较贵 |

**推荐配置**：如果追求性价比，建议使用 **K2** 或 **豆包**。
