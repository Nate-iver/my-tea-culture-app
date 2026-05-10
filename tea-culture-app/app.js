require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const contentRoutes = require('./routes/content');
const postRoutes = require('./routes/post');
const productRoutes = require('./routes/product');
const eventRoutes = require('./routes/event');
const enrollRoutes = require('./routes/enroll');
const certificateRoutes = require('./routes/certificate');
const certEnrollRoutes = require('./routes/certEnroll');
const feedbackRoutes = require('./routes/feedback');
const commentRoutes = require('./routes/comment');
const orderRoutes = require('./routes/order');
const { searchTea, searchTeaWithMeta } = require('./services/searchService');
const { generateAnswer } = require('./services/llmService');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 静态资源：将项目 images 目录暴露为 /uploads 和 /images
app.use('/uploads', express.static(path.join(__dirname, 'images')));
app.use('/images', express.static(path.join(__dirname, 'images')));
// 兼容旧数据：暴露 images2 目录以便直接通过 URL 访问
app.use('/images2', express.static(path.join(__dirname, 'images2')));

// 挂载路由
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/content', contentRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/products', productRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/enroll', enrollRoutes);
app.use('/api/certificates', certificateRoutes);
app.use('/api/certEnroll', certEnrollRoutes);
app.use('/api/feedback', feedbackRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api', commentRoutes);

app.get('/api/search/tea', async (req, res) => {
  try {
    const keyword = (req.query.keyword || '').trim();
    if (!keyword) {
      return res.status(400).json({
        error: 'keyword 不能为空'
      });
    }

    const results = await searchTea(keyword);
    res.json(results);
  } catch (error) {
    res.status(500).json({
      error: error.message || '茶叶搜索失败'
    });
  }
});

app.post('/api/ai/ask', async (req, res) => {
  try {
    const question = (req.body?.question || '').trim();
    if (!question) {
      return res.status(400).json({
        error: 'question 不能为空'
      });
    }

    const searchStart = Date.now();
    const searchResult = await searchTeaWithMeta(question);
    const searchDuration = Date.now() - searchStart;

    const sources = searchResult.results;
    const context = sources
      .map((item) => `${item.name}: ${item.content}`)
      .join('\n');

    const llmStart = Date.now();
    const answer = await generateAnswer(question, context);
    const llmDuration = Date.now() - llmStart;

    console.log(
      `[RAG] query="${question.slice(0, 30)}" searchMs=${searchDuration} llmMs=${llmDuration} hits=${sources.length} topScore=${searchResult.topScore.toFixed(4)}`
    );

    res.json({
      answer,
      sources,
      lowConfidence: searchResult.lowConfidence,
      topScore: searchResult.topScore
    });
  } catch (error) {
    res.status(500).json({
      error: error.message || 'AI 问答失败'
    });
  }
});

app.get('/', (req, res) => {
  res.send("Tea Culture API Running")
});

app.listen(PORT, () => {
  console.log(`服务运行在 http://localhost:${PORT}`);
});
