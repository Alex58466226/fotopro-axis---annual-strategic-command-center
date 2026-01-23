/**
 * 通用 AI 服务 - 支持多种大模型
 * 支持的模型：Gemini, OpenAI, DeepSeek, 通义千问等
 */

type AIModel = 'gemini' | 'openai' | 'deepseek' | 'qwen' | 'doubao' | 'glm4' | 'k2' | 'gemini-proxy' | 'none';

interface AIConfig {
  model: AIModel;
  apiKey?: string;
  baseURL?: string; // 用于自定义 API 端点
}

// 从环境变量读取配置
const getAIConfig = (): AIConfig => {
  // 优先使用 Gemini（官方 API，AIzaSy 格式）
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('AIzaSy')) {
    return {
      model: 'gemini',
      apiKey: process.env.GEMINI_API_KEY || process.env.API_KEY
    };
  }
  // 支持聚合平台的 Gemini（OpenAI 兼容格式，sk- 开头）
  if (process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('sk-')) {
    return {
      model: 'gemini-proxy',
      apiKey: process.env.GEMINI_API_KEY,
      baseURL: process.env.GEMINI_BASE_URL || 'https://api.ohmygpt.com/v1' // 默认使用 ohmygpt
    };
  }
  // 支持 OpenAI
  if (process.env.OPENAI_API_KEY) {
    return {
      model: 'openai',
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1'
    };
  }
  // 支持 DeepSeek
  if (process.env.DEEPSEEK_API_KEY) {
    return {
      model: 'deepseek',
      apiKey: process.env.DEEPSEEK_API_KEY,
      baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1'
    };
  }
  // 支持通义千问
  if (process.env.QWEN_API_KEY) {
    return {
      model: 'qwen',
      apiKey: process.env.QWEN_API_KEY,
      baseURL: process.env.QWEN_BASE_URL || 'https://dashscope.aliyuncs.com/api/v1'
    };
  }
  // 支持豆包（字节跳动）
  if (process.env.DOUBAO_API_KEY) {
    return {
      model: 'doubao',
      apiKey: process.env.DOUBAO_API_KEY,
      baseURL: process.env.DOUBAO_BASE_URL || 'https://ark.cn-beijing.volces.com/api/v3'
    };
  }
  // 支持 GLM-4（智谱AI）
  if (process.env.GLM4_API_KEY) {
    return {
      model: 'glm4',
      apiKey: process.env.GLM4_API_KEY,
      baseURL: process.env.GLM4_BASE_URL || 'https://open.bigmodel.cn/api/paas/v4'
    };
  }
  // 支持 K2（昆仑万维）
  if (process.env.K2_API_KEY) {
    return {
      model: 'k2',
      apiKey: process.env.K2_API_KEY,
      baseURL: process.env.K2_BASE_URL || 'https://api.siliconflow.cn/v1'
    };
  }
  
  return { model: 'none' };
};

/**
 * 使用 OpenAI 兼容 API 调用
 */
const callOpenAICompatibleAPI = async (
  prompt: string,
  config: AIConfig,
  responseSchema?: any
): Promise<string | null> => {
  if (!config.apiKey || !config.baseURL) return null;

  try {
    const modelMap: Record<string, string> = {
      'openai': 'gpt-4o-mini',
      'deepseek': 'deepseek-chat',
      'qwen': 'qwen-turbo',
      'doubao': 'doubao-pro-32k', // 豆包 Pro 32K
      'glm4': 'glm-4', // GLM-4
      'k2': 'K2/K2.1-72B', // K2 模型
      'gemini-proxy': 'gemini-2.5-flash-lite' // ohmygpt 平台的 Gemini 2.5 Flash Lite
    };

    const model = modelMap[config.model] || 'gpt-4o-mini';

    const response = await fetch(`${config.baseURL}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model,
        messages: [
          {
            role: 'system',
            content: '你是一个专业的项目管理助手。请严格按照要求返回 JSON 格式的数据。'
          },
          {
            role: 'user',
            content: prompt + (responseSchema ? '\n\n请严格按照以下 JSON Schema 格式返回：' + JSON.stringify(responseSchema, null, 2) : '')
          }
        ],
        response_format: responseSchema ? { type: 'json_object' } : undefined,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      const error = await response.text();
      console.error(`${config.model} API 错误:`, error);
      return null;
    }

    const data = await response.json();
    return data.choices?.[0]?.message?.content || null;
  } catch (error) {
    console.error(`${config.model} API 调用失败:`, error);
    return null;
  }
};

/**
 * 使用 Gemini API 调用
 */
const callGeminiAPI = async (
  prompt: string,
  apiKey: string,
  responseSchema?: any
): Promise<string | null> => {
  try {
    // 动态导入 Gemini SDK
    const { GoogleGenAI, Type } = await import("@google/genai");
    const ai = new GoogleGenAI({ apiKey });

    const config: any = {
      model: "gemini-3-flash-preview",
      contents: prompt
    };

    if (responseSchema) {
      config.config = {
        responseMimeType: "application/json",
        responseSchema
      };
    }

    const response = await ai.models.generateContent(config);
    return response.text || null;
  } catch (error) {
    console.error("Gemini API 错误:", error);
    return null;
  }
};

/**
 * 针对策略事项建议具体的执行任务（L4级别）
 */
export const suggestL4Tasks = async (strategyName: string, parentContext: string) => {
  const config = getAIConfig();
  
  if (config.model === 'none') {
    console.warn('未配置 AI API Key，AI 功能不可用');
    return null;
  }

  const prompt = `针对以下策略事项提出5个具体的、可落地的执行任务（L4级别）。策略名称: "${strategyName}"。上下文背景: "${parentContext}"。请直接以中文返回结果，包含标题和一句话描述。`;

  const responseSchema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' }
      },
      required: ['title', 'description']
    }
  };

  let result: string | null = null;

  if (config.model === 'gemini' && config.apiKey) {
    // 使用官方 Gemini API（AIzaSy 格式）
    const { Type } = await import("@google/genai");
    const geminiSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ['title', 'description']
      }
    };
    result = await callGeminiAPI(prompt, config.apiKey, geminiSchema);
  } else if (config.model !== 'none' && config.apiKey) {
    // 使用 OpenAI 兼容 API（包括聚合平台的 Gemini）
    result = await callOpenAICompatibleAPI(prompt, config, responseSchema);
  }

  if (!result) return null;

  try {
    // 尝试解析 JSON，如果失败则尝试提取 JSON 部分
    let jsonStr = result.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '').trim();
    }
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error('解析 AI 响应失败:', error);
    return null;
  }
};

/**
 * 根据当前策略和任务报告生成执行建议
 * 用于快速选取建议条目
 */
export const generateTaskSuggestions = async (
  strategyName: string,
  strategyContext: string,
  existingTasks: any[],
  reports: any[]
): Promise<Array<{ title: string; description: string }> | null> => {
  const config = getAIConfig();
  
  if (config.model === 'none') {
    // 如果没有配置 AI，返回基于现有数据的简单建议
    return generateSimpleSuggestions(strategyName, existingTasks, reports);
  }

  // 汇总现有任务和报告信息
  const taskSummary = existingTasks.length > 0
    ? existingTasks.map((t: any) => `- ${t.text} (${t.status === 'completed' ? '已完成' : '进行中'})`).join('\n')
    : '暂无任务';

  const reportSummary = reports.length > 0
    ? reports.map((r: any) => `[${r.type}] ${r.content}`).join('\n')
    : '暂无报告';

  const basePrompt = `你是一位资深的项目经理。请根据以下信息，为策略 "${strategyName}" 生成 5-8 个具体的、可立即执行的下一步任务建议。

策略上下文: ${strategyContext}

当前已有任务:
${taskSummary}

相关报告:
${reportSummary}

请基于以上信息，提出：
1. 针对未完成任务的下一步行动
2. 基于报告中发现的问题的解决方案
3. 推进策略目标的新任务

每个建议包含：
- title: 任务标题（简洁明确）
- description: 任务描述（一句话说明）`;

  const customInstructions = customPrompt 
    ? `\n\n额外要求：${customPrompt}\n请根据以上额外要求调整生成的任务建议。`
    : '';

  const prompt = `${basePrompt}${customInstructions}\n\n请以 JSON 数组格式返回，格式：\n[{"title": "...", "description": "..."}, ...]`;

  const responseSchema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' }
      },
      required: ['title', 'description']
    }
  };

  let result: string | null = null;

  if (config.model === 'gemini' && config.apiKey) {
    const { Type } = await import("@google/genai");
    const geminiSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          description: { type: Type.STRING }
        },
        required: ['title', 'description']
      }
    };
    result = await callGeminiAPI(prompt, config.apiKey, geminiSchema);
  } else if (config.model !== 'none' && config.apiKey) {
    result = await callOpenAICompatibleAPI(prompt, config, responseSchema);
  }

  if (!result) {
    // 如果 AI 调用失败，返回简单建议
    return generateSimpleSuggestions(strategyName, existingTasks, reports);
  }

  try {
    let jsonStr = result.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '').trim();
    }
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : null;
  } catch (error) {
    console.error('解析 AI 响应失败:', error);
    return generateSimpleSuggestions(strategyName, existingTasks, reports);
  }
};

/**
 * 生成简单建议（不依赖 AI）
 */
function generateSimpleSuggestions(
  strategyName: string,
  existingTasks: any[],
  reports: any[]
): Array<{ title: string; description: string }> {
  const suggestions: Array<{ title: string; description: string }> = [];

  // 基于报告中的问题生成建议
  const problemReports = reports.filter((r: any) => r.type === '问题');
  problemReports.forEach((r: any, idx: number) => {
    if (idx < 3) {
      suggestions.push({
        title: `解决：${r.content.substring(0, 20)}...`,
        description: `针对报告中提到的问题采取行动`
      });
    }
  });

  // 基于未完成的任务生成建议
  const incompleteTasks = existingTasks.filter((t: any) => 
    t.status !== 'completed' && t.status !== 'confirmed'
  );
  incompleteTasks.slice(0, 3).forEach((t: any) => {
    suggestions.push({
      title: `推进：${t.text}`,
      description: `继续推进当前进行中的任务`
    });
  });

  // 通用建议
  if (suggestions.length < 5) {
    suggestions.push({
      title: `完善 ${strategyName} 的执行计划`,
      description: `制定详细的执行步骤和时间安排`
    });
    suggestions.push({
      title: `跟踪 ${strategyName} 的关键指标`,
      description: `建立数据监控和反馈机制`
    });
  }

  return suggestions.slice(0, 8);
}

/**
 * AI 聊天对话功能
 * 整合智能周报、快速建议、项目总结等功能
 */
export const chatWithAI = async (
  message: string,
  context: {
    activeNode: any;
    strategies: any[];
    tasks: any[];
    stats?: any;
  }
): Promise<{
  content: string;
  suggestions?: Array<{ title: string; description: string }>;
  reportItems?: Array<{ type: '进展' | '问题' | '计划' | '结果' | '复盘'; content: string }>;
}> => {
  const config = getAIConfig();
  
  if (config.model === 'none') {
    return {
      content: '抱歉，AI 功能需要配置 API Key。请在环境变量中配置 GEMINI_API_KEY 或其他支持的 AI 服务 API Key。',
    };
  }

  // 构建上下文信息
  const strategyContext = `
当前策略: ${context.activeNode.name} (L${context.activeNode.level})
策略描述: ${context.activeNode.description || '无'}
负责人: ${context.activeNode.owner || '未指定'}
标签: ${context.activeNode.tags?.join(', ') || '无'}
`;

  const taskSummary = context.tasks.length > 0
    ? context.tasks.map((t: any) => 
        `- ${t.text} (状态: ${t.status}, 进度: ${t.progress}%)`
      ).join('\n')
    : '暂无任务';

  const statsInfo = context.stats
    ? `任务统计: 总计 ${context.stats.total} 个，已完成 ${context.stats.completed} 个，完成率 ${context.stats.rate}%`
    : '';

  // 构建系统提示词
  const systemPrompt = `你是一位资深的跨境电商项目管理专家，专门帮助用户管理年度战略项目。

当前项目上下文：
${strategyContext}

相关任务：
${taskSummary}

${statsInfo}

用户的问题或需求：
${message}

请根据用户的需求，提供有帮助的回答。如果需要生成任务建议，请以 JSON 格式返回 suggestions 数组。如果需要生成周报，请以 JSON 格式返回 reportItems 数组。

回答格式要求：
1. 如果是任务建议需求，在回答末尾添加 JSON 格式的 suggestions
2. 如果是周报需求，在回答末尾添加 JSON 格式的 reportItems
3. 如果是项目评估或总结，提供详细的分析和建议

JSON 格式示例：
\`\`\`json
{
  "suggestions": [
    {"title": "任务标题", "description": "任务描述"}
  ],
  "reportItems": [
    {"type": "进展", "content": "周报内容"}
  ]
}
\`\`\``;

  try {
    let result: string | null = null;

    if (config.model === 'gemini' && config.apiKey) {
      const { GoogleGenerativeAI } = await import("@google/genai");
      const genAI = new GoogleGenerativeAI(config.apiKey);
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
      const response = await model.generateContent(systemPrompt);
      result = response.response.text();
    } else if (config.model !== 'none' && config.apiKey) {
      result = await callOpenAICompatibleAPI(systemPrompt, config);
    }

    if (!result) {
      return {
        content: '抱歉，AI 服务暂时不可用。请检查 API 配置或稍后重试。',
      };
    }

    // 解析响应，提取 JSON 数据
    let content = result;
    let suggestions: Array<{ title: string; description: string }> | undefined;
    let reportItems: Array<{ type: '进展' | '问题' | '计划' | '结果' | '复盘'; content: string }> | undefined;

    // 尝试提取 JSON
    const jsonMatch = result.match(/```json\s*([\s\S]*?)\s*```/);
    if (jsonMatch) {
      try {
        const jsonData = JSON.parse(jsonMatch[1]);
        if (jsonData.suggestions) suggestions = jsonData.suggestions;
        if (jsonData.reportItems) reportItems = jsonData.reportItems;
        // 移除 JSON 部分，只保留文本内容
        content = result.replace(/```json\s*[\s\S]*?\s*```/g, '').trim();
      } catch (e) {
        console.error('解析 JSON 失败:', e);
      }
    }

    // 如果没有提取到 JSON，尝试根据关键词调用相应函数
    if (!suggestions && !reportItems) {
      const lowerMessage = message.toLowerCase();
      if (lowerMessage.includes('建议') || lowerMessage.includes('任务')) {
        // 生成任务建议
        const allReports = context.tasks.flatMap((t: any) => t.reports || []);
        suggestions = await generateTaskSuggestions(
          context.activeNode.name,
          strategyContext,
          context.tasks,
          allReports
        ) || [];
      } else if (lowerMessage.includes('周报') || lowerMessage.includes('总结')) {
        // 生成周报
        reportItems = await generateWeeklyReport(
          context.activeNode.name,
          context.tasks,
          context.stats || { total: context.tasks.length, completed: 0, rate: 0, timeUsedRate: 0 }
        );
      }
    }

    return {
      content,
      suggestions,
      reportItems,
    };
  } catch (error) {
    console.error('AI 聊天错误:', error);
    return {
      content: '抱歉，处理你的请求时出现了错误。请稍后重试。',
    };
  }
};

/**
 * 根据当前任务状态生成周报内容
 */
export const generateWeeklyReport = async (
  strategyName: string,
  tasks: any[],
  stats: { total: number; completed: number; rate: number; timeUsedRate: number },
  customPrompt?: string // 新增：自定义提示词，用于微调生成
) => {
  const config = getAIConfig();
  
  if (config.model === 'none') {
    console.warn('未配置 AI API Key，AI 功能不可用');
    return [
      { type: '问题' as const, content: '未配置 AI API Key，无法生成自动汇报。请手动添加汇报内容。' }
    ];
  }

  const taskSummary = tasks.map((t: any) => 
    `- [${t.priority}] ${t.text} (状态: ${t.status === 'completed' ? '已完成' : '进行中'}, 负责人: ${t.owner || '未分配'})`
  ).join('\n');

  const basePrompt = `
    你是一位资深的项目经理。请根据以下策略项目的当前状态，生成一份专业的周工作汇报。
    
    策略名称: "${strategyName}"
    整体进度: ${stats.rate}% (时间消耗: ${stats.timeUsedRate}%)
    任务总数: ${stats.total} (已完成: ${stats.completed})

    详细任务列表:
    ${taskSummary}

    请输出一组汇报条目。每个条目必须包含以下两个字段：
    1. type: 必须是 ["进展", "问题", "计划", "结果", "复盘"] 中的一个。
    2. content: 具体内容，语言简练专业。

    请生成 3-6 条核心汇报内容。`;

  const customInstructions = customPrompt 
    ? `\n\n额外要求：${customPrompt}\n请根据以上额外要求调整生成的周报内容。`
    : '';

  const prompt = `${basePrompt}${customInstructions}\n\n请以 JSON 数组格式返回，格式示例：\n[{"type": "进展", "content": "..."}, {"type": "问题", "content": "..."}]`;

  const responseSchema = {
    type: 'array',
    items: {
      type: 'object',
      properties: {
        type: {
          type: 'string',
          enum: ['进展', '问题', '计划', '结果', '复盘']
        },
        content: { type: 'string' }
      },
      required: ['type', 'content']
    }
  };

  let result: string | null = null;

  if (config.model === 'gemini' && config.apiKey) {
    // 使用官方 Gemini API（AIzaSy 格式）
    const { Type } = await import("@google/genai");
    const geminiSchema = {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          type: {
            type: Type.STRING,
            enum: ['进展', '问题', '计划', '结果', '复盘']
          },
          content: { type: Type.STRING }
        },
        required: ['type', 'content']
      }
    };
    result = await callGeminiAPI(prompt, config.apiKey, geminiSchema);
  } else if (config.model !== 'none' && config.apiKey) {
    // 使用 OpenAI 兼容 API（包括聚合平台的 Gemini）
    result = await callOpenAICompatibleAPI(prompt, config, responseSchema);
  }

  if (!result) {
    return [
      { type: '问题' as const, content: '生成汇报时发生错误，请稍后重试。' }
    ];
  }

  try {
    let jsonStr = result.trim();
    if (jsonStr.startsWith('```json')) {
      jsonStr = jsonStr.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    } else if (jsonStr.startsWith('```')) {
      jsonStr = jsonStr.replace(/```\n?/g, '').trim();
    }
    const parsed = JSON.parse(jsonStr);
    return Array.isArray(parsed) ? parsed : [
      { type: '问题' as const, content: 'AI 返回格式不正确，请手动添加汇报内容。' }
    ];
  } catch (error) {
    console.error('解析 AI 响应失败:', error);
    return [
      { type: '问题' as const, content: '生成汇报时发生错误，请稍后重试。' }
    ];
  }
};
