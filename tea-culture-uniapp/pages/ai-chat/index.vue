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
          content: '你好，我是你的茶文化助手。你可以问我关于茶叶品类、冲泡方式和茶礼仪的问题。'
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
          this.messages.push({
            role: 'ai',
            content: answer || '收到请求，但暂未获取到有效回复。'
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
</style>
