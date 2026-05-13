<template>
  <view class="content-edit-container">
    <view class="edit-content">
      <u-form :model="formData" ref="formRef" label-width="120">
        <view class="form-section">
          <u-text text="基础信息" size="16" bold color="#303133" margin="0 0 15 0"></u-text>

          <u-form-item label="内容标题" prop="title" required>
            <u-input v-model="formData.title" placeholder="输入内容标题" border="bottom"></u-input>
          </u-form-item>

          <u-form-item label="内容类型" prop="type" required>
            <u-radio-group v-model="formData.type">
              <view v-for="group in typeGroups" :key="group.label" class="type-group">
                <u-text :text="group.label" size="14" bold color="#5d8a6a" margin="0 0 12 0"></u-text>
                <view class="radio-grid">
                  <u-radio
                    v-for="item in group.items"
                    :key="item.value"
                    :label="item.label"
                    :name="item.value"
                  ></u-radio>
                </view>
              </view>
            </u-radio-group>
          </u-form-item>

          <u-form-item label="封面图片" prop="cover_image">
            <u-input v-model="formData.cover_image" placeholder="图片链接或相对路径" border="bottom"></u-input>
          </u-form-item>

          <u-form-item label="发布状态" prop="status" required>
            <u-radio-group v-model="formData.status">
              <u-radio label="已发布" name="1"></u-radio>
              <u-radio label="待审核" name="0"></u-radio>
            </u-radio-group>
          </u-form-item>
        </view>

        <view class="form-section">
          <u-text text="内容正文" size="16" bold color="#303133" margin="0 0 15 0"></u-text>

         
            <u-textarea
              v-model="formData.content"
              placeholder="支持 HTML 富文本或纯文本"
              height="260"
              border="bottom"
            ></u-textarea>

        </view>
      </u-form>

      <view class="form-actions">
        <u-button type="default" text="取消" @click="goBack"></u-button>
        <u-button type="primary" text="保存" @click="saveContent" :loading="saving"></u-button>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue';
import { onLoad } from '@dcloudio/uni-app';
import { request } from '@/utils/http.js';
import { checkPermission, backToAdminHome } from '@/utils/auth.js';

const formRef = ref(null);
const saving = ref(false);
const contentId = ref(null);

const typeGroups = [
  {
    label: '茶类内容',
    items: [
      { label: '茶类分类', value: 'tea_category' },
      { label: '冲泡教程', value: 'brewing' },
      { label: '产地文化', value: 'origin_culture' }
    ]
  },
  {
    label: '课程内容',
    items: [
      { label: '茶艺师课程', value: 'course' },
      { label: '茶具知识', value: 'tea_ware' },
      { label: '茶席设计', value: 'tea_table' }
    ]
  }
];

const formData = ref({
  title: '',
  type: 'tea_category',
  cover_image: '',
  status: '1',
  content: ''
});

onLoad((options) => {
  if (!checkPermission('admin')) {
    return;
  }

  if (options?.id) {
    contentId.value = parseInt(options.id, 10);
    loadContent();
  }
});

const loadContent = async () => {
  if (!contentId.value) return;

  try {
    const res = await request({
      url: `/content/${contentId.value}`,
      method: 'GET'
    });

    formData.value = {
      title: res.title || '',
      type: res.type || 'tea_category',
      cover_image: res.cover_image || '',
      status: String(res.status ?? 1),
      content: res.content || ''
    };
  } catch (e) {
    console.error('[content-edit] 加载内容失败:', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  }
};

const saveContent = async () => {
  if (!formData.value.title.trim()) {
    uni.showToast({ title: '请输入内容标题', icon: 'none' });
    return;
  }

  if (!formData.value.type) {
    uni.showToast({ title: '请选择内容类型', icon: 'none' });
    return;
  }

  try {
    saving.value = true;

    const data = {
      title: formData.value.title.trim(),
      type: formData.value.type,
      cover_image: formData.value.cover_image.trim(),
      status: Number(formData.value.status),
      content: formData.value.content.trim()
    };

    if (contentId.value) {
      await request({
        url: `/content/${contentId.value}`,
        method: 'PUT',
        data
      });
      uni.showToast({ title: '更新成功', icon: 'success' });
    } else {
      await request({
        url: '/content',
        method: 'POST',
        data
      });
      uni.showToast({ title: '添加成功', icon: 'success' });
    }

    setTimeout(() => {
      backToAdminHome();
    }, 500);
  } catch (e) {
    console.error('[content-edit] 保存失败:', e);
    uni.showToast({ title: e.message || '保存失败', icon: 'none' });
  } finally {
    saving.value = false;
  }
};

const goBack = () => {
  uni.navigateBack({ delta: 1 });
};
</script>

<style lang="scss" scoped>
.content-edit-container {
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

    .radio-grid {
      display: flex;
      flex-wrap: wrap;
      gap: 18rpx 20rpx;
    }

    .type-group {
      margin-bottom: 24rpx;

      &:last-child {
        margin-bottom: 0;
      }
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