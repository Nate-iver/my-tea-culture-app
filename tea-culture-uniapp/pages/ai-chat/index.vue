<template>
  <view class="page">
    <view class="chat-wrapper">
      <scroll-view
        class="chat-scroll"
        scroll-y
        :scroll-into-view="scrollIntoView"
        :scroll-with-animation="true"
      >
        <view class="messages">
          <view
            v-for="(msg, index) in messages"
            :id="`msg-${index}`"
            :key="index"
            class="message-row"
            :class="msg.role === 'user' ? 'row-user' : 'row-ai'"
          >
            <view class="bubble" :class="msg.role === 'user' ? 'bubble-user' : 'bubble-ai'">
              {{ msg.content }}
            </view>
            <view v-if="msg.role === 'ai' && msg.sources && msg.sources.length > 0" class="sources-container">
              <view class="sources-title">参考资料：</view>
              <view v-for="(src, idx) in msg.sources" :key="`${src.name}-${idx}`" class="source-item">
                <view class="source-name">{{ src.name }}</view>
                <view class="source-score">相似度: {{ (src.score * 100).toFixed(1) }}%</view>
                <view
                  class="source-toggle"
                  @click="toggleSource(index, idx)"
                >
                  {{ src.expanded ? '收起参考内容' : '查看参考内容' }}
                </view>
                <view
                  v-if="src.expanded"
                  class="source-toggle"
                >
                  <view class="source-content">{{ src.content }}</view>
                </view>
              </view>
            </view>
            <view v-if="msg.role === 'ai' && msg.lowConfidence" class="confidence-warning">
              ⚠️ 本次检索匹配度较低，回答仅供参考
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <view class="input-bar">
      <input
        v-model="inputText"
        class="question-input"
        placeholder="请输入你的茶文化问题"
        confirm-type="send"
        @confirm="handleSend"
      />
      <button class="send-btn" :disabled="sending" @click="handleSend">
        {{ sending ? '发送中...' : '发送' }}
      </button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      messages: [
        {
          role: 'ai',
          content: '你好，我是你的茶文化助手。你可以问我关于茶叶品类、冲泡方式和茶礼仪的问题。',
          sources: [],
          lowConfidence: false
        }
      ],
      inputText: '',
      sending: false,
      scrollIntoView: ''
    };
  },
  mounted() {
    this.scrollToBottom();
  },
  methods: {
    normalizeSources(sources) {
      if (!Array.isArray(sources)) {
        return [];
      }

      return sources.map((source, index) => {
        const rawContent = source && typeof source.content === 'string' ? source.content.trim() : '';
        const safeContent = rawContent || '暂无参考摘要';
        const safeName = source && source.name ? source.name : `参考资料 ${index + 1}`;
        const score = Number(source && source.score);

        return {
          ...source,
          name: safeName,
          content: safeContent,
          score: Number.isFinite(score) ? score : 0,
          expanded: false
        };
      });
    },
    toggleSource(messageIndex, sourceIndex) {
      const message = this.messages[messageIndex];
      if (!message || !Array.isArray(message.sources) || !message.sources[sourceIndex]) {
        return;
      }

      const source = message.sources[sourceIndex];
      this.$set(message.sources, sourceIndex, {
        ...source,
        expanded: !source.expanded
      });
    },
    scrollToBottom() {
      this.$nextTick(() => {
        if (!this.messages.length) return;
        this.scrollIntoView = `msg-${this.messages.length - 1}`;
      });
    },
    handleSend() {
      const question = this.inputText.trim();
      if (!question || this.sending) {
        return;
      }

      this.messages.push({ role: 'user', content: question });
      this.inputText = '';
      this.scrollToBottom();

      this.sending = true;
      uni.request({
        url: 'http://localhost:3000/api/ai/ask',
        method: 'POST',
        data: {
          question
        },
        success: (res) => {
          const answer = res && res.data && res.data.answer;
          const sources = this.normalizeSources((res && res.data && res.data.sources) || []);
          const lowConfidence = Boolean(res && res.data && res.data.lowConfidence);
          const topScore = Number(res && res.data && res.data.topScore) || 0;
          this.messages.push({
            role: 'ai',
            content: answer || '收到请求，但暂未获取到有效回复。',
            sources,
            lowConfidence,
            topScore
          });
        },
        fail: () => {
          this.messages.push({
            role: 'ai',
            content: '请求失败，请检查网络连接或后端服务状态。'
          });
        },
        complete: () => {
          this.sending = false;
          this.scrollToBottom();
        }
      });
    }
  }
};
</script>

<style scoped>
.page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #eef7ea 0%, #f7fbf5 100%);
}

.chat-wrapper {
  flex: 1;
  overflow: hidden;
  padding: 20rpx 20rpx 160rpx;
}

.chat-scroll {
  height: 100%;
}

.messages {
  display: flex;
  flex-direction: column;
  gap: 20rpx;
}

.message-row {
  display: flex;
}

.row-user {
  justify-content: flex-end;
}

.row-ai {
  justify-content: flex-start;
}

.bubble {
  max-width: 78%;
  padding: 18rpx 22rpx;
  border-radius: 18rpx;
  font-size: 28rpx;
  line-height: 1.6;
  color: #2f4f3a;
  box-shadow: 0 4rpx 10rpx rgba(70, 110, 80, 0.08);
  white-space: pre-wrap;
  word-break: break-word;
}

.bubble-user {
  background-color: #e1f5fe;
  border-top-right-radius: 8rpx;
}

.bubble-ai {
  background-color: #f1f8e9;
  border-top-left-radius: 8rpx;
}

.input-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 18rpx 20rpx 26rpx;
  background: rgba(240, 248, 235, 0.96);
  border-top: 1rpx solid #d6e7cf;
  box-sizing: border-box;
}

.question-input {
  flex: 1;
  height: 76rpx;
  border: 1rpx solid #b8cfb1;
  border-radius: 38rpx;
  padding: 0 28rpx;
  background: #ffffff;
  font-size: 28rpx;
  color: #2f4f3a;
}

.send-btn {
  width: 170rpx;
  height: 76rpx;
  line-height: 76rpx;
  border-radius: 38rpx;
  font-size: 28rpx;
  border: none;
  color: #ffffff;
  background: #7ba56a;
}

.send-btn[disabled] {
  background: #a8c3a0;
  color: #eef5ec;
}

.sources-container {
  margin-top: 10rpx;
  padding: 12rpx 16rpx;
  background: #f0f8e9;
  border-left: 3rpx solid #7ba56a;
  border-radius: 8rpx;
  max-width: 78%;
}

.sources-title {
  font-size: 22rpx;
  font-weight: bold;
  color: #5d8a6a;
  margin-bottom: 8rpx;
}

.source-item {
  margin-bottom: 8rpx;
  padding: 8rpx 0;
  border-bottom: 1rpx solid #d6e7cf;
}

.source-item:last-child {
  border-bottom: none;
  margin-bottom: 0;
}

.source-name {
  font-size: 24rpx;
  color: #2f4f3a;
  font-weight: 500;
}

.source-score {
  font-size: 20rpx;
  color: #7ba56a;
  margin-top: 4rpx;
}

.source-content {
  margin-top: 8rpx;
  font-size: 22rpx;
  color: #45614a;
  line-height: 1.6;
  word-break: break-word;
  white-space: pre-wrap;
}

.source-toggle {
  margin-top: 8rpx;
  color: #5f8d6f;
  font-size: 22rpx;
  font-weight: 500;
}

.confidence-warning {
  margin-top: 10rpx;
  padding: 10rpx 14rpx;
  background: #fff3cd;
  border-left: 3rpx solid #ff9800;
  border-radius: 8rpx;
  font-size: 24rpx;
  color: #ff6b00;
  max-width: 78%;
}
</style>
