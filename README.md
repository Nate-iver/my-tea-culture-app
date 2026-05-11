# My Tea Culture App

> 单仓库（monorepo），包含茶文化相关的服务、后端与前端。此 README 提供项目概览、目录与快速启动指引。

## 概览

本仓库包含三个主要子项目：

- `tea-ai-service`：与 AI/模型、向量、知识库嵌入相关的 Python 服务与脚本。
- `tea-culture-app`：基于 Node 的后端（控制器、路由、服务层），提供 API 与管理接口。
- `tea-culture-uniapp`：基于 uni-app 的移动/前端代码，负责用户界面与客户端交互。

## 目录结构（精简）

- `tea-ai-service/` — 模型下载、嵌入与数据处理脚本（Python）。
- `tea-culture-app/` — 后端服务（Node.js）。
- `tea-culture-uniapp/` — 前端 uni-app 项目（H5 / 移动端）。
- `data/`, `images/` 等 — 各类静态数据与资源。

## 快速开始

> 以下为通用快速启动步骤。各子项目中可能包含更详细的说明，请优先参考对应目录下的 README 或 `package.json` / `pyproject.toml`。

先决条件

- Node.js（建议 14+）和 npm 或 pnpm
- Python 3.8+
- 数据库（如项目需要，请根据 `tea-culture-app/config/db.js` 配置）

1) 启动 `tea-ai-service`（Python）

```powershell
cd tea-ai-service
python -m venv .venv
.\.venv\Scripts\activate
# 安装依赖（如果仓库有 requirements.txt）
pip install -r requirements.txt
# 或使用 pyproject.toml 的工具安装
# 运行服务 / 脚本
python main.py
```

2) 启动 `tea-culture-app`（后端，Node）

```bash
cd tea-culture-app
npm install
# 根据 package.json 执行启动命令，常见为：
npm run dev   # 或 npm start
```

注意：后端可能需要数据库连接信息，检查 `tea-culture-app/config/db.js` 并创建 `.env`（如需要）。仓库根目录下有 `schema.sql` 与 `seed.sql` 可用于初始化数据表与示例数据。

3) 启动 `tea-culture-uniapp`（前端）

```bash
cd tea-culture-uniapp
npm install
# 运行开发服务器（根据项目配置）
npm run dev
# 构建 H5 或平台包参见 package.json scripts
```

## 开发与贡献

- 分支策略：feature 分支 -> 提交 PR
- 代码风格：保持现有项目风格，提交前运行 lint（如有配置）
- 测试：各子项目如有测试框架，请运行对应测试命令

## 常见位置参考

- 后端路由与控制器：[tea-culture-app/controllers](tea-culture-app/controllers)
- 前端页面入口：[tea-culture-uniapp/pages](tea-culture-uniapp/pages)
- AI/模型相关：[tea-ai-service](tea-ai-service)

## 许可证

本仓库默认使用 MIT 许可证。若需要其他许可证，请在根目录添加 `LICENSE` 文件并更新此处说明。

## 联系

如需帮助或要提交问题，请创建 GitHub issue 或直接联系仓库维护者。
