<template>
  <view class="my-orders-container">
    <!-- 顶部 -->
    <view class="top-bar">
      <u-text text="我的订单" size="20" bold color="#303133"></u-text>
    </view>

    <!-- 加载状态 -->
    <u-loading-icon v-if="loading" mode="circle" text="加载中..."></u-loading-icon>

    <!-- 空状态 -->
    <view v-else-if="orders.length === 0" class="empty-state">
      <u-icon name="bag" color="#ccc" size="80"></u-icon>
      <u-text text="暂无订单" size="16" color="#909399" margin="20rpx 0 0 0"></u-text>
    </view>

    <!-- 订单列表 -->
    <view v-else class="orders-list">
      <view 
        v-for="order in orders" 
        :key="order.id"
        class="order-card"
        @click="goOrderDetail(order.id)"
      >
        <view class="order-header">
          <u-text :text="'订单号: ' + order.id" size="14" bold color="#303133"></u-text>
          <u-tag 
            :text="getStatusText(order.status)" 
            :type="getStatusColor(order.status)"
            size="mini"
          ></u-tag>
        </view>

        <view class="order-content">
          <u-text :text="order.product_name" size="15" bold color="#303133" :lines="2"></u-text>
          <view class="order-details">
            <u-text :text="'数量: ' + order.quantity" size="12" color="#606266"></u-text>
            <u-text :text="'收货人: ' + order.receiver_name" size="12" color="#606266" margin="8rpx 0 0 0"></u-text>
            <u-text :text="'地址: ' + order.receiver_address" size="12" color="#909399" :lines="1" margin="8rpx 0 0 0"></u-text>
          </view>
        </view>

        <view class="order-footer">
          <u-text :text="'¥' + order.total_amount" size="18" bold color="#ff6b6b"></u-text>
          <u-text :text="formatDate(order.created_at)" size="12" color="#909399"></u-text>
        </view>

        <!-- 操作按钮 -->
        <view class="order-actions" v-if="order.status === 'pending'">
          <u-button 
            size="mini"
            type="error"
            text="取消订单"
            @click.stop="cancelOrder(order.id)"
            plain
          ></u-button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '@/utils/http.js';

const loading = ref(false);
const orders = ref([]);

const formatDate = (value) => {
  if (!value) return '';
  const date = value.split('T')[0] || value.split(' ')[0];
  return date;
};

const getStatusText = (status) => {
  const statusMap = {
    'pending': '待支付',
    'paid': '已支付',
    'shipped': '已发货',
    'delivered': '已收货',
    'cancelled': '已取消'
  };
  return statusMap[status] || status;
};

const getStatusColor = (status) => {
  const colorMap = {
    'pending': 'warning',
    'paid': 'info',
    'shipped': 'primary',
    'delivered': 'success',
    'cancelled': 'error'
  };
  return colorMap[status] || 'info';
};

const loadMyOrders = async () => {
  try {
    loading.value = true;
    const res = await request({
      url: '/orders/my',
      method: 'GET'
    });

    console.log('[my-orders] response:', res);

    const list = Array.isArray(res)
      ? res
      : (Array.isArray(res.data)
        ? res.data
        : (res.data?.data || res.list || []));

    orders.value = list;
    console.log('[my-orders] loaded:', orders.value.length, 'orders');
  } catch (e) {
    console.error('[my-orders] 加载失败:', e);
    uni.showToast({ title: '加载订单失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const cancelOrder = async (orderId) => {
  uni.showModal({
    title: '取消订单',
    content: '确定要取消这个订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({
            url: `/orders/${orderId}/cancel`,
            method: 'POST'
          });

          uni.showToast({ title: '订单已取消', icon: 'success' });
          loadMyOrders();
        } catch (e) {
          console.error('取消订单失败:', e);
          uni.showToast({ title: '取消失败，请重试', icon: 'none' });
        }
      }
    }
  });
};

const goOrderDetail = (orderId) => {
  uni.navigateTo({
    url: `/pages/profile/order-detail?id=${orderId}`
  });
};

onMounted(() => {
  loadMyOrders();
});
</script>

<style lang="scss" scoped>
.my-orders-container {
  min-height: 100vh;
  background-color: #f5f5f5;

  .top-bar {
    padding: 30rpx;
    background-color: #fff;
    border-bottom: 1rpx solid #f0f0f0;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 30rpx;
    text-align: center;
  }

  .orders-list {
    padding: 20rpx;

    .order-card {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-bottom: 15rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15rpx;
        padding-bottom: 15rpx;
        border-bottom: 1rpx solid #f0f0f0;
      }

      .order-content {
        margin-bottom: 15rpx;

        .order-details {
          margin-top: 10rpx;
        }
      }

      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 15rpx;
        padding-top: 15rpx;
        border-top: 1rpx solid #f0f0f0;
      }

      .order-actions {
        display: flex;
        gap: 10rpx;
      }
    }
  }
}
</style>
