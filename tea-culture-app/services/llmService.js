const axios = require('axios');

const LLM_API_URL = process.env.LLM_API_URL || 'https://your-llm-api-url.example.com/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY || 'YOUR_API_KEY';

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

  const prompt = `你是一位资深茶文化专家。请结合以下参考资料：${safeContext}，回答用户的问题：${question}。如果资料中没有相关信息，请委婉告知并根据你的专业知识给出建议。`;

  try {
    const response = await axios.post(
      LLM_API_URL,
      {
        model: 'your-model-name',
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
