<template>
  <view class="detail-container">
    <view class="post-main" v-if="post">
      <view class="post-header">
        <u-avatar :text="post.username ? post.username.substring(0,1) : '茶'" size="40"></u-avatar>
        <view class="user-info">
          <text class="username">{{ post.username || '茶友' }}</text>
          <text class="time">{{ post.create_time }}</text>
        </view>
      </view>
      <text class="title">{{ post.title }}</text>
      <text class="content">{{ post.content }}</text>
    </view>

    <view class="comment-section">
      <view class="section-title">全部评论 ({{ commentList.length }})</view>
      
      <view v-for="(item, index) in commentList" :key="item.id" class="comment-item">
        <u-avatar :text="(item.username && item.username.substring(0, 1)) || '友'" size="24" bg-color="#eee"></u-avatar>
        <view class="comment-right">
          <view class="comment-user">{{ item.username || '匿名茶友' }}</view>
          <view class="comment-text">{{ item.content }}</view>
          <view class="comment-time">{{ item.create_time }}</view>
        </view>
      </view>

      <u-empty v-if="commentList.length === 0" text="暂无评论, 快来抢沙发" mode="message" margin-top="40"></u-empty>
    </view>

    <view class="comment-bar-placeholder"></view> <view class="comment-bar">
      <view class="bar-container">
        <view class="input-section">
          <u-icon name="edit-pen" size="18" color="#999"></u-icon>
          <u-input 
            v-model="commentText" 
            placeholder="写下你的茶评..." 
            :border="false"
            customStyle="padding-left: 10rpx"
          ></u-input>
        </view>
        <view class="action-btn" :class="{ 'active': commentText.trim() }" @click="submitComment">
          <text v-if="!submitting">发送</text>
          <u-loading-icon v-else size="16"></u-loading-icon>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request } from '@/utils/http.js';

const postId = ref(null);
const post = ref(null);
const commentList = ref([]);
const total = ref(0);
const commentText = ref('');
const submitting = ref(false);

onLoad((options) => {
  postId.value = options.id;
  loadPostDetail();
  loadComments();
});

// 获取帖子详情 (假设你后端 posts 路由有 getById)
const loadPostDetail = async () => {
  try {
    const res = await request({ url: `/posts/${postId.value}` });
    post.value = res;
  } catch (e) { console.error(e); }
};

// 获取评论列表 (对应你的 listByPost)
const loadComments = async () => {
  try {
    const res = await request({ 
      url: `/posts/${postId.value}/comments`, // 确保你的后端路由挂载路径正确
      method: 'GET'
    });
    commentList.value = res.list;
    total.value = res.total;
  } catch (e) { console.error(e); }
};

// 发表评论 (对应你的 create)
const submitComment = async () => {
  if (!commentText.value.trim()) return;
  
  const userInfo = uni.getStorageSync('userInfo');
  if (!userInfo) return uni.navigateTo({ url: '/pages/login/login' });

  submitting.value = true;
  try {
    await request({
      url: `/posts/${postId.value}/comments`,
      method: 'POST',
      data: {
        user_id: userInfo.id,
        content: commentText.value
      }
    });
    
    uni.showToast({ title: '评论成功' });
    commentText.value = '';
    loadComments(); // 刷新列表
  } catch (e) {
    if (e?.code === 'CONTENT_REJECTED') {
      return uni.showToast({ title: e.reason || '评论内容不符合发布规范', icon: 'none', duration: 2800 });
    }
    if (e?.code === 'MODERATION_SERVICE_UNAVAILABLE') {
      return uni.showToast({ title: '审核服务繁忙，请稍后重试', icon: 'none', duration: 2800 });
    }
    uni.showToast({ title: e?.message || '发表失败', icon: 'none' });
  } finally {
    submitting.value = false;
  }
};
</script>

<style lang="scss" scoped>
.detail-container {
  padding-bottom: 120rpx;
  background-color: #f8f8f8;
  min-height: 100vh;

  .post-main {
    background-color: #fff;
    padding: 30rpx;
    margin-bottom: 20rpx;
    .post-header {
      display: flex; align-items: center; margin-bottom: 30rpx;
      .user-info { margin-left: 20rpx; 
        .username { font-size: 28rpx; color: #333; font-weight: bold; display: block; }
        .time { font-size: 22rpx; color: #999; }
      }
    }
    .title { font-size: 36rpx; font-weight: bold; color: #333; display: block; margin-bottom: 20rpx; }
    .content { font-size: 30rpx; color: #666; line-height: 1.6; }
  }

  .comment-section {
    background-color: #fff; padding: 30rpx;
    .section-title { font-size: 30rpx; font-weight: bold; margin-bottom: 30rpx; border-left: 8rpx solid #3c9cff; padding-left: 20rpx; }
    .comment-item {
      display: flex; margin-bottom: 30rpx;
      .comment-right { flex: 1; margin-left: 20rpx; border-bottom: 1rpx solid #eee; padding-bottom: 20rpx;
        .comment-user { font-size: 26rpx; color: #555; font-weight: bold; }
        .comment-text { font-size: 28rpx; color: #333; margin: 10rpx 0; }
        .comment-time { font-size: 22rpx; color: #999; }
      }
    }
  }

  .footer-input {
    position: fixed; bottom: 0; left: 0; width: 100%; background-color: #fff;
    display: flex; align-items: center; padding: 20rpx 30rpx; box-shadow: 0 -2rpx 10rpx rgba(0,0,0,0.05);
    .input-box { flex: 1; background-color: #f5f5f5; border-radius: 40rpx; padding: 0 30rpx; margin-right: 20rpx; }
  }
}

/* 占位符，高度与底部栏一致 */
.comment-bar-placeholder {
  height: calc(110rpx + env(safe-area-inset-bottom));
  width: 100%;
}

.comment-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  z-index: 9999; /* 极高层级 */
  background-color: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px); /* 毛玻璃效果 */
  border-top: 1rpx solid rgba(0, 0, 0, 0.05);
  padding-bottom: env(safe-area-inset-bottom); /* 适配刘海屏底部 */
  box-shadow: 0 -8rpx 30rpx rgba(0, 0, 0, 0.05);

  .bar-container {
    display: flex;
    align-items: center;
    padding: 20rpx 30rpx;
    height: 110rpx;
    box-sizing: border-box;

    .input-section {
      flex: 1;
      height: 72rpx;
      background-color: #f2f3f5;
      border-radius: 36rpx;
      display: flex;
      align-items: center;
      padding: 0 24rpx;
      margin-right: 20rpx;
      transition: all 0.3s;

      &:focus-within {
        background-color: #fff;
        border: 2rpx solid #3c9cff;
      }
    }

    .action-btn {
      width: 120rpx;
      height: 72rpx;
      background-color: #f2f3f5;
      color: #999;
      border-radius: 36rpx;
      display: flex;
      justify-content: center;
      align-items: center;
      font-size: 28rpx;
      font-weight: bold;
      transition: all 0.3s;

      &.active {
        background-color: #3c9cff;
        color: #fff;
        box-shadow: 0 4rpx 12rpx rgba(60, 156, 255, 0.3);
      }

      &:active {
        transform: scale(0.95);
      }
    }
  }
}
</style>