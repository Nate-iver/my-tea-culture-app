from datasets import load_dataset
import re
import os

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
OUTPUT_PATH = os.path.join(BASE_DIR, "data", "knowledge.txt")

TEA_CORE_KEYWORDS = {
    "茶", "茶叶", "茶树", "茶文化", "茶道", "茶艺", "茶史", "茶汤",
    "绿茶", "红茶", "乌龙茶", "白茶", "黄茶", "黑茶", "普洱", "龙井",
    "碧螺春", "铁观音", "大红袍", "岩茶", "安吉白茶", "茉莉花茶"
}

TEA_WEAK_KEYWORDS = {
    "电视剧", "电影", "动画", "游戏", "专辑", "歌曲", "乐队", "演员",
    "角色", "地铁站", "道路", "行政区", "公司", "品牌", "高校", "学校"
}

DISAMBIG_PATTERNS = [
    r"\(消歧义\)",
    r"^消歧义",
    r"可能指",
    r"可以指",
    r"同名",
]

def clean_text(text):
    """
    清洗正文：去掉维基百科末尾噪音标题、模板痕迹和空白行
    """
    # 匹配“参考文献/外部链接/相关条目”等标题及其之后的所有内容
    noise_patterns = [
        r'==\s*参考文献\s*==.*',
        r'==\s*外部链接\s*==.*',
        r'==\s*相关条目\s*==.*',
        r'==\s*注释\s*==.*',
    ]
    for pattern in noise_patterns:
        text = re.sub(pattern, '', text, flags=re.DOTALL)

    # 去掉模板或标记残留
    text = re.sub(r'\{\{[^{}]*\}\}', '', text)
    text = re.sub(r'\[\[[^\]]*\]\]', '', text)

    # 压缩多余空白
    text = re.sub(r'\n\s*\n+', '\n\n', text)
    return text.strip()


def is_disambiguation_page(title, content):
    for pattern in DISAMBIG_PATTERNS:
        if re.search(pattern, title):
            return True

    head = content[:300]
    disambig_signals = ["可能指", "可以指", "本条目是消歧义", "消歧义页"]
    return any(signal in head for signal in disambig_signals)


def tea_relevance_score(title, content):
    text = f"{title}\n{content[:1200]}"

    core_hits = sum(1 for kw in TEA_CORE_KEYWORDS if kw in text)
    weak_hits = sum(1 for kw in TEA_WEAK_KEYWORDS if kw in text)

    # 标题命中茶关键词时提高分数，避免误杀茶类主词条
    title_bonus = 2 if any(kw in title for kw in TEA_CORE_KEYWORDS) else 0
    return core_hits + title_bonus - weak_hits


def is_weak_topic(title, content):
    score = tea_relevance_score(title, content)
    # 阈值可按召回效果调整：当前偏保守，优先保证茶主题纯度
    return score < 2

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
        target_count = 300  # 可以稍微多抓几条
        current_count = 0
        dropped_disambiguation = 0
        dropped_weak = 0
        
        print("🔍 正在深度检索茶叶相关条目全文...")
        
        for entry in dataset:
            title = entry['title']
            content = entry['text']

            # 基础门槛
            if len(content) <= 100:
                continue

            # 第一层：必须与“茶”相关（标题或正文出现）
            if "茶" not in title and "茶" not in content[:500]:
                continue

            # 第二层：去掉消歧义页
            if is_disambiguation_page(title, content):
                dropped_disambiguation += 1
                continue

            # 第三层：去掉弱相关主题
            if is_weak_topic(title, content):
                dropped_weak += 1
                continue

            cleaned_content = clean_text(content)
            if len(cleaned_content) < 80:
                continue

            print(f"✅ 抓取全文成功: 【{title}】 (字数: {len(cleaned_content)})")
            tea_data.append(f"主题：{title}\n内容：{cleaned_content}\n")
            current_count += 1
            
            if current_count >= target_count:
                break
        
        # 保存到 data/knowledge.txt
        os.makedirs(os.path.dirname(OUTPUT_PATH), exist_ok=True)
        with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
            f.write("\n\n" + "="*50 + "\n\n") # 添加分隔符
            f.write("\n\n".join(tea_data))
            
        print(f"\n✨ 大功告成！已将 {current_count} 条完整百科知识存入 {OUTPUT_PATH}")
        print(f"🧹 已过滤消歧义词条: {dropped_disambiguation} 条")
        print(f"🧪 已过滤弱相关词条: {dropped_weak} 条")
        print("💡 建议：由于现在文档变长了，请确保你的 embed_data.py 开启了『带重叠的切片』功能。")

    except Exception as e:
        print(f"❌ 运行出错: {e}")

if __name__ == "__main__":
    download_tea_knowledge()