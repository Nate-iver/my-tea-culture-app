<template>
  <view class="profile-container">
    <view class="user-header">
      <u-avatar :src="userInfo.avatar || ''" size="60"></u-avatar>
      <view class="info">
        <u-text :text="userInfo.username || '未登录'" size="18" bold></u-text>
        <u-tag :text="userInfo.role === 'admin' ? '管理员' : '茶友'" size="mini" type="warning" plain></u-tag>
      </view>
    </view>

    <view class="menu-list">
      <u-cell-group>
        <u-cell icon="shopping-cart" title="我的订单" isLink @click="goMyOrders"></u-cell>
        <u-cell icon="edit-pen" title="我的发布" isLink @click="goMyPosts"></u-cell>
        <u-cell icon="chat" title="意见反馈" isLink @click="goFeedback"></u-cell>
        <u-cell icon="setting" title="设置" isLink></u-cell>
      </u-cell-group>
    </view>

    <view class="logout-btn">
      <u-button type="error" text="退出登录" @click="handleLogout" plain></u-button>
    </view>
  </view>
</template>

<script setup>
// 【核心修复】必须导入 ref 和 uni-app 生命周期
import { ref } from 'vue';
import { onShow } from '@dcloudio/uni-app';
import { logout, isAdmin } from '@/utils/auth.js';

const userInfo = ref({});

onShow(() => {
  console.log('个人中心页面显示');
  // 1. 获取 Token
  const token = uni.getStorageSync('token');
  // 2. 获取用户信息
  const info = uni.getStorageSync('userInfo');
  
  if (token && info) {
    userInfo.value = info;
  } else {
    console.log('未检测到登录状态，准备跳转');
    // 使用 reLaunch 防止页面栈堆积，或者 redirectTo
    uni.reLaunch({ url: '/pages/login/login' });
  }
});

const handleLogout = () => {
  console.log('触发退出登录');
  uni.showModal({
    title: '提示',
    content: '确定要退出登录吗？',
    success: (res) => {
      if (res.confirm) {
        uni.showToast({
          title: '退出成功',
          icon: 'success'
        });

        // 延迟跳转
        setTimeout(() => {
          logout();
        }, 1000);
      }
    }
  });
};

const goMyOrders = () => {
  uni.navigateTo({ url: '/pages/profile/my-orders' });
};

const goMyPosts = () => {
  uni.navigateTo({ url: '/pages/profile/my-posts' });
};

const goFeedback = () => {
  uni.navigateTo({ url: '/pages/profile/feedback' });
};
</script>

<style lang="scss" scoped>
.profile-container {
  padding: 40rpx 30rpx;
  .user-header {
    display: flex;
    align-items: center;
    padding: 40rpx;
    background-color: #f8f9fa;
    border-radius: 20rpx;
    .info { margin-left: 30rpx; }
  }
  .menu-list { margin-top: 40rpx; }
  .logout-btn { margin-top: 100rpx; padding: 0 40rpx; }
}
</style>