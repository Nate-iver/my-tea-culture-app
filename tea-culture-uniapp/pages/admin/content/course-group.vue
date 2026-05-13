<template>
  <view class="group-admin-container">
    <view class="top-bar">
      <u-button icon="plus" text="新增（课程）" type="primary" size="small" @click="goAdd"></u-button>
      <u-button plain type="default" text="返回" size="small" @click="goBack" style="margin-left:12rpx"></u-button>
    </view>

    <u-loading-icon v-if="loading" mode="circle" text="加载中..."></u-loading-icon>

    <view v-else-if="list.length === 0" class="empty-state">
      <u-text text="暂无内容" size="16" color="#909399" margin="20rpx 0 0 0"></u-text>
    </view>

    <view v-else class="content-list">
      <view v-for="item in list" :key="item.id" class="content-item">
        <view class="item-left">
          <u-text :text="item.title" size="15" bold></u-text>
          <u-text :text="item.create_time?.split(' ')[0] || ''" size="12" color="#909399"></u-text>
        </view>
        <view class="item-actions">
          <u-button plain size="small" text="编辑" @click="edit(item.id)"></u-button>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { request } from '@/utils/http.js';
import { checkPermission } from '@/utils/auth.js';

const loading = ref(false);
const list = ref([]);

const types = ['course', 'tea_ware', 'tea_table'];

onMounted(() => {
  if (!checkPermission('admin')) return;
  load();
});

const load = async () => {
  try {
    loading.value = true;
    const res = await request({ url: '/content', method: 'GET', data: { page: 1, pageSize: 200 } });
    const data = Array.isArray(res) ? res : (res.list || res.data || []);
    list.value = data.filter((i) => types.includes(i.type));
  } catch (e) {
    console.error(e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const goAdd = () => {
  uni.navigateTo({ url: '/pages/admin/content/edit' });
};

const edit = (id) => {
  uni.navigateTo({ url: `/pages/admin/content/edit?id=${id}` });
};

const goBack = () => uni.navigateBack({ delta: 1 });
</script>

<style scoped lang="scss">
.group-admin-container { padding: 20rpx; background:#f5f5f5; min-height:100vh }
.top-bar { display:flex; gap:12rpx; align-items:center; margin-bottom:14rpx }
.content-list { display:flex; flex-direction:column; gap:12rpx }
.content-item { background:#fff; padding:18rpx; border-radius:10rpx; display:flex; justify-content:space-between }
.item-left { display:flex; flex-direction:column }
.item-actions { display:flex; align-items:center }
</style>
