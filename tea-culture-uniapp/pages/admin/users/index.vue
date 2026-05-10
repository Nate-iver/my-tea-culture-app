<template>
  <view class="users-admin-container">
    <!-- 搜索栏 -->
    <view class="search-bar">
      <u-search 
        v-model="searchKeyword"
        placeholder="搜索用户名"
        @search="handleSearch"
        shape="round"
      ></u-search>
    </view>

    <!-- 加载状态 -->
    <u-loading-icon v-if="loading" mode="circle" text="加载中..."></u-loading-icon>

    <!-- 空状态 -->
    <view v-else-if="users.length === 0" class="empty-state">
      <u-icon name="account" color="#ccc" size="80"></u-icon>
      <u-text text="暂无用户" size="16" color="#909399" margin="20rpx 0 0 0"></u-text>
    </view>

    <!-- 用户列表 -->
    <view v-else class="users-list">
      <view v-for="user in users" :key="user.id" class="user-item">
        <view class="user-avatar">
          <u-avatar :src="user.avatar || ''" size="48"></u-avatar>
        </view>

        <view class="user-info">
          <view class="user-header">
            <u-text :text="user.username" size="14" bold color="#303133"></u-text>
            <u-tag 
              :text="user.role === 'admin' ? '管理员' : '用户'" 
              :type="user.role === 'admin' ? 'error' : 'success'"
              size="mini"
            ></u-tag>
          </view>
          <view class="user-meta" style="margin-top: 8rpx;">
            <u-text :text="'注册: ' + formatDate(user.create_time)" size="11" color="#bdbdbd"></u-text>
          </view>
        </view>

        <view class="user-actions">
          <u-icon 
            name="edit-pen" 
            size="20" 
            color="#2196f3"
            @click="editUser(user)"
            style="margin-right: 10rpx;"
          ></u-icon>
          <u-icon 
            name="trash" 
            size="20" 
            color="#ff6b6b"
            @click="deleteUser(user)"
          ></u-icon>
        </view>
      </view>
    </view>

    <!-- 编辑用户弹窗 -->
    <u-popup 
      :show="showModal"
      @close="showModal = false"
      mode="center"
      :mask-click="false"
      border-radius="20"
    >
      <view class="modal-content">
        <u-text text="用户信息" size="18" bold color="#303133" margin="0 0 20rpx 0"></u-text>

        <u-form 
          :model="formData" 
          ref="uForm"
          label-width="80rpx"
        >
          <u-form-item label="用户名" prop="username">
            <u-input v-model="formData.username" placeholder="用户名" border="none" disabled></u-input>
          </u-form-item>

          <u-form-item label="用户角色" prop="role">
            <u-radio-group v-model="formData.role" placement="row">
              <u-radio name="user" label="普通用户"></u-radio>
              <u-radio name="admin" label="管理员"></u-radio>
            </u-radio-group>
          </u-form-item>

          <u-form-item label="注册时间" prop="create_time">
            <u-input v-model="formData.create_time" border="none" disabled></u-input>
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
            @click="saveUser"
            :loading="saving"
          ></u-button>
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
const saving = ref(false);
const users = ref([]);
const allUsers = ref([]);
const searchKeyword = ref('');
const showModal = ref(false);
const editingId = ref(null);

const formData = ref({
  username: '',
  role: 'user',
  create_time: ''
});

const formatDate = (value) => {
  if (!value) return '';
  const date = value.split('T')[0] || value.split(' ')[0];
  return date;
};

const loadUsers = async () => {
  try {
    loading.value = true;
    const res = await request({
      url: '/users',
      method: 'GET',
      data: { page: 1, pageSize: 100 }
    });

    console.log('[users-admin] API 响应:', res);
    const list = Array.isArray(res) ? res : (res.data || res.list || []);
    allUsers.value = list;
    users.value = list;
    console.log('[users-admin] 加载完成:', list.length, '个用户');
  } catch (e) {
    console.error('[users-admin] 加载失败:', e);
    uni.showToast({ title: '加载失败', icon: 'none' });
  } finally {
    loading.value = false;
  }
};

const handleSearch = () => {
  if (!searchKeyword.value) {
    users.value = allUsers.value;
    return;
  }

  const keyword = searchKeyword.value.toLowerCase();
  users.value = allUsers.value.filter(user =>
    (user.username || '').toLowerCase().includes(keyword)
  );
};

const editUser = (user) => {
  editingId.value = user.id;
  formData.value = {
    username: user.username,
    role: user.role || 'user',
    create_time: formatDate(user.create_time)
  };
  showModal.value = true;
};

const saveUser = async () => {
  try {
    saving.value = true;
    const data = {
      role: formData.value.role
    };

    await request({
      url: `/users/${editingId.value}`,
      method: 'PUT',
      data
    });

    uni.showToast({ title: '更新成功', icon: 'success' });
    showModal.value = false;
    loadUsers();
  } catch (e) {
    console.error('保存失败:', e);
    uni.showToast({ title: '保存失败', icon: 'none' });
  } finally {
    saving.value = false;
  }
};

const deleteUser = (user) => {
  uni.showModal({
    title: '确认操作',
    content: `确定要删除用户 ${user.username} 吗？`,
    success: async (res) => {
      if (res.confirm) {
        try {
          await request({
            url: `/users/${user.id}`,
            method: 'DELETE'
          });
          uni.showToast({ title: '删除成功', icon: 'success' });
          loadUsers();
        } catch (e) {
          console.error('操作失败:', e);
          uni.showToast({ title: '操作失败', icon: 'none' });
        }
      }
    }
  });
};

const goBack = () => {
  uni.navigateBack({ delta: 1 });
};

onMounted(() => {
  if (!checkPermission('admin')) {
    return;
  }
  loadUsers();
});
</script>

<style lang="scss" scoped>
.users-admin-container {
  background-color: #f5f5f5;
  min-height: 100vh;

  .search-bar {
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

  .users-list {
    padding: 20rpx;

    .user-item {
      background-color: #fff;
      border-radius: 12rpx;
      padding: 20rpx;
      margin-bottom: 15rpx;
      display: flex;
      align-items: center;
      gap: 15rpx;
      box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);

      .user-avatar {
        flex-shrink: 0;
      }

      .user-info {
        flex: 1;
        min-width: 0;

        .user-header {
          display: flex;
          align-items: center;
          gap: 10rpx;
          margin-bottom: 5rpx;
        }

        .user-meta {
          display: flex;
          align-items: center;
        }
      }

      .user-actions {
        display: flex;
        align-items: center;
        flex-shrink: 0;
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
}
</style>
