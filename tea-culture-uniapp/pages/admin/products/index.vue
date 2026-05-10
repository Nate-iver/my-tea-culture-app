<template>
  <view class="products-admin-container">
    <!-- 顶部操作栏 -->
    <view class="top-bar">
      <u-button 
        icon="plus"
        text="新增产品"
        type="primary"
        @click="goAddProduct"
        size="small"
      ></u-button>
    </view>

    <!-- 加载状态 -->
    <u-loading-icon v-if="loading" mode="circle" text="加载中..."></u-loading-icon>

    <!-- 空状态 -->
    <view v-else-if="products.length === 0" class="empty-state">
      <u-icon name="basket" color="#ccc" size="80"></u-icon>
      <u-text text="暂无产品" size="16" color="#909399" margin="20rpx 0 0 0"></u-text>
    </view>

    <!-- 产品列表 -->
    <view v-else class="products-list">
      <view v-for="product in products" :key="product.id" class="product-item">
        <view class="product-info">
          <u-text :text="product.name" size="15" bold color="#303133"></u-text>
          <u-text :text="'分类: ' + product.type" size="12" color="#909399" margin="8rpx 0 0 0"></u-text>
          <u-text :text="'价格: ¥' + product.price" size="14" bold color="#ff6b6b" margin="8rpx 0 0 0"></u-text>
        </view>

        <view class="product-actions">
          <u-icon name="edit-pen" size="20" color="#5d8a6a" @click="editProduct(product.id)"></u-icon>
          <u-icon name="trash" size="20" color="#ff6b6b" margin="0 0 0 15rpx" @click="deleteProduct(product.id)"></u-icon>
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
const products = ref([]);

onMounted(() => {
  if (!checkPermission('admin')) {
    return;
  }
  loadProducts();
});

const loadProducts = async () => {
  try {
    loading.value = true;
    
    console.log('[products-admin] 开始加载产品列表...');
    const res = await request({
      url: '/products',
      method: 'GET',
      data: { page: 1, pageSize: 100 }
    });

    console.log('[products-admin] API 响应:', res);
    console.log('[products-admin] 响应类型:', typeof res);
    
    const list = Array.isArray(res) ? res : (res.data || res.list || []);
    products.value = list;
    
    console.log('[products-admin] 产品列表:', list);
    console.log('[products-admin] 加载完成:', products.value.length, '件产品');
    
    if (list.length === 0) {
      uni.showToast({ title: '暂无产品数据', icon: 'none' });
    }
  } catch (e) {
    console.error('[products-admin] 加载失败:', e);
    console.error('[products-admin] 错误详情:', JSON.stringify(e));
    uni.showToast({ title: '加载失败: ' + (e.message || '未知错误'), icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const goAddProduct = () => {
  uni.navigateTo({ url: '/pages/admin/products/edit' });
};

const editProduct = (productId) => {
  uni.navigateTo({ url: `/pages/admin/products/edit?id=${productId}` });
};

const deleteProduct = (productId) => {
  uni.showModal({
    title: '删除确认',
    content: '确定要删除这个产品吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({
            url: `/products/${productId}`,
            method: 'DELETE'
          });
          uni.showToast({ title: '删除成功', icon: 'success' });
          loadProducts();
        } catch (e) {
          console.error('删除失败:', e);
          uni.showToast({ title: '删除失败', icon: 'none' });
        }
      }
    }
  });
};

const goBack = () => {
  uni.navigateBack({ delta: 1 });
};
</script>

<style lang="scss" scoped>
.products-admin-container {
  background-color: #f5f5f5;
  min-height: 100vh;

  .top-bar {
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

  .products-list {
    padding: 20rpx;

    .product-item {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-bottom: 15rpx;
      display: flex;
      justify-content: space-between;
      align-items: center;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

      .product-info {
        flex: 1;
      }

      .product-actions {
        display: flex;
        align-items: center;
        margin-left: 15rpx;
      }
    }
  }
}

.navbar-back {
  padding: 0 15rpx;
  cursor: pointer;
}
</style>
