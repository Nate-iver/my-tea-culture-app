/**
 * 图片上传工具函数
 * 支持选择图片、压缩、上传到服务器
 */

import { request } from './http.js';

/**
 * 选择图片
 * @param {number} count - 最多选择图片数量，默认1
 * @returns {Promise<Array>} 返回选中的图片路径数组
 */
export const selectImage = (count = 1) => {
  return new Promise((resolve, reject) => {
    uni.chooseImage({
      count: count,
      sizeType: ['original', 'compressed'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        resolve(res.tempFilePaths);
      },
      fail: (err) => {
        console.error('选择图片失败:', err);
        reject(err);
      }
    });
  });
};

/**
 * 上传单个图片
 * @param {string} filePath - 图片本地路径
 * @param {string} uploadUrl - 上传接口地址
 * @returns {Promise<string>} 返回图片URL
 */
export const uploadImage = async (filePath, uploadUrl = '/upload') => {
  return new Promise((resolve, reject) => {
    const fileName = filePath.split('/').pop();
    
    uni.uploadFile({
      url: `http://localhost:8000/api${uploadUrl}`,
      filePath: filePath,
      name: 'file',
      header: {
        'Authorization': `Bearer ${uni.getStorageSync('token')}`
      },
      success: (res) => {
        try {
          const data = JSON.parse(res.data);
          if (data.code === 200 || data.url) {
            // 假设后端返回 { code: 200, url: '/path/to/image.jpg' }
            const imageUrl = data.url || data.data?.url;
            resolve(imageUrl);
          } else {
            reject(new Error(data.message || '上传失败'));
          }
        } catch (e) {
          reject(new Error('上传响应解析失败'));
        }
      },
      fail: (err) => {
        console.error('上传失败:', err);
        reject(err);
      }
    });
  });
};

/**
 * 批量上传图片
 * @param {Array<string>} filePaths - 图片路径数组
 * @param {string} uploadUrl - 上传接口地址
 * @returns {Promise<Array<string>>} 返回上传后的图片URL数组
 */
export const uploadImages = async (filePaths, uploadUrl = '/upload') => {
  const results = [];
  
  for (const filePath of filePaths) {
    try {
      const url = await uploadImage(filePath, uploadUrl);
      results.push(url);
    } catch (e) {
      console.error(`上传 ${filePath} 失败:`, e);
      uni.showToast({ title: `上传失败: ${e.message}`, icon: 'none' });
    }
  }
  
  return results;
};

/**
 * 选择并上传单个图片
 * @param {string} uploadUrl - 上传接口地址
 * @returns {Promise<string>} 返回上传后的图片URL
 */
export const chooseAndUploadImage = async (uploadUrl = '/upload') => {
  try {
    const filePaths = await selectImage(1);
    if (filePaths.length === 0) return null;
    
    uni.showLoading({ title: '上传中...' });
    const imageUrl = await uploadImage(filePaths[0], uploadUrl);
    uni.hideLoading();
    uni.showToast({ title: '上传成功', icon: 'success' });
    
    return imageUrl;
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: '上传失败', icon: 'none' });
    return null;
  }
};

/**
 * 选择并上传多张图片
 * @param {number} count - 最多选择图片数量，默认9
 * @param {string} uploadUrl - 上传接口地址
 * @returns {Promise<Array<string>>} 返回上传后的图片URL数组
 */
export const chooseAndUploadImages = async (count = 9, uploadUrl = '/upload') => {
  try {
    const filePaths = await selectImage(count);
    if (filePaths.length === 0) return [];
    
    uni.showLoading({ title: '上传中...' });
    const imageUrls = await uploadImages(filePaths, uploadUrl);
    uni.hideLoading();
    
    if (imageUrls.length > 0) {
      uni.showToast({ title: `成功上传${imageUrls.length}张图片`, icon: 'success' });
    }
    
    return imageUrls;
  } catch (e) {
    uni.hideLoading();
    uni.showToast({ title: '上传失败', icon: 'none' });
    return [];
  }
};
