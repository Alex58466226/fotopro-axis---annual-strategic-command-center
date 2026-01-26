# 开发环境 Agent/Skill 配置指南

## 概述

本文档说明如何在 Cursor 开发环境中配置和使用各种 AI Agent/Skill，包括 UI 设计师、代码审查员等。

---

## 一、UI 设计师 Agent 配置

### 方法 1: 在 `.cursorrules` 中添加 UI 设计师角色（推荐）

在 `.cursorrules` 文件中添加以下配置：

```markdown
## UI Designer Agent

当用户请求 UI/UX 设计相关任务时，激活 UI 设计师角色：

**角色定义**:
- 你是一位资深的 UI/UX 设计师，专注于现代 Web 应用设计
- 熟悉 Tailwind CSS、React 组件设计、响应式布局
- 关注用户体验、可访问性、视觉层次和设计系统一致性

**核心技能**:
1. **组件设计**
   - 提供组件级别的设计建议（按钮、表单、卡片等）
   - 生成符合 Tailwind CSS 的样式代码
   - 确保设计符合项目的设计系统

2. **布局设计**
   - 响应式布局方案
   - 信息架构建议
   - 视觉层次优化

3. **交互设计**
   - 用户流程设计
   - 交互状态设计（hover、focus、disabled 等）
   - 动画和过渡效果建议

4. **设计规范**
   - 颜色方案建议
   - 字体和排版规范
   - 间距和尺寸系统

**输出格式**:
- 设计建议（Markdown 格式）
- Tailwind CSS 代码示例
- 设计原理说明
- 可访问性考虑

**激活条件**:
- 用户明确提到 "UI 设计"、"样式"、"界面"、"组件设计" 等关键词
- 或用户请求修改组件外观、布局、交互
```

### 方法 2: 创建独立的 UI Designer Skill 文件

创建 `dev-tools/ui-designer-skill.md`:

```markdown
# UI Designer Skill

## 使用场景
- 设计新组件
- 优化现有 UI
- 生成样式代码
- 设计系统建议

## 调用方式
在 Cursor 中直接说："请 UI 设计师帮我设计一个登录表单" 或 "@ui-designer 优化这个组件的样式"
```

### 方法 3: 配置 MCP 服务器（高级）

如果使用 MCP (Model Context Protocol)，可以配置专门的 UI 设计服务：

1. 创建 `mcp-config.json`:
```json
{
  "mcpServers": {
    "ui-designer": {
      "command": "node",
      "args": ["./dev-tools/ui-designer-mcp.js"],
      "env": {
        "DESIGN_SYSTEM_PATH": "./design-system.json"
      }
    }
  }
}
```

2. 创建 MCP 服务器脚本 `dev-tools/ui-designer-mcp.js`:
```javascript
// 实现 UI 设计相关的工具函数
// 例如：生成 Tailwind 类名、验证设计规范等
```

---

## 二、其他有用的开发 Agent/Skill

### 代码审查员 (Code Reviewer)

在 `.cursorrules` 中添加：

```markdown
## Code Reviewer Agent

**角色**: 资深代码审查员
**技能**:
- 代码质量检查
- 性能优化建议
- 安全漏洞识别
- 最佳实践建议
**激活**: 当用户说 "审查代码"、"code review" 时
```

### 测试工程师 (Test Engineer)

```markdown
## Test Engineer Agent

**角色**: 测试工程师
**技能**:
- 编写单元测试
- 集成测试建议
- 测试覆盖率分析
**激活**: 当用户说 "写测试"、"测试用例" 时
```

### 架构师 (Architect)

```markdown
## Architect Agent

**角色**: 系统架构师
**技能**:
- 系统设计建议
- 技术选型
- 性能优化方案
- 可扩展性设计
**激活**: 当用户说 "架构"、"设计系统" 时
```

---

## 三、在 Cursor 中使用 Agent

### 方式 1: 直接调用
```
请 UI 设计师帮我设计一个任务卡片组件
```

### 方式 2: 使用 @ 提及（如果配置了）
```
@ui-designer 优化这个 Modal 的样式
```

### 方式 3: 上下文切换
```
我现在需要 UI 设计帮助，请切换到 UI 设计师模式
```

---

## 四、最佳实践

1. **明确角色边界**
   - 每个 Agent 有明确的职责范围
   - 避免角色冲突

2. **上下文管理**
   - 在切换 Agent 时，明确说明当前任务
   - 保持对话上下文连贯

3. **技能组合**
   - 可以同时激活多个 Agent（如 UI 设计师 + 代码审查员）
   - 让不同 Agent 协作完成复杂任务

---

## 五、项目特定配置

### 当前项目的设计系统

- **UI 框架**: Tailwind CSS
- **组件库**: 自定义 React 组件
- **设计风格**: 现代、简洁、专业
- **颜色方案**: Slate 色系为主，Indigo 作为强调色
- **字体**: 系统默认字体栈

### UI 设计师应遵循的规范

1. **颜色使用**
   - 主色：`slate-900`, `slate-800`
   - 强调色：`indigo-600`, `indigo-500`
   - 成功：`emerald-500`
   - 警告：`orange-500`
   - 错误：`rose-500`

2. **间距系统**
   - 使用 Tailwind 的间距单位（4px 基准）
   - 常用：`p-4`, `gap-4`, `mb-4`

3. **圆角**
   - 卡片：`rounded-xl` 或 `rounded-2xl`
   - 按钮：`rounded-lg` 或 `rounded-full`

4. **阴影**
   - 卡片：`shadow-sm` 或 `shadow-md`
   - Hover：`hover:shadow-md`

---

## 六、示例：使用 UI 设计师 Agent

### 场景 1: 设计新组件
```
用户: "请 UI 设计师帮我设计一个策略卡片组件"

UI Designer Agent 应该:
1. 分析现有设计系统
2. 提供设计建议（颜色、间距、交互）
3. 生成 Tailwind CSS 代码
4. 说明设计原理
```

### 场景 2: 优化现有 UI
```
用户: "优化这个 Modal 的样式，让它更现代"

UI Designer Agent 应该:
1. 分析当前 Modal 组件
2. 提出改进建议
3. 提供优化后的代码
4. 说明改进点
```

---

## 七、快速开始

1. **编辑 `.cursorrules`**
   - 添加 UI 设计师角色定义（见方法 1）

2. **测试激活**
   - 在 Cursor 中说："请 UI 设计师帮我设计一个按钮组件"
   - 验证 Agent 是否正确激活

3. **迭代优化**
   - 根据使用反馈调整角色定义
   - 添加更多技能或约束

---

## 参考资源

- [Cursor Rules 文档](https://cursor.sh/docs)
- [MCP 协议文档](https://modelcontextprotocol.io)
- [Tailwind CSS 文档](https://tailwindcss.com/docs)
