<template>
  <view class="community-container">

    <!-- 茶会活动入口 -->
    <view class="teaparty-banner" @click="goTeaParty">
      <view class="banner-left">
        <u-icon name="calendar" color="#5d8a6a" size="24"></u-icon>
        <view class="banner-text">
          <u-text text="线下茶会" size="16" bold color="#303133"></u-text>
          <u-text text="发现同城茶友，参加线下活动" size="12" color="#909399" margin="5rpx 0 0 0"></u-text>
        </view>
      </view>
      <u-icon name="arrow-right" color="#909399" size="16"></u-icon>
    </view>

    <view class="post-list">
      <view v-for="(item, index) in postList" :key="item.id" class="post-item" @click="goDetail(item.id)">
        <view class="post-header">
          <u-avatar :src="item.avatar || ''" :text="item.username ? item.username.substring(0,1) : '茶'" size="30"></u-avatar>
          <view class="user-info">
            <view class="user-name-box">
               <text class="username">{{ item.username || '匿名茶友' }}</text>
               <text class="type-tag" v-if="item.type">{{ formatType(item.type) }}</text>
            </view>
            <text class="time">{{ formatPostTime(item.create_time) }}</text>
          </view>
        </view>
        
        <view class="post-content">
          <text class="post-title">{{ item.title }}</text>
          <text class="post-desc">{{ item.content }}</text>
        </view>
        
        <view class="post-footer">
          <view class="post-stats">
            <u-icon name="chat" color="#909399" size="18"></u-icon>
            <u-text :text="item.comments || 0" size="14" color="#909399" margin="0 0 0 8rpx"></u-text>
          </view>
        </view>
      </view>
      
      <u-loadmore :status="loadStatus" />
    </view>

    <view class="fab-btn" @click="goPost">
      <u-icon name="plus" color="#fff" size="24"></u-icon>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app';
import { request } from '@/utils/http.js';

const postList = ref([]);
const page = ref(1);
const loadStatus = ref('loadmore');
const currentCategory = ref(0);
const isRefreshing = ref(false);

// 格式化类型
const formatType = (type) => {
  const map = {
    'tasting_note': '品茶笔记',
    'discussion': '茶友交流',
    'tea_party': '线下茶会',
    'brewing': '冲泡心得',
    'teaware': '茶具分享'
  };
  return map[type] || '其它';
};

const formatPostTime = (value) => {
  if (!value) return '刚刚';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const hh = String(date.getHours()).padStart(2, '0');
  const mm = String(date.getMinutes()).padStart(2, '0');
  return `${y}-${m}-${d} ${hh}:${mm}`;
};

const getPosts = async (isRefresh = false) => {
  if (isRefresh) {
    isRefreshing.value = true;
  }

  if (isRefresh) {
    page.value = 1;
  }
  
  loadStatus.value = 'loading';

  try {
    const res = await request({
      url: '/posts',
      data: {
        page: page.value,
        limit: 10
      }
    });

    console.log('后端返回的原始数据:', res);

    // 【关键修复】统一使用后端返回的 list 字段
    const newList = res.list || [];
    const total = res.total || 0;

    if (isRefresh) {
      postList.value = newList;
    } else {
      postList.value = [...postList.value, ...newList];
    }

    // 更新加载状态
    if (postList.value.length >= total) {
      loadStatus.value = 'nomore';
    } else {
      loadStatus.value = 'loadmore';
    }
  } catch (e) {
    console.error('获取社区列表失败:', e);
    loadStatus.value = 'loadmore';
  } finally {
    if (isRefresh) {
      uni.stopPullDownRefresh();
      isRefreshing.value = false;
    }
  }
};

onPullDownRefresh(() => {
  getPosts(true);
});

onReachBottom(() => {
  if (loadStatus.value === 'nomore' || loadStatus.value === 'loading') return;
  page.value++;
  getPosts();
});

onMounted(() => {
  getPosts();
});

const goPost = () => {
  const token = uni.getStorageSync('token');
  if (!token) {
    return uni.navigateTo({ url: '/pages/login/login' });
  }
  uni.navigateTo({ url: '/pages/community/post/post' });
};

const goTeaParty = () => {
  uni.navigateTo({
    url: '/pages/community/teaparty/teaparty'
  });
};

const goDetail = (id) => {
  uni.navigateTo({ url: `/pages/community/detail/detail?id=${id}` });
};
</script>

<style lang="scss" scoped>
.community-container {
  background-color: #f7f8fa;
  min-height: 100vh;
  padding-bottom: 20rpx;

  .category-tabs {
    background-color: #fff;
    padding: 20rpx 0;
  }

  .teaparty-banner {
    display: flex;
    justify-content: space-between;
    align-items: center;
    background: linear-gradient(135deg, #f5f9f6 0%, #e8f5ea 100%);
    margin: 20rpx;
    padding: 25rpx;
    border-radius: 16rpx;
    box-shadow: 0 4rpx 12rpx rgba(93, 138, 106, 0.1);

    .banner-left {
      display: flex;
      align-items: center;

      .banner-text {
        margin-left: 15rpx;
      }
    }
  }

  .post-list {
    padding: 0 20rpx;
  }

  .header { padding: 20rpx 10rpx; }

  .post-item {
    background-color: #fff;
    border-radius: 16rpx;
    padding: 30rpx;
    margin-bottom: 20rpx;
    box-shadow: 0 2rpx 10rpx rgba(0,0,0,0.05);
    
    .post-header {
      display: flex;
      align-items: center;
      margin-bottom: 20rpx;
      .user-info {
        margin-left: 20rpx;
        flex: 1;
        .user-name-box {
          display: flex;
          align-items: center;
          .username { font-size: 28rpx; color: #333; font-weight: bold; }
          .type-tag {
            font-size: 20rpx;
            color: #3c9cff;
            background: rgba(60, 156, 255, 0.1);
            padding: 2rpx 12rpx;
            border-radius: 4rpx;
            margin-left: 10rpx;
          }
        }
        .time { font-size: 22rpx; color: #999; }
      }
    }

    .post-content {
      .post-title { font-size: 32rpx; color: #333; font-weight: bold; display: block; margin-bottom: 10rpx; }
      .post-desc { 
        font-size: 28rpx; 
        color: #666; 
        line-height: 1.6;
        display: -webkit-box;
        -webkit-box-orient: vertical;
        -webkit-line-clamp: 3; // 最多显示3行
        line-clamp: 3;
        overflow: hidden;
      }
    }

    .post-footer {
      display: flex;
      margin-top: 20rpx;
      border-top: 1rpx solid #f5f5f5;
      padding-top: 20rpx;
      
      .post-stats {
        display: flex;
        align-items: center;
      }
    }
  }

  .fab-btn {
    position: fixed;
    right: 40rpx;
    bottom: 120rpx;
    width: 100rpx;
    height: 100rpx;
    background: linear-gradient(135deg, #5d8a6a 0%, #4a7057 100%);
    border-radius: 50%;
    display: flex;
    justify-content: center;
    align-items: center;
    box-shadow: 0 8rpx 20rpx rgba(93, 138, 106, 0.4);
    z-index: 99;
  }
}
</style>