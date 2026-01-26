<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1OiZMrbFIFgSpyc3Hnc603Soj32hui3HA

## Run Locally

**Prerequisites:**  Node.js

1. Install dependencies:
   ```bash
   npm install
   ```

2. (可选) 配置 AI API Key
   - 项目支持多种大模型：Gemini、OpenAI、DeepSeek、通义千问
   - **不配置 API Key 也可以正常运行**，只是 AI 辅助功能不可用
   - 详细配置说明请查看 [AI_CONFIG.md](./AI_CONFIG.md)
   - 如果使用 Gemini，创建 `.env.local` 文件并添加：
     ```
     GEMINI_API_KEY=your_api_key_here
     ```

3. Run the app:
   ```bash
   npm run dev
   ```
   
   然后在浏览器中打开 http://localhost:3000

## 功能说明

- ✅ **无需 API Key 即可使用**：所有核心功能（策略管理、任务管理、甘特图等）都可以正常使用
- 🤖 **AI 功能（可选）**：配置 API Key 后可使用 AI 自动生成任务建议和周报
- 💾 **数据存储**：所有数据保存在浏览器本地存储中

## 文档

所有文档已按类别整理到 `docs/` 目录，详见 [文档索引](./docs/README.md)。

### 快速导航
- 📖 [产品使用手册](./docs/product/PRODUCT_MANUAL.md) - 完整的产品功能说明和使用指南
- 🔧 [开发指引](./docs/development/DEVELOPER_GUIDE.md) - 开发者文档，包含架构说明和扩展指南
- 🤖 [AI 配置说明](./docs/ai/AI_CONFIG.md) - AI 模型配置和 API Key 设置
- 🚀 [部署指南](./docs/deployment/DEPLOYMENT_GUIDE.md) - 部署流程和环境配置
- 🧪 [测试文档](./docs/tests/) - 测试清单和测试报告
- 🐛 [调试文档](./docs/debug/) - 问题诊断和故障排除
- 📚 [完整文档索引](./docs/README.md) - 所有文档分类索引
