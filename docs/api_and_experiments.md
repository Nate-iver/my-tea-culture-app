# API 与实验复现说明

本文件列出关键 API 端点、AI 模型信息与可复制的实验步骤，便于他人或 AI 快速生成毕设说明书并复现实验。

---

## 一、关键 API 列表（摘要）

- 后端挂载前缀（见 `tea-culture-app/app.js`）：
  - `/api/auth` — 认证相关路由（登录/注册）
  - `/api/users` — 用户相关
  - `/api/content` — 内容/课程/文章
  - `/api/posts` — 社区帖子
  - `/api/products` — 商品
  - `/api/events` — 活动
  - `/api/enroll` — 报名
  - `/api/certificates` — 证书
  - `/api/certEnroll` — 证书报名
  - `/api/feedback` — 反馈
  - `/api/orders` — 订单
  - `/api` — 其它（评论路由挂在此）

- 重要独立端点（位于 `tea-culture-app/app.js` / `services`）：
  - `GET /api/search/tea?keyword=...` — 基于向量或关键词的茶文化搜索，返回 top-3 片段
  - `POST /api/ai/ask` — RAG 问答接口（前端或客户端向此接口发送 `{ question: "..." }`）

- AI 服务（独立 FastAPI 服务，见 `tea-ai-service/main.py`）：
  - `POST /embed` — 批量文本向量化，JSON 请求体 `{ "texts": ["...", ...] }`，返回 `{ "embeddings": [...] }`
  - `GET /health` — 服务健康与模型状态检查

## 二、示例请求与响应

- `POST /api/ai/ask` 请求示例：

```bash
curl -X POST http://localhost:3000/api/ai/ask -H "Content-Type: application/json" -d '{"question":"普洱茶如何储存？"}'
```

示例成功响应：

```json
{
  "answer": "...生成的答案...",
  "sources": [{"name":"条目名","content":"相关片段内容","score":0.87}],
  "lowConfidence": false,
  "topScore": 0.87
}
```

- `POST /embed` 请求示例（AI 服务）：

```bash
curl -X POST http://127.0.0.1:8000/embed -H "Content-Type: application/json" -d '{"texts":["龙井茶","碧螺春"]}'
```

响应示例：`{ "embeddings": [[...], [...]] }`

## 三、模型与组件清单

- 嵌入模型（本项目主要嵌入模型）：`shibing624/text2vec-base-chinese`（通过 `sentence_transformers` 使用，本地缓存于 `tea-ai-service/hf_models`）
- 向量服务：`tea-ai-service`（FastAPI + SentenceTransformer），可通过 `embed_data.py` 批量将 `data/knowledge.txt` 切片并发送到 `/embed` 生成 `data/tea_with_vectors.json`
- 检索实现：基于离线向量文件的余弦相似度计算（实现见 `tea-culture-app/services/searchService.js`）
- LLM：默认通过 `tea-culture-app/services/llmService.js` 请求外部 LLM（`qwen-flash` 为示例），环境变量 `LLM_API_URL` 与 `LLM_API_KEY` 可配置；当 LLM 不可用时，会返回基于本地知识库的回退回答

## 四、可复现实验流程（推荐顺序）

前提：已安装 Node.js、npm、Python 3.8+。在 Windows 下以 PowerShell 操作示例给出。

1) 克隆仓库

```powershell
git clone <repo-url>
cd my-tea-culture-app
```

2) 下载并缓存嵌入模型（可选，但推荐离线使用）

```powershell
cd tea-ai-service
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt  # 若存在 requirements.txt
python download_model.py
```

说明：`download_model.py` 会把 `shibing624/text2vec-base-chinese` 保存在 `tea-ai-service/hf_models`，并且 `main.py` 启动时会尝试从 HF 缓存加载模型（`HF_HUB_OFFLINE=1` 可禁用在线下载）。

3) 启动本地向量服务

```powershell
cd tea-ai-service
.\.venv\Scripts\activate
python main.py
# 服务默认监听 8000
```

4) 生成向量数据库

```powershell
# 在 tea-ai-service 下
python embed_data.py
# 输出文件： tea-ai-service/data/tea_with_vectors.json
```

5) 启动后端服务

```bash
cd ../tea-culture-app
npm install
# 如需连接数据库，先配置 `config/db.js` 或 .env
npm run dev
# 服务默认监听 3000
```

6) 启动前端（可选，用于交互验证）

```bash
cd ../tea-culture-uniapp
npm install
npm run dev
```

7) 运行示例查询并记录指标

- 功能验证：使用 `curl` 或前端页面向 `/api/ai/ask` 发起问题请求，确认返回 `answer` 与 `sources`。
- 性能指标：记录
  - 检索时间（`searchMs`）与 LLM 时间（`llmMs`），可通过后端日志查看（app.js 中有 console.log）
  - 平均响应延迟（端到端）

## 五、实验设计与评估指标建议（写论文用）

- 数据集：从 `tea-ai-service/data/knowledge.txt` 构建问答对，人工标注 ground-truth 答案或引用段落
- 指标：
  - 检索召回@K（Recall@K）
  - 精确率 / 准确率（若有明确答案）
  - BLEU / ROUGE（若评估生成文本与参考答案相似度）
  - 人工评分（可读性、专业性、准确性，5 分量表）
  - 延迟（平均与 P95）与吞吐量（QPS）
- 对照实验：
  - 仅关键词检索 vs 向量检索
  - 向量检索 + LLM vs 向量检索 + 基于模板的合成
  - 不同 embedding 模型（如 text2vec vs 其它中文 embedding）

## 六、建议的评测脚本与自动化

- 编写一个 `scripts/eval_qa.py`（或 Node 脚本）来遍历测试问答集，调用 `/api/ai/ask`、保存响应、与参考答案比对并计算指标（Recall@K, exact match, latency）。
- 建议输出 CSV/JSON 结果以便在论文中展示表格与绘图。

## 七、附录：重要文件映射（便于自动化生成论文引用）

- AI 服务： `tea-ai-service/main.py`, `tea-ai-service/embed_data.py`, `tea-ai-service/download_model.py`, `tea-ai-service/data/*`
- 后端： `tea-culture-app/app.js`, `tea-culture-app/services/searchService.js`, `tea-culture-app/services/aiService.js`, `tea-culture-app/services/llmService.js`, `tea-culture-app/controllers/*`, `tea-culture-app/routes/*`
- 前端： `tea-culture-uniapp/pages/*`, `tea-culture-uniapp/main.js`
- 数据库脚本： `schema.sql`, `seed.sql`

---

如果你同意，我会：

- 把以上内容以论文章节草稿生成 `docs/thesis_draft.md`（把每一节拓展成完整段落并引用仓库文件）；
- 或先生成 `scripts/eval_qa.py` 的模板脚本来自动化评测。 

请选择下一步（生成论文草稿 / 生成评测脚本 / 其他）。