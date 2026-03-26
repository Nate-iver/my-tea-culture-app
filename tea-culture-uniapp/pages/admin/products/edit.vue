<template>
  <view class="product-edit-container">
    <u-navbar 
      title="产品编辑"
      :is-back="true"
      @back="goBack"
    ></u-navbar>

    <view class="edit-content">
      <u-form 
        :model="formData" 
        ref="formRef"
        label-width="120"
      >
        <!-- 基本信息 -->
        <view class="form-section">
          <u-text text="基本信息" size="16" bold color="#303133" margin="0 0 15 0"></u-text>
          
          <u-form-item label="产品名称" prop="name" required>
            <u-input v-model="formData.name" placeholder="输入产品名称" border="bottom"></u-input>
          </u-form-item>

          <u-form-item label="产品类型" prop="type" required>
            <u-radio-group v-model="formData.type">
              <u-radio label="茶叶" name="tea"></u-radio>
              <u-radio label="茶具" name="tool"></u-radio>
            </u-radio-group>
          </u-form-item>

          <u-form-item label="产品描述" prop="description">
            <u-textarea 
              v-model="formData.description" 
              placeholder="输入产品描述"
              height="180"
              border="bottom"
            ></u-textarea>
          </u-form-item>
        </view>

        <!-- 价格库存 -->
        <view class="form-section">
          <u-text text="价格和库存" size="16" bold color="#303133" margin="20 0 15 0"></u-text>
          
          <u-form-item label="价格(¥)" prop="price" required>
            <u-input 
              v-model="formData.price" 
              type="number"
              placeholder="0.00"
              border="bottom"
            ></u-input>
          </u-form-item>

          <u-form-item label="图片URL" prop="image">
            <u-input 
              v-model="formData.image" 
              placeholder="产品图片链接"
              border="bottom"
            ></u-input>
          </u-form-item>

          <u-form-item label="产地" prop="origin">
            <u-input v-model="formData.origin" placeholder="如：浙江杭州" border="bottom"></u-input>
          </u-form-item>

          <u-form-item label="溯源码" prop="trace_code">
            <u-input v-model="formData.trace_code" placeholder="产品溯源码" border="bottom"></u-input>
          </u-form-item>
        </view>
      </u-form>

      <!-- 操作按钮 -->
      <view class="form-actions">
        <u-button 
          type="default"
          text="取消"
          @click="goBack"
        ></u-button>
        <u-button 
          type="primary"
          text="保存"
          @click="saveProduct"
          :loading="saving"
        ></u-button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '@/utils/http.js';
import { checkPermission, backToAdminHome } from '@/utils/auth.js';

const formRef = ref(null);
const saving = ref(false);
const productId = ref(null);

const formData = ref({
  name: '',
  type: 'tea',
  description: '',
  price: '',
  image: '',
  origin: '',
  trace_code: ''
});

onMounted(() => {
  if (!checkPermission('admin')) {
    return;
  }
  
  // 从路由参数中获取产品ID
  const pages = getCurrentPages();
  const currentPage = pages[pages.length - 1];
  if (currentPage?.options?.id) {
    productId.value = parseInt(currentPage.options.id);
    loadProduct();
  }
});

const loadProduct = async () => {
  if (!productId.value) return;
  
  try {
    const res = await request({
      url: `/products/${productId.value}`,
      method: 'GET'
    });
    
    console.log('[product-edit] 加载产品:', res);
    formData.value = {
      name: res.name || '',
      type: res.type || 'tea',
      description: res.description || '',
      price: String(res.price || ''),
      image: res.image || '',
      origin: res.origin || '',
      trace_code: res.trace_code || ''
    };
  } catch (e) {
    console.error('[product-edit] 加载产品失败:', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
};

const saveProduct = async () => {
  if (!formData.value.name) {
    uni.showToast({ title: '请输入产品名称', icon: 'none' });
    return;
  }
  
  if (!formData.value.price || isNaN(formData.value.price)) {
    uni.showToast({ title: '请输入有效价格', icon: 'none' });
    return;
  }
  
  try {
    saving.value = true;
    const data = {
      ...formData.value,
      price: Number(formData.value.price)
    };

    if (productId.value) {
      // 编辑
      await request({
        url: `/products/${productId.value}`,
        method: 'PUT',
        data
      });
      uni.showToast({ title: '更新成功', icon: 'success' });
    } else {
      // 新增
      await request({
        url: '/products',
        method: 'POST',
        data
      });
      uni.showToast({ title: '添加成功', icon: 'success' });
    }

    setTimeout(() => {
      backToAdminHome();
    }, 500);
  } catch (e) {
    console.error('[product-edit] 保存失败:', e);
    uni.showToast({ title: '保存失败', icon: 'none' });
  } finally {
    saving.value = false;
  }
};

const goBack = () => {
  backToAdminHome();
};
</script>

<style lang="scss" scoped>
.product-edit-container {
  background-color: #f5f5f5;
  min-height: 100vh;

  .edit-content {
    padding: 20rpx;

    .form-section {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-bottom: 20rpx;
    }

    .form-actions {
      display: flex;
      gap: 15rpx;
      margin-top: 30rpx;
      padding-bottom: 50rpx;

      u-button {
        flex: 1;
      }
    }
  }
}
</style>
