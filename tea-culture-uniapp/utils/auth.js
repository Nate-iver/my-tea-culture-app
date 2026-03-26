/**
 * 获取当前用户信息
 */
export const getUserInfo = () => {
  const userInfo = uni.getStorageSync('userInfo');
  return userInfo;
};

/**
 * 获取用户角色
 */
export const getUserRole = () => {
  const userInfo = getUserInfo();
  return userInfo?.role || 'user';
};

/**
 * 检查是否已登录
 */
export const isLoggedIn = () => {
  const token = uni.getStorageSync('token');
  return !!token;
};

/**
 * 检查是否是管理员
 */
export const isAdmin = () => {
  return getUserRole() === 'admin';
};

/**
 * 检查权限 - 如果无权限则跳转回上一页
 */
export const checkPermission = (requiredRole = 'admin') => {
  const userRole = getUserRole();
  
  if (requiredRole === 'admin' && userRole !== 'admin') {
    uni.showToast({ 
      title: '您没有权限访问此页面', 
      icon: 'none' 
    });
    // 延迟返回，让提示能显示
    setTimeout(() => {
      uni.navigateBack();
    }, 500);
    return false;
  }
  
  return true;
};

/**
 * 退出登录
 */
export const logout = () => {
  uni.removeStorageSync('token');
  uni.removeStorageSync('userInfo');
  uni.navigateTo({ url: '/pages/login/login' });
};

/**
 * 根据role获取首页路由
 */
export const getHomePageRoute = () => {
  const role = getUserRole();
  if (role === 'admin') {
    return '/pages/admin/index';
  }
  return '/pages/index/index';
};

/**
 * 管理员页面返回：
 * 1. 上一页仍是管理员页面时，正常返回
 * 2. 否则直接跳转管理员首页，避免回到普通用户页面
 */
export const backToAdminHome = () => {
  const pages = getCurrentPages();
  const prevPage = pages.length > 1 ? pages[pages.length - 2] : null;
  const prevRoute = prevPage?.route || '';

  if (prevRoute.startsWith('pages/admin/')) {
    uni.navigateBack({ delta: 1 });
    return;
  }

  uni.redirectTo({ url: '/pages/admin/index' });
};
