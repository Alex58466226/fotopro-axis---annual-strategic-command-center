# Gemini API 接入指南

## 步骤 1：获取 Gemini API Key

1. 访问 Google AI Studio：https://makersuite.google.com/app/apikey
2. 使用你的 Google 账号登录
3. 点击 **"Create API Key"** 或 **"Get API Key"**
4. 选择或创建一个 Google Cloud 项目（如果没有，会自动创建一个）
5. 复制生成的 API Key（格式类似：`AIzaSy...`）

> ⚠️ **重要**：API Key 只显示一次，请妥善保存！

---

## 步骤 2：配置到项目中

### 方法 1：直接编辑 `.env.local` 文件

在项目根目录的 `.env.local` 文件中添加：

```bash
GEMINI_API_KEY=你的_API_Key_这里
```

**示例**：
```bash
GEMINI_API_KEY=AIzaSyAbc123def456ghi789jkl012mno345pqr
```

### 方法 2：使用命令行添加

```bash
# 在项目根目录执行
echo "GEMINI_API_KEY=你的_API_Key_这里" >> .env.local
```

---

## 步骤 3：验证配置

### 检查文件内容

```bash
cat .env.local
```

应该看到类似：
```
GEMINI_API_KEY=AIzaSy...
```

### 检查环境变量是否被读取

重启开发服务器后，打开浏览器控制台（F12），应该不会看到：
- ❌ `未配置 AI API Key，AI 功能不可用`

---

## 步骤 4：重启开发服务器

**重要**：修改 `.env.local` 后必须重启服务器才能生效！

```bash
# 1. 停止当前服务器（按 Ctrl+C）

# 2. 重新启动
npm run dev
```

---

## 步骤 5：测试 Gemini API

### 测试方法 1：使用智能周报功能

1. 打开应用：http://localhost:3000
2. 登录账号
3. 选择一个策略节点
4. 点击 **"智能周报"** 按钮
5. 如果配置正确，应该能自动生成周报内容

### 测试方法 2：使用任务建议功能

1. 在策略节点下，点击 **"添加任务"**
2. 如果配置了 Gemini，系统会自动使用 AI 建议任务

### 测试方法 3：检查控制台

打开浏览器开发者工具（F12）→ Console，查看：
- ✅ 没有错误信息
- ✅ 如果看到 `Gemini API 调用失败`，说明配置有问题

---

## 常见问题

### Q1: 如何确认当前使用的是 Gemini？

**A**: 打开浏览器控制台，查看 Network 标签页，调用 AI 功能时应该能看到请求发送到 `generativelanguage.googleapis.com`

### Q2: API Key 格式不对？

**A**: Gemini API Key 格式通常是：
- 以 `AIzaSy` 开头
- 长度约 39 个字符
- 例如：`AIzaSyAbc123def456ghi789jkl012mno345pqr`

### Q3: 配置后仍然提示"未配置 AI API Key"？

**A**: 
1. 确认 `.env.local` 文件在项目根目录（不是 `src/` 或其他目录）
2. 确认文件内容格式正确（没有多余的空格或引号）
3. **必须重启开发服务器**（`npm run dev`）
4. 检查 `vite.config.ts` 是否正确配置了环境变量

### Q4: API Key 泄露了怎么办？

**A**: 
1. 立即在 Google AI Studio 中删除/重新生成 API Key
2. 更新 `.env.local` 文件
3. 确认 `.env.local` 已加入 `.gitignore`（不会被提交到 Git）

### Q5: 可以同时配置多个模型吗？

**A**: 可以，但系统会按优先级自动选择：
1. Gemini（如果配置了 `GEMINI_API_KEY`）
2. OpenAI
3. DeepSeek
4. 通义千问
5. 豆包
6. GLM-4
7. K2

如果想强制使用 Gemini，只配置 `GEMINI_API_KEY`，不配置其他模型的 Key。

---

## 验证配置是否成功

### 快速检查清单

- [ ] `.env.local` 文件存在
- [ ] `GEMINI_API_KEY=你的key` 已添加
- [ ] 已重启开发服务器
- [ ] 浏览器控制台没有错误
- [ ] 智能周报功能可以正常使用

---

## 下一步

配置成功后，你可以：
1. ✅ 使用"智能周报"功能自动生成周报
2. ✅ 使用 AI 建议任务功能
3. ✅ 所有 AI 功能都会使用 Gemini

如果需要切换到其他模型，只需：
- 注释掉 `GEMINI_API_KEY`
- 添加其他模型的配置（如 `DOUBAO_API_KEY`）
- 重启服务器
