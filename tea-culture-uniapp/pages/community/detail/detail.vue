<template>
  <view class="detail-container">
    <view class="post-main" v-if="post">
      <view class="post-header">
        <view class="user-left">
          <u-avatar :text="post.username ? post.username.substring(0,1) : '茶'" size="40"></u-avatar>
          <view class="user-info">
            <text class="username">{{ post.username || '茶友' }}</text>
            <text class="time">{{ post.create_time }}</text>
          </view>
        </view>
        <view v-if="canDelete" class="delete-btn" @tap.stop="deleteCurrentPost">
          <u-icon name="trash" size="14" color="#ff6b6b"></u-icon>
          <text class="delete-text">删除</text>
        </view>
      </view>
      <text class="title">{{ post.title }}</text>
      <text class="content">{{ post.content }}</text>
    </view>
    <u-empty v-else text="帖子不存在或加载失败" mode="data" margin-top="80"></u-empty>

    <view class="comment-section" v-if="post">
      <view class="section-title">全部评论 ({{ commentList.length }})</view>
      
      <view v-for="(item, index) in commentList" :key="item.id" class="comment-item">
        <u-avatar :text="(item.username && item.username.substring(0, 1)) || '友'" size="24" bg-color="#eee"></u-avatar>
        <view class="comment-right">
          <view class="comment-user-line">
            <text class="comment-user">{{ item.username || '匿名茶友' }}</text>
            <view v-if="canDeleteComment(item)" class="comment-delete-btn" @tap.stop="deleteComment(item.id)">
              <u-icon name="trash" size="13" color="#ff6b6b"></u-icon>
              <text class="delete-text">删除</text>
            </view>
          </view>
          <view class="comment-text">{{ item.content }}</view>
          <view class="comment-time">{{ item.create_time }}</view>
        </view>
      </view>

      <u-empty v-if="commentList.length === 0" text="暂无评论, 快来抢沙发" mode="message" margin-top="40"></u-empty>
    </view>

    <view v-if="post" class="comment-bar-placeholder"></view>
    <view v-if="post" class="comment-bar">
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
import { ref, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request } from '@/utils/http.js';

const postId = ref(null);
const post = ref(null);
const commentList = ref([]);
const total = ref(0);
const commentText = ref('');
const submitting = ref(false);
const currentUserId = ref(null);
const canDelete = computed(() => {
  if (!post.value || currentUserId.value === null) return false;
  return Number(post.value.user_id) === Number(currentUserId.value);
});

const loadCurrentUser = () => {
  const userInfo = uni.getStorageSync('userInfo');
  currentUserId.value = userInfo?.id ?? null;
};

onLoad((options) => {
  const rawId = options?.id ?? options?.postId;
  const normalizedId = Number(rawId);
  if (!rawId || Number.isNaN(normalizedId) || normalizedId <= 0) {
    uni.showToast({ title: '帖子参数异常', icon: 'none' });
    setTimeout(() => {
      uni.navigateBack();
    }, 800);
    return;
  }

  postId.value = normalizedId;
  loadCurrentUser();
  initDetailPage();
});

const initDetailPage = async () => {
  const loaded = await loadPostDetail();
  if (loaded) {
    loadComments();
  }
};

// 获取帖子详情 (假设你后端 posts 路由有 getById)
const loadPostDetail = async () => {
  if (!postId.value) return false;

  try {
    const res = await request({ url: `/posts/${postId.value}` });
    post.value = res;
    return true;
  } catch (e) {
    console.error('[detail] 加载帖子详情失败:', e);
    return false;
  }
};

// 获取评论列表 (对应你的 listByPost)
const loadComments = async () => {
  if (!postId.value) return;

  try {
    const res = await request({ 
      url: `/posts/${postId.value}/comments`, // 确保你的后端路由挂载路径正确
      method: 'GET'
    });
    commentList.value = Array.isArray(res?.list) ? res.list : [];
    total.value = Number(res?.total || commentList.value.length);
  } catch (e) {
    console.error('[detail] 加载评论失败:', e);
  }
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

const canDeleteComment = (comment) => {
  if (!comment || currentUserId.value === null) return false;
  const isCommentAuthor = Number(comment.user_id) === Number(currentUserId.value);
  const isPostAuthor = post.value && Number(post.value.user_id) === Number(currentUserId.value);
  return isCommentAuthor || isPostAuthor;
};

const deleteComment = (commentId) => {
  uni.showModal({
    title: '删除评论',
    content: '确定要删除这条评论吗？',
    success: async (res) => {
      if (!res.confirm) return;
      try {
        await request({
          url: `/posts/${postId.value}/comments/${commentId}`,
          method: 'DELETE'
        });

        uni.showToast({ title: '删除成功', icon: 'success' });
        loadComments();
      } catch (e) {
        uni.showToast({ title: e?.message || '删除失败，请重试', icon: 'none' });
      }
    }
  });
};

const deleteCurrentPost = () => {
  if (!canDelete.value) return;

  uni.showModal({
    title: '删除确认',
    content: '确定要删除这个帖子吗？',
    success: async (res) => {
      if (!res.confirm) return;
      try {
        await request({
          url: `/posts/${postId.value}`,
          method: 'DELETE'
        });

        uni.$emit('refreshCommunity');
        uni.showToast({ title: '删除成功', icon: 'success' });
        setTimeout(() => {
          uni.navigateBack();
        }, 500);
      } catch (e) {
        uni.showToast({ title: e?.message || '删除失败，请重试', icon: 'none' });
      }
    }
  });
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
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 30rpx;

      .user-left {
        display: flex;
        align-items: center;
        min-width: 0;
      }

      .user-info {
        margin-left: 20rpx;
        .username { font-size: 28rpx; color: #333; font-weight: bold; display: block; }
        .time { font-size: 22rpx; color: #999; }
      }

      .delete-btn {
        height: 50rpx;
        padding: 0 16rpx;
        border-radius: 25rpx;
        border: 1rpx solid rgba(255, 107, 107, 0.35);
        background: rgba(255, 107, 107, 0.08);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6rpx;

        .delete-text {
          font-size: 22rpx;
          line-height: 1;
          color: #ff6b6b;
        }
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
        .comment-user-line {
          display: flex;
          align-items: center;
          gap: 10rpx;
          margin-bottom: 8rpx;

          .comment-user { font-size: 26rpx; color: #555; font-weight: bold; flex: 1; }
          
          .comment-delete-btn {
            height: 44rpx;
            padding: 0 14rpx;
            border-radius: 22rpx;
            border: 1rpx solid rgba(255, 107, 107, 0.35);
            background: rgba(255, 107, 107, 0.08);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6rpx;
            flex-shrink: 0;

            .delete-text {
              font-size: 20rpx;
              line-height: 1;
              color: #ff6b6b;
              font-weight: 500;
            }

            &:active {
              background: rgba(255, 107, 107, 0.15);
            }
          }
        }
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