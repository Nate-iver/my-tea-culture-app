# 系统架构说明

本文件描述系统总体架构，便于 AI 或审阅者快速理解各模块之间的数据流与依赖关系。

## 总览

系统由三大子系统组成：前端（`tea-culture-uniapp`）、后端 API（`tea-culture-app`）、AI 与向量服务（`tea-ai-service`）。数据库/持久化层用于用户、内容与业务数据存储；向量数据可另存为文件或外部向量索引（如 FAISS）。

## 架构图（Mermaid）

```mermaid
flowchart LR
  subgraph Frontend
    FE[uni-app 前端]
  end
  subgraph Backend
    BE[Node.js API]
  end
  subgraph AI
    AI[tea-ai-service: 嵌入/检索/LLM]
  end
  subgraph Storage
    DB[(关系型数据库)]
    VS[(向量存储 / 文件)]
  end

  FE -->|REST / WebSocket| BE
  BE -->|REST / RPC| AI
  BE -->|CRUD| DB
  AI -->|读/写| VS
  AI -->|必要时读| DB
```

## 说明

- 前端 `FE` 发起用户请求（认证、内容浏览、提交问题到 AI 等），调用后端 API。
- 后端 `BE` 负责鉴权、业务逻辑、路由转发，并在必要时调用 `AI` 服务以获得检索或生成结果。
- AI 服务 `AI` 包含模型下载、文本预处理、向量化、向量检索与可选的 LLM 回答组件。向量可存为 `tea-ai-service/data/tea_with_vectors.json` 或加载到向量索引库。
- 存储 `DB` 保存用户、内容、订单、证书等结构化数据；`VS` 为向量与知识文本缓存/索引。

## 建议图像资源

- 推荐在 `docs/architecture.png` 或 `docs/architecture.svg` 放置可视化架构图（论文与演示使用）。
