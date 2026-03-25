<template>
  <view class="service-container">
    <!-- 顶部导航 -->
    <view class="tabs-box">
      <u-tabs 
        :list="tabs" 
        @change="handleTabChange"
        :current="currentTab"
        activeColor="#5d8a6a"
        :scrollable="false"
        :itemStyle="{ flex: 1, height: '88rpx' }"
        :activeStyle="{ color: '#5d8a6a', fontWeight: 'bold' }"
      ></u-tabs>
    </view>

    <!-- 茶叶购买 -->
    <view v-if="currentTab === 0" class="tea-shop">
      <view class="banner">
        <u-image src="/static/placeholders/banner.png" width="100%" height="300rpx"></u-image>
      </view>
      
      <u-loading-icon v-if="teaLoading" mode="circle" text="加载中..."></u-loading-icon>
      
      <view v-else class="product-list">
        <view 
          v-for="product in teaProducts" 
          :key="product.id"
          class="product-card"
        >
          <u-image 
            :src="product.image || '/static/placeholders/tea.png'" 
            width="100%" 
            height="200rpx"
            radius="8rpx"
          ></u-image>
          <view class="product-info">
            <u-text :text="product.name" size="15" bold color="#303133" :lines="2"></u-text>
            <u-tag :text="product.origin" size="mini" type="success" plain margin="10rpx 0"></u-tag>
            <view class="product-footer">
              <u-text :text="'¥' + product.price" size="18" bold color="#ff6b6b"></u-text>
              <u-button
                size="mini"
                type="primary"
                text="购买"
                @click.stop="openBuy(product, 'tea')"
                customStyle="height: 46rpx;"
              ></u-button>
              <u-text :text="'已售' + product.sales" size="12" color="#909399"></u-text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 茶具商城 -->
    <view v-if="currentTab === 1" class="teaware-shop">
      <view class="category-filter">
        <u-tag 
          v-for="cat in teawareCategories" 
          :key="cat"
          :text="cat" 
          size="small"
          :type="selectedCategory === cat ? 'primary' : 'info'"
          :plain="selectedCategory !== cat"
          @click="selectCategory(cat)"
          margin="0 15rpx 15rpx 0"
        ></u-tag>
      </view>

      <u-loading-icon v-if="teawareLoading" mode="circle" text="加载中..."></u-loading-icon>

      <view v-else class="product-list">
        <view 
          v-for="product in filteredTeawareProducts" 
          :key="product.id"
          class="product-card"
        >
          <u-image 
            :src="product.image || '/static/placeholders/teaware.png'" 
            width="100%" 
            height="200rpx"
            radius="8rpx"
          ></u-image>
          <view class="product-info">
            <u-text :text="product.name" size="15" bold color="#303133" :lines="2"></u-text>
            <u-tag :text="product.category" size="mini" type="warning" plain margin="10rpx 0"></u-tag>
            <view class="product-footer">
              <u-text :text="'¥' + product.price" size="18" bold color="#ff6b6b"></u-text>
              <u-button
                size="mini"
                type="primary"
                text="购买"
                @click.stop="openBuy(product, 'tool')"
                customStyle="height: 46rpx;"
              ></u-button>
              <u-text :text="'已售' + product.sales" size="12" color="#909399"></u-text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 茶艺师认证 -->
    <view v-if="currentTab === 2" class="certification">
      <view class="cert-intro">
        <u-text text="茶艺师认证报名" size="20" bold color="#303133"></u-text>
        <u-text text="专业认证，权威机构颁发" size="14" color="#909399" margin="10rpx 0 0 0"></u-text>
      </view>

      <view class="cert-filter">
        <u-tag 
          v-for="lv in certLevels" 
          :key="lv"
          :text="lv" 
          size="small"
          :type="selectedLevel === lv ? 'primary' : 'info'"
          :plain="selectedLevel !== lv"
          @click="selectLevel(lv)"
          margin="0 15rpx 15rpx 0"
        ></u-tag>
      </view>

      <u-loading-icon v-if="certLoading" mode="circle" text="加载中..."></u-loading-icon>

      <view class="cert-list" v-else>
        <view 
          v-for="cert in certifications" 
          :key="cert.id"
          class="cert-card"
        >
          <view class="cert-icon">
            <u-icon name="medal" color="#ffc107" size="40"></u-icon>
          </view>
          <view class="cert-info">
            <u-text :text="cert.title" size="17" bold color="#303133"></u-text>
            <u-text :text="cert.description" size="13" color="#606266" margin="10rpx 0" :lines="2"></u-text>
            <view class="cert-meta">
              <u-tag :text="cert.level" size="mini" :type="getCertLevelColor(cert.level)" plain></u-tag>
              <u-text :text="'课程费用：¥' + cert.price" size="14" color="#ff6b6b" margin="0 0 0 15rpx"></u-text>
            </view>
            <view class="cert-details">
              <u-text :text="'课时：' + cert.duration + '天'" size="12" color="#909399"></u-text>
              <u-text :text="'开课城市：' + cert.city" size="12" color="#909399" margin="0 0 0 20rpx"></u-text>
            </view>
            <view class="cert-footer">
              <u-text :text="'开课时间：' + formatDate(cert.start_date)" size="12" color="#909399"></u-text>
              <u-button 
                v-if="cert.status === 1"
                size="mini" 
                :type="cert.enrolled ? 'info' : 'primary'" 
                :text="cert.enrolled ? '已报名' : '立即报名'" 
                :disabled="cert.enrolled"
                color="#5d8a6a"
                @click.stop="openCertEnroll(cert)"
              ></u-button>
              <u-tag v-else-if="cert.status === 2" text="已满员" size="mini" type="info"></u-tag>
              <u-tag v-else text="已结束" size="mini" type="info"></u-tag>
            </view>
          </view>
        </view>
      </view>
    </view>

    <!-- 茶艺师报名弹窗 -->
    <u-popup :show="showCertEnroll" @close="closeCertEnroll" mode="center" round="12">
      <view class="enroll-popup">
        <u-text text="茶艺师课程报名" size="16" bold></u-text>
        <view class="enroll-form">
          <u-input
            v-model="certEnrollPhone"
            placeholder="请输入联系电话"
            type="number"
            clearable
            border="bottom"
          ></u-input>
        </view>
        <view class="enroll-actions">
          <u-button text="取消" @click="closeCertEnroll"></u-button>
          <u-button type="primary" text="确认报名" @click="submitCertEnroll"></u-button>
        </view>
      </view>
    </u-popup>

    <!-- 购买弹窗 -->
    <u-popup :show="showBuy" @close="closeBuy" mode="center" round="12">
      <view class="buy-popup">
        <u-text text="确认购买" size="16" bold></u-text>
        <view class="buy-info">
          <u-text :text="buyProduct?.name || ''" size="14" color="#303133"></u-text>
          <u-text :text="'单价：¥' + (buyProduct?.price || 0)" size="12" color="#909399" margin="6rpx 0 0 0"></u-text>
        </view>
        <view class="buy-form">
          <u-input
            v-model="buyQuantity"
            placeholder="购买数量"
            type="number"
            clearable
            border="bottom"
          ></u-input>
          <u-input
            v-model="buyPhone"
            placeholder="联系电话"
            type="number"
            clearable
            border="bottom"
            customStyle="margin-top: 12rpx;"
          ></u-input>
          <u-input
            v-model="buyAddress"
            placeholder="收货地址"
            clearable
            border="bottom"
            customStyle="margin-top: 12rpx;"
          ></u-input>
          <u-text :text="'合计：¥' + buyTotal" size="14" bold color="#ff6b6b" margin="12rpx 0 0 0"></u-text>
        </view>
        <view class="buy-actions">
          <u-button text="取消" @click="closeBuy"></u-button>
          <u-button type="primary" text="确认购买" @click="() => { console.log('[test] 按钮点击'); submitBuy(); }"></u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request } from '@/utils/http.js';

const currentTab = ref(0);
const tabs = ref([
  { name: '茶叶购买' },
  { name: '茶具商城' },
  { name: '茶艺师认证' }
]);

const selectedCategory = ref('全部');
const teawareCategories = ref(['全部', '紫砂壶', '盖碗', '公道杯', '品茗杯', '茶盘']);
const selectedLevel = ref('全部');
const certLevels = ref(['全部', '初级', '中级', '高级']);
const certLoading = ref(false);
const teaLoading = ref(false);
const teawareLoading = ref(false);
const showCertEnroll = ref(false);
const showBuy = ref(false);
const buyProduct = ref(null);
const buyQuantity = ref('1');
const buyPhone = ref('');
const buyAddress = ref('');
const certEnrollPhone = ref('');
const selectedCourse = ref(null);
const enrolledCourseIds = ref(new Set());

// 茶叶商品
const teaProducts = ref([]);

const loadTeaProducts = async () => {
  try {
    teaLoading.value = true;

    const res = await request({
      url: '/products',
      method: 'GET',
      data: {
        type: 'tea',
        page: 1,
        limit: 20
      }
    });

    const list = Array.isArray(res)
      ? res
      : (Array.isArray(res.data)
        ? res.data
        : (res.data?.data || res.list || []));

    teaProducts.value = list.map(item => ({
      id: item.id,
      name: item.name,
      origin: item.origin || '产地直供',
      price: item.price,
      sales: 0, // 后端暂无销量字段
      image: item.image || ''
    }));
  } catch (e) {
    console.error('加载茶叶商品失败:', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    teaLoading.value = false;
  }
};

// 茶具商品
const teawareProducts = ref([]);
const filteredTeawareProducts = computed(() => {
  if (selectedCategory.value === '全部') {
    return teawareProducts.value;
  }
  return teawareProducts.value.filter(item => item.category === selectedCategory.value);
});

const buyTotal = computed(() => {
  if (!buyProduct.value) return 0;
  const qty = Number(buyQuantity.value) || 1;
  return (buyProduct.value.price || 0) * qty;
});

const loadTeawareProducts = async () => {
  try {
    teawareLoading.value = true;

    const res = await request({
      url: '/products',
      method: 'GET',
      data: {
        type: 'tool',
        page: 1,
        limit: 20
      }
    });

    const list = Array.isArray(res)
      ? res
      : (Array.isArray(res.data)
        ? res.data
        : (res.data?.data || res.list || []));

    teawareProducts.value = list.map(item => {
      // 根据名称推断分类
      let category = '茶具';
      if (item.name.includes('紫砂壶')) category = '紫砂壶';
      else if (item.name.includes('盖碗')) category = '盖碗';
      else if (item.name.includes('公道杯')) category = '公道杯';
      else if (item.name.includes('品茗杯')) category = '品茗杯';
      else if (item.name.includes('茶盘')) category = '茶盘';

      return {
        id: item.id,
        name: item.name,
        category,
        price: item.price,
        sales: 0,
        image: item.image || ''
      };
    });
  } catch (e) {
    console.error('加载茶具商品失败:', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    teawareLoading.value = false;
  }
};

// 认证课程
const certifications = ref([]);

const formatDate = (value) => {
  if (!value) return '';
  const date = value.split('T')[0] || value.split(' ')[0];
  return date;
};

const loadMyCertEnrollments = async () => {
  const token = uni.getStorageSync('token');
  if (!token) {
    enrolledCourseIds.value = new Set();
    return;
  }

  try {
    const res = await request({
      url: '/certEnroll/my',
      method: 'GET'
    });

    const list = Array.isArray(res)
      ? res
      : (Array.isArray(res.data)
        ? res.data
        : (res.data?.data || res.list || []));

    enrolledCourseIds.value = new Set(list.map(item => item.course_id));
  } catch (e) {
    console.error('加载报名记录失败:', e);
  }
};

const loadCertifications = async () => {
  try {
    certLoading.value = true;

    const params = {
      page: 1,
      limit: 20,
      status: 1
    };
    if (selectedLevel.value && selectedLevel.value !== '全部') {
      params.level = selectedLevel.value;
    }

    console.log('[certificates] request params:', params);
    const res = await request({
      url: '/certificates',
      method: 'GET',
      data: params
    });

    console.log('[certificates] response:', res);
    const list = Array.isArray(res)
      ? res
      : (Array.isArray(res.data)
        ? res.data
        : (res.data?.data || res.list || []));

    console.log('[certificates] parsed list:', list);
    certifications.value = list.map(item => ({
      ...item,
      enrolled: enrolledCourseIds.value.has(item.id)
    }));
    
    if (list.length === 0) {
      uni.showToast({ title: '暂无课程数据', icon: 'none' });
    }
  } catch (e) {
    console.error('加载课程失败:', e);
    uni.showToast({ title: '加载课程失败', icon: 'none' });
  } finally {
    certLoading.value = false;
  }
};

const selectLevel = (level) => {
  selectedLevel.value = level;
  loadCertifications();
};

const openCertEnroll = (course) => {
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return uni.navigateTo({ url: '/pages/login/login' });
  }
  selectedCourse.value = course;
  certEnrollPhone.value = '';
  showCertEnroll.value = true;
};

const closeCertEnroll = () => {
  showCertEnroll.value = false;
};

const submitCertEnroll = async () => {
  if (!certEnrollPhone.value) {
    return uni.showToast({ title: '请输入联系电话', icon: 'none' });
  }
  if (!selectedCourse.value) {
    return uni.showToast({ title: '请选择课程', icon: 'none' });
  }

  try {
    await request({
      url: '/certEnroll',
      method: 'POST',
      data: {
        course_id: selectedCourse.value.id,
        phone: certEnrollPhone.value
      }
    });

    uni.showToast({ title: '报名成功', icon: 'success' });
    showCertEnroll.value = false;
    await loadMyCertEnrollments();
    loadCertifications();
  } catch (e) {
    console.error('报名失败:', e);
    uni.showToast({ title: '报名失败', icon: 'none' });
  }
};

const openBuy = (product, type) => {
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return uni.navigateTo({ url: '/pages/login/login' });
  }
  buyProduct.value = { ...product, type };
  buyQuantity.value = '1';
  buyPhone.value = '';
  buyAddress.value = '';
  showBuy.value = true;
};

const closeBuy = () => {
  showBuy.value = false;
};

const submitBuy = async () => {
  const qty = Number(buyQuantity.value) || 0;
  if (!buyProduct.value) {
    return uni.showToast({ title: '请选择商品', icon: 'none' });
  }
  if (qty <= 0 || qty > 999) {
    return uni.showToast({ title: '请输入1-999之间的数量', icon: 'none' });
  }
  if (!buyPhone.value) {
    return uni.showToast({ title: '请输入联系电话', icon: 'none' });
  }
  if (!buyAddress.value) {
    return uni.showToast({ title: '请输入收货地址', icon: 'none' });
  }

  console.log('[submitBuy] 开始提交订单...');
  
  try {
    const payload = {
      product_id: buyProduct.value.id,
      quantity: qty,
      receiver_name: '用户',
      receiver_phone: buyPhone.value,
      receiver_address: buyAddress.value
    };
    console.log('[submitBuy] 请求参数:', payload);

    const res = await request({
      url: '/orders',
      method: 'POST',
      data: payload
    });

    console.log('[submitBuy] 收到响应:', res);

    if (res && res.data && res.data.id) {
      uni.showToast({ title: '订单创建成功', icon: 'success' });
      buyProduct.value = null;
      buyQuantity.value = '1';
      buyPhone.value = '';
      buyAddress.value = '';
      showBuy.value = false;
    } else {
      console.error('[submitBuy] 响应异常:', res);
      uni.showToast({ title: res?.message || '下单失败', icon: 'none' });
    }
  } catch (e) {
    console.error('[submitBuy] 异常错误:', e);
    uni.showToast({ title: '下单失败: ' + e.message, icon: 'none' });
  }
};

const handleTabChange = (item) => {
  const index = typeof item === 'object' ? item.index : item;
  currentTab.value = index;
  if (index === 0) {
    loadTeaProducts();
  } else if (index === 1) {
    loadTeawareProducts();
  } else if (index === 2) {
    loadMyCertEnrollments();
    loadCertifications();
  }
};

onLoad((options) => {
  const tabIndex = Number(options?.tab || 0);
  currentTab.value = Number.isNaN(tabIndex) ? 0 : tabIndex;
  if (currentTab.value === 0) {
    loadTeaProducts();
  } else if (currentTab.value === 1) {
    loadTeawareProducts();
  } else if (currentTab.value === 2) {
    loadMyCertEnrollments();
    loadCertifications();
  }
});

onMounted(() => {
  if (currentTab.value === 0) {
    loadTeaProducts();
  }
  loadMyCertEnrollments();
});

const selectCategory = (cat) => {
  selectedCategory.value = cat;
  // 根据分类筛选商品
};

const getCertLevelColor = (level) => {
  const colorMap = {
    '初级': 'success',
    '中级': 'warning',
    '高级': 'error'
  };
  return colorMap[level] || 'primary';
};

const goProductDetail = (id, type) => {
  // 产品详情页已删除，仅保留购买按钮功能
};



</script>

<style lang="scss" scoped>
.service-container {
  min-height: 100vh;
  background-color: #f5f5f5;

  .tabs-box {
    background-color: #fff;
    padding: 20rpx 0;
    width: 100%;

    :deep(.u-tabs__wrapper__nav) {
      display: flex !important;
      flex-direction: row;
      width: 100% !important;
      
      .u-tabs__wrapper__nav__item {
        flex: 1 !important;
        padding: 0 !important;
        display: flex;
        justify-content: center;
      }
    }
  }

  .tea-shop, .teaware-shop {
    .banner {
      margin-bottom: 20rpx;
    }

    .category-filter {
      padding: 20rpx;
      background-color: #fff;
      margin-bottom: 20rpx;
    }

    .product-list {
      padding: 20rpx;
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 20rpx;

      .product-card {
        background-color: #fff;
        border-radius: 12rpx;
        overflow: hidden;

        .product-info {
          padding: 15rpx;

          .product-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 10rpx;
          }
        }
      }
    }
  }

  .certification {
    padding: 20rpx;

    .cert-intro {
      background-color: #fff;
      padding: 30rpx;
      border-radius: 12rpx;
      margin-bottom: 20rpx;
      text-align: center;
    }

    .cert-filter {
      padding: 20rpx;
      background-color: #fff;
      margin-bottom: 20rpx;
      border-radius: 12rpx;
    }

    .cert-list {
      .cert-card {
        display: flex;
        background-color: #fff;
        border-radius: 12rpx;
        padding: 25rpx;
        margin-bottom: 20rpx;

        .cert-icon {
          margin-right: 20rpx;
        }

        .cert-info {
          flex: 1;

          .cert-meta {
            display: flex;
            align-items: center;
            margin-top: 15rpx;
          }

          .cert-details {
            display: flex;
            align-items: center;
            margin-top: 10rpx;
          }

          .cert-footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-top: 20rpx;
            padding-top: 15rpx;
            border-top: 1rpx solid #f0f0f0;
          }
        }
      }
    }
  }

  .enroll-popup {
    width: 560rpx;
    padding: 30rpx;

    .enroll-form {
      margin-top: 20rpx;
    }

    .enroll-actions {
      margin-top: 30rpx;
      display: flex;
      justify-content: space-between;
      gap: 20rpx;
    }
  }
}
</style>
