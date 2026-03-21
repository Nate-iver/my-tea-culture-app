const axios = require('axios');

const LLM_API_URL = process.env.LLM_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY || 'sk-xxxxxxxxxx';

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

  const safeContext = typeof context === 'string' && context.trim() ? context : '暂无可用参考资料';

  // 加上“请使用简体中文回答”的强制指令
const prompt = `
### 身份：你是一位只使用【简体中文】交流的资深茶文化专家，一旦我发现你用了繁体中文回答，我就会杀了你。

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

    return String(text).trim();
  } catch (error) {
    if (error.response) {
      throw new Error(`LLM API 请求失败: ${error.response.status}`);
    }
    if (error.request) {
      throw new Error('LLM API 无响应，请检查服务地址或网络连接');
    }
    throw error;
  }
}

module.exports = {
  generateAnswer
};
