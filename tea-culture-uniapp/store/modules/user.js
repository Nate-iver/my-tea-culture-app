import { defineStore } from 'pinia';

export const useUserStore = defineStore('user', {
  state: () => ({
    token: '',
    userInfo: null,
    isLogin: false
  }),
  
  getters: {
    // 获取用户名
    userName: (state) => state.userInfo?.username || '游客',
    // 获取用户头像
    userAvatar: (state) => state.userInfo?.avatar || '/static/default-avatar.png',
    // 是否已登录
    hasLogin: (state) => state.isLogin && !!state.token
  },
  
  actions: {
    // 设置登录信息
    setLoginInfo(token, userInfo) {
      this.token = token;
      this.userInfo = userInfo;
      this.isLogin = true;
      
      // 同步到本地存储
      uni.setStorageSync('token', token);
      uni.setStorageSync('userInfo', userInfo);
    },
    
    // 退出登录
    logout() {
      this.token = '';
      this.userInfo = null;
      this.isLogin = false;
      
      // 清除本地存储
      uni.removeStorageSync('token');
      uni.removeStorageSync('userInfo');
      
      // 跳转到登录页
      uni.reLaunch({
        url: '/pages/login/login'
      });
    },
    
    // 从本地存储恢复登录状态
    restoreLoginState() {
      const token = uni.getStorageSync('token');
      const userInfo = uni.getStorageSync('userInfo');
      
      if (token && userInfo) {
        this.token = token;
        this.userInfo = userInfo;
        this.isLogin = true;
      }
    },
    
    // 更新用户信息
    updateUserInfo(userInfo) {
      this.userInfo = { ...this.userInfo, ...userInfo };
      uni.setStorageSync('userInfo', this.userInfo);
    }
  },
  
  // 开启持久化
  persist: {
    enabled: true,
    strategies: [
      {
        key: 'tea-user',
        storage: {
          getItem: (key) => uni.getStorageSync(key),
          setItem: (key, value) => uni.setStorageSync(key, value)
        }
      }
    ]
  }
});
