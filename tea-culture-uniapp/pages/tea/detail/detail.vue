<template>
  <view class="detail-container">
    <u-loading-icon v-if="loading" mode="circle" text="加载中..."></u-loading-icon>

    <view v-else>
      <!-- 头图 -->
      <u-image 
        v-if="detail.image"
        :src="detail.image" 
        width="100%" 
        height="300rpx"
      ></u-image>

      <!-- 详情内容 -->
      <view class="detail-content">
        <u-text :text="detail.title || detail.name" size="20" bold color="#303133"></u-text>
        
        <view class="meta-info">
          <u-tag :text="detail.category || detail.type" size="mini" type="success" plain></u-tag>
          <u-text :text="detail.create_time || '2026-02-23'" size="12" color="#999" margin="0 0 0 15rpx"></u-text>
        </view>

        <view class="detail-body">
          <rich-text :nodes="detail.content || detail.description"></rich-text>
        </view>

        <!-- 冲泡步骤（针对冲泡教程） -->
        <view v-if="type === 'brewing' && detail.steps" class="brewing-steps">
          <u-text text="冲泡步骤" size="17" bold color="#303133" margin="0 0 20rpx 0"></u-text>
          <view 
            v-for="(step, index) in detail.steps" 
            :key="index"
            class="step-item"
          >
            <view class="step-number">{{ index + 1 }}</view>
            <u-text :text="step" size="14" color="#606266"></u-text>
          </view>
        </view>

        <!-- 相关推荐 -->
        <view class="recommend-section">
          <u-text text="相关推荐" size="17" bold color="#303133" margin="0 0 20rpx 0"></u-text>
          <view class="recommend-list">
            <view 
              v-for="item in recommendations" 
              :key="item.id"
              class="recommend-item"
              @click="goDetail(item.id)"
            >
              <u-image :src="item.image" width="100rpx" height="100rpx" radius="8rpx"></u-image>
              <u-text :text="item.title" size="14" color="#303133" margin="0 0 0 15rpx"></u-text>
            </view>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onLoad } from '@dcloudio/uni-app';
import { request } from '@/utils/http.js';

const loading = ref(true);
const detail = ref({});
const recommendations = ref([]);
const type = ref('');
const id = ref('');

onLoad((options) => {
  id.value = options.id;
  type.value = options.type;
  loadDetail();
});

const loadDetail = async () => {
  try {
    loading.value = true;
    // const res = await request({ 
    //   url: `/tea/${type.value}/${id.value}` 
    // });
    // detail.value = res.data;
    
    // 模拟数据
    detail.value = {
      name: '西湖龙井',
      title: '西湖龙井冲泡指南',
      image: '/static/placeholders/tea.png',
      category: '绿茶',
      type: '冲泡教程',
      create_time: '2026-02-20',
      content: '<p>西湖龙井茶，是中国名茶之首，产于浙江省杭州市西湖龙井村周围群山...</p>',
      description: '详细介绍西湖龙井的冲泡方法、水温控制、器具选择等。',
      steps: [
        '准备：选用透明玻璃杯或白瓷盖碗',
        '投茶：取3-5克龙井茶叶',
        '注水：使用80-85℃的温水',
        '浸泡：静置2-3分钟',
        '品饮：观色、闻香、品味'
      ]
    };
    
    recommendations.value = [
      { id: 2, title: '碧螺春品鉴', image: '/static/placeholders/cover-square.png' },
      { id: 3, title: '黄山毛峰', image: '/static/placeholders/cover-square.png' }
    ];
  } catch (e) {
    console.error('加载详情失败:', e);
  } finally {
    loading.value = false;
  }
};

const goDetail = (itemId) => {
  uni.redirectTo({
    url: `/pages/tea/detail/detail?id=${itemId}&type=${type.value}`
  });
};
</script>

<style lang="scss" scoped>
.detail-container {
  min-height: 100vh;
  background-color: #fff;

  .detail-content {
    padding: 30rpx;

    .meta-info {
      display: flex;
      align-items: center;
      margin: 20rpx 0;
    }

    .detail-body {
      margin-top: 30rpx;
      line-height: 1.8;
      color: #606266;
    }

    .brewing-steps {
      margin-top: 40rpx;
      padding-top: 30rpx;
      border-top: 1rpx solid #f0f0f0;

      .step-item {
        display: flex;
        align-items: flex-start;
        margin-bottom: 25rpx;

        .step-number {
          width: 40rpx;
          height: 40rpx;
          border-radius: 50%;
          background-color: #5d8a6a;
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 14px;
          font-weight: bold;
          margin-right: 15rpx;
          flex-shrink: 0;
        }
      }
    }

    .recommend-section {
      margin-top: 50rpx;
      padding-top: 30rpx;
      border-top: 1rpx solid #f0f0f0;

      .recommend-list {
        .recommend-item {
          display: flex;
          align-items: center;
          padding: 20rpx;
          background-color: #f8f8f8;
          border-radius: 12rpx;
          margin-bottom: 15rpx;
        }
      }
    }
  }
}
</style>
