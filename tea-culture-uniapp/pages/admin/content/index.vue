<template>
  <view class="content-admin-container">
    <view class="top-bar">
      <u-button
        icon="plus"
        text="新增内容"
        type="primary"
        @click="goAddContent"
        size="small"
      ></u-button>
      <view class="quick-links">
        <u-button plain type="info" text="茶类内容管理" size="small" @click="openTeaGroup"></u-button>
        <u-button plain type="info" text="课程内容管理" size="small" @click="openCourseGroup" style="margin-left:12rpx"></u-button>
      </view>
    </view>

    <view class="filter-bar">
      <u-tabs
        :list="groupTabs"
        @click="handleTypeClick"
        :current="currentGroupIndex"
        :scrollable="true"
        lineColor="#5d8a6a"
        :itemStyle="{ height: '84rpx', padding: '0 10rpx' }"
      ></u-tabs>
    </view>

    <u-loading-icon v-if="loading" mode="circle" text="加载中..."></u-loading-icon>

    <view v-else-if="contents.length === 0" class="empty-state">
      <u-icon name="file-text" color="#ccc" size="80"></u-icon>
      <u-text text="暂无内容" size="16" color="#909399" margin="20rpx 0 0 0"></u-text>
    </view>

    <view v-else class="content-list">
      <view v-for="item in contents" :key="item.id" class="content-item">
        <image
          class="content-cover"
          :src="formatImageUrl(item.cover_image)"
          mode="aspectFill"
        ></image>

        <view class="content-info">
          <view class="content-header">
            <u-text :text="item.title" size="15" bold color="#303133" :lines="1"></u-text>
            <u-tag :text="getGroupLabel(item.type)" size="mini" type="primary" plain></u-tag>
          </view>

          <view class="content-meta">
            <u-tag
              :text="getTypeLabel(item.type)"
              :type="getStatusTagType(item.status)"
              size="mini"
              plain
            ></u-tag>
            <u-text :text="item.create_time?.split(' ')[0] || ''" size="12" color="#909399"></u-text>
          </view>

          <u-text :text="getSummary(item.content)" size="12" color="#606266" :lines="2"></u-text>
        </view>

        <view class="content-actions">
          <u-icon name="edit-pen" size="20" color="#5d8a6a" @click="editContent(item.id)"></u-icon>
          <u-icon
            name="trash"
            size="20"
            color="#ff6b6b"
            margin="0 0 0 15rpx"
            @click="deleteContent(item.id)"
          ></u-icon>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue';
import { request, getServerHost } from '@/utils/http.js';
import { checkPermission } from '@/utils/auth.js';

const loading = ref(false);
const contents = ref([]);
const currentGroup = ref('');

const groupOptions = [
  { text: '全部', value: '' },
  { text: '茶类内容', value: 'tea' },
  { text: '课程内容', value: 'course' }
];

const groupTabs = computed(() => groupOptions.map((item) => ({
  name: item.text,
  value: item.value
})));

const currentGroupIndex = computed(() =>
  Math.max(0, groupOptions.findIndex((item) => item.value === currentGroup.value))
);

const teaTypes = ['tea_category', 'brewing', 'origin_culture'];
const courseTypes = ['course', 'tea_ware', 'tea_table'];

onMounted(() => {
  if (!checkPermission('admin')) {
    return;
  }
  loadContents();
});

const formatImageUrl = (url) => {
  if (!url) return '/static/placeholders/cover-rect.png';
  if (url.startsWith('http')) return url;
  return `${getServerHost()}${url}`;
};

const openTeaGroup = () => {
  uni.navigateTo({ url: '/pages/admin/content/tea-group' });
};

const openCourseGroup = () => {
  uni.navigateTo({ url: '/pages/admin/content/course-group' });
};

const getSummary = (content) => {
  if (!content) return '暂无内容摘要';
  const plainText = String(content)
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  return plainText || '暂无内容摘要';
};

const getTypeLabel = (type) => {
  const typeMap = {
    tea_category: '茶类分类',
    brewing: '冲泡教程',
    origin_culture: '产地文化',
    course: '茶艺师课程',
    tea_ware: '茶具知识',
    tea_table: '茶席设计'
  };
  return typeMap[type] || '未分类';
};

const getGroupLabel = (type) => {
  if (teaTypes.includes(type)) return '茶类内容';
  if (courseTypes.includes(type)) return '课程内容';
  return '未分类';
};

const getStatusTagType = (status) => {
  return Number(status) === 1 ? 'success' : 'warning';
};

const loadContents = async () => {
  try {
    loading.value = true;
    const res = await request({
      url: '/content',
      method: 'GET',
      data: {
        page: 1,
        pageSize: 100
      }
    });

    const list = Array.isArray(res) ? res : (res.list || res.data || []);

    const filteredList = currentGroup.value === 'tea'
      ? list.filter((item) => teaTypes.includes(item.type))
      : currentGroup.value === 'course'
        ? list.filter((item) => courseTypes.includes(item.type))
        : list;

    contents.value = filteredList;
  } catch (e) {
    console.error('[content-admin] 加载失败:', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const handleTypeClick = (item) => {
  currentGroup.value = item.value || '';
  loadContents();
};

const goAddContent = () => {
  uni.navigateTo({ url: '/pages/admin/content/edit' });
};

const editContent = (contentId) => {
  uni.navigateTo({ url: `/pages/admin/content/edit?id=${contentId}` });
};

const deleteContent = (contentId) => {
  uni.showModal({
    title: '删除确认',
    content: '确定要删除这条内容吗？',
    success: async (res) => {
      if (!res.confirm) {
        return;
      }

      try {
        await request({
          url: `/content/${contentId}`,
          method: 'DELETE'
        });
        uni.showToast({ title: '删除成功', icon: 'success' });
        loadContents();
      } catch (e) {
        console.error('[content-admin] 删除失败:', e);
        uni.showToast({ title: '删除失败', icon: 'none' });
      }
    }
  });
};
</script>

<style lang="scss" scoped>
.content-admin-container {
  background-color: #f5f5f5;
  min-height: 100vh;

  .top-bar,
  .filter-bar {
    background-color: #fff;
    border-bottom: 1rpx solid #f0f0f0;
  }

  .top-bar {
    padding: 20rpx;
  }

  .filter-bar {
    margin-bottom: 10rpx;
  }

  .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 100rpx 30rpx;
    text-align: center;
  }

  .content-list {
    padding: 20rpx;

    .content-item {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 18rpx;
      margin-bottom: 15rpx;
      display: flex;
      align-items: flex-start;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

      .content-cover {
        width: 150rpx;
        height: 120rpx;
        border-radius: 10rpx;
        flex-shrink: 0;
        background-color: #f0f0f0;
      }

      .content-info {
        flex: 1;
        margin-left: 18rpx;
        min-width: 0;

        .content-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12rpx;
        }

        .content-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12rpx;
          margin: 10rpx 0;
        }
      }

      .content-actions {
        display: flex;
        align-items: center;
        margin-left: 15rpx;
        padding-top: 4rpx;
      }
    }
  }
}
</style>