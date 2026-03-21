const axios = require('axios');

/**
 * 获取文本的向量表示
 * @param {string[]} texts - 输入的文本数组
 * @returns {Promise<Array>} - 返回向量数组
 */
async function getEmbeddings(texts) {
  try {
    if (!texts || !Array.isArray(texts) || texts.length === 0) {
      throw new Error('texts 必须是非空的字符串数组');
    }

    const response = await axios.post('http://127.0.0.1:8000/embed', {
      texts: texts
    });

    if (!response.data || !response.data.embeddings) {
      throw new Error('响应数据格式异常: 缺少 embeddings 字段');
    }

    return response.data.embeddings;
  } catch (error) {
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('AI 服务错误:', error.response.status, error.response.data);
      throw new Error(`AI 服务错误: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      // 请求已发送但没有收到响应
      console.error('无法连接到 AI 服务');
      throw new Error('无法连接到 AI 服务: http://127.0.0.1:8000/embed');
    } else {
      // 其他错误
      console.error('获取向量时出错:', error.message);
      throw error;
    }
  }
}

module.exports = {
  getEmbeddings
};
