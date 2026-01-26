# 中国 AI 模型配置指南

## 快速开始

### 推荐配置（性价比最高）

在 `.env.local` 文件中添加以下任一配置：

#### 方案 1：豆包（字节跳动）⭐ 最推荐
```bash
DOUBAO_API_KEY=your_doubao_api_key
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

**为什么推荐**：
- ✅ 价格便宜（约 $0.12/1M tokens）
- ✅ 中文理解能力强
- ✅ 国内访问速度快
- ✅ 字节跳动技术背景，稳定可靠

**获取 API Key**：
1. 访问：https://console.volcengine.com/ark/
2. 注册/登录火山引擎账号
3. 创建应用，获取 API Key

---

#### 方案 2：K2（昆仑万维 via SiliconFlow）⭐ 最便宜
```bash
K2_API_KEY=your_siliconflow_api_key
K2_BASE_URL=https://api.siliconflow.cn/v1
```

**为什么推荐**：
- ✅ **价格最便宜**（约 $0.1/1M tokens）
- ✅ 通过 SiliconFlow 使用，简单方便
- ✅ OpenAI 兼容 API，无需修改代码
- ✅ 72B 参数，性能不错

**获取 API Key**：
1. 访问：https://www.siliconflow.cn/
2. 注册账号
3. 充值后获取 API Key
4. 选择 K2 模型

---

#### 方案 3：GLM-4（智谱AI）⭐ 国产优秀
```bash
GLM4_API_KEY=your_glm4_api_key
GLM4_BASE_URL=https://open.bigmodel.cn/api/paas/v4
```

**为什么推荐**：
- ✅ 清华大学背景，技术实力强
- ✅ 中文能力优秀
- ✅ 价格合理（约 $0.15/1M tokens）
- ✅ 国产模型，数据安全

**获取 API Key**：
1. 访问：https://open.bigmodel.cn/
2. 注册/登录账号
3. 创建应用，获取 API Key

---

## 详细配置步骤

### 1. 创建 `.env.local` 文件

在项目根目录创建 `.env.local` 文件（如果还没有）：

```bash
touch .env.local
```

### 2. 添加配置

选择上述任一方案，将对应的配置添加到 `.env.local`：

```bash
# 示例：使用豆包
DOUBAO_API_KEY=your_api_key_here
DOUBAO_BASE_URL=https://ark.cn-beijing.volces.com/api/v3
```

### 3. 重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
# 然后重新启动
npm run dev
```

### 4. 测试 AI 功能

1. 打开应用：http://localhost:3000
2. 登录账号
3. 点击"智能周报"按钮
4. 如果配置正确，应该能正常生成周报

---

## 价格对比

| 模型 | 输入价格 | 输出价格 | 总价（估算） | 推荐度 |
|------|---------|---------|------------|--------|
| **K2 (SiliconFlow)** | $0.05/1M | $0.05/1M | **$0.1/1M** | ⭐⭐⭐⭐⭐ |
| **豆包** | $0.06/1M | $0.06/1M | **$0.12/1M** | ⭐⭐⭐⭐⭐ |
| **DeepSeek** | $0.07/1M | $0.07/1M | $0.14/1M | ⭐⭐⭐⭐ |
| **GLM-4** | $0.075/1M | $0.075/1M | $0.15/1M | ⭐⭐⭐⭐ |
| **通义千问** | $0.06/1M | $0.06/1M | $0.12/1M | ⭐⭐⭐ |
| **OpenAI GPT-4o-mini** | $0.15/1M | $0.60/1M | $0.75/1M | ⭐⭐⭐ |

> 注：价格仅供参考，实际价格以官方为准。1M tokens 约等于 75 万汉字。

---

## 使用场景建议

### 日常使用（推荐：豆包）
- 生成周报
- 任务建议
- 中文内容理解

### 预算有限（推荐：K2）
- 大量调用
- 测试阶段
- 个人项目

### 高质量需求（推荐：GLM-4）
- 重要报告
- 复杂分析
- 对质量要求高

---

## 常见问题

### Q1: 如何知道当前使用的是哪个模型？

**A**: 打开浏览器控制台（F12），查看 Console 输出。如果配置正确，会显示使用的模型名称。

### Q2: 可以同时配置多个模型吗？

**A**: 可以，但系统会按优先级自动选择第一个可用的模型。优先级顺序见 `AI_CONFIG.md`。

### Q3: 如何切换模型？

**A**: 在 `.env.local` 中注释掉当前模型的配置，取消注释想要使用的模型配置，然后重启服务器。

### Q4: API Key 会泄露吗？

**A**: 
- `.env.local` 文件已加入 `.gitignore`，不会被提交到 Git
- 但部署到 Vercel 等平台时，需要在平台的环境变量中配置
- 不要在代码中硬编码 API Key

### Q5: 使用这些模型需要翻墙吗？

**A**: 
- **豆包、GLM-4、K2（SiliconFlow）**：不需要，国内可直接访问
- **OpenAI、Gemini**：需要翻墙或使用代理

---

## 技术支持

如果遇到问题：
1. 检查 `.env.local` 文件格式是否正确
2. 确认 API Key 是否有效
3. 查看浏览器控制台的错误信息
4. 参考 `DEBUG_SUPABASE.md` 中的调试方法
