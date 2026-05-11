# 毕业设计说明书（可提交版草稿）

项目名称：My Tea Culture App —— 基于 RAG 的茶文化知识与社区平台设计与实现  
作者：__________  
学号：__________  
专业班级：__________  
指导教师：__________  
完成日期：__________（格式：YYYY-MM-DD）

---

## 摘要

本课题围绕“茶文化数字化传播与智能问答”展开，设计并实现了一个集知识检索、问答服务、社区互动与基础电商于一体的全栈系统。系统采用“前端（uni-app）+后端（Node.js/Express）+AI 向量服务（FastAPI + SentenceTransformer）”的分层架构，面向茶文化场景提供知识查询、内容学习、用户交流和商品服务。

在智能问答方面，系统将茶文化语料进行切片与向量化，通过余弦相似度完成 Top-K 语义检索，并结合大语言模型生成回答，形成检索增强生成（RAG）流程。工程上实现了模型下载与本地缓存、向量文件构建、检索降级策略（向量失败时回退关键词匹配）以及低置信度提示机制。实验层面，从检索效果、问答质量和接口性能三方面设计评估指标，支持后续可复现实验。

项目最终形成了可运行、可扩展、可复现的茶文化智能应用原型，为垂直文化领域的知识服务系统建设提供了实践参考。

关键词：茶文化；检索增强生成；向量检索；知识问答；uni-app；Node.js

---

## 目录

1. 引言  
2. 需求分析  
3. 系统设计  
4. 系统实现  
5. 测试与实验评估  
6. 总结与展望  
7. 参考文献  
附录 A 部署与复现说明  
附录 B 数据库与数据说明  
附录 C 关键接口与文件映射

---

## 1 引言

### 1.1 课题背景

随着移动互联网与生成式 AI 技术的发展，文化知识平台从“静态内容展示”向“智能检索与交互问答”演进。茶文化作为典型的中文垂直知识领域，具有专业术语多、知识分散、检索门槛高等特征，传统关键词检索难以满足用户对准确性与可读性的双重需求。

### 1.2 研究意义

本项目通过构建茶文化垂直知识库与 RAG 问答链路，将语义检索与自然语言生成结合，提升用户获取知识的效率；同时以工程化方式打通前端、后端、AI 服务与数据库，实现完整应用闭环，具有较强的教学与实践价值。

### 1.3 课题目标

- 构建面向茶文化场景的多模块系统（内容、社区、活动、商品、问答）。
- 建立文本切片—向量化—相似度检索的知识处理流程。
- 实现基于检索上下文的问答生成与失败回退机制。
- 形成可复现实验流程，支持答辩展示与后续优化。

### 1.4 项目特色与答辩亮点

1. **垂直领域落地**：聚焦茶文化，数据与业务场景统一。  
2. **RAG 闭环实现**：问题输入→向量检索→上下文拼接→LLM 生成。  
3. **全栈工程能力**：uni-app + Express + FastAPI + MySQL 协同。  
4. **可复现实验**：具备向量生成、接口调用、指标统计的完整流程。

---

## 2 需求分析

### 2.1 功能需求

系统主要功能如下：

- 用户与权限：注册、登录、角色区分（普通用户/管理员）。
- 内容学习：茶类、冲泡、产地文化、课程、茶具与茶席等内容展示与管理。
- 社区互动：发帖、评论、内容审核。
- 活动与证书：茶会活动发布、报名；茶艺师课程与报名。
- 商城与订单：商品展示、下单、订单状态管理。
- 智能问答：对外提供 `/api/ai/ask`，返回答案与检索来源。

### 2.2 非功能需求

- 可用性：接口返回明确错误信息，支持基础异常处理。
- 性能：问答接口可记录检索与生成耗时，支持后续性能分析。
- 可扩展性：路由、控制器、服务分层，便于模块增量开发。
- 可维护性：知识向量与业务数据分离，便于独立迭代。

### 2.3 业务流程概述

用户可在前端完成学习、社区与商品操作；当用户提出茶文化问题时，后端调用检索服务从向量库筛选候选片段，拼接上下文后调用 LLM 生成回答，最终返回答案、来源片段与置信度相关信息。

---

## 3 系统设计

### 3.1 总体架构设计

系统采用三层协同架构：

- 前端：`tea-culture-uniapp`（用户交互与页面展示）
- 后端：`tea-culture-app`（认证、业务逻辑、API 聚合）
- AI 服务：`tea-ai-service`（文本向量化、嵌入服务）

参考架构文档：`docs/architecture.md`。

### 3.2 模块设计

- 表现层：uni-app 页面模块（学习、社区、问答、商城等）。
- 业务层：Express 路由与控制器（auth/users/content/posts/products/events/orders 等）。
- 智能层：检索服务 `searchService.js` 与大模型服务 `llmService.js`。
- 数据层：MySQL 结构化数据 + `tea_with_vectors.json` 向量数据。

### 3.3 数据库设计

数据库脚本路径：

- `tea-culture-app/schema.sql`
- `tea-culture-app/seed.sql`

核心数据实体包括：`user`、`content`、`post`、`comment`、`product`、`tea_event`、`event_enroll`、`certificate_course`、`certificate_enroll`、`feedback`、`orders`。

### 3.4 关键调用链路设计（RAG）

1. 前端提交问题到 `POST /api/ai/ask`。  
2. 后端调用 `searchTeaWithMeta(question)` 获取相关片段。  
3. 组装 `context` 后调用 `generateAnswer(question, context)`。  
4. 返回 `answer`、`sources`、`lowConfidence`、`topScore`。

该链路在 `tea-culture-app/app.js` 与 `tea-culture-app/services/searchService.js` 中实现。

---

## 4 系统实现

### 4.1 AI 服务实现

目录：`tea-ai-service`

- `main.py`：提供 `/embed` 与 `/health` 接口。
- `download_model.py`：下载并缓存 `shibing624/text2vec-base-chinese`。
- `embed_data.py`：读取知识文本，分片后批量向量化，产出 `data/tea_with_vectors.json`。

数据来源与处理流程：

- 原始语料：`data/knowledge.txt`、`data/tea_data.json`
- 处理步骤：清洗→分片（含 overlap）→向量化→写入向量文件

### 4.2 后端实现

目录：`tea-culture-app`

后端入口为 `app.js`，统一挂载认证、内容、社区、活动、课程、反馈、订单等路由，并提供两个关键能力：

- `GET /api/search/tea`：茶文化检索接口。
- `POST /api/ai/ask`：RAG 问答接口。

检索策略实现于 `services/searchService.js`：

- 优先使用 embedding + 余弦相似度。
- 当向量服务不可用时回退关键词匹配。
- 输出 Top-K 结果（默认 `K=3`）。
- 低置信度分数阈值常量名为 `LOW_CONFIDENCE_THRESHOLD`。
- 阈值常量定义位置：`tea-culture-app/services/searchService.js`。

### 4.3 前端实现

目录：`tea-culture-uniapp`

前端基于 uni-app 实现多端页面与接口调用，负责用户操作入口、内容展示、问答交互及商城流程承载。前端与后端通过 REST 接口通信，保证业务模块解耦。

### 4.4 安全与健壮性实现

- 鉴权与密码处理：后端引入 `jsonwebtoken` 与 `bcrypt`。
- 跨域与请求处理：使用 `cors`、`express.json()`、`express.urlencoded()`。
- 失败回退机制：向量检索或 LLM 不可用时提供兜底结果，避免服务完全不可用。

---

## 5 测试与实验评估

### 5.1 实验目标

围绕“检索效果、问答质量、响应性能”三方面验证系统有效性。

### 5.2 测试数据与数据来源

- 知识语料：`tea-ai-service/data/knowledge.txt`
- 可构造测试问答集：从语料抽取问题并人工标注参考答案
- 业务演示数据：`tea-culture-app/seed.sql`

### 5.3 评价指标定义

- 检索指标：Recall@K、MRR
- 生成指标：人工评分（准确性、可读性、专业性）
- 性能指标：平均响应时延、P95 延时、QPS

### 5.4 实验设计合理性说明

- 通过“关键词检索 vs 向量检索”验证语义检索价值。
- 通过“仅检索结果 vs RAG 生成答案”验证可读性提升。
- 通过不同问题类型（事实型、解释型、建议型）验证泛化表现。

### 5.5 实验步骤（可复现）

1. 启动 AI 服务并生成向量文件。  
2. 启动后端服务（必要时配置数据库）。  
3. 使用 curl 或脚本批量请求 `/api/ai/ask`。  
4. 记录返回结果、来源片段和耗时，计算指标并汇总。

### 5.6 结果记录模板

建议在正式提交版中补充以下内容：

- 表 5-1：不同检索策略的 Recall@K/MRR 对比
- 表 5-2：RAG 回答人工评分统计
- 图 5-1：问答接口响应时间分布（平均值与 P95）

---

## 6 总结与展望

### 6.1 工作总结

本课题完成了茶文化智能平台的需求分析、架构设计、核心实现与评估方案设计，重点实现了基于向量检索与 LLM 生成的 RAG 问答链路，并在工程上打通了前后端与 AI 服务。

### 6.2 不足分析

- 评测集规模仍可扩大，自动化评测脚本有待完善。
- 生成质量评估仍以人工评分为主，自动化指标可进一步丰富。
- 向量存储目前以文件为主，索引能力与大规模性能仍有提升空间。

### 6.3 后续展望

- 引入专业向量数据库（如 FAISS/Milvus）与分层召回策略。
- 扩展多模态能力（图像识别茶具/茶叶）。
- 建立持续评测流水线，支持模型与参数自动对比。

---

## 7 参考文献（示例，提交前按学校格式统一）

[1] Lewis P, Perez E, Piktus A, et al. Retrieval-Augmented Generation for Knowledge-Intensive NLP Tasks[J]. NeurIPS, 2020.  
[2] Reimers N, Gurevych I. Sentence-BERT: Sentence Embeddings using Siamese BERT-Networks[C]. EMNLP, 2019.  
[3] FastAPI Official Documentation. https://fastapi.tiangolo.com/  
[4] Express Official Documentation. https://expressjs.com/  
[5] uni-app 官方文档. https://uniapp.dcloud.net.cn/

---

## 附录 A 部署与复现说明

### A.1 AI 服务

```bash
cd tea-ai-service
python -m venv .venv
pip install -r requirements.txt
python download_model.py
python main.py
python embed_data.py
```

- Linux / macOS 激活命令：`source .venv/bin/activate`
- Windows PowerShell 激活命令：`.\.venv\Scripts\activate`
- Windows Command Prompt 激活命令：`.venv\Scripts\activate.bat`

### A.2 后端服务

```bash
cd tea-culture-app
npm install
npm start
```

### A.3 前端服务

```bash
cd tea-culture-uniapp
npm install
# 按项目脚本在 HBuilderX 或对应命令中运行
```

---

## 附录 B 数据库与数据说明

- 数据库结构：`tea-culture-app/schema.sql`
- 演示数据：`tea-culture-app/seed.sql`
- 向量数据：`tea-ai-service/data/tea_with_vectors.json`
- 数据说明文档：`docs/data_dictionary.md`

---

## 附录 C 关键接口与文件映射

### C.1 关键接口

- `POST /api/ai/ask`：RAG 问答
- `GET /api/search/tea`：茶文化检索
- `POST /embed`：文本向量化
- `GET /health`：AI 服务健康检查

### C.2 关键文件

- 后端入口：`tea-culture-app/app.js`
- 检索服务：`tea-culture-app/services/searchService.js`
- LLM 服务：`tea-culture-app/services/llmService.js`
- 向量服务：`tea-ai-service/main.py`
- 向量构建：`tea-ai-service/embed_data.py`

---

## 提交前一致性检查清单

- [ ] 章节标题与学校模板一致  
- [ ] 图表编号与交叉引用一致  
- [ ] 名词术语统一（向量检索/RAG/Top-K 等）  
- [ ] 参考文献格式符合学院规范  
- [ ] 文中路径、接口、模块与仓库实现一致
