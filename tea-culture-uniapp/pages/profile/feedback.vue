<template>
  <view class="feedback-container">
    <view class="header-tip">
      <u-icon name="chat-fill" size="28" color="#5d8a6a"></u-icon>
      <u-text text="您的反馈对我们很重要" size="16" bold color="#303133" margin="0 0 0 15rpx"></u-text>
    </view>

    <view class="form-section">
      <!-- 反馈内容 -->
      <view class="form-item">
        <view class="item-label">
          <u-text text="反馈内容" size="14" bold color="#303133"></u-text>
          <u-text text="*" size="14" color="#ff6b6b" margin="0 0 0 5rpx"></u-text>
        </view>
        <u-textarea 
          v-model="content"
          placeholder="请详细描述您的问题或建议，我们会认真阅读..."
          :maxlength="500"
          count
          :autoHeight="true"
          customStyle="background-color: #f8f9fa; border-radius: 12rpx; padding: 20rpx;"
        ></u-textarea>
      </view>
    </view>

    <!-- 提交按钮 -->
    <view class="submit-section">
      <u-button 
        text="提交反馈" 
        type="primary"
        :loading="submitting"
        :disabled="!canSubmit"
        customStyle="height: 88rpx; font-size: 32rpx;"
        @click="handleSubmit"
      ></u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue';
import { request } from '@/utils/http.js';

const content = ref('');
const submitting = ref(false);

const canSubmit = computed(() => {
  return content.value.trim().length >= 10;
});

const handleSubmit = async () => {
  if (!canSubmit.value) {
    uni.showToast({
      title: '请至少输入10个字',
      icon: 'none'
    });
    return;
  }

  try {
    submitting.value = true;
    
    // 获取用户信息中的 user_id
    const userInfo = uni.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      uni.showToast({
        title: '用户信息丢失，请重新登录',
        icon: 'none'
      });
      return;
    }
    
    await request({
      url: '/feedback',
      method: 'POST',
      data: {
        content: content.value.trim(),
        user_id: userInfo.id
      }
    });

    uni.showToast({
      title: '提交成功',
      icon: 'success'
    });

    // 重置表单
    content.value = '';
    
    // 1秒后返回
    setTimeout(() => {
      uni.navigateBack();
    }, 1000);

  } catch (error) {
    console.error('提交反馈失败:', error);
    uni.showToast({
      title: error.message || '提交失败',
      icon: 'none'
    });
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.feedback-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 30rpx;

  .header-tip {
    display: flex;
    align-items: center;
    background: linear-gradient(135deg, #f8fdf9 0%, #e8f5e9 100%);
    padding: 30rpx;
    border-radius: 16rpx;
    margin-bottom: 30rpx;
    border: 1px solid #c8e6c9;
  }

  .form-section {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 30rpx;

    .form-item {
      margin-bottom: 30rpx;

      &:last-child {
        margin-bottom: 0;
      }

      .item-label {
        display: flex;
        align-items: center;
        margin-bottom: 15rpx;
      }
    }
  }

  .submit-section {
    margin-bottom: 40rpx;
  }
}
</style>
