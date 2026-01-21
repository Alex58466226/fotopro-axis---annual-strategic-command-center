import { GoogleGenAI, Type } from "@google/genai";

/**
 * 针对策略事项建议具体的执行任务（L4级别）
 */
export const suggestL4Tasks = async (strategyName: string, parentContext: string) => {
  if (!process.env.API_KEY) return null;

  // 根据 @google/genai 指南，在每次请求前初始化新实例
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `针对以下策略事项提出5个具体的、可落地的执行任务（L4级别）。策略名称: "${strategyName}"。上下文背景: "${parentContext}"。请直接以中文返回结果，包含标题和一句话描述。`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["title", "description"]
          }
        }
      }
    });

    // 正确使用 .text 获取响应内容
    const text = response.text;
    if (!text) return null;
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API 错误:", error);
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
  if (!process.env.API_KEY) return [];

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const taskSummary = tasks.map((t: any) => 
    `- [${t.priority}] ${t.text} (状态: ${t.done ? '已完成' : '进行中'}, 负责人: ${t.owner || '未分配'})`
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
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { 
                type: Type.STRING, 
                enum: ["进展", "问题", "计划", "结果", "复盘"] 
              },
              content: { type: Type.STRING }
            },
            required: ["type", "content"]
          }
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini API Error (Report):", error);
    return [
      { type: '问题', content: '生成汇报时发生错误，请稍后重试。' }
    ];
  }
};