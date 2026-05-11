# 毕业设计说明书草稿

项目名称：My Tea Culture App — 基于 AI 的茶文化知识与社区平台

作者：
指导教师：
日期：

---

## 摘要

本项目实现了一个以茶文化为核心的全栈系统，集成知识库向量化检索、RAG（检索增强生成）问答、社区交互与基础电商功能。系统由三部分构成：AI 向量服务（`tea-ai-service`），后端 API（`tea-culture-app`）和跨平台前端（`tea-culture-uniapp`）。论文工作包含数据处理与向量化流水线实现、检索策略设计、与 LLM 的集成方法、系统工程化实现与一系列可复现的实验评估。

关键词：茶文化，向量检索，嵌入，RAG，uni-app，Node.js，SentenceTransformer

---

## 目录

1. 引言
2. 相关工作
3. 方法
   3.1 数据集与预处理
   3.2 嵌入模型与向量化
   3.3 向量检索与相似度计算
   3.4 检索增强生成（RAG）策略
4. 系统实现
   4.1 系统架构
   4.2 AI 服务实现（`tea-ai-service`）
   4.3 后端实现（`tea-culture-app`）
   4.4 前端实现（`tea-culture-uniapp`）
5. 实验设计与评估
   5.1 数据集构建与测试集
   5.2 评价指标
   5.3 实验步骤
6. 实验结果与分析
7. 结论与未来工作
8. 致谢
9. 参考文献

附录 A：源码与运行说明
附录 B：数据库 schema 与示例数据
附录 C：评测脚本与结果文件

---

## 1 引言

（在此处说明项目背景、研究意义、目标与问题）

近年来，基于向量的语义检索与生成模型的结合（RAG）在问答系统与知识检索领域表现出色。本项目以茶文化知识为域，探索如何将现有文化类文本资源结构化并应用向量检索与大模型生成，提升用户查询的准确性与可读性，同时实现一个可复现的工程系统，作为毕业设计的实现与实验平台。

## 2 相关工作

（综述向量检索、中文 embedding、RAG 方法、知识库问答与文化信息系统相关文献）

## 3 方法

### 3.1 数据集与预处理

- 原始语料位置：`tea-ai-service/data/knowledge.txt` 与 `tea-ai-service/data/tea_data.json`。
- 预处理流程：文本清洗（去除 HTML、特殊字符）、分段/切片（见 `embed_data.py` 的 `split_text_with_overlap`），中文分词与停用词处理（如使用 Jieba/HanLP，可记录在论文中）。
- 数据集说明表：在论文中列出样本数、平均片段长度、分词统计等。

### 3.2 嵌入模型与向量化

- 使用模型：`shibing624/text2vec-base-chinese`（通过 `sentence_transformers` 进行向量化）。
- 模型下载：见 `download_model.py`，建议在复现实验中先运行该脚本以缓存模型。
- 向量化实现：`tea-ai-service/main.py` 提供 `POST /embed` 接口；`embed_data.py` 批量切片并调用此接口，生成 `tea_with_vectors.json`。
- 应记录：embedding 维度、是否归一化、批量大小、处理时间等。

### 3.3 向量检索与相似度计算

- 检索实现：当前使用离线向量文件与余弦相似度计算，见 `tea-culture-app/services/searchService.js`。
- 评价点：比较基于关键词的相似度与向量余弦的检索效果。

### 3.4 检索增强生成（RAG）策略

- 流程：
  1. 用户问题发送到后端 `POST /api/ai/ask`。
  2. 后端调用 `searchTeaWithMeta` 检索最相关片段（top-K），合并为 `context`。
  3. 将 `question` 与 `context` 一并发送到 LLM（`llmService.generateAnswer`）生成最终答案；若 LLM 不可用，返回基于本地知识库的回退文本。
- 需在论文中说明 prompt 设计、context 拼接方式、top-K 选择与置信度阈值（`LOW_CONFIDENCE_THRESHOLD`）。

## 4 系统实现

### 4.1 系统架构

（引用 `docs/architecture.md` 的图与描述，说明前端、后端、AI 服务与存储的交互）

### 4.2 AI 服务实现（`tea-ai-service`）

- 主要文件：`main.py`（FastAPI 服务）、`embed_data.py`（向量化流水线）、`download_model.py`（模型缓存脚本）
- 运行命令示例：

```powershell
cd tea-ai-service
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python main.py
```

### 4.3 后端实现（`tea-culture-app`）

- 主要文件：`app.js`、`services/searchService.js`、`services/aiService.js`、`services/llmService.js`、`controllers/*`、`routes/*`
- 重要端点说明：`POST /api/ai/ask`、`GET /api/search/tea` 等（见 `docs/api_and_experiments.md`）
- 启动示例：

```bash
cd tea-culture-app
npm install
npm run dev
```

### 4.4 前端实现（`tea-culture-uniapp`）

- 页面入口：`pages/` 目录，跨平台构建使用 `npm run dev` 或 `npm run build`（查看 `package.json` scripts）。

## 5 实验设计与评估

### 5.1 数据集构建与测试集

- 从 `tea-ai-service/data/knowledge.txt` 抽取若干问答对作为测试集，人工标注参考答案或引用片段。
- 建议测试集规模：100-500 问题（根据时间与资源决定）。

### 5.2 评价指标

- 检索：Recall@K、Mean Reciprocal Rank (MRR)
- 生成：准确率/人工评分、ROUGE/BLEU（如适用）
- 性能：平均响应时延、P95 延时、QPS

### 5.3 实验步骤（可直接复制到复现脚本）

1. 启动向量服务并生成 `tea_with_vectors.json`（参考第 3.2 小节）
2. 启动后端与前端服务
3. 使用 `scripts/eval_qa.py`（或 curl）遍历测试问答集，向 `/api/ai/ask` 发送请求并记录返回答案、sources、响应时间
4. 计算并汇总指标，生成表格与图表

## 6 实验结果与分析

（在此处填入实验运行后得到的定量表格、图表与定性分析）

## 7 结论与未来工作

（总结工作，并提出未来可扩展方向，例如知识图谱融合、模型微调、多模态扩展等）

## 8 致谢


## 9 参考文献

（列出相关论文与工具文档）

---

## 附录 A：源码与运行说明（快速复现）

- 克隆仓库并进入根目录

```bash
git clone <repo-url>
cd my-tea-culture-app
```

- 启动 AI 服务与生成向量

```powershell
cd tea-ai-service
python -m venv .venv
.\.venv\Scripts\activate
pip install -r requirements.txt
python download_model.py
python main.py  # 启动 embed 服务
python embed_data.py  # 生成 tea_with_vectors.json
```

- 启动后端

```bash
cd ../tea-culture-app
npm install
npm run dev
```

- 启动前端

```bash
cd ../tea-culture-uniapp
npm install
npm run dev
```

## 附录 B：数据库 schema 与示例数据

- 表结构文件：`schema.sql`，示例数据：`seed.sql`。

## 附录 C：评测脚本模版（建议）

- 建议实现：`scripts/eval_qa.py`（Python）或 `scripts/eval_qa.js`（Node），功能：
  - 读取测试问答文件 `tests/qa_pairs.json`
  - 对每个问题调用 `/api/ai/ask`，记录 `answer`, `sources`, `time_ms`
  - 将结果保存为 `results/*.json`，并输出 CSV 汇总

---

（此草稿可直接作为毕业设计说明书的初稿；如需我把每一节扩展为更详细段落并生成可提交的 Markdown/Word 文档，我可以继续。）