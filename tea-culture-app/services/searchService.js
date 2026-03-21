const fs = require('fs');
const path = require('path');
const { getEmbeddings } = require('./aiService');

const VECTOR_DB_PATH = path.join(
  __dirname,
  '../../tea-ai-service/data/tea_with_vectors.json'
);

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

  const embeddings = await getEmbeddings([query]);
  const queryVector = embeddings && embeddings[0];

  if (!Array.isArray(queryVector) || queryVector.length === 0) {
    throw new Error('未获取到有效的查询向量');
  }

  const raw = fs.readFileSync(VECTOR_DB_PATH, 'utf-8');
  const vectorDB = JSON.parse(raw);

  if (!Array.isArray(vectorDB)) {
    throw new Error('向量库数据格式错误，期望为数组');
  }

  return vectorDB
    .map((item) => {
      const itemVector = Array.isArray(item.vector) ? item.vector : [];
      const score = cosineSimilarity(queryVector, itemVector);
      return {
        name: item.name,
        content: item.content,
        score
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

module.exports = {
  cosineSimilarity,
  searchTea
};
