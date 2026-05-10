import os
import time
from pathlib import Path
from typing import List, Optional

# 在导入 transformers/sentence_transformers 之前设置缓存目录。
# 默认使用 Linux 主目录缓存（WSL 下通常比 /mnt/* 更快），也可通过环境变量覆盖。
os.environ.setdefault("HF_HOME", str(Path.home() / ".cache" / "huggingface"))
os.environ.setdefault("TRANSFORMERS_CACHE", os.path.join(os.environ["HF_HOME"], "hub"))

from fastapi import FastAPI
from sentence_transformers import SentenceTransformer
from pydantic import BaseModel
import uvicorn

# 使用缓存中的模型，禁用网络下载
MODEL_NAME = "shibing624/text2vec-base-chinese"
os.environ["HF_HUB_OFFLINE"] = "1"  # 禁用在线下载，仅使用本地缓存

app = FastAPI(title="茶文化 App - 本地 AI 向量服务")

_model: Optional[SentenceTransformer] = None


def get_model() -> SentenceTransformer:
    global _model
    if _model is None:
        print("🔄 加载本地模型...")
        start = time.time()
        _model = SentenceTransformer(MODEL_NAME)
        print(f"✅ 模型加载完成，用时 {time.time() - start:.2f}s")
    return _model

class TextBatch(BaseModel):
    texts: List[str] = ["龙井茶", "碧螺春"]

@app.on_event("startup")
async def startup_event():
    """应用启动时预加载模型"""
    get_model()

@app.post("/embed")
async def get_embeddings(data: TextBatch):
    model = get_model()
    # 核心功能：将文本转为向量
    embeddings = model.encode(data.texts)
    return {"embeddings": embeddings.tolist()}

@app.get("/health")
async def health():
    return {
        "status": "ready",
        "model_loaded": _model is not None,
        "model_name": MODEL_NAME,
        "hf_home": os.environ.get("HF_HOME"),
        "offline_mode": os.environ.get("HF_HUB_OFFLINE") == "1",
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)