/**
 * AI 提示词模板和项目上下文
 * 用于优化 AI 聊天助手的回答质量
 */

/**
 * 项目背景信息
 */
export const PROJECT_CONTEXT = `
# 项目背景

**Fotopro AMZ 项目管理器** 是一个企业级战略执行管理系统，专门为跨境电商（Fotopro）的年度战略项目设计。

## 核心业务场景
- **跨境电商业务**：主要面向 Amazon、TikTok、独立站等渠道
- **年度战略规划**：从战略目标到具体执行的完整管理体系
- **多维度管理**：按渠道、产品、负责人等维度组织和管理项目

## 系统架构
- **四层架构**：L1（战略目标）→ L2（二级策略）→ L3（三级策略）→ L4（执行任务）
- **数据模型**：策略节点（StrategyNode）、任务（Task）、任务汇报（TaskReport）
- **核心功能**：策略管理、任务管理、甘特图、筛选、AI 辅助、数据导出

## 关键概念
- **策略节点（L1-L3）**：战略目标、策略、子策略，支持层级关系
- **执行任务（L4）**：具体可执行的任务，关联到 L3 策略
- **任务汇报**：每个任务可以有多个汇报记录（计划、进展、问题、结果、复盘）
- **筛选维度**：负责人、渠道、产品、标签、时间范围
- **项目评估**：基于任务得分、进度、时间效率等维度评估项目状态
`;

/**
 * 常见问题回答模板
 */
export const ANSWER_TEMPLATES = {
  '项目介绍': `**Fotopro AMZ 项目管理器** 是一个专门为跨境电商设计的战略执行管理系统。

**核心功能**：
- 📊 四层架构管理（L1-L4）：从年度战略目标到具体执行任务
- 📅 可视化甘特图：直观展示项目时间轴和进度
- 🤖 AI 智能辅助：自动生成任务建议和周报
- 📈 项目评估看板：多维度评估项目状态
- 🔍 多维度筛选：按负责人、渠道、产品、标签筛选
- 📤 数据导出：一键导出完整报表

**适用场景**：
- 年度战略规划与执行
- 跨渠道项目管理
- 团队协作与进度跟踪
- 数据驱动的决策支持`,

  '如何使用': `**快速开始**：

1. **创建策略**：在侧边栏点击 "+" 创建 L1 战略目标
2. **分解策略**：创建 L2、L3 子策略，形成层级结构
3. **添加任务**：在 L3 策略下创建 L4 执行任务
4. **跟踪进度**：更新任务状态和进度，添加执行汇报
5. **查看视图**：使用甘特图查看时间轴，使用筛选器查看特定维度
6. **AI 辅助**：使用 AI 助手生成任务建议和周报

**提示**：点击左侧边栏的 "AI 助手" 按钮，可以随时获取帮助和建议。`,

  '功能说明': `**主要功能模块**：

1. **策略管理**：创建、编辑、删除策略节点（L1-L3）
2. **任务管理**：创建、编辑任务，更新状态和进度
3. **执行汇报**：为每个任务添加汇报记录（计划、进展、问题、结果、复盘）
4. **甘特图**：可视化时间轴，支持拖拽调整任务时间
5. **筛选器**：多维度筛选策略和任务
6. **项目评估**：查看项目得分、进度、时间效率等指标
7. **AI 助手**：生成任务建议、周报、项目总结
8. **数据导出**：导出 CSV 格式的完整报表`,

  '层级关系': `**四层架构说明**：

- **L1（战略目标）**：年度顶级目标，如"2026 全球品牌心智工程"
- **L2（二级策略）**：区域或渠道策略，如"北美市场扩张"
- **L3（三级策略）**：具体项目，如"洛杉矶旗舰店落地"
- **L4（执行任务）**：可执行的具体任务，如"完成店面选址调研"

**层级规则**：
- L1 没有父级
- L2 的父级必须是 L1
- L3 的父级必须是 L2
- L4（任务）的父级必须是 L3`,

  '数据导出': `**数据导出功能**：

- **导出格式**：CSV 文件
- **导出内容**：当前筛选后的所有策略和任务数据
- **最小颗粒度**：任务汇报（Report），每个汇报一行
- **包含字段**：策略层级、任务信息、汇报内容、时间等

**使用方法**：
1. 应用筛选条件（可选）
2. 点击左侧边栏的 "导出" 按钮
3. CSV 文件自动下载`
};

/**
 * 判断是否为简单场景（需要简短回答）
 */
const isSimpleScenario = (message: string): boolean => {
  const lowerMessage = message.toLowerCase().trim();
  const simplePatterns = [
    /^(你好|hi|hello|hey|哈喽|嗨)/i,
    /^(谢谢|thanks|thank you|感谢)/i,
    /^(再见|bye|拜拜|88)/i,
    /^(好的|ok|okay|收到|明白)/i,
    /^(是|对|没错|是的)/i,
    /^(不|不是|不对|否)/i,
    /^[？?]$/, // 单个问号
    /^(嗯|哦|啊|额)/i,
  ];
  
  // 如果消息很短（少于10个字符）且匹配简单模式，认为是简单场景
  if (message.length < 10) {
    return simplePatterns.some(pattern => pattern.test(lowerMessage));
  }
  
  return false;
};

/**
 * 构建增强的系统提示词
 */
export const buildEnhancedSystemPrompt = (
  userMessage: string,
  strategyContext: string,
  taskSummary: string,
  statsInfo: string
): string => {
  // 判断是否为简单场景
  if (isSimpleScenario(userMessage)) {
    return `你是一个友好的项目管理助手。用户说："${userMessage}"

请给出简短、友好的回应（1-2句话即可），不要长篇大论。如果是打招呼，简单回应即可。`;
  }

  // 判断用户意图
  const lowerMessage = userMessage.toLowerCase();
  const isQuestion = lowerMessage.includes('？') || lowerMessage.includes('?') || 
                     lowerMessage.includes('什么') || lowerMessage.includes('如何') || 
                     lowerMessage.includes('怎么') || lowerMessage.includes('介绍') ||
                     lowerMessage.includes('是谁') || lowerMessage.includes('功能');
  
  const isTaskRequest = lowerMessage.includes('建议') || lowerMessage.includes('任务') || 
                        lowerMessage.includes('生成') || lowerMessage.includes('创建');
  
  const isReportRequest = lowerMessage.includes('周报') || lowerMessage.includes('汇报') || 
                          lowerMessage.includes('总结') || lowerMessage.includes('报告');
  
  const isEvaluationRequest = lowerMessage.includes('评估') || lowerMessage.includes('分析') || 
                              lowerMessage.includes('状态') || lowerMessage.includes('风险');

  // 构建基础提示词
  let systemPrompt = `你是一位资深的跨境电商项目管理专家，专门帮助用户管理年度战略项目。

${PROJECT_CONTEXT}

## 当前项目上下文
${strategyContext}

## 相关任务
${taskSummary}

${statsInfo}

## 用户的问题或需求
${userMessage}

## 你的角色和能力
你是这个项目管理系统的 AI 助手，可以帮助用户：
1. **回答问题**：关于系统功能、使用方法、项目状态等
2. **生成建议**：根据当前策略和任务生成执行建议
3. **生成周报**：自动总结项目进展和问题
4. **项目评估**：分析项目状态、风险和优化建议
5. **提供指导**：如何使用系统功能，如何优化项目管理

## 回答要求
`;

  // 根据意图添加特定指导
  if (isQuestion) {
    systemPrompt += `
**这是一个问题，请提供有帮助的回答**：
- 如果问的是项目介绍，参考模板：${ANSWER_TEMPLATES['项目介绍']}
- 如果问的是如何使用，参考模板：${ANSWER_TEMPLATES['如何使用']}
- 如果问的是功能说明，参考模板：${ANSWER_TEMPLATES['功能说明']}
- 如果问的是层级关系，参考模板：${ANSWER_TEMPLATES['层级关系']}
- 如果问的是数据导出，参考模板：${ANSWER_TEMPLATES['数据导出']}
- 其他问题：基于项目上下文和文档提供准确、有用的回答
- **重要**：不要只说"抱歉无法回答"，要基于项目背景提供实际帮助
`;
  }

  if (isTaskRequest) {
    systemPrompt += `
**这是任务建议需求**：
- 分析当前策略和任务状态
- 生成 5-8 个具体的、可立即执行的下一步任务建议
- 在回答末尾以 JSON 格式返回 suggestions 数组
- JSON 格式：\`\`\`json\n{"suggestions": [{"title": "...", "description": "..."}]}\n\`\`\`
`;
  }

  if (isReportRequest) {
    systemPrompt += `
**这是周报生成需求**：
- 分析当前任务状态和进度
- 生成 3-6 条核心汇报内容
- 在回答末尾以 JSON 格式返回 reportItems 数组
- JSON 格式：\`\`\`json\n{"reportItems": [{"type": "进展", "content": "..."}]}\n\`\`\`
`;
  }

  if (isEvaluationRequest) {
    systemPrompt += `
**这是项目评估需求**：
- 分析项目整体状态（进度、质量、风险）
- 提供详细的评估报告和建议
- 指出潜在风险和优化方向
`;
  }

  systemPrompt += `
## 回答格式要求
- 使用中文回答
- 语言专业但易懂
- **根据问题复杂度调整回答长度**：
  - 简单问题：1-3句话
  - 一般问题：3-5句话或简短段落
  - 复杂问题：可以详细展开
- 如果涉及 JSON 数据，在回答末尾添加 JSON 代码块
- 始终提供有用的信息，不要只说"无法回答"
- **避免过度展开**：如果用户只是简单询问，不要给出长篇大论
`;

  return systemPrompt;
};
