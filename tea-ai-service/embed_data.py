import json
import requests
import os

# 配置路径
DATA_PATH = os.path.join("data", "tea_data.json")
OUTPUT_PATH = os.path.join("data", "tea_with_vectors.json")
API_URL = "http://127.0.0.1:8000/embed"

def generate_vectors():
    # 1. 读取原始茶叶数据
    if not os.path.exists(DATA_PATH):
        print(f"错误：找不到文件 {DATA_PATH}，请确认你已经创建了该文件。")
        return

    with open(DATA_PATH, "r", encoding="utf-8") as f:
        tea_list = json.load(f)

    # 2. 提取所有文字内容
    all_contents = [item["content"] for item in tea_list]
    
    print(f"正在发送 {len(all_contents)} 条数据到 AI 服务进行向量化...")

    try:
        # 3. 呼叫你正在运行的 FastAPI 接口
        response = requests.post(API_URL, json={"texts": all_contents})
        response.raise_for_status()
        
        # 拿到返回的 768 维向量列表
        embeddings = response.json()["embeddings"]

        # 4. 将向量拼接到原始数据中
        for i, item in enumerate(tea_list):
            item["vector"] = embeddings[i]

        # 5. 保存结果
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            json.dump(tea_list, f, ensure_ascii=False, indent=2)
        
        print(f"成功！向量数据库已生成至: {OUTPUT_PATH}")
        print("现在你可以把这个 JSON 文件交给 Express 后端进行语义搜索了。")

    except Exception as e:
        print(f"转换失败，请确保你的 main.py 服务正在运行 (8000端口)。错误信息: {e}")

if __name__ == "__main__":
    generate_vectors()