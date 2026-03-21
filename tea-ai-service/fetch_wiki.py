from datasets import load_dataset
import re

def clean_text(text):
    """
    简单清洗：去掉维基百科末尾的‘参考文献’、‘外部链接’等噪音
    """
    # 匹配‘参考文献’、‘相关条目’等标题及其之后的所有内容并删除
    noise_patterns = [r'==\s*参考文献\s*==.*', r'==\s*外部链接\s*==.*', r'==\s*相关条目\s*==.*']
    for pattern in noise_patterns:
        text = re.sub(pattern, '', text, flags=re.DOTALL)
    return text.strip()

def download_tea_knowledge():
    print("🚀 正在连接 Hugging Face (不截断模式，获取全文)...")
    
    try:
        # 流式加载中文维基
        dataset = load_dataset(
            "wikimedia/wikipedia", 
            "20231101.zh", 
            streaming=True, 
            split="train"
        )
        
        tea_data = []
        target_count = 50  # 可以稍微多抓几条
        current_count = 0
        
        print("🔍 正在深度检索茶叶相关条目全文...")
        
        for entry in dataset:
            title = entry['title']
            content = entry['text']
            
            # 过滤逻辑：标题带“茶”
            if "茶" in title and len(content) > 100:
                print(f"✅ 抓取全文成功: 【{title}】 (字数: {len(content)})")
                
                # 清洗掉末尾的参考文献等杂质
                cleaned_content = clean_text(content)
                
                # 存入列表，不再限制 800 字
                tea_data.append(f"主题：{title}\n内容：{cleaned_content}\n")
                current_count += 1
            
            if current_count >= target_count:
                break
        
        # 保存到文本文件
        with open("knowledge.txt", "w", encoding="utf-8") as f:
            f.write("\n\n" + "="*50 + "\n\n") # 添加分隔符
            f.write("\n\n".join(tea_data))
            
        print(f"\n✨ 大功告成！已将 {current_count} 条完整百科知识存入 knowledge.txt")
        print("💡 建议：由于现在文档变长了，请确保你的 embed_document.py 开启了『带重叠的切片』功能。")

    except Exception as e:
        print(f"❌ 运行出错: {e}")

if __name__ == "__main__":
    download_tea_knowledge()