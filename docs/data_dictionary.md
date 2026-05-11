# 数据字典（Data Dictionary）

本数据字典列出仓库中重要数据文件与表的含义、示例字段与用途，便于 AI 在生成论文方法与实验部分时引用。

## `tea-ai-service/data/tea_data.json`

- 描述：原始结构化的茶文化条目集合，可能包含标题、正文、来源与元数据。
- 建议字段：
  - `id`：唯一标识
  - `title`：条目标题
  - `text` / `content`：正文文本
  - `source`：来源（书籍/网站）
  - `tags`：关键词数组
  - `created_at`：创建时间（可选）
- 用途：作为嵌入与检索的原始语料。

## `tea-ai-service/data/knowledge.txt`

- 描述：纯文本形式的知识库，用于快速抽取与分段后做向量化处理。
- 格式示例：每行或每段为一条独立知识片段。

## `tea-ai-service/data/tea_with_vectors.json`

- 描述：向量化后的输出文件，典型用于离线检索或作为示例数据。
- 建议字段：
  - `id`：与原文档关联的 id
  - `text`：原文片段
  - `metadata`：如 `source`, `title`, `section`
  - `vector`：向量数组（浮点数列表）
- 注意：为论文描述，应记录向量维度（embedding-dim）、模型名称与预处理步骤。

## 数据库脚本：`schema.sql`, `seed.sql`

- 描述：SQL 脚本用于创建表结构与插入示例数据。
- 可能的表（从后端控制器推断）及常见字段：
  - `users`：`id`, `username`, `password_hash`, `email`, `role`, `created_at`
  - `content` / `posts`：`id`, `author_id`, `title`, `body`, `status`, `created_at`
  - `certificate`：`id`, `user_id`, `course`, `issued_at`
  - `orders`：`id`, `user_id`, `product_id`, `amount`, `status`, `created_at`
- 建议：在论文的“数据与环境”节中粘贴 `schema.sql` 的表结构以增加可复现性。

## 前端/后端交互数据示例

- 登录请求：`{ "username": "xxx", "password": "yyy" }`
- AI 问答请求示例：`{ "question": "普洱茶的发酵程度如何区分？", "top_k": 5 }`
- AI 响应示例：`{ "answer": "...", "sources": [{"id": "...","score": 0.87}], "retrieved": 5 }`

## 建议记录（为了论文复现）

在撰写论文时，记录以下细节以便复现：

- 文本清洗步骤：分句策略、停用词、特殊字符处理；
- 中文分词工具与参数（如使用 Jieba、HanLP 等）；
- 嵌入模型名称与版本、embedding 维度、是否归一化；
- 向量检索方法（FAISS 索引类型、参数、metric、top-K）；
- 随机种子、硬件环境与运行时性能指标采集方法。
