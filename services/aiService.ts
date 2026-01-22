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
 * 根据当前任务状态生成周报内容
 */
export const generateWeeklyReport = async (
  strategyName: string,
  tasks: any[],
  stats: { total: number; completed: number; rate: number; timeUsedRate: number }
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

  const prompt = `
    你是一位资深的项目经理。请根据以下策略项目的当前状态，生成一份专业的周工作汇报。
    
    策略名称: "${strategyName}"
    整体进度: ${stats.rate}% (时间消耗: ${stats.timeUsedRate}%)
    任务总数: ${stats.total} (已完成: ${stats.completed})

    详细任务列表:
    ${taskSummary}

    请输出一组汇报条目。每个条目必须包含以下两个字段：
    1. type: 必须是 ["进展", "问题", "计划", "结果", "复盘"] 中的一个。
    2. content: 具体内容，语言简练专业。

    请生成 3-6 条核心汇报内容。
    请以 JSON 数组格式返回，格式示例：
    [{"type": "进展", "content": "..."}, {"type": "问题", "content": "..."}]
  `;

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
