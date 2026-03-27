const axios = require('axios');
const { Converter } = require('opencc-js');

const LLM_API_URL = process.env.LLM_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY || 'sk-xxxxxxxxxx';
const t2sConverter = Converter({ from: 'tw', to: 'cn' });

function toSimplified(text) {
  if (typeof text !== 'string') {
    return '';
  }

  try {
    return t2sConverter(text);
  } catch (error) {
    console.error('[llmService] 简繁转换失败:', error.message);
    return text;
  }
}

function buildFallbackAnswer(question, context) {
  const contextLines = toSimplified(String(context || ''))
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(0, 3);

  const contextSummary = contextLines.length > 0 ? contextLines.join('；') : '暂无可用参考资料';

  return [
    '当前大模型服务暂时不可用，以下是基于本地知识库的参考结论：',
    `你问的是：${question}`,
    `参考资料：${contextSummary}`,
    '建议稍后重试，以获取更完整的智能回答。'
  ].join('\n');
}

/**
 * 调用大模型生成回答
 * @param {string} question - 用户问题
 * @param {string} context - 向量检索得到的参考资料
 * @returns {Promise<string>} - 大模型返回的文本答案
 */
async function generateAnswer(question, context) {
  if (!question || typeof question !== 'string' || !question.trim()) {
    throw new Error('question 必须是非空字符串');
  }

  const safeContext =
    typeof context === 'string' && context.trim() ? toSimplified(context) : '暂无可用参考资料';

  // 加上“请使用简体中文回答”的强制指令
const prompt = `
### 身份：你是一位只使用【简体中文】交流的资深茶文化专家。

### 核心任务：
结合以下参考资料回答用户问题。
1. 无论参考资料中出现繁体字、英文还是其他语言，你的回答【必须且只能】使用简体中文。
2. 严禁出现“國”、“茶”、“葉”等繁体字形。
3. 如果资料不足，请基于专业知识用简体中文建议。

### 参考资料：
${safeContext}

### 用户问题：
${question}

### 简体中文回答：`;

  try {
    const response = await axios.post(
      LLM_API_URL,
      {
        model: 'qwen-turbo',
        messages: [
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.7
      },
      {
        headers: {
          Authorization: `Bearer ${LLM_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: 30000
      }
    );

    // 兼容常见 LLM 返回格式
    const text =
      response?.data?.choices?.[0]?.message?.content ||
      response?.data?.output_text ||
      response?.data?.text;

    if (!text) {
      throw new Error('LLM 响应中未找到文本内容');
    }

    return toSimplified(String(text).trim());
  } catch (error) {
    if (error.response) {
      console.error('[llmService] LLM API 请求失败:', error.response.status);
      return buildFallbackAnswer(question, safeContext);
    }
    if (error.request) {
      console.error('[llmService] LLM API 无响应');
      return buildFallbackAnswer(question, safeContext);
    }
    console.error('[llmService] 生成回答异常:', error.message);
    return buildFallbackAnswer(question, safeContext);
  }
}

module.exports = {
  generateAnswer
};
