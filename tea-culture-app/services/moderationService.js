const axios = require('axios');

const LLM_API_URL = process.env.LLM_API_URL || 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';
const LLM_API_KEY = process.env.LLM_API_KEY || 'sk-xxxxxxxxxx';
const MODERATION_TIMEOUT_MS = Number(process.env.MODERATION_TIMEOUT_MS || 10000);

const ALLOWED_CATEGORIES = new Set(['safe', 'abuse', 'ad', 'political', 'sexual']);

class ModerationServiceUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ModerationServiceUnavailableError';
    this.code = 'MODERATION_SERVICE_UNAVAILABLE';
  }
}

function buildPostModerationPrompt(title, content) {
  return `你是社区内容审核助手，请只返回 JSON，不要输出其他说明。

请审核以下帖子是否适合公开展示。违规类型仅允许以下枚举：
- abuse：辱骂、人身攻击、恶意挑衅
- ad：广告引流、联系方式导流、营销刷屏
- political：政治敏感或不当政治内容
- sexual：色情低俗、性暗示内容
- safe：以上都不命中

请分别阅读标题与正文后给出统一结论。

标题：${title}
正文：${content}

输出格式必须是：
{"pass": true|false, "category": "safe|abuse|ad|political|sexual", "reason": "不超过40字的中文原因"}`;
}

function buildCommentModerationPrompt(content) {
  return `你是社区内容审核助手，请只返回 JSON，不要输出其他说明。

请审核以下评论是否适合公开展示。违规类型仅允许以下枚举：
- abuse：辱骂、人身攻击、恶意挑衅
- ad：广告引流、联系方式导流、营销刷屏
- political：政治敏感或不当政治内容
- sexual：色情低俗、性暗示内容
- safe：以上都不命中

评论：${content}

输出格式必须是：
{"pass": true|false, "category": "safe|abuse|ad|political|sexual", "reason": "不超过40字的中文原因"}`;
}

function extractJsonText(rawText) {
  const trimmed = String(rawText || '').trim();
  if (!trimmed) {
    return '';
  }

  const codeBlockMatch = trimmed.match(/```json\s*([\s\S]*?)\s*```/i) || trimmed.match(/```\s*([\s\S]*?)\s*```/i);
  if (codeBlockMatch && codeBlockMatch[1]) {
    return codeBlockMatch[1].trim();
  }

  const start = trimmed.indexOf('{');
  const end = trimmed.lastIndexOf('}');
  if (start >= 0 && end > start) {
    return trimmed.slice(start, end + 1);
  }

  return trimmed;
}

function normalizeModerationResult(parsed) {
  const pass = parsed && typeof parsed.pass === 'boolean' ? parsed.pass : null;
  const category = typeof parsed?.category === 'string' ? parsed.category.trim().toLowerCase() : '';
  const reason = typeof parsed?.reason === 'string' ? parsed.reason.trim() : '';

  if (pass === null || !ALLOWED_CATEGORIES.has(category)) {
    throw new Error('审核结果字段无效');
  }

  if (pass && category !== 'safe') {
    throw new Error('审核结果冲突');
  }

  if (!pass && category === 'safe') {
    throw new Error('审核结果冲突');
  }

  return {
    pass,
    category,
    reason: reason || (pass ? '内容合规' : '内容不符合社区规范')
  };
}

async function auditPost(title, content) {
  return auditByPrompt(buildPostModerationPrompt(title, content));
}

async function auditComment(content) {
  return auditByPrompt(buildCommentModerationPrompt(content));
}

async function auditByPrompt(prompt) {
  try {
    const response = await axios.post(
      LLM_API_URL,
      {
        model: 'qwen-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0
      },
      {
        headers: {
          Authorization: `Bearer ${LLM_API_KEY}`,
          'Content-Type': 'application/json'
        },
        timeout: MODERATION_TIMEOUT_MS
      }
    );

    const text =
      response?.data?.choices?.[0]?.message?.content ||
      response?.data?.output_text ||
      response?.data?.text;

    const jsonText = extractJsonText(text);
    const parsed = JSON.parse(jsonText);
    return normalizeModerationResult(parsed);
  } catch (error) {
    console.error('[moderationService] 审核失败:', error.message);
    throw new ModerationServiceUnavailableError('审核服务繁忙，请稍后重试');
  }
}

module.exports = {
  auditPost,
  auditComment,
  ModerationServiceUnavailableError
};
