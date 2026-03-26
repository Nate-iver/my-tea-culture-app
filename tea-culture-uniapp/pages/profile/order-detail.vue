<template>
  <view class="order-detail-container">
    <!-- 加载状态 -->
    <u-loading-icon v-if="loading" mode="circle" text="加载中..."></u-loading-icon>

    <!-- 订单详情 -->
    <view v-else-if="order" class="order-info">
      <!-- 订单状态 -->
      <view class="status-card">
        <view class="status-icon">
          <u-icon :name="getStatusIcon(order.status)" :color="getStatusIconColor(order.status)" size="50"></u-icon>
        </view>
        <u-text :text="getStatusText(order.status)" size="18" bold color="#303133" margin="10rpx 0 0 0"></u-text>
        <u-text :text="formatDate(order.created_at)" size="12" color="#909399" margin="5rpx 0 0 0"></u-text>
      </view>

      <!-- 基本信息 -->
      <view class="section">
        <u-text text="订单信息" size="16" bold color="#303133" margin="0 0 15rpx 0"></u-text>
        
        <view class="info-row">
          <u-text text="订单号" size="14" color="#606266" width="80rpx"></u-text>
          <u-text :text="order.id" size="14" color="#303133"></u-text>
        </view>

        <view class="info-row">
          <u-text text="商品" size="14" color="#606266" width="80rpx"></u-text>
          <u-text :text="order.product_name" size="14" color="#303133"></u-text>
        </view>

        <view class="info-row">
          <u-text text="数量" size="14" color="#606266" width="80rpx"></u-text>
          <u-text :text="order.quantity + '件'" size="14" color="#303133"></u-text>
        </view>

        <view class="info-row">
          <u-text text="单价" size="14" color="#606266" width="80rpx"></u-text>
          <u-text :text="'¥' + order.unit_price" size="14" color="#ff6b6b" bold></u-text>
        </view>

        <view class="divider"></view>

        <view class="info-row">
          <u-text text="合计" size="16" color="#303133" bold width="80rpx"></u-text>
          <u-text :text="'¥' + order.total_amount" size="18" color="#ff6b6b" bold></u-text>
        </view>
      </view>

      <!-- 收货信息 -->
      <view class="section">
        <u-text text="收货信息" size="16" bold color="#303133" margin="0 0 15rpx 0"></u-text>

        <view class="info-row">
          <u-text text="收货人" size="14" color="#606266" width="80rpx"></u-text>
          <u-text :text="order.receiver_name" size="14" color="#303133"></u-text>
        </view>

        <view class="info-row">
          <u-text text="联系电话" size="14" color="#606266" width="80rpx"></u-text>
          <u-text :text="order.receiver_phone" size="14" color="#303133"></u-text>
        </view>

        <view class="info-row">
          <u-text text="收货地址" size="14" color="#606266" width="80rpx"></u-text>
          <u-text :text="order.receiver_address" size="14" color="#303133" :lines="2"></u-text>
        </view>
      </view>

      <!-- 操作按钮 -->
      <view class="actions" v-if="order.status === 'pending'">
        <view class="actions-row">
          <u-button 
            text="取消订单" 
            type="error"
            @click="cancelOrder"
            plain
            customStyle="flex: 1;"
          ></u-button>
          <u-button 
            text="立即支付" 
            type="primary"
            @click="payOrder"
            customStyle="flex: 1;"
          ></u-button>
        </view>
      </view>

      <view class="actions" v-else-if="order.status === 'shipped'">
        <u-button 
          text="确认收货" 
          type="success"
          @click="confirmOrder"
        ></u-button>
      </view>
    </view>

    <!-- 错误状态 -->
    <view v-else class="empty-state">
      <u-icon name="search" color="#ccc" size="80"></u-icon>
      <u-text text="订单未找到" size="16" color="#909399" margin="20rpx 0 0 0"></u-text>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request } from '@/utils/http.js';

const loading = ref(false);
const order = ref(null);
const orderId = ref(null);

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

const getStatusIcon = (status) => {
  const iconMap = {
    'pending': 'clock',
    'paid': 'checkmark',
    'shipped': 'send',
    'delivered': 'checkmark-circle',
    'cancelled': 'close-circle'
  };
  return iconMap[status] || 'info';
};

const getStatusIconColor = (status) => {
  const colorMap = {
    'pending': '#ff9800',
    'paid': '#2196f3',
    'shipped': '#2196f3',
    'delivered': '#4caf50',
    'cancelled': '#f44336'
  };
  return colorMap[status] || '#909399';
};

const loadOrder = async () => {
  if (!orderId.value) return;

  try {
    loading.value = true;
    const res = await request({
      url: `/orders/${orderId.value}`,
      method: 'GET'
    });

    console.log('[order-detail] response:', res);

    const detail = res && typeof res === 'object'
      ? (res.data || res)
      : null;

    order.value = detail;
  } catch (e) {
    console.error('[order-detail] 加载失败:', e);
    uni.showToast({ title: e.message || '加载订单失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const cancelOrder = async () => {
  uni.showModal({
    title: '取消订单',
    content: '确定要取消这个订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({
            url: `/orders/${orderId.value}/cancel`,
            method: 'POST'
          });

          uni.showToast({ title: '订单已取消', icon: 'success' });
          setTimeout(() => {
            uni.navigateBack();
          }, 1000);
        } catch (e) {
          console.error('取消失败:', e);
          uni.showToast({ title: '取消失败，请重试', icon: 'none' });
        }
      }
    }
  });
};

const payOrder = async () => {
  uni.showModal({
    title: '订单支付',
    content: '确认支付该订单吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({
            url: `/orders/${orderId.value}/pay`,
            method: 'POST'
          });

          uni.showToast({ title: '支付成功', icon: 'success' });
          setTimeout(() => {
            loadOrder();
          }, 500);
        } catch (e) {
          console.error('支付失败:', e);
          uni.showToast({ title: e.message || '支付失败，请重试', icon: 'none' });
        }
      }
    }
  });
};

const confirmOrder = async () => {
  uni.showModal({
    title: '确认收货',
    content: '确认已收到商品吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({
            url: `/orders/${orderId.value}/confirm`,
            method: 'POST'
          });

          uni.showToast({ title: '已确认收货', icon: 'success' });
          setTimeout(() => {
            loadOrder();
          }, 1000);
        } catch (e) {
          console.error('确认失败:', e);
          uni.showToast({ title: e.message || '操作失败，请重试', icon: 'none' });
        }
      }
    }
  });
};

onLoad((options) => {
  orderId.value = options?.id;
  if (orderId.value) {
    loadOrder();
  }
});
</script>

<style lang="scss" scoped>
.order-detail-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding: 20rpx;

  .status-card {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 40rpx;
    text-align: center;
    margin-bottom: 20rpx;

    .status-icon {
      margin-bottom: 15rpx;
    }
  }

  .section {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 25rpx;
    margin-bottom: 20rpx;

    .info-row {
      display: flex;
      align-items: center;
      padding: 12rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }
    }

    .divider {
      height: 1rpx;
      background-color: #f0f0f0;
      margin: 15rpx 0;
    }
  }

  .actions {
    padding: 0 20rpx 30rpx 20rpx;

    .actions-row {
      display: flex;
      gap: 16rpx;
    }
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 30rpx;
    text-align: center;
  }
}
</style>
