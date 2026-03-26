<template>
  <view class="orders-admin-container">
    <!-- 自定义导航栏 -->
    <u-navbar 
      title="订单管理"
      :is-back="true"
      @back="goBack"
      :background="{ background: '#fff' }"
    ></u-navbar>

    <!-- 状态筛选 -->
    <view class="filter-bar">
      <u-tag 
        v-for="status in statusFilters" 
        :key="status"
        :text="status" 
        size="small"
        :type="selectedStatus === status ? 'primary' : 'info'"
        :plain="selectedStatus !== status"
        @click="selectStatus(status)"
        margin="0 10rpx 10rpx 0"
      ></u-tag>
    </view>

    <!-- 加载状态 -->
    <u-loading-icon v-if="loading" mode="circle" text="加载中..."></u-loading-icon>

    <!-- 空状态 -->
    <view v-else-if="orders.length === 0" class="empty-state">
      <u-icon name="shopping-cart" color="#ccc" size="80"></u-icon>
      <u-text text="暂无订单" size="16" color="#909399" margin="20rpx 0 0 0"></u-text>
    </view>

    <!-- 订单列表 -->
    <view v-else class="orders-list">
      <view v-for="order in orders" :key="order.id" class="order-item">
        <view class="order-header">
          <view class="order-info">
            <u-text :text="'订单 #' + order.id" size="14" bold color="#303133"></u-text>
            <u-text :text="order.receiver_name + ' | ' + order.receiver_phone" size="12" color="#909399" margin="5rpx 0 0 0"></u-text>
          </view>
          <u-tag :text="getStatusText(order.status)" :type="getStatusColor(order.status)" size="mini"></u-tag>
        </view>

        <view class="order-content">
          <u-text :text="order.product_name" size="13" color="#303133" :lines="1"></u-text>
          <u-text :text="'数量: ' + order.quantity" size="12" color="#909399" margin="5rpx 0 0 0"></u-text>
        </view>

        <view class="order-footer">
          <u-text :text="'¥' + order.total_amount" size="16" bold color="#ff6b6b"></u-text>
          <u-text :text="formatDate(order.created_at)" size="12" color="#bdbdbd"></u-text>
        </view>

        <!-- 操作按钮 -->
        <view class="order-actions" v-if="order.status === 'paid'">
          <u-button 
            size="mini"
            type="success"
            text="发货"
            @click="shipOrder(order.id)"
            plain
          ></u-button>
        </view>
        <view class="order-actions" v-else-if="order.status === 'shipped'">
          <u-button 
            size="mini"
            type="info"
            text="已收货"
            @click="deliverOrder(order.id)"
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
import { checkPermission, backToAdminHome } from '@/utils/auth.js';

const loading = ref(false);
const orders = ref([]);
const selectedStatus = ref('全部');
const statusFilters = ref(['全部', '待支付', '已支付', '已发货', '已收货', '已取消']);
const allOrders = ref([]);

onMounted(() => {
  // 权限检查
  if (!checkPermission('admin')) {
    return;
  }
  loadOrders();
});

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

const statusMap = {
  '全部': null,
  '待支付': 'pending',
  '已支付': 'paid',
  '已发货': 'shipped',
  '已收货': 'delivered',
  '已取消': 'cancelled'
};

const loadOrders = async () => {
  try {
    loading.value = true;
    
    // 调试信息
    const token = uni.getStorageSync('token');
    const userInfo = uni.getStorageSync('userInfo');
    console.log('[orders-admin] Token:', token ? '存在' : '不存在');
    console.log('[orders-admin] 用户信息:', userInfo);
    console.log('[orders-admin] 用户角色:', userInfo?.role);
    console.log('[orders-admin] 开始请求 GET /api/orders...');
    
    const res = await request({
      url: '/orders',
      method: 'GET',
      data: { page: 1, pageSize: 100 }
    });
    
    console.log('[orders-admin] API 响应:', res);
    console.log('[orders-admin] 响应类型:', typeof res);
    console.log('[orders-admin] 是否数组:', Array.isArray(res));
    console.log('[orders-admin] res.data:', res.data);

    const list = Array.isArray(res) ? res : (res.data || res.list || []);
    allOrders.value = list;
    filterOrders();
    
    console.log('[orders-admin] 最终订单列表:', list);
    console.log('[orders-admin] 订单数量:', list.length);
    
    if (list.length === 0) {
      uni.showToast({ title: '暂无订单数据', icon: 'none' });
    }
  } catch (e) {
    console.error('[orders-admin] 加载失败 - 错误对象:', e);
    console.error('[orders-admin] 错误消息:', e.message);
    console.error('[orders-admin] 错误栈:', e.stack);
    uni.showToast({ title: '加载失败: ' + (e.message || JSON.stringify(e)), icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const filterOrders = () => {
  const status = statusMap[selectedStatus.value];
  if (status) {
    orders.value = allOrders.value.filter(order => order.status === status);
  } else {
    orders.value = allOrders.value;
  }
};

const selectStatus = (status) => {
  selectedStatus.value = status;
  filterOrders();
};

const shipOrder = async (orderId) => {
  try {
    await request({
      url: `/orders/${orderId}/status`,
      method: 'PUT',
      data: { status: 'shipped' }
    });
    uni.showToast({ title: '已发货', icon: 'success' });
    loadOrders();
  } catch (e) {
    console.error('发货失败:', e);
    uni.showToast({ title: '操作失败', icon: 'none' });
  }
};

const deliverOrder = async (orderId) => {
  try {
    await request({
      url: `/orders/${orderId}/status`,
      method: 'PUT',
      data: { status: 'delivered' }
    });
    uni.showToast({ title: '已确认收货', icon: 'success' });
    loadOrders();
  } catch (e) {
    console.error('确认失败:', e);
    uni.showToast({ title: '操作失败', icon: 'none' });
  }
};

const goBack = () => {
  backToAdminHome();
};
</script>

<style lang="scss" scoped>
.orders-admin-container {
  background-color: #f5f5f5;
  min-height: 100vh;

  .filter-bar {
    padding: 20rpx;
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

    .order-item {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-bottom: 15rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

      .order-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;
        padding-bottom: 12rpx;
        border-bottom: 1rpx solid #f0f0f0;
      }

      .order-content {
        margin-bottom: 12rpx;
      }

      .order-footer {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;
        padding-top: 12rpx;
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
