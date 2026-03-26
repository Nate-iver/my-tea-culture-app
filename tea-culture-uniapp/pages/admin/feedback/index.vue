<template>
  <view class="feedback-admin-container">
    <view class="header">
      <u-icon name="arrow-left" size="22" @click="goBack"></u-icon>
      <u-text text="用户反馈管理" size="18" bold color="#303133"></u-text>
      <view style="width: 44rpx;"></view>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-section">
      <view class="stat-card">
        <u-text :text="stats.total" size="28" bold color="#303133"></u-text>
        <u-text text="总反馈数" size="13" color="#909399" margin="5rpx 0 0 0"></u-text>
      </view>
      <view class="stat-card">
        <u-text :text="stats.pending" size="28" bold color="#ff9800"></u-text>
        <u-text text="待处理" size="13" color="#909399" margin="5rpx 0 0 0"></u-text>
      </view>
      <view class="stat-card">
        <u-text :text="stats.handled" size="28" bold color="#4caf50"></u-text>
        <u-text text="已处理" size="13" color="#909399" margin="5rpx 0 0 0"></u-text>
      </view>
    </view>

    <!-- 筛选器 -->
    <view class="filter-section">
      <view class="filter-tabs">
        <view 
          v-for="tab in filterTabs" 
          :key="tab.value"
          class="tab-item"
          :class="{ active: filterStatus === tab.value }"
          @click="changeFilter(tab.value)"
        >
          <u-text :text="tab.label" size="14" :color="filterStatus === tab.value ? '#5d8a6a' : '#606266'"></u-text>
        </view>
      </view>
    </view>

    <!-- 反馈列表 -->
    <u-loading-icon v-if="loading" mode="circle" text="加载中..."></u-loading-icon>

    <view v-else-if="filteredList.length > 0" class="feedback-list">
      <view v-for="item in filteredList" :key="item.id" class="feedback-item" @click="viewDetail(item)">
        <view class="item-header">
          <view class="user-info">
            <u-avatar :text="getDisplayName(item)" size="35"></u-avatar>
            <u-text :text="getDisplayName(item)" size="14" bold color="#303133" margin="0 0 0 15rpx"></u-text>
          </view>
          <u-tag 
            :text="item.status === 0 ? '待处理' : '已处理'" 
            :type="item.status === 0 ? 'warning' : 'success'"
            size="mini"
          ></u-tag>
        </view>

        <view class="item-content">
          <u-text :text="item.content" size="14" color="#606266" :lines="3"></u-text>
        </view>

        <view class="item-footer">
          <u-text :text="formatTime(item.create_time)" size="12" color="#909399"></u-text>
          <view class="actions">
            <u-button 
              v-if="item.status === 0"
              text="标记已处理" 
              type="success"
              size="mini"
              plain
              @click.stop="handleFeedback(item.id)"
            ></u-button>
            <u-button 
              text="删除" 
              type="error"
              size="mini"
              plain
              @click.stop="deleteFeedback(item.id)"
            ></u-button>
          </view>
        </view>
      </view>
    </view>

    <view v-else class="empty-tip">
      <u-empty mode="list" text="暂无反馈数据"></u-empty>
    </view>

    <!-- 详情弹窗 -->
    <u-popup 
      :show="showDetail" 
      @close="showDetail = false"
      mode="center"
      :round="20"
      :closeable="true"
    >
      <view class="detail-popup">
        <view class="popup-title">
          <u-text text="反馈详情" size="18" bold color="#303133"></u-text>
        </view>

        <view v-if="currentItem" class="detail-content">
          <view class="detail-row">
            <u-text text="用户" size="13" color="#909399"></u-text>
            <u-text :text="getDisplayName(currentItem)" size="14" bold color="#303133"></u-text>
          </view>

          <view class="detail-row">
            <u-text text="状态" size="13" color="#909399"></u-text>
            <u-tag 
              :text="currentItem.status === 0 ? '待处理' : '已处理'" 
              :type="currentItem.status === 0 ? 'warning' : 'success'"
              size="mini"
            ></u-tag>
          </view>

          <view class="detail-row">
            <u-text text="提交时间" size="13" color="#909399"></u-text>
            <u-text :text="formatTime(currentItem.create_time)" size="14" color="#606266"></u-text>
          </view>

          <view class="detail-full">
            <u-text text="反馈内容" size="13" color="#909399" margin="0 0 15rpx 0"></u-text>
            <view class="content-box">
              <u-text :text="currentItem.content" size="14" color="#303133"></u-text>
            </view>
          </view>
        </view>

        <view class="popup-actions">
          <u-button 
            v-if="currentItem && currentItem.status === 0"
            text="标记已处理" 
            type="success"
            customStyle="flex: 1; margin-right: 15rpx;"
            @click="handleFeedback(currentItem.id)"
          ></u-button>
          <u-button 
            text="关闭" 
            type="primary"
            plain
            customStyle="flex: 1;"
            @click="showDetail = false"
          ></u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { request } from '@/utils/http.js';
import { checkPermission, backToAdminHome } from '@/utils/auth.js';

const filterTabs = [
  { value: 'all', label: '全部' },
  { value: 0, label: '待处理' },
  { value: 1, label: '已处理' }
];

const loading = ref(false);
const filterStatus = ref('all');
const feedbackList = ref([]);
const showDetail = ref(false);
const currentItem = ref(null);

const stats = computed(() => {
  const total = feedbackList.value.length;
  const pending = feedbackList.value.filter(item => item.status === 0).length;
  const handled = feedbackList.value.filter(item => item.status === 1).length;
  
  return { total, pending, handled };
});

onMounted(() => {
  if (!checkPermission('admin')) {
    return;
  }
  loadFeedbackList();
});

const getDisplayName = (item) => {
  if (item.username) return item.username;
  if (item.user_id) return `用户#${item.user_id}`;
  return '匿名用户';
};

const loadFeedbackList = async () => {
  try {
    loading.value = true;
    const res = await request({
      url: '/feedback',
      method: 'GET',
      data: { page: 1, pageSize: 100 }
    });
    
    console.log('[反馈列表] 原始响应:', res);
    
    if (res && res.list && Array.isArray(res.list)) {
      feedbackList.value = res.list;
      console.log('[反馈列表] 从 res.list 获取数据:', res.list);
    } else if (res && res.data && Array.isArray(res.data)) {
      feedbackList.value = res.data;
      console.log('[反馈列表] 从 res.data 获取数据:', res.data);
    } else if (Array.isArray(res)) {
      feedbackList.value = res;
      console.log('[反馈列表] 从 res 直接获取数组数据:', res);
    } else {
      console.error('[反馈列表] 响应格式不符:', res);
      feedbackList.value = [];
    }
  } catch (error) {
    console.error('加载反馈列表失败:', error);
    uni.showToast({
      title: '加载失败',
      icon: 'none'
    });
  } finally {
    loading.value = false;
  }
};

const changeFilter = (status) => {
  filterStatus.value = status;
};

const filteredList = computed(() => {
  if (filterStatus.value === 'all') {
    return feedbackList.value;
  }
  return feedbackList.value.filter(item => item.status === filterStatus.value);
});

const viewDetail = (item) => {
  currentItem.value = item;
  showDetail.value = true;
};

const handleFeedback = async (id) => {
  try {
    uni.showLoading({ title: '处理中...' });
    
    await request({
      url: `/feedback/${id}`,
      method: 'PATCH',
      data: { status: 1 }
    });
    
    uni.showToast({
      title: '处理成功',
      icon: 'success'
    });

    // 刷新列表
    loadFeedbackList();
    showDetail.value = false;

  } catch (error) {
    console.error('处理反馈失败:', error);
    uni.showToast({
      title: '处理失败',
      icon: 'none'
    });
  } finally {
    uni.hideLoading();
  }
};

const deleteFeedback = (id) => {
  uni.showModal({
    title: '确认删除',
    content: '删除后无法恢复，确定要删除这条反馈吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          uni.showLoading({ title: '删除中...' });
          
          await request({
            url: `/feedback/${id}`,
            method: 'DELETE'
          });
          
          uni.showToast({
            title: '删除成功',
            icon: 'success'
          });

          // 刷新列表
          loadFeedbackList();
          showDetail.value = false;

        } catch (error) {
          console.error('删除反馈失败:', error);
          uni.showToast({
            title: '删除失败',
            icon: 'none'
          });
        } finally {
          uni.hideLoading();
        }
      }
    }
  });
};

const formatTime = (timeStr) => {
  if (!timeStr) return '';
  const date = new Date(timeStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}-${month}-${day} ${hour}:${minute}`;
};

const goBack = () => {
  backToAdminHome();
};
</script>

<style lang="scss" scoped>
.feedback-admin-container {
  min-height: 100vh;
  background-color: #f5f5f5;

  .header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx;
    background-color: #fff;
    position: sticky;
    top: 0;
    z-index: 10;
  }

  .stats-section {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 20rpx;
    padding: 30rpx;

    .stat-card {
      background-color: #fff;
      padding: 30rpx;
      border-radius: 12rpx;
      text-align: center;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);
    }
  }

  .filter-section {
    padding: 0 30rpx 20rpx;

    .filter-tabs {
      display: flex;
      background-color: #fff;
      border-radius: 12rpx;
      padding: 10rpx;

      .tab-item {
        flex: 1;
        text-align: center;
        padding: 15rpx;
        border-radius: 8rpx;
        transition: all 0.3s;

        &.active {
          background-color: #e8f5e9;
        }
      }
    }
  }

  .feedback-list {
    padding: 0 30rpx 30rpx;

    .feedback-item {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 25rpx;
      margin-bottom: 20rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.05);

      .item-header {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 15rpx;

        .user-info {
          display: flex;
          align-items: center;
        }
      }

      .item-content {
        margin-bottom: 15rpx;
        line-height: 1.6;
      }

      .item-footer {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding-top: 15rpx;
        border-top: 1px solid #ebeef5;

        .actions {
          display: flex;
          gap: 15rpx;
        }
      }
    }
  }

  .empty-tip {
    padding: 100rpx 0;
  }

  .detail-popup {
    width: 650rpx;
    max-height: 80vh;
    overflow-y: auto;
    padding: 40rpx 30rpx;

    .popup-title {
      text-align: center;
      margin-bottom: 30rpx;
      padding-bottom: 20rpx;
      border-bottom: 1px solid #ebeef5;
    }

    .detail-content {
      .detail-row {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 20rpx 0;
        border-bottom: 1px solid #f5f5f5;
      }

      .detail-full {
        margin-top: 20rpx;
        padding-top: 20rpx;
        border-top: 1px solid #ebeef5;

        .content-box {
          background-color: #f8f9fa;
          padding: 20rpx;
          border-radius: 8rpx;
          line-height: 1.8;
        }
      }
    }

    .popup-actions {
      display: flex;
      margin-top: 30rpx;
      padding-top: 20rpx;
      border-top: 1px solid #ebeef5;
    }
  }
}
</style>
