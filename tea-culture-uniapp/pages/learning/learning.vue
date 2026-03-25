<template>
  <view class="learning-container">
    <view class="sticky-nav">
      <u-tabs 
        :list="categories" 
        @click="handleTabClick" 
        lineColor="#3c9cff"
        :itemStyle="{ flex: 1, height: '88rpx' }"
        :activeStyle="{ color: '#3c9cff', fontWeight: 'bold' }"
      ></u-tabs>
    </view>

    <view class="content-list">
      <view 
        v-for="(item, index) in list" 
        :key="item.id" 
        class="content-card"
        @click="goDetail(item.id)"
      >
        <image 
          class="cover" 
          :src="item.cover_image || '/static/placeholders/cover-rect.png'" 
          mode="aspectFill"
        ></image>
        <view class="info">
          <view class="title-wrap">
            <u-tag :text="formatType(item.type)" size="mini" type="primary" plain customStyle="margin-right: 10rpx"></u-tag>
            <text class="title">{{ item.title }}</text>
          </view>
          <text class="time">{{ item.create_time.split(' ')[0] }}</text>
        </view>
      </view>

      <u-loadmore :status="loadStatus" v-if="list.length > 0" />
      <u-empty v-if="list.length === 0" mode="list" margin-top="100"></u-empty>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '@/utils/http.js';
import { onReachBottom, onPullDownRefresh } from '@dcloudio/uni-app';

const list = ref([]);
const page = ref(1);
const loadStatus = ref('loadmore');
const currentType = ref(''); // 默认为空，查全部

const categories = [
  { name: '全部', type: '' },
  { name: '茶艺师课程', type: 'course' },
  { name: '茶具知识', type: 'tea_ware' },
  { name: '茶席设计', type: 'tea_table' }
];

const loadData = async (reset = false) => {
  if (reset) {
    page.value = 1;
    list.value = [];
  }
  loadStatus.value = 'loading';

  try {
    const res = await request({
      url: '/content',
      method: 'GET',
      data: {
        page: page.value,
        pageSize: 20,
        type: currentType.value,
        status: 1
      }
    });

    // 从后端获取数据
    let newList = res.list || [];
    
    // 如果是全部类型，只保留 course, tea_ware, tea_table 这三种
    if (!currentType.value) {
      newList = newList.filter(item => 
        ['course', 'tea_ware', 'tea_table'].includes(item.type)
      );
    }
    
    list.value = [...list.value, ...newList];
    
    if (newList.length < 10) {
      loadStatus.value = 'nomore';
    } else {
      loadStatus.value = 'loadmore';
      page.value++;
    }
  } catch (e) {
    console.error('加载数据失败:', e);
    loadStatus.value = 'loadmore';
  } finally {
    uni.stopPullDownRefresh();
  }
};

const handleTabClick = (item) => {
  currentType.value = item.type;
  loadData(true);
};

const formatType = (type) => {
  const find = categories.find(c => c.type === type);
  return find ? find.name : '百科';
};

const goDetail = (id) => {
  uni.navigateTo({
    url: `/pages/learning/detail/detail?id=${id}`
  });
};

onMounted(() => loadData());
onPullDownRefresh(() => loadData(true));
onReachBottom(() => {
  if (loadStatus.value === 'loadmore') loadData();
});
</script>

<style lang="scss" scoped>
.learning-container {
  background-color: #f7f8fa;
  min-height: 100vh;

  .sticky-nav {
    position: sticky;
    top: 0;
    z-index: 10;
    background-color: #fff;
  }

  .content-list {
    padding: 20rpx;

    .content-card {
      display: flex;
      background-color: #fff;
      border-radius: 16rpx;
      padding: 24rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 4rpx 12rpx rgba(0,0,0,0.03);

      .cover {
        width: 180rpx;
        height: 120rpx;
        border-radius: 8rpx;
        flex-shrink: 0;
      }

      .info {
        flex: 1;
        margin-left: 20rpx;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .title-wrap {
          display: flex;
          align-items: flex-start;
          .title {
            font-size: 28rpx;
            color: #333;
            font-weight: bold;
            line-height: 1.4;
          }
        }

        .time {
          font-size: 22rpx;
          color: #999;
        }
      }
    }
  }
}

.sticky-nav {
  position: sticky;
  top: 0;
  z-index: 10;
  background-color: #fff;
  width: 100%;

  /* 核心修复：穿透组件内部，强制让 nav 容器占满 100% 并平分空间 */
  :deep(.u-tabs__wrapper__nav) {
    display: flex !important;
    flex-direction: row;
    width: 100% !important;
    
    /* 让每一个 tab 项目平分空间 */
    .u-tabs__wrapper__nav__item {
      flex: 1 !important;
      padding: 0 !important; // 去掉默认边距，完全由 flex 控制
      display: flex;
      justify-content: center;
    }
  }
}

</style>