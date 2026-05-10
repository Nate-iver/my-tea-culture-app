#!/usr/bin/env python3
"""
下载 shibing624/text2vec-base-chinese 模型到本地
这样可以离线使用模型，避免每次启动时从 HuggingFace 下载
"""

import os
import shutil
from pathlib import Path
from sentence_transformers import SentenceTransformer

BASE_DIR = Path(__file__).parent
LOCAL_MODEL_DIR = BASE_DIR / "hf_models" / "text2vec-base-chinese"
MODEL_ID = "shibing624/text2vec-base-chinese"

def download_model():
    """下载模型到本地目录"""
    print(f"📥 开始下载模型: {MODEL_ID}")
    
    # 创建本地模型目录
    LOCAL_MODEL_DIR.parent.mkdir(parents=True, exist_ok=True)
    
    # 如果已存在旧版本，删除它
    if LOCAL_MODEL_DIR.exists():
        print(f"⚠️  本地模型已存在，删除旧版本: {LOCAL_MODEL_DIR}")
        shutil.rmtree(LOCAL_MODEL_DIR)
    
    # 下载并保存模型
    print(f"⏳ 下载中... (可能需要几分钟)")
    model = SentenceTransformer(MODEL_ID)
    
    # 保存模型到本地
    model.save(str(LOCAL_MODEL_DIR))
    print(f"✅ 模型已保存到: {LOCAL_MODEL_DIR}")
    
    # 验证
    if LOCAL_MODEL_DIR.exists():
        size = sum(f.stat().st_size for f in LOCAL_MODEL_DIR.rglob('*') if f.is_file())
        print(f"✅ 验证成功，本地模型大小: {size / 1024 / 1024:.2f} MB")
    
if __name__ == "__main__":
    download_model()
