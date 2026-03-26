<template>
  <view class="teaparty-container">
    <!-- 顶部筛选 -->
    <view class="filter-bar">
      <u-dropdown>
        <u-dropdown-item :options="cityOptions" v-model="selectedCity" @change="handleFilter"></u-dropdown-item>
        <u-dropdown-item :options="themeOptions" v-model="selectedTheme" @change="handleFilter"></u-dropdown-item>
        <u-dropdown-item :options="statusOptions" v-model="selectedStatus" @change="handleFilter"></u-dropdown-item>
      </u-dropdown>
    </view>

    <!-- 茶会列表 -->
    <view class="party-list">
      <view 
        v-for="party in partyList" 
        :key="party.id"
        class="party-card"
        @click="goDetail(party.id)"
      >
        <u-image 
          :src="party.image || '/static/placeholders/party.png'" 
          width="100%" 
          height="200rpx"
          radius="12rpx"
        ></u-image>
        
        <view class="party-info">
          <u-text :text="party.title" size="16" bold color="#303133" :lines="2"></u-text>
          
          <view class="party-meta">
            <view class="meta-item">
              <u-icon name="map" color="#5d8a6a" size="14"></u-icon>
              <u-text :text="party.city + ' · ' + party.address" size="12" color="#606266" margin="0 0 0 5rpx"></u-text>
            </view>
            <view class="meta-item">
              <u-icon name="clock" color="#5d8a6a" size="14"></u-icon>
              <u-text :text="party.time" size="12" color="#606266" margin="0 0 0 5rpx"></u-text>
            </view>
            <view class="meta-item">
              <u-icon name="account" color="#5d8a6a" size="14"></u-icon>
              <u-text :text="party.participants + '/' + party.max_participants + '人'" size="12" color="#606266" margin="0 0 0 5rpx"></u-text>
            </view>
          </view>

          <view class="party-footer">
            <u-tag :text="party.theme" size="mini" type="success" plain></u-tag>
            <u-tag 
              :text="party.status === 'recruiting' ? '报名中' : party.status === 'full' ? '已满员' : '已结束'" 
              size="mini" 
              :type="party.status === 'recruiting' ? 'primary' : 'info'"
              margin="0 0 0 10rpx"
            ></u-tag>
            <u-button
              v-if="party.enrolled"
              size="mini"
              type="error"
              text="取消报名"
              @click.stop="cancelEnroll(party)"
              customStyle="margin-left: 10rpx; height: 46rpx;"
            ></u-button>
            <u-button
              v-else-if="party.status === 'recruiting'"
              size="mini"
              type="primary"
              text="报名"
              @click.stop="openEnroll(party)"
              customStyle="margin-left: 10rpx; height: 46rpx;"
            ></u-button>
            <view class="price">
              <u-text :text="party.fee === 0 ? '免费' : '¥' + party.fee" size="16" bold color="#ff6b6b"></u-text>
            </view>
          </view>
        </view>
      </view>

      <u-loadmore :status="loadStatus" v-if="partyList.length > 0" />
      <u-empty v-if="partyList.length === 0" mode="list" text="暂无茶会活动"></u-empty>
    </view>

    <!-- 发起茶会按钮 -->
    <view class="fab-btn" @click="createParty">
      <u-icon name="plus" color="#fff" size="24"></u-icon>
    </view>

    <!-- 报名弹窗 -->
    <u-popup :show="showEnroll" @close="closeEnroll" mode="center" round="12">
      <view class="enroll-popup">
        <u-text text="报名茶会" size="16" bold></u-text>
        <view class="enroll-form">
          <u-input
            v-model="enrollPhone"
            placeholder="请输入联系电话"
            type="number"
            clearable
            border="bottom"
          ></u-input>
        </view>
        <view class="enroll-actions">
          <u-button text="取消" @click="closeEnroll"></u-button>
          <u-button type="primary" text="确认报名" @click="submitEnroll"></u-button>
        </view>
      </view>
    </u-popup>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '@/utils/http.js';

const selectedCity = ref('');
const selectedTheme = ref('');
const selectedStatus = ref('');

const partyList = ref([]);
const loadStatus = ref('loadmore');
const showEnroll = ref(false);
const enrollPhone = ref('');
const selectedEvent = ref(null);
const enrolledEventIds = ref(new Set());
const enrollIdByEventId = ref(new Map());

const cityOptions = ref([
  { label: '全部城市', value: '' },
  { label: '北京', value: 'beijing' },
  { label: '上海', value: 'shanghai' },
  { label: '杭州', value: 'hangzhou' },
  { label: '成都', value: 'chengdu' },
  { label: '福州', value: 'fuzhou' }
]);

const themeOptions = ref([
  { label: '全部主题', value: '' },
  { label: '品茶交流', value: 'tasting' },
  { label: '茶艺表演', value: 'performance' },
  { label: '茶文化讲座', value: 'lecture' },
  { label: '茶山游学', value: 'tour' }
]);

const statusOptions = ref([
  { label: '全部状态', value: '' },
  { label: '报名中', value: 'recruiting' },
  { label: '已满员', value: 'full' },
  { label: '已结束', value: 'ended' }
]);

const handleFilter = () => {
  loadPartyList();
};

const loadMyEnrollments = async () => {
  const token = uni.getStorageSync('token');
  if (!token) {
    enrolledEventIds.value = new Set();
    return;
  }

  try {
    const res = await request({
      url: '/enroll/my',
      method: 'GET'
    });

    const list = Array.isArray(res)
      ? res
      : (Array.isArray(res.data)
        ? res.data
        : (res.data?.data || res.list || []));

    const activeList = list.filter(item => item.status !== 2);
    enrolledEventIds.value = new Set(activeList.map(item => item.event_id));

    const idMap = new Map();
    activeList.forEach(item => {
      idMap.set(item.event_id, item.id);
    });
    enrollIdByEventId.value = idMap;
  } catch (e) {
    console.error('加载报名记录失败:', e);
  }
};

const loadPartyList = async () => {
  try {
    loadStatus.value = 'loading';

    const cityLabel = cityOptions.value.find(c => c.value === selectedCity.value)?.label || '';
    const statusMap = {
      recruiting: 1,
      full: 2,
      ended: 3
    };
    const statusValue = selectedStatus.value ? statusMap[selectedStatus.value] : '';

    const pageSize = 20;
    const params = {
      page: 1,
      pageSize
    };
    if (selectedCity.value) params.location = cityLabel;
    if (selectedStatus.value) params.status = statusValue;

    const res = await request({
      url: '/events',
      method: 'GET',
      data: params
    });

    console.log('[events] raw response:', res);
    const rawList = Array.isArray(res)
      ? res
      : (Array.isArray(res.data)
        ? res.data
        : (res.data?.data || res.list || []));
    console.log('[events] parsed list length:', rawList.length);

    const mappedList = rawList.map(item => {
      const title = item.title || '';
      let theme = '品茶交流';
      if (title.includes('表演')) theme = '茶艺表演';
      else if (title.includes('讲座') || title.includes('沙龙')) theme = '茶文化讲座';
      else if (title.includes('游学')) theme = '茶山游学';

      let statusText = 'recruiting';
      if (item.status === 2) statusText = 'full';
      else if (item.status === 3) statusText = 'ended';
      else if (item.status === 0) statusText = 'ended';

      const isEnrolled = enrolledEventIds.value.has(item.id);
      return {
        id: item.id,
        title: item.title,
        city: item.location,
        address: item.address,
        time: item.event_date,
        participants: item.current_participants,
        max_participants: item.max_participants,
        theme,
        status: statusText,
        fee: item.fee || 0,
        image: item.image || '',
        enrolled: isEnrolled,
        enrollId: enrollIdByEventId.value.get(item.id) || null
      };
    });

    const themeLabel = themeOptions.value.find(t => t.value === selectedTheme.value)?.label || '';
    partyList.value = mappedList.filter(party => {
      if (selectedTheme.value && party.theme !== themeLabel) {
        return false;
      }
      return true;
    });

    if (rawList.length === 0) {
      uni.showToast({ title: '暂无茶会数据', icon: 'none' });
    }
    loadStatus.value = rawList.length < pageSize ? 'nomore' : 'loadmore';
  } catch (e) {
    console.error('加载茶会列表失败:', e);
    loadStatus.value = 'loadmore';
  }
};

onMounted(async () => {
  await loadMyEnrollments();
  await loadPartyList();
});

const goDetail = (id) => {
  uni.navigateTo({
    url: `/pages/community/teaparty/detail?id=${id}`
  });
};

const createParty = () => {
  uni.navigateTo({
    url: '/pages/community/teaparty/create'
  });
};

const openEnroll = (party) => {
  const token = uni.getStorageSync('token');
  if (!token) {
    uni.showToast({ title: '请先登录', icon: 'none' });
    return uni.navigateTo({ url: '/pages/login/login' });
  }
  selectedEvent.value = party;
  enrollPhone.value = '';
  showEnroll.value = true;
};

const closeEnroll = () => {
  showEnroll.value = false;
};

const submitEnroll = async () => {
  if (!enrollPhone.value) {
    return uni.showToast({ title: '请输入联系电话', icon: 'none' });
  }
  if (!selectedEvent.value) {
    return uni.showToast({ title: '请选择茶会', icon: 'none' });
  }

  try {
    await request({
      url: '/enroll',
      method: 'POST',
      data: {
        event_id: selectedEvent.value.id,
        phone: enrollPhone.value
      }
    });

    uni.showToast({ title: '报名成功', icon: 'success' });
    showEnroll.value = false;
    await loadMyEnrollments();
    loadPartyList();
  } catch (e) {
    console.error('报名失败:', e);
    uni.showToast({ title: e.message || '报名失败', icon: 'none' });
  }
};

const cancelEnroll = (party) => {
  if (!party.enrollId) {
    uni.showToast({ title: '未找到报名记录', icon: 'none' });
    return;
  }

  uni.showModal({
    title: '取消报名',
    content: '确定要取消该茶会报名吗？',
    success: async (res) => {
      if (!res.confirm) return;

      try {
        await request({
          url: `/enroll/${party.enrollId}`,
          method: 'DELETE'
        });

        uni.showToast({ title: '已取消报名', icon: 'success' });
        await loadMyEnrollments();
        loadPartyList();
      } catch (e) {
        console.error('取消报名失败:', e);
        uni.showToast({ title: e.message || '取消失败', icon: 'none' });
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.teaparty-container {
  min-height: 100vh;
  background-color: #f5f5f5;
  padding-bottom: 100rpx;

  .filter-bar {
    background-color: #fff;
    padding: 20rpx;
  }

  .party-list {
    padding: 20rpx;

    .party-card {
      background-color: #fff;
      border-radius: 12rpx;
      margin-bottom: 20rpx;
      overflow: hidden;

      .party-info {
        padding: 20rpx;

        .party-meta {
          margin-top: 15rpx;

          .meta-item {
            display: flex;
            align-items: center;
            margin-bottom: 10rpx;
          }
        }

        .party-footer {
          display: flex;
          align-items: center;
          margin-top: 20rpx;
          padding-top: 15rpx;
          border-top: 1rpx solid #f0f0f0;

          .price {
            margin-left: auto;
          }
        }
      }
    }
  }

  .fab-btn {
    position: fixed;
    right: 40rpx;
    bottom: 100rpx;
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background: linear-gradient(135deg, #5d8a6a 0%, #4a7057 100%);
    box-shadow: 0 8rpx 20rpx rgba(93, 138, 106, 0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 100;
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
