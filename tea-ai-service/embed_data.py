import requests
import json
import os
import time

# --- 配置区 ---
EMBED_API_URL = "http://127.0.0.1:8000/embed"
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
INPUT_PATH = os.path.join(BASE_DIR, "data", "knowledge.txt")
OUTPUT_PATH = os.path.join(BASE_DIR, "data", "tea_with_vectors.json")
# 既然你的 main.py 支持 List[str]，我们一次发 16 条，效率更高
BATCH_SIZE = 4 
MAX_RETRIES = 3

def split_text_with_overlap(text, chunk_size=450, overlap=50):
    chunks = []
    for i in range(0, len(text), chunk_size - overlap):
        chunk = text[i : i + chunk_size].strip()
        if len(chunk) > 5:
            chunks.append(chunk)
    return chunks

def process_knowledge():
    if not os.path.exists(INPUT_PATH):
        print(f"❌ 错误：在 {INPUT_PATH} 找不到语料文件！")
        return

    print(f"📖 正在从 {INPUT_PATH} 读取茶叶百科...")
    with open(INPUT_PATH, "r", encoding="utf-8") as f:
        full_text = f.read()

    all_chunks = split_text_with_overlap(full_text)
    total_chunks = len(all_chunks)
    print(f"✅ 文档已切分为 {total_chunks} 个片段。")

    vector_database = []
    session = requests.Session()
    # 忽略系统代理，确保请求直连本机向量服务
    session.trust_env = False

    # --- 批量向量化处理 ---
    print(f"🚀 开始批量向量化 (每组 {BATCH_SIZE} 片)...")
    for i in range(0, total_chunks, BATCH_SIZE):
        # 截取一组片段
        batch_texts = all_chunks[i : i + BATCH_SIZE]
        
        try:
            # 【关键修改 1】：发送格式对齐 main.py 的 TextBatch 类
            payload = {"texts": batch_texts}
            response = None

            for attempt in range(1, MAX_RETRIES + 1):
                response = session.post(EMBED_API_URL, json=payload, timeout=20)
                if response.status_code == 200:
                    break
                if attempt < MAX_RETRIES:
                    time.sleep(0.8)

            if response is not None and response.status_code == 200:
                # 【关键修改 2】：获取键名对齐 main.py 返回的 "embeddings"
                batch_vectors = response.json()["embeddings"]
                
                # 将文本和对应的向量存入数据库
                for j, vector in enumerate(batch_vectors):
                    vector_database.append({
                        "id": i + j,
                        "content": batch_texts[j],
                        "vector": vector
                    })
                
                print(f"进度: [{min(i + BATCH_SIZE, total_chunks)}/{total_chunks}] 向量化完成...")
            else:
                # 打印具体的报错 JSON，看看是 FastAPI 报的还是模型报的
                status_code = response.status_code if response is not None else "N/A"
                body = response.text if response is not None else ""
                print(f"⚠️ 处理失败 (索引 {i}): 状态码 {status_code}, 内容: {body}")
                if i == 0:
                    print("❌ 首批请求失败，已中止。请先确认 main.py 正在运行。")
                    break
                
        except Exception as e:
            print(f"❌ 连接失败，请确保 main.py 已启动！错误: {e}")
            break

    # 保存到 data 目录
    print(f"💾 正在将向量库写入 {OUTPUT_PATH}...")
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(vector_database, f, ensure_ascii=False, indent=2)

    print("\n" + "="*30)
    print(f"✨ 炼金成功！生成片段: {len(vector_database)}")
    print("="*30)

if __name__ == "__main__":
    process_knowledge()