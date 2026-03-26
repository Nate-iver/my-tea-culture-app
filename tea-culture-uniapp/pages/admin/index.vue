<template>
  <view class="admin-container">
    <!-- 顶部欢迎 -->
    <view class="welcome-section">
      <u-text :text="'欢迎，' + userInfo.username" size="22" bold color="#303133"></u-text>
      <u-text text="茶文化平台 - 管理员后台" size="14" color="#909399" margin="5rpx 0 0 0"></u-text>
    </view>

    <!-- 统计卡片 -->
    <view class="stats-grid">
      <view class="stat-card" @click="goPage('/pages/admin/orders/index')">
        <u-icon name="shopping-cart" color="#ff6b6b" size="40"></u-icon>
        <u-text :text="stats.orders" size="24" bold color="#303133" margin="10rpx 0 0 0"></u-text>
        <u-text text="总订单数" size="12" color="#909399" margin="5rpx 0 0 0"></u-text>
      </view>

      <view class="stat-card" @click="goPage('/pages/admin/products/index')">
        <u-icon name="basket" color="#ffc107" size="40"></u-icon>
        <u-text :text="stats.products" size="24" bold color="#303133" margin="10rpx 0 0 0"></u-text>
        <u-text text="产品数" size="12" color="#909399" margin="5rpx 0 0 0"></u-text>
      </view>

      <view class="stat-card" @click="goPage('/pages/admin/certificates/index')">
        <u-icon name="medal" color="#4caf50" size="40"></u-icon>
        <u-text :text="stats.certificates" size="24" bold color="#303133" margin="10rpx 0 0 0"></u-text>
        <u-text text="认证课程" size="12" color="#909399" margin="5rpx 0 0 0"></u-text>
      </view>

      <view class="stat-card" @click="goPage('/pages/admin/events/index')">
        <u-icon name="calendar" color="#2196f3" size="40"></u-icon>
        <u-text :text="stats.events" size="24" bold color="#303133" margin="10rpx 0 0 0"></u-text>
        <u-text text="活动数" size="12" color="#909399" margin="5rpx 0 0 0"></u-text>
      </view>

      <view class="stat-card" @click="goPage('/pages/admin/users/index')">
        <u-icon name="account" color="#9c27b0" size="40"></u-icon>
        <u-text :text="stats.users" size="24" bold color="#303133" margin="10rpx 0 0 0"></u-text>
        <u-text text="总用户数" size="12" color="#909399" margin="5rpx 0 0 0"></u-text>
      </view>

      <view class="stat-card" @click="goPage('/pages/admin/feedback/index')">
        <u-icon name="chat" color="#ff5722" size="40"></u-icon>
        <u-text :text="stats.feedback" size="24" bold color="#303133" margin="10rpx 0 0 0"></u-text>
        <u-text text="用户反馈" size="12" color="#909399" margin="5rpx 0 0 0"></u-text>
      </view>
    </view>

    <!-- 快捷功能 -->
    <view class="quick-actions">
      <u-text text="快捷功能" size="16" bold color="#303133" margin="0 0 20rpx 0"></u-text>
      
      <view class="action-buttons">
        <u-button 
          text="订单管理" 
          type="primary"
          icon="shopping-cart"
          @click="goPage('/pages/admin/orders/index')"
          customStyle="flex: 1; margin-right: 10rpx;"
        ></u-button>
        <u-button 
          text="产品管理" 
          type="warning"
          icon="basket"
          @click="goPage('/pages/admin/products/index')"
          customStyle="flex: 1;"
        ></u-button>
      </view>

      <view class="action-buttons" style="margin-top: 15rpx;">
        <u-button 
          text="课程管理" 
          type="success"
          icon="medal"
          @click="goPage('/pages/admin/certificates/index')"
          customStyle="flex: 1; margin-right: 10rpx;"
        ></u-button>
        <u-button 
          text="活动管理" 
          type="info"
          icon="calendar"
          @click="goPage('/pages/admin/events/index')"
          customStyle="flex: 1;"
        ></u-button>
      </view>

      <view class="action-buttons" style="margin-top: 15rpx;">
        <u-button 
          text="用户管理" 
          type="error"
          icon="account"
          @click="goPage('/pages/admin/users/index')"
          customStyle="flex: 1;"
        ></u-button>
        <u-button 
          text="用户反馈" 
          icon="chat"
          color="#ff5722"
          @click="goPage('/pages/admin/feedback/index')"
          customStyle="flex: 1;"
        ></u-button>
      </view>
    </view>

    <!-- 最近的订单 -->
    <view class="recent-section">
      <view class="section-header">
        <u-text text="最近订单" size="16" bold color="#303133"></u-text>
        <u-text 
          text="查看全部 >" 
          size="12" 
          color="#5d8a6a"
          @click="goPage('/pages/admin/orders/index')"
        ></u-text>
      </view>

      <view class="recent-list" v-if="recentOrders.length > 0">
        <view v-for="order in recentOrders.slice(0, 3)" :key="order.id" class="recent-item">
          <view class="item-left">
            <u-text :text="order.product_name" size="14" bold color="#303133"></u-text>
            <u-text :text="order.receiver_name" size="12" color="#909399" margin="5rpx 0 0 0"></u-text>
          </view>
          <view class="item-right">
            <u-tag :text="getStatusText(order.status)" :type="getStatusColor(order.status)" size="mini"></u-tag>
            <u-text :text="'¥' + order.total_amount" size="14" bold color="#ff6b6b" margin="5rpx 0 0 0"></u-text>
          </view>
        </view>
      </view>

      <view v-else class="empty-tip">
        <u-text text="暂无订单" size="12" color="#bdbdbd"></u-text>
      </view>
    </view>

    <!-- 系统信息 -->
    <view class="system-info">
      <u-text text="系统信息" size="14" bold color="#303133" margin="0 0 15rpx 0"></u-text>
      <view class="info-row">
        <u-text text="平台名称" size="12" color="#606266"></u-text>
        <u-text text="茶文化电商平台" size="12" color="#303133"></u-text>
      </view>
      <view class="info-row">
        <u-text text="当前用户" size="12" color="#606266"></u-text>
        <u-text :text="userInfo.username" size="12" color="#303133"></u-text>
      </view>
      <view class="info-row">
        <u-text text="用户角色" size="12" color="#606266"></u-text>
        <u-tag text="管理员" type="error" size="mini"></u-tag>
      </view>
    </view>

    <!-- 退出按钮 -->
    <view class="logout-btn">
      <u-button type="error" text="退出登录" @click="handleLogout" plain></u-button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '@/utils/http.js';
import { checkPermission, logout, getUserInfo } from '@/utils/auth.js';

const userInfo = ref({});
const stats = ref({
  orders: 0,
  products: 0,
  certificates: 0,
  events: 0,
  users: 0,
  feedback: 0
});
const recentOrders = ref([]);

onMounted(() => {
  // 权限检查：如果不是管理员，跳转回上一页
  if (!checkPermission('admin')) {
    return;
  }

  const info = getUserInfo();
  userInfo.value = info || {};
  loadDashboard();
});

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

const loadDashboard = async () => {
  try {
    // 加载统计数据
    const [ordersRes, productsRes, certificatesRes, eventsRes, usersRes, feedbackRes] = await Promise.all([
      request({ url: '/orders', method: 'GET', data: { page: 1, pageSize: 5 } }),
      request({ url: '/products', method: 'GET', data: { page: 1, pageSize: 1 } }),
      request({ url: '/certificates', method: 'GET', data: { page: 1, pageSize: 1 } }),
      request({ url: '/events', method: 'GET', data: { page: 1, pageSize: 1 } }),
      request({ url: '/users', method: 'GET', data: { page: 1, pageSize: 1 } }),
      request({ url: '/feedback', method: 'GET', data: { page: 1, pageSize: 1 } })
    ]);

    console.log('[admin-dashboard] 订单响应:', ordersRes);
    console.log('[admin-dashboard] 产品响应:', productsRes);
    console.log('[admin-dashboard] 课程响应:', certificatesRes);
    console.log('[admin-dashboard] 活动响应:', eventsRes);
    console.log('[admin-dashboard] 用户响应:', usersRes);
    console.log('[admin-dashboard] 反馈响应:', feedbackRes);

    // 解析订单数据
    const ordersList = Array.isArray(ordersRes) ? ordersRes : (ordersRes.data || ordersRes.list || []);
    recentOrders.value = ordersList.slice(0, 3);
    stats.value.orders = ordersRes.total || ordersList.length;

    // 解析产品数据 - 使用 total 字段
    stats.value.products = productsRes.total || 0;

    // 解析认证课程数据 - 使用 total 字段或数组长度
    const certList = Array.isArray(certificatesRes) ? certificatesRes : (certificatesRes.data || certificatesRes.list || []);
    stats.value.certificates = certificatesRes.total || certList.length;

    // 解析活动数据 - 使用 total 字段或数组长度
    const eventsList = Array.isArray(eventsRes) ? eventsRes : (eventsRes.data || eventsRes.list || []);
    stats.value.events = eventsRes.total || eventsList.length;

    // 解析用户数据 - 使用 total 字段
    stats.value.users = usersRes.total || 0;

    // 解析反馈数据 - 使用 total 字段或数组长度
    const feedbackList = Array.isArray(feedbackRes) ? feedbackRes : (feedbackRes.data || feedbackRes.list || []);
    stats.value.feedback = feedbackRes.total || feedbackList.length;

    console.log('[admin-dashboard] 统计数据:', stats.value);
  } catch (e) {
    console.error('[admin] 加载仪表板失败:', e);
  }
};

const goPage = (url) => {
  uni.navigateTo({ url });
};

const handleLogout = () => {
  uni.showModal({
    title: '退出登录',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        logout();
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.admin-container {
  padding: 30rpx;
  background-color: #f5f5f5;
  min-height: 100vh;

  .welcome-section {
    margin-bottom: 40rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #e0e0e0;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 15rpx;
    margin-bottom: 40rpx;

    .stat-card {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 25rpx;
      text-align: center;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
      cursor: pointer;
      transition: transform 0.2s;

      &:active {
        transform: scale(0.98);
      }
    }
  }

  .quick-actions {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 25rpx;
    margin-bottom: 30rpx;

    .action-buttons {
      display: flex;
      gap: 10rpx;
    }
  }

  .recent-section {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 25rpx;
    margin-bottom: 30rpx;

    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
    }

    .recent-list {
      .recent-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 15rpx 0;
        border-bottom: 1rpx solid #f0f0f0;

        &:last-child {
          border-bottom: none;
        }

        .item-left {
          flex: 1;
        }

        .item-right {
          text-align: right;
        }
      }
    }

    .empty-tip {
      text-align: center;
      padding: 30rpx 0;
    }
  }

  .system-info {
    background-color: #fff;
    border-radius: 12rpx;
    padding: 25rpx;
    margin-bottom: 30rpx;

    .info-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12rpx 0;
      border-bottom: 1rpx solid #f0f0f0;

      &:last-child {
        border-bottom: none;
      }
    }
  }

  .logout-btn {
    margin-bottom: 30rpx;
  }
}
</style>
