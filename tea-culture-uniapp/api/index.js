import { request } from '@/utils/http.js';

// ==================== 用户认证相关 ====================

/**
 * 用户登录
 * @param {Object} data - { username, password }
 */
export const login = (data) => {
  return request({
    url: '/auth/login',
    method: 'POST',
    data
  });
};

/**
 * 用户注册
 * @param {Object} data - { username, password, email, phone }
 */
export const register = (data) => {
  return request({
    url: '/auth/register',
    method: 'POST',
    data
  });
};

/**
 * 获取当前用户信息 (需认证)
 */
export const getUserInfo = () => {
  return request({
    url: '/auth/me',
    method: 'GET'
  });
};

// ==================== 茶道百科相关 ====================

/**
 * 获取内容列表（茶道相关）
 * @param {Object} params - { type, page, limit }
 */
export const getTeaContent = (params) => {
  return request({
    url: '/content',
    method: 'GET',
    data: params
  });
};

/**
 * 获取茶道内容详情
 * @param {Number} id - 内容ID
 */
export const getTeaContentDetail = (id) => {
  return request({
    url: `/content/${id}`,
    method: 'GET'
  });
};

// ==================== 学习模块相关 ====================

/**
 * 获取学习内容列表（通用，替代独立的teaware/settings端点）
 * @param {Object} params - { page, limit, type }
 */
export const getLearningContent = (params) => {
  return request({
    url: '/content',
    method: 'GET',
    data: params
  });
};

/**
 * 获取茶艺师课程列表
 * @param {Object} params - { page, limit, status, level }
 */
export const getCourses = (params) => {
  return request({
    url: '/certificates',
    method: 'GET',
    data: params
  });
};

/**
 * 获取茶艺师课程详情
 * @param {Number} id - 课程ID
 */
export const getCourseDetail = (id) => {
  return request({
    url: `/certificates/${id}`,
    method: 'GET'
  });
};

// ==================== 社区模块相关 ====================

/**
 * 获取社区帖子列表
 * @param {Object} params - { page, limit, type }
 */
export const getPosts = (params) => {
  return request({
    url: '/posts',
    method: 'GET',
    data: params
  });
};

/**
 * 获取帖子详情
 * @param {Number} id - 帖子ID
 */
export const getPostDetail = (id) => {
  return request({
    url: `/posts/${id}`,
    method: 'GET'
  });
};

/**
 * 发布帖子
 * @param {Object} data - { title, content, type, images }
 */
export const createPost = (data) => {
  return request({
    url: '/posts',
    method: 'POST',
    data
  });
};

/**
 * 删除帖子评论
 * @param {Number} id - 帖子ID
 * @param {Number} commentId - 评论ID
 */
export const deleteComment = (id, commentId) => {
  return request({
    url: `/posts/${id}/comments/${commentId}`,
    method: 'DELETE'
  });
};

// ==================== 线下茶会/活动相关 ====================

/**
 * 获取活动列表
 * @param {Object} params - { status, location, page, limit }
 */
export const getEvents = (params) => {
  return request({
    url: '/events',
    method: 'GET',
    data: params
  });
};

/**
 * 获取活动详情
 * @param {Number} id - 活动ID
 */
export const getEventDetail = (id) => {
  return request({
    url: `/events/${id}`,
    method: 'GET'
  });
};

/**
 * 报名活动（需认证）
 * @param {Object} data - { event_id, phone }
 */
export const enrollEvent = (data) => {
  return request({
    url: '/enroll',
    method: 'POST',
    data
  });
};

/**
 * 获取我的活动报名列表（需认证）
 */
export const getMyEnrollments = () => {
  return request({
    url: '/enroll/my',
    method: 'GET'
  });
};

/**
 * 取消活动报名（需认证）
 * @param {Number} id - 报名ID
 */
export const cancelEnrollment = (id) => {
  return request({
    url: `/enroll/${id}`,
    method: 'DELETE'
  });
};

/**
 * 创建活动（需管理员权限）
 * @param {Object} data - 活动信息
 */
export const createEvent = (data) => {
  return request({
    url: '/events',
    method: 'POST',
    data
  });
};

/**
 * 更新活动（需管理员权限）
 * @param {Number} id - 活动ID
 * @param {Object} data - 活动信息
 */
export const updateEvent = (id, data) => {
  return request({
    url: `/events/${id}`,
    method: 'PUT',
    data
  });
};

/**
 * 删除活动（需管理员权限）
 * @param {Number} id - 活动ID
 */
export const deleteEvent = (id) => {
  return request({
    url: `/events/${id}`,
    method: 'DELETE'
  });
};

// ==================== 服务模块相关 ====================

/**
 * 获取产品列表
 * @param {Object} params - { type, page, limit }
 */
export const getProducts = (params) => {
  return request({
    url: '/products',
    method: 'GET',
    data: params
  });
};

/**
 * 获取产品详情
 * @param {Number} id - 产品ID
 */
export const getProductDetail = (id) => {
  return request({
    url: `/products/${id}`,
    method: 'GET'
  });
};

/**
 * 创建订单（需认证）
 * @param {Object} data - 订单信息
 */
export const createOrder = (data) => {
  return request({
    url: '/orders',
    method: 'POST',
    data
  });
};

/**
 * 获取我的订单列表（需认证）
 */
export const getMyOrders = (params) => {
  return request({
    url: '/orders/my',
    method: 'GET',
    data: params
  });
};

/**
 * 获取订单详情（需认证）
 * @param {Number} id - 订单ID
 */
export const getOrderDetail = (id) => {
  return request({
    url: `/orders/${id}`,
    method: 'GET'
  });
};

/**
 * 取消订单（需认证）
 * @param {Number} id - 订单ID
 */
export const cancelOrder = (id) => {
  return request({
    url: `/orders/${id}/cancel`,
    method: 'POST'
  });
};

/**
 * 获取茶艺师认证课程列表
 * @param {Object} params - { page, limit, status, level }
 */
export const getCertificates = (params) => {
  return request({
    url: '/certificates',
    method: 'GET',
    data: params
  });
};

/**
 * 获取茶艺师认证课程详情
 * @param {Number} id - 课程ID
 */
export const getCertificateDetail = (id) => {
  return request({
    url: `/certificates/${id}`,
    method: 'GET'
  });
};

/**
 * 报名茶艺师课程（需认证）
 * @param {Object} data - { course_id, phone }
 */
export const enrollCertificate = (data) => {
  return request({
    url: '/certEnroll',
    method: 'POST',
    data
  });
};

/**
 * 获取我的茶艺师课程报名列表（需认证）
 */
export const getMyCertEnrollments = () => {
  return request({
    url: '/certEnroll/my',
    method: 'GET'
  });
};

/**
 * 取消茶艺师课程报名（需认证）
 * @param {Number} id - 报名ID
 */
export const cancelCertEnrollment = (id) => {
  return request({
    url: `/certEnroll/${id}`,
    method: 'DELETE'
  });
};

/**
 * 创建茶艺师课程（需管理员权限）
 * @param {Object} data - 课程信息
 */
export const createCertificate = (data) => {
  return request({
    url: '/certificates',
    method: 'POST',
    data
  });
};

/**
 * 更新茶艺师课程（需管理员权限）
 * @param {Number} id - 课程ID
 * @param {Object} data - 课程信息
 */
export const updateCertificate = (id, data) => {
  return request({
    url: `/certificates/${id}`,
    method: 'PUT',
    data
  });
};

/**
 * 删除茶艺师课程（需管理员权限）
 * @param {Number} id - 课程ID
 */
export const deleteCertificate = (id) => {
  return request({
    url: `/certificates/${id}`,
    method: 'DELETE'
  });
};

// ==================== 内容相关 ====================

/**
 * 获取推荐内容列表
 * @param {Object} params - { page, pageSize, type }
 */
export const getContent = (params) => {
  return request({
    url: '/content',
    method: 'GET',
    data: params
  });
};

/**
 * 获取内容详情
 * @param {Number} id - 内容ID
 */
export const getContentDetail = (id) => {
  return request({
    url: `/content/${id}`,
    method: 'GET'
  });
};

// ==================== 文件上传相关 ====================

/**
 * 上传图片
 * @param {String} filePath - 本地文件路径
 */
export const uploadImage = (filePath) => {
  return new Promise((resolve, reject) => {
    const token = uni.getStorageSync('token');
    
    uni.uploadFile({
      url: '/api/upload/image',
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': token ? `Bearer ${token}` : ''
      },
      success: (res) => {
        const data = JSON.parse(res.data);
        resolve(data);
      },
      fail: (err) => {
        uni.showToast({ title: '上传失败', icon: 'none' });
        reject(err);
      }
    });
  });
};

// ==================== 反馈相关 ====================

/**
 * 获取反馈列表（管理员）
 * @param {Object} params - { page, limit, status }
 */
export const getFeedbackList = (params) => {
  return request({
    url: '/feedback',
    method: 'GET',
    data: params
  });
};

/**
 * 获取反馈详情（管理员）
 * @param {Number} id - 反馈ID
 */
export const getFeedbackDetail = (id) => {
  return request({
    url: `/feedback/${id}`,
    method: 'GET'
  });
};

/**
 * 提交反馈
 * @param {Object} data - { content, type, contact }
 */
export const submitFeedback = (data) => {
  return request({
    url: '/feedback',
    method: 'POST',
    data
  });
};

/**
 * 处理反馈（管理员）
 * @param {Number} id - 反馈ID
 * @param {Object} data - { status }
 */
export const handleFeedback = (id, data) => {
  return request({
    url: `/feedback/${id}`,
    method: 'PATCH',
    data
  });
};

/**
 * 删除反馈（管理员）
 * @param {Number} id - 反馈ID
 */
export const deleteFeedback = (id) => {
  return request({
    url: `/feedback/${id}`,
    method: 'DELETE'
  });
};
