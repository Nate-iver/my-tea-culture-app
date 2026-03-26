<template>
  <view class="certificates-admin-container">
    <!-- 自定义导航栏 -->
    <u-navbar 
      title="课程管理"
      :is-back="true"
      @back="goBack"
      :background="{ background: '#fff' }"
    ></u-navbar>

    <!-- 添加按钮 -->
    <view class="add-btn-bar">
      <u-button 
        type="primary"
        text="+ 添加课程"
        @click="showAddCertificate"
      ></u-button>
    </view>

    <!-- 加载状态 -->
    <u-loading-icon v-if="loading" mode="circle" text="加载中..."></u-loading-icon>

    <!-- 空状态 -->
    <view v-else-if="certificates.length === 0" class="empty-state">
      <u-icon name="star" color="#ccc" size="80"></u-icon>
      <u-text text="暂无课程" size="16" color="#909399" margin="20rpx 0 0 0"></u-text>
    </view>

    <!-- 课程列表 -->
    <view v-else class="certificates-list">
      <view v-for="cert in certificates" :key="cert.id" class="cert-item">
        <view class="cert-header">
          <view class="cert-info">
            <u-text :text="cert.title || cert.name" size="15" bold color="#303133"></u-text>
            <u-text :text="cert.level" size="12" color="#909399" margin="5rpx 0 0 0"></u-text>
          </view>
          <u-tag :text="'¥' + cert.price" type="success" size="mini"></u-tag>
        </view>

        <view class="cert-content">
          <u-text :text="cert.description" size="13" color="#606266" :lines="2"></u-text>
          <view class="cert-meta" style="margin-top: 10rpx;">
            <u-text :text="'课时: ' + cert.duration + '天'" size="12" color="#909399"></u-text>
            <u-text :text="'报名: ' + (cert.current_students || 0) + '/' + (cert.max_students || 0)" size="12" color="#909399" margin="0 0 0 20rpx"></u-text>
          </view>
        </view>

        <view class="cert-actions">
          <u-button 
            size="mini"
            type="primary"
            text="编辑"
            @click="editCertificate(cert)"
            plain
          ></u-button>
          <u-button 
            size="mini"
            type="error"
            text="删除"
            @click="deleteCertificate(cert.id)"
            plain
          ></u-button>
        </view>
      </view>
    </view>

    <!-- 编辑/新增弹窗 -->
    <u-popup 
      :show="showModal"
      @close="showModal = false"
      mode="center"
      :closeable="true"
      :round="20"
    >
      <view class="modal-content">
        <u-text text="课程信息" size="18" bold color="#303133" margin="0 0 20 0"></u-text>

        <u-form 
          :model="formData" 
          ref="uForm"
          label-width="100rpx"
          :rules="rules"
        >
          <u-form-item label="课程标题" prop="title">
            <u-input v-model="formData.title" placeholder="输入课程标题" border="none"></u-input>
          </u-form-item>

          <u-form-item label="课程等级" prop="level">
            <u-input v-model="formData.level" placeholder="入门/中级/高级" border="none"></u-input>
          </u-form-item>

          <u-form-item label="开课城市" prop="city">
            <u-input v-model="formData.city" placeholder="如：杭州" border="none"></u-input>
          </u-form-item>

          <u-form-item label="开课时间" prop="start_date">
            <view style="display: flex; gap: 10rpx;">
              <u-input 
                v-model="formData.start_date" 
                placeholder="YYYY-MM-DD HH:mm:ss" 
                border="none"
                readonly
              ></u-input>
              <u-button 
                text="选择"
                type="primary"
                size="mini"
                @click="openDateTimePicker"
              ></u-button>
            </view>
          </u-form-item>

          <u-form-item label="课程描述" prop="description">
            <u-textarea v-model="formData.description" placeholder="输入课程描述" border="none" height="150rpx"></u-textarea>
          </u-form-item>

          <u-form-item label="课时" prop="duration">
            <u-input v-model="formData.duration" type="number" placeholder="课时数" border="none"></u-input>
          </u-form-item>

          <u-form-item label="价格" prop="price">
            <u-input v-model="formData.price" type="number" placeholder="课程价格" border="none"></u-input>
          </u-form-item>

          <u-form-item label="招生人数" prop="max_students">
            <u-input v-model="formData.max_students" type="number" placeholder="最大学员数" border="none"></u-input>
          </u-form-item>
        </u-form>

        <view class="modal-actions">
          <u-button 
            text="取消"
            type="default"
            @click="showModal = false"
          ></u-button>
          <u-button 
            text="保存"
            type="primary"
            @click="saveCertificate"
          ></u-button>
        </view>
      </view>
    </u-popup>

    <!-- 日期时间选择器弹窗 -->
    <u-popup 
      :show="showDateTimePickerModal"
      @close="showDateTimePickerModal = false"
      mode="bottom"
      :closeable="true"
    >
      <view class="datetime-picker-container">
        <view class="datetime-picker-header">
          <u-text text="选择开课时间" size="16" bold color="#303133"></u-text>
          <u-button 
            text="确定"
            type="primary"
            size="mini"
            @click="confirmDateTime"
          ></u-button>
        </view>

        <!-- 日期选择 -->
        <view class="picker-section">
          <u-text text="日期" size="13" color="#606266" margin="0 0 10 0"></u-text>
          <view style="display: flex; gap: 10rpx; align-items: center;">
            <u-input 
              v-model="tempYear" 
              type="number" 
              placeholder="年"
              border="solid"
              style="flex: 1;"
            ></u-input>
            <u-text text="年" size="13" color="#303133"></u-text>
            <u-input 
              v-model="tempMonth" 
              type="number" 
              placeholder="月" 
              border="solid"
              style="flex: 1;"
            ></u-input>
            <u-text text="月" size="13" color="#303133"></u-text>
            <u-input 
              v-model="tempDay" 
              type="number" 
              placeholder="日" 
              border="solid"
              style="flex: 1;"
            ></u-input>
            <u-text text="日" size="13" color="#303133"></u-text>
          </view>
        </view>

        <!-- 时间选择 -->
        <view class="picker-section">
          <u-text text="时间" size="13" color="#606266" margin="0 0 10 0"></u-text>
          <view style="display: flex; gap: 10rpx; align-items: center;">
            <u-input 
              v-model="tempHour" 
              type="number" 
              placeholder="时" 
              border="solid"
              style="flex: 1;"
            ></u-input>
            <u-text text="时" size="13" color="#303133"></u-text>
            <u-input 
              v-model="tempMinute" 
              type="number" 
              placeholder="分" 
              border="solid"
              style="flex: 1;"
            ></u-input>
            <u-text text="分" size="13" color="#303133"></u-text>
            <u-input 
              v-model="tempSecond" 
              type="number" 
              placeholder="秒" 
              border="solid"
              style="flex: 1;"
            ></u-input>
            <u-text text="秒" size="13" color="#303133"></u-text>
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import { request } from '@/utils/http.js';
import { checkPermission, backToAdminHome } from '@/utils/auth.js';

const loading = ref(false);
const certificates = ref([]);
const showModal = ref(false);
const editingId = ref(null);
const showDateTimePickerModal = ref(false);

// 日期时间选择器状态
const currentYear = ref(new Date().getFullYear());
const currentMonth = ref(new Date().getMonth() + 1);
const currentDay = ref(new Date().getDate());
const currentHour = ref(new Date().getHours());
const currentMinute = ref(new Date().getMinutes());
const currentSecond = ref(0);

// 临时选择值（用于输入框）
const tempYear = ref(String(new Date().getFullYear()));
const tempMonth = ref(String(new Date().getMonth() + 1).padStart(2, '0'));
const tempDay = ref(String(new Date().getDate()).padStart(2, '0'));
const tempHour = ref(String(new Date().getHours()).padStart(2, '0'));
const tempMinute = ref(String(new Date().getMinutes()).padStart(2, '0'));
const tempSecond = ref('00');

// 生成年份数组 (当前年份-10年 到 当前年份+10年)
const generateYears = () => {
  const years = [];
  const start = currentYear.value - 10;
  const end = currentYear.value + 10;
  for (let i = start; i <= end; i++) {
    years.push({ text: i + '年', value: i });
  }
  return years;
};

// 生成月份数组
const generateMonths = () => {
  const months = [];
  for (let i = 1; i <= 12; i++) {
    months.push({ text: String(i).padStart(2, '0') + '月', value: i });
  }
  return months;
};

// 生成日期数组
const generateDays = () => {
  const days = [];
  const daysInMonth = new Date(currentYear.value, currentMonth.value, 0).getDate();
  for (let i = 1; i <= daysInMonth; i++) {
    days.push({ text: String(i).padStart(2, '0') + '日', value: i });
  }
  return days;
};

// 生成小时数组
const generateHours = () => {
  const hours = [];
  for (let i = 0; i < 24; i++) {
    hours.push({ text: String(i).padStart(2, '0') + '时', value: i });
  }
  return hours;
};

// 生成分钟数组
const generateMinutes = () => {
  const minutes = [];
  for (let i = 0; i < 60; i++) {
    minutes.push({ text: String(i).padStart(2, '0') + '分', value: i });
  }
  return minutes;
};

// 生成秒数数组
const generateSeconds = () => {
  const seconds = [];
  for (let i = 0; i < 60; i++) {
    seconds.push({ text: String(i).padStart(2, '0') + '秒', value: i });
  }
  return seconds;
};

// 打开日期时间选择器时，初始化临时值
const openDateTimePicker = () => {
  const date = new Date(formData.value.start_date || new Date());
  tempYear.value = String(date.getFullYear());
  tempMonth.value = String(date.getMonth() + 1).padStart(2, '0');
  tempDay.value = String(date.getDate()).padStart(2, '0');
  tempHour.value = String(date.getHours()).padStart(2, '0');
  tempMinute.value = String(date.getMinutes()).padStart(2, '0');
  tempSecond.value = String(date.getSeconds()).padStart(2, '0');
  showDateTimePickerModal.value = true;
};

// 日期列配置
const dateColumns = computed(() => [
  generateYears(),
  generateMonths(),
  generateDays()
]);

// 时间列配置
const timeColumns = ref([
  generateHours(),
  generateMinutes(),
  generateSeconds()
]);

// 默认选中索引
const dateDefaultIndex = computed(() => {
  const yearIndex = currentYear.value - (currentYear.value - 10);
  return [yearIndex, currentMonth.value - 1, currentDay.value - 1];
});
const timeDefaultIndex = computed(() => [currentHour.value, currentMinute.value, currentSecond.value]);

onMounted(() => {
  if (!checkPermission('admin')) {
    return;
  }
  loadCertificates();
});

const formData = ref({
  title: '',
  level: '',
  city: '',
  start_date: '',
  description: '',
  duration: '10',
  price: '99',
  max_students: '20'
});

const rules = {
  title: [{ required: true, message: '请输入课程名称' }],
  level: [{ required: true, message: '请输入课程等级' }],
  description: [{ required: true, message: '请输入课程描述' }],
  duration: [{ required: true, message: '请输入课时' }],
  price: [{ required: true, message: '请输入课程价格' }],
  max_students: [{ required: true, message: '请输入招生人数' }]
};

const loadCertificates = async () => {
  try {
    loading.value = true;
    const res = await request({
      url: '/certificates',
      method: 'GET',
      data: { page: 1, pageSize: 100 }
    });

    certificates.value = Array.isArray(res) ? res : (res.data || []);
    console.log('[certificates-admin] 加载完成:', certificates.value.length, '个课程');
  } catch (e) {
    console.error('[certificates-admin] 加载失败:', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const showAddCertificate = () => {
  editingId.value = null;
  formData.value = {
    title: '',
    level: '',
    start_date: '',
    city: '',
    description: '',
    duration: '10',
    price: '99',
    max_students: '20'
  };
  showModal.value = true;
  console.log('[certificates-admin] 打开新增弹窗');
};

const editCertificate = (cert) => {
  editingId.value = cert.id;
  formData.value = {
    title: cert.title || cert.name,
    level: cert.level,
    start_date: cert.start_date || '',
    city: cert.city || '',
    description: cert.description,
    duration: String(cert.duration || 10),
    price: String(cert.price || 99),
    max_students: String(cert.max_students || 20)
  };
  showModal.value = true;
  console.log('[certificates-admin] 打开编辑弹窗, ID:', cert.id);
};

const saveCertificate = async () => {
  try {
    console.log('[certificates-admin] formData 当前值:', JSON.stringify(formData.value));
    
    // 前端验证
    if (!formData.value.title?.trim()) {
      uni.showToast({ title: '请输入课程标题', icon: 'none' });
      return;
    }
    if (!formData.value.level?.trim()) {
      uni.showToast({ title: '请输入课程等级', icon: 'none' });
      return;
    }
    if (!formData.value.city?.trim()) {
      uni.showToast({ title: '请输入开课城市', icon: 'none' });
      return;
    }
    if (!formData.value.start_date?.trim()) {
      uni.showToast({ title: '请输入开课时间', icon: 'none' });
      return;
    }
    if (!formData.value.description?.trim()) {
      uni.showToast({ title: '请输入课程描述', icon: 'none' });
      return;
    }
    if (!formData.value.duration?.trim()) {
      uni.showToast({ title: '请输入课时', icon: 'none' });
      return;
    }
    if (!formData.value.price?.trim()) {
      uni.showToast({ title: '请输入课程价格', icon: 'none' });
      return;
    }
    if (!formData.value.max_students?.trim()) {
      uni.showToast({ title: '请输入招生人数', icon: 'none' });
      return;
    }

    const data = {
      title: formData.value.title.trim(),
      level: formData.value.level.trim(),
      city: formData.value.city.trim(),
      start_date: formData.value.start_date.trim(),
      description: formData.value.description.trim(),
      duration: Number(formData.value.duration),
      price: Number(formData.value.price),
      max_students: Number(formData.value.max_students)
    };
    
    console.log('[certificates-admin] 准备发送的数据:', JSON.stringify(data));
    
    if (editingId.value) {
      // 编辑
      console.log('[certificates-admin] 执行PUT请求');
      await request({
        url: `/certificates/${editingId.value}`,
        method: 'PUT',
        data
      });
      uni.showToast({ title: '更新成功', icon: 'success' });
    } else {
      // 新增
      console.log('[certificates-admin] 执行POST请求');
      await request({
        url: '/certificates',
        method: 'POST',
        data
      });
      uni.showToast({ title: '添加成功', icon: 'success' });
    }
    showModal.value = false;
    loadCertificates();
  } catch (e) {
    console.error('[certificates-admin] 保存失败:', e);
    uni.showToast({ title: e.message || '保存失败', icon: 'none' });
  }
};

// 日期选择器改变
const onDateChange = (e) => {
  currentYear.value = dateColumns.value[0][e.detail.value[0]].value;
  currentMonth.value = dateColumns.value[1][e.detail.value[1]].value;
  
  // 检查当前日期是否超过新月份的最大日期
  const daysInNewMonth = new Date(currentYear.value, currentMonth.value, 0).getDate();
  if (currentDay.value > daysInNewMonth) {
    currentDay.value = daysInNewMonth;
  } else {
    currentDay.value = dateColumns.value[2][e.detail.value[2]].value;
  }
  
  console.log('[certificates] 日期改变:', currentYear.value, currentMonth.value, currentDay.value);
};

// 时间选择器改变
const onTimeChange = (e) => {
  currentHour.value = timeColumns.value[0][e.detail.value[0]].value;
  currentMinute.value = timeColumns.value[1][e.detail.value[1]].value;
  currentSecond.value = timeColumns.value[2][e.detail.value[2]].value;
  
  console.log('[certificates] 时间改变:', currentHour.value, currentMinute.value, currentSecond.value);
};

// 确认日期时间选择
const confirmDateTime = () => {
  // 验证输入值
  const year = Number(tempYear.value);
  const month = Number(tempMonth.value);
  const day = Number(tempDay.value);
  const hour = Number(tempHour.value);
  const minute = Number(tempMinute.value);
  const second = Number(tempSecond.value);
  
  // 基本验证
  if (!year || year < 1900 || year > 2100) {
    uni.showToast({ title: '年份范围 1900-2100', icon: 'none' });
    return;
  }
  if (!month || month < 1 || month > 12) {
    uni.showToast({ title: '月份范围 01-12', icon: 'none' });
    return;
  }
  if (!day || day < 1 || day > 31) {
    uni.showToast({ title: '日期范围 01-31', icon: 'none' });
    return;
  }
  if (hour < 0 || hour > 23) {
    uni.showToast({ title: '小时范围 00-23', icon: 'none' });
    return;
  }
  if (minute < 0 || minute > 59) {
    uni.showToast({ title: '分钟范围 00-59', icon: 'none' });
    return;
  }
  if (second < 0 || second > 59) {
    uni.showToast({ title: '秒数范围 00-59', icon: 'none' });
    return;
  }
  
  const yearStr = String(year).padStart(4, '0');
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  const hourStr = String(hour).padStart(2, '0');
  const minuteStr = String(minute).padStart(2, '0');
  const secondStr = String(second).padStart(2, '0');
  
  const dateTime = `${yearStr}-${monthStr}-${dayStr} ${hourStr}:${minuteStr}:${secondStr}`;
  formData.value.start_date = dateTime;
  
  console.log('[certificates] 最终时间:', dateTime);
  uni.showToast({ title: '时间已设置', icon: 'success' });
  showDateTimePickerModal.value = false;
};

const deleteCertificate = (certId) => {
  uni.showModal({
    title: '删除确认',
    content: '确认删除此课程吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({
            url: `/certificates/${certId}`,
            method: 'DELETE'
          });
          uni.showToast({ title: '删除成功', icon: 'success' });
          loadCertificates();
        } catch (e) {
          console.error('删除失败:', e);
          uni.showToast({ title: '删除失败', icon: 'none' });
        }
      }
    }
  });
};

const goBack = () => {
  backToAdminHome();
};
</script>

<style lang="scss" scoped>
.certificates-admin-container {
  background-color: #f5f5f5;
  min-height: 100vh;

  .add-btn-bar {
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

  .certificates-list {
    padding: 20rpx;

    .cert-item {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-bottom: 15rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

      .cert-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;
        padding-bottom: 12rpx;
        border-bottom: 1rpx solid #f0f0f0;
      }

      .cert-meta {
        display: flex;
        gap: 20rpx;
      }

      .cert-actions {
        display: flex;
        gap: 10rpx;
        margin-top: 15rpx;
      }
    }
  }

  .modal-content {
    padding: 40rpx 30rpx;
    max-width: 600rpx;

    .modal-actions {
      display: flex;
      gap: 15rpx;
      justify-content: flex-end;
      margin-top: 30rpx;
    }
  }

  .datetime-picker-container {
    background-color: #fff;
    padding: 20rpx;
    border-radius: 12rpx 12rpx 0 0;

    .datetime-picker-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20rpx;
      padding-bottom: 15rpx;
      border-bottom: 1rpx solid #f0f0f0;
    }

    .picker-section {
      margin-bottom: 20rpx;
    }
  }
}
</style>
