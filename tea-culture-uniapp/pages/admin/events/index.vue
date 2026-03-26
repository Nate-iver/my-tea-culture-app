<template>
  <view class="events-admin-container">
    <!-- 自定义导航栏 -->
    <u-navbar 
      title="活动管理"
      :is-back="true"
      @back="goBack"
      :background="{ background: '#fff' }"
    ></u-navbar>

    <!-- 添加按钮 -->
    <view class="add-btn-bar">
      <u-button 
        type="primary"
        text="+ 添加活动"
        @click="showAddEvent"
      ></u-button>
    </view>

    <!-- 加载状态 -->
    <u-loading-icon v-if="loading" mode="circle" text="加载中..."></u-loading-icon>

    <!-- 空状态 -->
    <view v-else-if="events.length === 0" class="empty-state">
      <u-icon name="calendar" color="#ccc" size="80"></u-icon>
      <u-text text="暂无活动" size="16" color="#909399" margin="20rpx 0 0 0"></u-text>
    </view>

    <!-- 活动列表 -->
    <view v-else class="events-list">
      <view v-for="event in events" :key="event.id" class="event-item">
        <view class="event-header">
          <view class="event-info">
            <u-text :text="event.title" size="15" bold color="#303133"></u-text>
            <u-text :text="formatDateTime(event.event_date)" size="12" color="#909399" margin="5rpx 0 0 0"></u-text>
          </view>
          <u-tag 
            :text="(event.current_participants || 0) + '/' + (event.max_participants || 0)" 
            :type="(event.current_participants || 0) >= (event.max_participants || 0) ? 'error' : 'success'"
            size="mini"
          ></u-tag>
        </view>

        <view class="event-content">
          <u-text :text="event.description" size="13" color="#606266" :lines="2"></u-text>
          <view class="event-meta" style="margin-top: 10rpx;">
            <u-text :text="'地点: ' + event.location" size="12" color="#909399"></u-text>
            <u-text :text="event.address || '地址未填写'" size="12" color="#909399" margin="0 0 0 20rpx"></u-text>
          </view>
        </view>

        <view class="event-actions">
          <u-button 
            size="mini"
            type="primary"
            text="编辑"
            @click="editEvent(event)"
            plain
          ></u-button>
          <u-button 
            size="mini"
            type="error"
            text="删除"
            @click="deleteEvent(event.id)"
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
        <u-text text="活动信息" size="18" bold color="#303133" margin="0 0 20 0"></u-text>

        <u-form 
          :model="formData" 
          ref="uForm"
          label-width="100rpx"
          :rules="rules"
        >
          <u-form-item label="活动名称" prop="title">
            <u-input v-model="formData.title" placeholder="输入活动名称" border="none"></u-input>
          </u-form-item>

          <u-form-item label="活动描述" prop="description">
            <u-textarea v-model="formData.description" placeholder="输入活动描述" border="none" height="150rpx"></u-textarea>
          </u-form-item>

          <u-form-item label="活动日期" prop="event_date">
            <view style="display: flex; gap: 10rpx;">
              <u-input 
                v-model="formData.event_date" 
                placeholder="YYYY-MM-DD" 
                border="none"
                readonly
              ></u-input>
              <u-button 
                text="选择"
                type="primary"
                size="mini"
                @click="openDatePicker"
              ></u-button>
            </view>
          </u-form-item>

          <u-form-item label="活动时间" prop="event_time">
            <view style="display: flex; gap: 10rpx;">
              <u-input 
                v-model="formData.event_time" 
                placeholder="HH:mm" 
                border="none"
                readonly
              ></u-input>
              <u-button 
                text="选择"
                type="primary"
                size="mini"
                @click="openTimePicker"
              ></u-button>
            </view>
          </u-form-item>

          <u-form-item label="活动地点" prop="location">
            <u-input v-model="formData.location" placeholder="输入活动地点" border="none"></u-input>
          </u-form-item>

          <u-form-item label="容纳人数" prop="capacity">
            <u-input v-model="formData.capacity" type="number" placeholder="容纳人数" border="none"></u-input>
          </u-form-item>

          <u-form-item label="详细地址" prop="address">
            <u-input v-model="formData.address" placeholder="输入详细地址(可选)" border="none"></u-input>
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
            @click="saveEvent"
          ></u-button>
        </view>
      </view>
    </u-popup>

    <!-- 日期选择器弹窗 -->
    <u-popup 
      :show="showDatePickerModal"
      @close="showDatePickerModal = false"
      mode="bottom"
      :closeable="true"
    >
      <view class="datetime-picker-container">
        <view class="datetime-picker-header">
          <u-text text="选择活动日期" size="16" bold color="#303133"></u-text>
          <u-button 
            text="确定"
            type="primary"
            size="mini"
            @click="confirmDate"
          ></u-button>
        </view>

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
      </view>
    </u-popup>

    <!-- 时间选择器弹窗 -->
    <u-popup 
      :show="showTimePickerModal"
      @close="showTimePickerModal = false"
      mode="bottom"
      :closeable="true"
    >
      <view class="datetime-picker-container">
        <view class="datetime-picker-header">
          <u-text text="选择活动时间" size="16" bold color="#303133"></u-text>
          <u-button 
            text="确定"
            type="primary"
            size="mini"
            @click="confirmTime"
          ></u-button>
        </view>

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
          </view>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '@/utils/http.js';
import { checkPermission, backToAdminHome } from '@/utils/auth.js';

const loading = ref(false);
const events = ref([]);
const showModal = ref(false);
const editingId = ref(null);
const showDatePickerModal = ref(false);
const showTimePickerModal = ref(false);

// 日期选择器临时值
const tempYear = ref(String(new Date().getFullYear()));
const tempMonth = ref(String(new Date().getMonth() + 1).padStart(2, '0'));
const tempDay = ref(String(new Date().getDate()).padStart(2, '0'));

// 时间选择器临时值
const tempHour = ref(String(new Date().getHours()).padStart(2, '0'));
const tempMinute = ref(String(new Date().getMinutes()).padStart(2, '0'));

onMounted(() => {
  if (!checkPermission('admin')) {
    return;
  }
  loadEvents();
});

const formData = ref({
  title: '',
  description: '',
  event_date: '',
  event_time: '',
  location: '',
  capacity: 20,
  address: ''
});

const rules = {
  title: [{ required: true, message: '请输入活动名称' }],
  description: [{ required: true, message: '请输入活动描述' }],
  event_date: [{ required: true, message: '请选择活动日期' }],
  event_time: [{ required: true, message: '请选择活动时间' }],
  location: [{ required: true, message: '请输入活动地点' }],
  capacity: [{ required: true, message: '请输入容纳人数' }]
};

const formatDate = (value) => {
  if (!value) return '';
  return value.split('T')[0] || value.split(' ')[0];
};

const formatDateTime = (value) => {
  if (!value) return '';
  const normalized = String(value).replace('T', ' ');
  return normalized.slice(0, 16);
};

const loadEvents = async () => {
  try {
    loading.value = true;
    const res = await request({
      url: '/events',
      method: 'GET',
      data: { page: 1, pageSize: 100 }
    });

    console.log('[events-admin] API 响应:', res);
    events.value = Array.isArray(res) ? res : (res.data || res.list || []);
    console.log('[events-admin] 加载完成:', events.value.length, '个活动');
  } catch (e) {
    console.error('[events-admin] 加载失败:', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const showAddEvent = () => {
  editingId.value = null;
  formData.value = {
    title: '',
    description: '',
    event_date: '',
    event_time: '',
    location: '',
    capacity: 20,
    address: ''
  };
  showModal.value = true;
  console.log('[events-admin] 打开新增弹窗');
};

const editEvent = (event) => {
  const dateObj = new Date(event.event_date || Date.now());
  const datePart = `${dateObj.getFullYear()}-${String(dateObj.getMonth() + 1).padStart(2, '0')}-${String(dateObj.getDate()).padStart(2, '0')}`;
  const timePart = `${String(dateObj.getHours()).padStart(2, '0')}:${String(dateObj.getMinutes()).padStart(2, '0')}`;

  editingId.value = event.id;
  formData.value = {
    title: event.title,
    description: event.description,
    event_date: datePart,
    event_time: timePart,
    location: event.location,
    capacity: event.max_participants || 30,
    address: event.address || ''
  };
  showModal.value = true;
  console.log('[events-admin] 打开编辑弹窗, ID:', event.id);
};

const saveEvent = async () => {
  try {
    console.log('[events-admin] formData 当前值:', JSON.stringify(formData.value));
    
    // 前端验证
    if (!formData.value.title?.trim()) {
      uni.showToast({ title: '请输入活动名称', icon: 'none' });
      return;
    }
    if (!formData.value.description?.trim()) {
      uni.showToast({ title: '请输入活动描述', icon: 'none' });
      return;
    }
    if (!formData.value.event_date?.trim()) {
      uni.showToast({ title: '请选择活动日期', icon: 'none' });
      return;
    }
    if (!formData.value.event_time?.trim()) {
      uni.showToast({ title: '请选择活动时间', icon: 'none' });
      return;
    }
    if (!formData.value.location?.trim()) {
      uni.showToast({ title: '请输入活动地点', icon: 'none' });
      return;
    }
    if (!formData.value.capacity) {
      uni.showToast({ title: '请输入容纳人数', icon: 'none' });
      return;
    }
    const dateTime = `${formData.value.event_date.trim()} ${formData.value.event_time.trim()}:00`;

    const data = {
      title: formData.value.title.trim(),
      description: formData.value.description.trim(),
      event_date: dateTime,
      location: formData.value.location.trim(),
      address: formData.value.address?.trim() || null,
      max_participants: Number(formData.value.capacity)
    };
    
    console.log('[events-admin] 准备发送的数据:', JSON.stringify(data));
    
    if (editingId.value) {
      // 编辑
      console.log('[events-admin] 执行PUT请求');
      await request({
        url: `/events/${editingId.value}`,
        method: 'PUT',
        data
      });
      uni.showToast({ title: '更新成功', icon: 'success' });
    } else {
      // 新增
      console.log('[events-admin] 执行POST请求');
      await request({
        url: '/events',
        method: 'POST',
        data
      });
      uni.showToast({ title: '添加成功', icon: 'success' });
    }
    showModal.value = false;
    loadEvents();
  } catch (e) {
    console.error('[events-admin] 保存失败:', e);
    uni.showToast({ title: e.message || '保存失败', icon: 'none' });
  }
};

// 打开日期选择器
const openDatePicker = () => {
  const date = new Date(formData.value.event_date || new Date());
  tempYear.value = String(date.getFullYear());
  tempMonth.value = String(date.getMonth() + 1).padStart(2, '0');
  tempDay.value = String(date.getDate()).padStart(2, '0');
  showDatePickerModal.value = true;
};

// 确认日期选择
const confirmDate = () => {
  const year = Number(tempYear.value);
  const month = Number(tempMonth.value);
  const day = Number(tempDay.value);
  
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
  
  const yearStr = String(year).padStart(4, '0');
  const monthStr = String(month).padStart(2, '0');
  const dayStr = String(day).padStart(2, '0');
  
  formData.value.event_date = `${yearStr}-${monthStr}-${dayStr}`;
  uni.showToast({ title: '日期已设置', icon: 'success' });
  showDatePickerModal.value = false;
};

// 打开时间选择器
const openTimePicker = () => {
  const parts = (formData.value.event_time || '').split(':');
  tempHour.value = parts[0] || String(new Date().getHours()).padStart(2, '0');
  tempMinute.value = parts[1] || String(new Date().getMinutes()).padStart(2, '0');
  showTimePickerModal.value = true;
};

// 确认时间选择
const confirmTime = () => {
  const hour = Number(tempHour.value);
  const minute = Number(tempMinute.value);
  
  if (hour < 0 || hour > 23) {
    uni.showToast({ title: '小时范围 00-23', icon: 'none' });
    return;
  }
  if (minute < 0 || minute > 59) {
    uni.showToast({ title: '分钟范围 00-59', icon: 'none' });
    return;
  }
  
  const hourStr = String(hour).padStart(2, '0');
  const minuteStr = String(minute).padStart(2, '0');
  
  formData.value.event_time = `${hourStr}:${minuteStr}`;
  uni.showToast({ title: '时间已设置', icon: 'success' });
  showTimePickerModal.value = false;
};

const deleteEvent = (eventId) => {
  uni.showModal({
    title: '删除确认',
    content: '确认删除此活动吗？',
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({
            url: `/events/${eventId}`,
            method: 'DELETE'
          });
          uni.showToast({ title: '删除成功', icon: 'success' });
          loadEvents();
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
.events-admin-container {
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

  .events-list {
    padding: 20rpx;

    .event-item {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-bottom: 15rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

      .event-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12rpx;
        padding-bottom: 12rpx;
        border-bottom: 1rpx solid #f0f0f0;
      }

      .event-meta {
        display: flex;
        gap: 20rpx;
      }

      .event-actions {
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
