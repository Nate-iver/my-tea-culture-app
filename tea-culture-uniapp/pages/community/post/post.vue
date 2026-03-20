<template>
  <view style="padding: 20px;">
    <u-input v-model="form.title" placeholder="请输入标题" border="bottom"></u-input>
    <u-textarea v-model="form.content" placeholder="分享你的茶生活..." count></u-textarea>
    <view style="margin: 20px 0;">
      <u-radio-group v-model="form.type" placement="row">
        <u-radio label="话题讨论" name="discussion"></u-radio>
        <u-radio label="品茶笔记" name="tasting_note" customStyle="margin-left: 20px"></u-radio>
      </u-radio-group>
    </view>
    <u-button type="primary" text="发布帖子" @click="submitPost" :loading="loading"></u-button>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { request } from '@/utils/http.js';

const form = ref({ 
  title: '', 
  content: '',
  type: 'discussion' // 默认类型
});
const loading = ref(false);

const submitPost = async () => {
  if (!form.value.title || !form.value.content) {
    return uni.showToast({title:'请填写完整', icon:'none'});
  }

  // 【关键修复】从缓存获取当前登录用户的 ID
  const userInfo = uni.getStorageSync('userInfo');
  if (!userInfo || !userInfo.id) {
    uni.showToast({title: '请先登录', icon: 'none'});
    return setTimeout(() => uni.navigateTo({url: '/pages/login/login'}), 1500);
  }

  loading.value = true;
  try {
    await request({
      url: '/posts',
      method: 'POST',
      data: {
        ...form.value,
        user_id: userInfo.id, // 【核心】补齐后端要求的 user_id
        status: 1            // 【核心】设为 1，否则你列表查不出来（后端默认是0）
      }
    });
    
    uni.showToast({ title: '发布成功' });
    // 发送成功后通知社区列表刷新
    uni.$emit('refreshCommunity');
    setTimeout(() => uni.navigateBack(), 1500);
  } catch (e) {
    console.error('发布失败详情:', e);
    // 这里如果报错，去 F12 Network 看一眼 Response
    uni.showToast({ title: e.message || '发布失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};
</script>