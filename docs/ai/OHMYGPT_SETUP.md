# ohmygpt 平台 Gemini 2.5 Lite 配置指南

## 配置步骤

### 1. 更新 `.env.local` 文件

在项目根目录的 `.env.local` 文件中，确保有以下配置：

```bash
GEMINI_API_KEY=sk-WYKb5tHF7D88FE15F8d4T3BLbKFJ78704eee96D640b9B295
GEMINI_BASE_URL=https://api.ohmygpt.com/v1
```

### 2. 模型名称

系统已配置为使用 `gemini-2.5-lite` 模型。

如果 ohmygpt 平台使用的模型名称不同，可能需要调整。常见的模型名称格式：
- `gemini-2.5-lite`
- `google/gemini-2.5-lite`
- `gemini-2.5-lite-preview`

### 3. 重启开发服务器

```bash
# 停止当前服务器（Ctrl+C）
npm run dev
```

---

## 验证配置

### 检查配置

```bash
cat .env.local | grep GEMINI
```

应该看到：
```
GEMINI_API_KEY=sk-...
GEMINI_BASE_URL=https://api.ohmygpt.com/v1
```

### 测试 AI 功能

1. 打开应用：http://localhost:3000
2. 登录账号
3. 选择一个策略节点
4. 点击 **"智能周报"** 按钮
5. 查看是否能正常生成周报

### 检查浏览器控制台

打开浏览器开发者工具（F12）→ Console，查看：
- ✅ **成功**：没有错误，能看到生成的周报
- ❌ **失败**：会显示具体的错误信息

### 检查网络请求

打开浏览器开发者工具（F12）→ Network，点击"智能周报"后：
- ✅ **成功**：能看到请求发送到 `api.ohmygpt.com`
- ❌ **失败**：请求失败或返回错误

---

## 常见问题

### Q1: 仍然提示"未配置 AI API Key"

**解决方法**：
1. 确认 `.env.local` 文件在项目根目录
2. 确认配置格式正确（没有多余空格、引号）
3. **必须重启开发服务器**
4. 清除浏览器缓存后重试

### Q2: API 调用失败，提示模型不存在

**可能原因**：模型名称不正确

**解决方法**：
1. 查看 ohmygpt 平台文档，确认正确的模型名称
2. 告诉我正确的模型名称，我可以帮你更新代码

### Q3: 401 Unauthorized 错误

**可能原因**：API Key 无效或已过期

**解决方法**：
1. 检查 API Key 是否正确
2. 确认 API Key 是否还有余额
3. 在 ohmygpt 平台检查 Key 状态

### Q4: 网络请求超时

**可能原因**：网络连接问题或 API 端点不正确

**解决方法**：
1. 检查网络连接
2. 确认 `GEMINI_BASE_URL` 是否正确
3. 尝试访问 ohmygpt 平台确认服务状态

---

## 如果模型名称不对

如果 ohmygpt 平台使用的模型名称不是 `gemini-2.5-lite`，请告诉我正确的模型名称，我会更新代码。

常见的模型名称格式：
- `gemini-2.5-lite`
- `google/gemini-2.5-lite`
- `gemini-2.5-lite-preview`
- `gemini-2.5-lite-001`

---

## 调试信息

如果仍然不成功，请提供以下信息：

1. **浏览器控制台的完整错误信息**
2. **Network 标签中的请求详情**（包括请求 URL、请求头、响应内容）
3. **ohmygpt 平台文档中的模型名称**

这样我可以帮你进一步排查问题。
