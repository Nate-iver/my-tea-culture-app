<template>
  <view class="login-container">
    <view class="header">
      <u-text text="欢迎来到茶韵" size="24" bold color="#303133"></u-text>
      <u-text text="品味茶文化，发现生活之美" size="14" color="#909399" margin="20rpx 0 0 0"></u-text>
    </view>

    <view class="form-box">
      <u-input
        placeholder="请输入用户名"
        prefixIcon="account"
        v-model="loginForm.username"
        border="bottom"
        clearable
      ></u-input>
      
      <view style="height: 40rpx;"></view>

      <u-input
        placeholder="请输入密码"
        prefixIcon="lock"
        v-model="loginForm.password"
        border="bottom"
        type="password"
        clearable
      ></u-input>

      <view class="btn-group">
        <u-button 
          type="primary" 
          text="立即登录" 
          :loading="loading" 
          @click="handleLogin"
          color="#3c9cff"
        ></u-button>
        
        <view class="tips">
          <u-text text="演示账号: admin | 密码: admin123" size="12" color="#ccc"></u-text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { request } from '@/utils/http.js';
import { getHomePageRoute, isAdmin } from '@/utils/auth.js';

const loginForm = ref({
  username: '',
  password: ''
});

const loading = ref(false);

const handleLogin = async () => {
  if (!loginForm.value.username || !loginForm.value.password) {
    return uni.showToast({ title: '请填写完整信息', icon: 'none' });
  }

  try {
    loading.value = true;
    // 调用后端登录接口
    const res = await request({
      url: '/auth/login',
      method: 'POST',
      data: loginForm.value
    });

    console.log('登录成功:', res);

    // 1. 保存 Token 和用户信息到本地
    uni.setStorageSync('token', res.token);
    uni.setStorageSync('userInfo', res.user);

    uni.showToast({ title: '登录成功', icon: 'success' });

    // 2. 根据 role 跳转到不同的首页
    setTimeout(() => {
      const homeRoute = getHomePageRoute();
      
      if (res.user.role === 'admin') {
        // 管理员跳转到后台
        console.log('[登录] 管理员用户，跳转到后台:', homeRoute);
        uni.navigateTo({
          url: homeRoute
        });
      } else {
        // 普通用户跳转到首页
        console.log('[登录] 普通用户，跳转到首页:', homeRoute);
        uni.switchTab({
          url: homeRoute
        });
      }
    }, 1500);

  } catch (e) {
    console.error('登录失败:', e);
  } finally {
    loading.value = false;
  }
};
</script>

<style lang="scss" scoped>
.login-container {
  padding: 100rpx 60rpx;
  background-color: #fff;
  min-height: 100vh;

  .header {
    margin-bottom: 100rpx;
  }

  .form-box {
    .btn-group {
      margin-top: 80rpx;
      .tips {
        margin-top: 30rpx;
        text-align: center;
      }
    }
  }
}
</style>