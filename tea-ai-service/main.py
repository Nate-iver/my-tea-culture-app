import os
from fastapi import FastAPI
from sentence_transformers import SentenceTransformer
from pydantic import BaseModel
from typing import List
import uvicorn

# 【重要】为了防止模型下载到 C 盘，你可以指定模型存放路径到当前目录下
# 这样即便以后重装系统，模型文件依然在你的 D 盘项目里
os.environ['HF_HOME'] = os.path.join(os.getcwd(), "hf_models")

app = FastAPI(title="茶文化 App - 本地 AI 向量服务")

print("正在初始化 AI 模型...")
# 使用轻量级但效果极佳的中文语义模型
# 第一次运行会下载约 400MB 的数据
model = SentenceTransformer('shibing624/text2vec-base-chinese')
print("AI 模型加载成功！服务准备就绪。")

class TextBatch(BaseModel):
    texts: List[str] = ["龙井茶", "碧螺春"]

@app.post("/embed")
async def get_embeddings(data: TextBatch):
    # 核心功能：将文本转为向量
    embeddings = model.encode(data.texts)
    return {"embeddings": embeddings.tolist()}

@app.get("/health")
async def health():
    return {"status": "ready"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)