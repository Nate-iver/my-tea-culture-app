// api/request.js
// H5 走 Vite 代理；App 端需直连后端绝对地址。
let baseUrl = '/api';

// #ifdef APP-PLUS
baseUrl = 'http://10.168.107.184:3000/api';
// #endif

export const request = (options) => {
	// 从本地缓存读取 token
    const token = uni.getStorageSync('token');
	
    return new Promise((resolve, reject) => {
        uni.request({
            url: baseUrl + options.url,
            method: options.method || 'GET',
            data: options.data || {},
            header: {
                ...options.header,
                // 按照 API 文档要求，通常使用 Bearer 格式
                'Authorization': token ? `Bearer ${token}` : ''
            },
            success: (res) => {
                console.log('[http] 响应状态码:', res.statusCode);
                console.log('[http] 响应数据:', res.data);
                
                // 根据后端数据结构，通常 res.data 才是我们要的内容
                if (res.statusCode === 401) {
					uni.showToast({ title: '请先登录', icon: 'none' });
					uni.navigateTo({ url: '/pages/login/login' });
					return reject(res.data);
				}
				
				// 处理 500 等服务器错误
				if (res.statusCode >= 500) {
					console.error('[http] 服务器错误:', res.data);
					uni.showToast({ 
						title: '服务器错误: ' + (res.data?.message || '请稍后重试'), 
						icon: 'none',
						duration: 3000
					});
					return reject(res.data);
				}
				
				// 处理其他错误状态码
				if (res.statusCode >= 400) {
					console.error('[http] 请求错误:', res.statusCode, res.data);
					return reject(res.data);
				}
				
				resolve(res.data);
            },
            fail: (err) => {
                console.error('[http] 网络请求失败:', err);
                uni.showToast({ title: '网络连接失败', icon: 'none' });
                reject(err);
            }
        });
    });
};