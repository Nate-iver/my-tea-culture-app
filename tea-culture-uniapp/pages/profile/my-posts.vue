<template>
  <view class="my-posts-container">
    <!-- 顶部 -->
    <view class="top-bar">
      <u-text text="我的发布" size="20" bold color="#303133"></u-text>
      <u-button 
        icon="plus"
        shape="circle"
        size="small"
        @click="goNewPost"
        customStyle="position: absolute; right: 30rpx;"
      ></u-button>
    </view>

    <!-- 加载状态 -->
    <u-loading-icon v-if="loading" mode="circle" text="加载中..."></u-loading-icon>

    <!-- 空状态 -->
    <view v-else-if="posts.length === 0" class="empty-state">
      <u-icon name="edit-pen" color="#ccc" size="80"></u-icon>
      <u-text text="暂无发布" size="16" color="#909399" margin="20rpx 0 0 0"></u-text>
    </view>

    <!-- 帖子列表 -->
    <view v-else class="posts-list">
      <view 
        v-for="post in posts" 
        :key="post.id"
        class="post-card"
      >
        <view class="post-header">
          <view class="post-title-section" @click="goPostDetail(post.id)">
            <u-text :text="post.title" size="16" bold color="#303133" :lines="2"></u-text>
          </view>
          <view class="post-actions">
            <u-icon name="edit-pen" size="20" color="#5d8a6a" @click.stop="editPost(post.id)"></u-icon>
            <u-icon name="trash" size="20" color="#ff6b6b" margin="0 0 0 15rpx" @click.stop="deletePost(post.id)"></u-icon>
          </view>
        </view>

        <view class="post-content" @click="goPostDetail(post.id)">
          <u-text :text="post.content" size="14" color="#606266" :lines="3"></u-text>
        </view>

        <view class="post-footer">
          <view class="post-stats">
            <u-icon name="chat" color="#909399" size="16"></u-icon>
            <u-text :text="post.comments || 0" size="12" color="#909399" margin="0 0 0 5rpx"></u-text>
          </view>
          <u-text :text="formatDate(post.created_at)" size="12" color="#bdbdbd"></u-text>
        </view>

        <!-- 状态标签 -->
        <view class="post-status">
          <u-tag 
            :text="post.status === 1 ? '已发布' : '草稿'" 
            :type="post.status === 1 ? 'success' : 'info'"
            size="mini"
          ></u-tag>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '@/utils/http.js';

const loading = ref(false);
const posts = ref([]);

const formatDate = (value) => {
  if (!value) return '';
  const date = value.split('T')[0] || value.split(' ')[0];
  return date;
};

const loadMyPosts = async () => {
  try {
    loading.value = true;
    
    // 获取当前登录用户的信息
    const userInfo = uni.getStorageSync('userInfo');
    if (!userInfo || !userInfo.id) {
      console.error('[my-posts] 未获取到用户信息');
      uni.showToast({ title: '请登录后查看', icon: 'none' });
      return;
    }

    const currentUserId = userInfo.id;
    console.log('[my-posts] 当前用户ID:', currentUserId);

    const res = await request({
      url: '/posts',
      method: 'GET',
      data: {
        page: 1,
        limit: 100  // 增加limit以获取更多帖子
      }
    });

    console.log('[my-posts] 原始响应:', res);

    // 处理响应数据：{ data: [帖子列表], total, page, pageSize }
    let allPosts = [];
    if (Array.isArray(res)) {
      allPosts = res;
    } else if (res && res.data && Array.isArray(res.data)) {
      allPosts = res.data;
    } else if (res && Array.isArray(res.list)) {
      allPosts = res.list;
    }

    // 过滤只显示当前用户的帖子
    posts.value = allPosts.filter(post => post.user_id === currentUserId);
    console.log('[my-posts] 加载完成:', posts.value.length, '条当前用户的帖子');
  } catch (e) {
    console.error('[my-posts] 加载失败:', e);
    uni.showToast({ title: '加载发布失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const deletePost = async (postId) => {
  uni.showModal({
    title: '删除确认',
    content: '确定要删除这个帖子吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({
            url: `/posts/${postId}`,
            method: 'DELETE'
          });

          uni.showToast({ title: '删除成功', icon: 'success' });
          loadMyPosts();
        } catch (e) {
          console.error('删除失败:', e);
          uni.showToast({ title: '删除失败，请重试', icon: 'none' });
        }
      }
    }
  });
};

const editPost = (postId) => {
  uni.navigateTo({
    url: `/pages/community/post/post?id=${postId}`
  });
};

const goPostDetail = (postId) => {
  console.log('[goPostDetail] 跳转到帖子详情:', postId);
  uni.navigateTo({
    url: `/pages/community/detail/detail?id=${postId}`
  });
};

const goNewPost = () => {
  uni.navigateTo({
    url: '/pages/community/post/post'
  });
};

onMounted(() => {
  loadMyPosts();
});
</script>

<style lang="scss" scoped>
.my-posts-container {
  min-height: 100vh;
  background-color: #f5f5f5;

  .top-bar {
    padding: 30rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #f0f0f0;
    position: relative;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 30rpx;
    text-align: center;
  }

  .posts-list {
    padding: 20rpx;

    .post-card {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-bottom: 15rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
      position: relative;

      .post-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        margin-bottom: 15rpx;
        gap: 10rpx;

        .post-title-section {
          flex: 1;
        }

        .post-actions {
          display: flex;
          gap: 10rpx;
          flex-shrink: 0;
        }
      }

      .post-content {
        margin-bottom: 15rpx;
      }

      .post-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding-top: 15rpx;
        border-top: 1rpx solid #f0f0f0;

        .post-stats {
          display: flex;
          align-items: center;
        }
      }

      .post-status {
        position: absolute;
        top: 20rpx;
        right: 20rpx;
      }
    }
  }
}
</style>
