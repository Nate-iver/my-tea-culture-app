const fs = require('fs');
const path = require('path');
const { getEmbeddings } = require('./aiService');

const VECTOR_DB_PATH = path.join(
  __dirname,
  '../../tea-ai-service/data/tea_with_vectors.json'
);
const LOW_CONFIDENCE_THRESHOLD = 0.45;

function tokenize(text) {
  if (typeof text !== 'string') {
    return [];
  }

  return text
    .toLowerCase()
    .replace(/[^\u4e00-\u9fa5a-z0-9\s]/gi, ' ')
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function keywordSimilarity(query, text) {
  const queryTokens = tokenize(query);
  const textTokens = tokenize(text);

  if (queryTokens.length === 0 || textTokens.length === 0) {
    return 0;
  }

  const textTokenSet = new Set(textTokens);
  const hitCount = queryTokens.reduce((acc, token) => {
    return acc + (textTokenSet.has(token) ? 1 : 0);
  }, 0);

  return hitCount / queryTokens.length;
}

function cosineSimilarity(vecA, vecB) {
  if (!Array.isArray(vecA) || !Array.isArray(vecB) || vecA.length === 0 || vecB.length === 0) {
    return 0;
  }

  const length = Math.min(vecA.length, vecB.length);
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < length; i += 1) {
    const a = Number(vecA[i]) || 0;
    const b = Number(vecB[i]) || 0;
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  if (normA === 0 || normB === 0) {
    return 0;
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}

async function searchTea(query) {
  if (!query || typeof query !== 'string' || !query.trim()) {
    throw new Error('query 必须是非空字符串');
  }

  let queryVector = [];
  let useVectorSearch = true;

  try {
    const embeddings = await getEmbeddings([query]);
    queryVector = embeddings && embeddings[0];
    if (!Array.isArray(queryVector) || queryVector.length === 0) {
      useVectorSearch = false;
    }
  } catch (error) {
    useVectorSearch = false;
    console.warn('[searchService] 向量检索不可用，降级为关键词检索:', error.message);
  }

  const raw = fs.readFileSync(VECTOR_DB_PATH, 'utf-8');
  const vectorDB = JSON.parse(raw);

  if (!Array.isArray(vectorDB)) {
    throw new Error('向量库数据格式错误，期望为数组');
  }

  const results = vectorDB
    .map((item) => {
      const itemVector = Array.isArray(item.vector) ? item.vector : [];
      const score = useVectorSearch
        ? cosineSimilarity(queryVector, itemVector)
        : keywordSimilarity(query, `${item.name || ''} ${item.content || ''}`);
      const fallbackName = item.name || item.title || item.topic || `片段-${item.id ?? 'unknown'}`;
      return {
        name: fallbackName,
        content: item.content || '',
        score
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return results;
}

async function searchTeaWithMeta(query) {
  const results = await searchTea(query);
  const topScore = results.length > 0 ? results[0].score : 0;

  return {
    results,
    topScore,
    lowConfidence: topScore < LOW_CONFIDENCE_THRESHOLD
  };
}

module.exports = {
  cosineSimilarity,
  searchTea,
  searchTeaWithMeta
};
