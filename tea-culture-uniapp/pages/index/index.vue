<template>
  <view class="page">
    <!-- 顶部横幅 -->
    <view class="banner">
      <u-swiper
        :list="swiperList"
        keyName="image"
        height="190"
        circular
        indicator
        indicatorMode="dot"
      ></u-swiper>
      <view class="banner-mask"></view>
      <view class="banner-text">
        <u-text text="茶韵生活" size="20" bold color="#ffffff"></u-text>
        <u-text text="学茶艺 · 懂茶道 · 结茶友" size="12" color="#f3f7f4" margin="8rpx 0 0 0"></u-text>
      </view>
    </view>

    <!-- 功能入口 -->
    <view class="entry-card">
      <view
        v-for="item in quickNavs"
        :key="item.id"
        class="entry-item"
        @click="goPage(item.url)"
      >
        <view class="entry-icon" :style="{ backgroundColor: item.color }">
          <u-icon :name="item.icon" color="#fff" size="26"></u-icon>
        </view>
        <view class="entry-text">
          <u-text :text="item.name" size="12" color="#596066" align="center"></u-text>
        </view>
      </view>
    </view>

    <!-- 今日推荐 -->
    <view class="section">
      <view class="section-head">
        <u-text text="今日推荐" size="18" bold color="#2f3437"></u-text>
        <view class="section-more" @click="goPage('/pages/learning/learning')">
          <u-text text="更多" size="12" color="#8c9399"></u-text>
          <u-icon name="arrow-right" size="12" color="#8c9399"></u-icon>
        </view>
      </view>

      <u-loading-icon v-if="contentLoading" mode="circle" text="加载中..."></u-loading-icon>

      <view v-else>
        <view
          v-for="item in contentList"
          :key="item.id"
          class="recommend-item"
          @click="goDetail(item.id)"
        >
          <u-image
            :src="item.cover_image || '/static/placeholders/cover-square.png'"
            width="120rpx"
            height="120rpx"
            radius="12rpx"
          ></u-image>
          <view class="recommend-info">
            <u-text :text="item.title" size="15" bold color="#2f3437" :lines="2"></u-text>
            <view class="recommend-meta">
              <u-tag :text="formatType(item.type)" size="mini" type="success" plain></u-tag>
              <u-text :text="formatDate(item.create_time)" size="12" color="#9aa1a7"></u-text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 热门茶会 -->
    <view class="section">
      <view class="section-head">
        <u-text text="热门茶会" size="18" bold color="#2f3437"></u-text>
        <view class="section-more" @click="goPage('/pages/community/community')">
          <u-text text="进入社区" size="12" color="#8c9399"></u-text>
          <u-icon name="arrow-right" size="12" color="#8c9399"></u-icon>
        </view>
      </view>

      <u-loading-icon v-if="eventLoading" mode="circle" text="加载中..."></u-loading-icon>

      <view v-else class="event-grid">
        <view
          v-for="party in hotParties"
          :key="party.id"
          class="event-card"
        >
          <view class="event-title">
            <u-text :text="party.title" size="14" bold color="#2f3437" :lines="2"></u-text>
          </view>
          <view class="event-meta">
            <view class="meta-line">
              <u-icon name="map" size="12" color="#9aa1a7"></u-icon>
              <u-text :text="party.city" size="12" color="#9aa1a7" margin="0 0 0 6rpx"></u-text>
            </view>
            <view class="meta-line">
              <u-icon name="clock" size="12" color="#9aa1a7"></u-icon>
              <u-text :text="party.time" size="12" color="#9aa1a7" margin="0 0 0 6rpx"></u-text>
            </view>
          </view>
          <u-tag :text="party.status" size="mini" type="primary"></u-tag>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '../../utils/http.js';

const contentList = ref([]);
const hotParties = ref([]);
const contentLoading = ref(true);
const eventLoading = ref(true);

const swiperList = ref([
  { image: '/static/placeholders/banner.png' },
  { image: '/static/placeholders/banner.png' },
  { image: '/static/placeholders/banner.png' }
]);

const quickNavs = ref([
  { id: 1, name: '茶道百科', icon: 'list', url: '/pages/tea/tea', color: '#5d8a6a' },
  { id: 2, name: '茶艺课程', icon: 'play-circle', url: '/pages/learning/learning', color: '#ff6b6b' },
  { id: 3, name: 'AI问茶', icon: 'chat-fill', url: '/pages/ai-chat/index', color: '#66bb6a' },
  { id: 4, name: '茶叶购买', icon: 'shopping-cart', url: '/pages/service/service', color: '#ffc107' },
  { id: 5, name: '茶具商城', icon: 'gift', url: '/pages/service/service?tab=1', color: '#9c27b0' },
  { id: 6, name: '茶艺认证', icon: 'medal', url: '/pages/service/service?tab=2', color: '#ff9800' }
]);

const formatType = (type) => {
  const map = {
    'tea_category': '百科',
    'brewing': '冲泡',
    'origin_culture': '产地',
    'course': '课程',
    'tea_ware': '茶具',
    'tea_table': '茶席'
  };
  return map[type] || '其他';
};

const formatDate = (value) => {
  if (!value) return '';
  const date = value.split('T')[0] || value.split(' ')[0];
  return date;
};

const fetchContent = async () => {
  try {
    contentLoading.value = true;
    const res = await request({
      url: '/content',
      method: 'GET',
      data: {
        page: 1,
        limit: 6,
        status: 1
      }
    });

    const list = Array.isArray(res)
      ? res
      : (Array.isArray(res.data)
        ? res.data
        : (res.data?.data || res.list || []));

    contentList.value = list.filter(item =>
      ['course', 'tea_ware', 'tea_table'].includes(item.type)
    ).slice(0, 5);
  } catch (e) {
    console.error('首页内容请求失败：', e);
  } finally {
    contentLoading.value = false;
  }
};

const fetchHotEvents = async () => {
  try {
    eventLoading.value = true;
    const res = await request({
      url: '/events',
      method: 'GET',
      data: {
        status: 1,
        page: 1,
        limit: 4
      }
    });

    const list = Array.isArray(res)
      ? res
      : (Array.isArray(res.data)
        ? res.data
        : (res.data?.data || res.list || []));

    hotParties.value = list.map(item => ({
      id: item.id,
      title: item.title,
      city: item.location,
      time: formatDate(item.event_date),
      status: item.status === 1 ? '报名中' : item.status === 2 ? '已满' : '已结束'
    }));
  } catch (e) {
    console.error('首页茶会请求失败：', e);
  } finally {
    eventLoading.value = false;
  }
};

onMounted(() => {
  fetchContent();
  fetchHotEvents();
});

const goDetail = (id) => {
  uni.navigateTo({
    url: `/pages/learning/detail/detail?id=${id}`
  });
};

const goPage = (url) => {
  if (url.includes('/pages/index') || url.includes('/pages/learning') || url.includes('/pages/community') || url.includes('/pages/profile')) {
    uni.switchTab({ url: url.split('?')[0] });
  } else {
    uni.navigateTo({ url });
  }
};
</script>

<style lang="scss" scoped>
.page {
  background: #f5f6f7;
  min-height: 100vh;
  padding-bottom: 30rpx;
}

.banner {
  position: relative;
  padding: 20rpx 20rpx 0;

  :deep(.u-swiper) {
    border-radius: 18rpx;
    overflow: hidden;
    box-shadow: 0 10rpx 22rpx rgba(0, 0, 0, 0.12);
  }

  .banner-mask {
    position: absolute;
    left: 20rpx;
    right: 20rpx;
    bottom: 0;
    height: 70rpx;
    border-radius: 0 0 18rpx 18rpx;
    background: linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.35) 100%);
  }

  .banner-text {
    position: absolute;
    left: 40rpx;
    bottom: 26rpx;
  }
}

.entry-card {
  margin: 20rpx 20rpx 0;
  padding: 24rpx 20rpx 10rpx;
  background: #ffffff;
  border-radius: 18rpx;
  box-shadow: 0 8rpx 18rpx rgba(0, 0, 0, 0.05);
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24rpx;

  .entry-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .entry-text {
    margin-top: 10rpx;
    width: 100%;
    text-align: center;
  }

  .entry-icon {
    width: 90rpx;
    height: 90rpx;
    border-radius: 22rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 6rpx 14rpx rgba(0, 0, 0, 0.08);
  }
}

.section {
  margin: 26rpx 20rpx 0;
  padding: 22rpx 20rpx 8rpx;
  background: #ffffff;
  border-radius: 18rpx;
  box-shadow: 0 8rpx 18rpx rgba(0, 0, 0, 0.04);
}

.section-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16rpx;

  .section-more {
    display: flex;
    align-items: center;
    gap: 6rpx;
  }
}

.recommend-item {
  display: flex;
  gap: 16rpx;
  padding: 14rpx 0;
  border-bottom: 1rpx solid #f0f1f2;

  &:last-child {
    border-bottom: none;
  }

  .recommend-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
  }

  .recommend-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10rpx;
  }
}

.event-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16rpx;
}

.event-card {
  padding: 14rpx;
  border-radius: 14rpx;
  background: #f8f9fb;
  border: 1rpx solid #eef0f2;
  display: flex;
  flex-direction: column;
  gap: 10rpx;

  .event-meta {
    display: flex;
    flex-direction: column;
    gap: 6rpx;
  }

  .meta-line {
    display: flex;
    align-items: center;
  }
}
</style>