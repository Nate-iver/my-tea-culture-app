<template>
  <view class="article-container" v-if="article">
    <view class="header">
      <text class="title">{{ article.title }}</text>
      <view class="meta">
        <text class="tag">{{ article.type }}</text>
        <text class="time">{{ article.create_time }}</text>
      </view>
    </view>
    
    <image v-if="article.cover_image" :src="article.cover_image" mode="widthFix" class="main-img"></image>

    <view class="content-body">
      <u-parse :content="article.content"></u-parse>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request } from '@/utils/http.js';

const article = ref(null);

onLoad(async (options) => {
  const res = await request({
    url: `/content/${options.id}`
  });
  article.value = res;
});
</script>

<style lang="scss" scoped>
.article-container {
  padding: 40rpx 30rpx;
  background-color: #fff;
  min-height: 100vh;

  .header {
    margin-bottom: 30rpx;
    .title { font-size: 40rpx; font-weight: bold; color: #333; line-height: 1.4; }
    .meta { 
      margin-top: 20rpx; display: flex; align-items: center;
      .tag { color: #3c9cff; font-size: 24rpx; background: #eef7ff; padding: 4rpx 12rpx; border-radius: 4rpx; margin-right: 20rpx; }
      .time { color: #999; font-size: 24rpx; }
    }
  }

  .main-img { width: 100%; border-radius: 12rpx; margin-bottom: 30rpx; }
  .content-body { font-size: 30rpx; color: #444; line-height: 1.8; }
}
</style>