# 茶文化学习平台 - 项目文档

## 📋 项目背景

茶文化学习平台的前端项目，基于 uni-app 开发，支持 H5 和微信小程序。

**后端API地址**: http://localhost:3000/api

---

## 🛠️ 技术栈

- **框架**: uni-app + Vue 3 (Composition API) + Vite
- **UI组件库**: uView Plus (最新版本)
- **状态管理**: Pinia (管理用户登录状态和全局配置)
- **富文本**: mp-html (用于内容详情展示)
- **样式**: SCSS
- **目标平台**: H5 + 微信小程序

---

## 👤 测试账号

### 管理员账号
- 用户名: `admin`
- 密码: `admin123`

### 普通用户账号
- 用户名: `alice`
- 密码: `123456`

---

## 📱 主要模块和页面

### 1. 认证模块
- 登录页面（支持用户名密码登录）
- 注册页面

### 2. 首页
- 展示茶文化内容概览
- 推荐内容卡片
- 快捷入口导航（茶道百科、茶艺课程、茶友社区等）

### 3. 学习模块
- 内容列表页（分类展示：茶艺师课程、茶具知识、茶席设计、冲泡教程等）
- 内容详情页（富文本显示）

### 4. 茶道模块
- 茶类分类（绿茶/红茶/乌龙茶等）
- 冲泡教程（水温/器具/步骤）
- 产地文化（茶山/工艺）

### 5. 社区模块
- 帖子列表页（品茶笔记、茶友交流、冲泡心得）
- 帖子详情页（含评论功能）
- 发布帖子页（需登录）
- 线下茶会报名（城市/主题筛选）

### 6. 服务模块
- 茶叶购买（产地直供）
- 茶具商城
- 茶艺师认证报名（初级/中级/高级）

### 7. 个人中心
- 用户信息展示
- 我的学习记录
- 我的帖子
- 退出登录

---

## 🔌 后端API端点说明

### 基础配置
- **Base URL**: `http://localhost:3000/api`
- **认证方式**: JWT (Bearer Token)
- **请求头**: `Authorization: Bearer {token}`

---

### 📝 认证相关 API

#### 用户注册
```http
POST /api/auth/register
Content-Type: application/json

Body:
{
  "username": "string",
  "password": "string"
}

Response (200):
{
  "message": "注册成功",
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "alice",
    "role": "user",
    "create_time": "2026-02-23T00:00:00.000Z"
  }
}
```

#### 用户登录
```http
POST /api/auth/login
Content-Type: application/json

Body:
{
  "username": "string",
  "password": "string"
}

Response (200):
{
  "message": "登录成功",
  "token": "jwt_token_string",
  "user": {
    "id": 1,
    "username": "alice",
    "role": "user",
    "create_time": "2026-02-23T00:00:00.000Z"
  }
}
```

#### 获取当前用户信息 (需认证)
```http
GET /api/auth/me
Authorization: Bearer {token}

Response (200):
{
  "id": 1,
  "username": "alice",
  "role": "user",
  "create_time": "2026-02-23T00:00:00.000Z"
}
```

---

### 📚 内容相关 API

#### 获取内容列表
```http
GET /api/content
Query Parameters:
  - type: string (可选) - tea_category | brewing | origin_culture | course | tea_ware | tea_table
  - page: number (默认: 1)
  - limit: number (默认: 10)

Response (200):
{
  "data": [
    {
      "id": 1,
      "title": "西湖龙井的冲泡技巧",
      "content": "HTML富文本内容...",
      "type": "brewing",
      "cover_image": "https://...",
      "status": 1,
      "create_time": "2026-02-20T00:00:00.000Z",
      "update_time": "2026-02-20T00:00:00.000Z"
    }
  ],
  "total": 50,
  "page": 1,
  "pageSize": 10
}
```

#### 获取内容详情
```http
GET /api/content/:id
Path Parameters:
  - id: number - 内容ID

Response (200):
{
  "id": 1,
  "title": "西湖龙井的冲泡技巧",
  "content": "<p>详细的HTML内容...</p>",
  "type": "brewing",
  "cover_image": "https://...",
  "status": 1,
  "create_time": "2026-02-20T00:00:00.000Z",
  "update_time": "2026-02-20T00:00:00.000Z"
}
```

---

### 💬 帖子相关 API

#### 获取帖子列表
```http
GET /api/posts
Query Parameters:
  - page: number (默认: 1)
  - limit: number (默认: 10)

Response (200):
{
  "data": [
    {
      "id": 1,
      "title": "今日品茶心得",
      "content": "分享今天品茶的心得...",
      "user_id": 2,
      "username": "alice",
      "type": "tasting_note",
      "status": 1,
      "create_time": "2026-02-23T00:00:00.000Z",
      "update_time": "2026-02-23T00:00:00.000Z"
    }
  ],
  "total": 30,
  "page": 1,
  "pageSize": 10
}
```

#### 获取帖子详情
```http
GET /api/posts/:id
Path Parameters:
  - id: number - 帖子ID

Response (200):
{
  "id": 1,
  "title": "今日品茶心得",
  "content": "分享今天品茶的心得...",
  "user_id": 2,
  "username": "alice",
  "type": "tasting_note",
  "status": 1,
  "create_time": "2026-02-23T00:00:00.000Z",
  "update_time": "2026-02-23T00:00:00.000Z"
}
```

#### 发布帖子 (需认证)
```http
POST /api/posts
Authorization: Bearer {token}
Content-Type: application/json

Body:
{
  "title": "string",
  "content": "string",
  "type": "tasting_note" | "discussion" | "brewing"
}

Response (201):
{
  "id": 10,
  "title": "今日品茶心得",
  "content": "分享今天品茶的心得...",
  "user_id": 2,
  "username": "alice",
  "type": "tasting_note",
  "status": 1,
  "create_time": "2026-02-23T00:00:00.000Z",
  "update_time": "2026-02-23T00:00:00.000Z"
}
```

#### 获取帖子评论列表
```http
GET /api/posts/:id/comments
Path Parameters:
  - id: number - 帖子ID

Response (200):
[
  {
    "id": 1,
    "post_id": 1,
    "user_id": 3,
    "username": "bob",
    "content": "很棒的分享！",
    "create_time": "2026-02-23T01:00:00.000Z"
  }
]
```

#### 发布评论 (需认证)
```http
POST /api/posts/:id/comments
Authorization: Bearer {token}
Content-Type: application/json
Path Parameters:
  - id: number - 帖子ID

Body:
{
  "content": "string"
}

Response (201):
{
  "id": 5,
  "post_id": 1,
  "user_id": 2,
  "username": "alice",
  "content": "感谢分享！",
  "create_time": "2026-02-23T02:00:00.000Z"
}
```

#### 删除评论 (需认证)
```http
DELETE /api/posts/:id/comments/:commentId
Authorization: Bearer {token}
Path Parameters:
  - id: number - 帖子ID
  - commentId: number - 评论ID

Response (200):
{
  "message": "删除成功"
}
```

---

### 🛒 产品相关 API

#### 获取产品列表
```http
GET /api/products
Query Parameters:
  - type: string (可选) - tea | tool
  - page: number (默认: 1)
  - limit: number (默认: 10)

Response (200):
{
  "data": [
    {
      "id": 1,
      "name": "西湖龙井明前特级",
      "price": 388.00,
      "type": "tea",
      "description": "2026年明前头采...",
      "image": "https://...",
      "origin": "浙江杭州",
      "trace_code": "ZJ-HZ-001",
      "create_time": "2026-02-20T00:00:00.000Z"
    }
  ],
  "total": 20,
  "page": 1,
  "pageSize": 10
}
```

#### 获取产品详情
```http
GET /api/products/:id
Path Parameters:
  - id: number - 产品ID

Response (200):
{
  "id": 1,
  "name": "西湖龙井明前特级",
  "price": 388.00,
  "type": "tea",
  "description": "2026年明前头采，产地直供...",
  "image": "https://...",
  "origin": "浙江杭州",
  "trace_code": "ZJ-HZ-001",
  "create_time": "2026-02-20T00:00:00.000Z"
}
```

---

### 👥 用户相关 API

#### 获取用户个人信息 (需认证)
```http
GET /api/users/profile
Authorization: Bearer {token}

Response (200):
{
  "id": 2,
  "username": "alice",
  "role": "user",
  "create_time": "2026-01-15T00:00:00.000Z"
}
```

#### 获取指定用户信息 (需认证)
```http
GET /api/users/:id
Authorization: Bearer {token}
Path Parameters:
  - id: number - 用户ID

Response (200):
{
  "id": 2,
  "username": "alice",
  "role": "user",
  "create_time": "2026-01-15T00:00:00.000Z"
}
```

---

## 📂 项目文件结构

```
tea-culture-uniapp/
├── api/                      # API接口封装
│   └── index.js             # 统一的API方法
├── pages/                    # 页面文件
│   ├── index/               # 首页
│   ├── tea/                 # 茶道百科
│   ├── learning/            # 学习模块
│   ├── community/           # 社区模块
│   │   ├── teaparty/       # 线下茶会
│   │   ├── post/           # 发帖
│   │   └── detail/         # 帖子详情
│   ├── service/             # 服务模块
│   ├── profile/             # 个人中心
│   └── login/               # 登录页
├── static/                   # 静态资源
│   └── tabbar/              # TabBar图标
├── store/                    # Pinia状态管理
│   ├── index.js
│   └── modules/
│       └── user.js          # 用户状态
├── utils/                    # 工具函数
│   └── http.js              # HTTP请求封装
├── App.vue
├── main.js
├── pages.json               # 页面配置
├── manifest.json            # 应用配置
└── vite.config.js           # Vite配置
```

---

## 🔧 开发配置

### vite.config.js - 代理配置
```javascript
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:3000',
      changeOrigin: true
    }
  }
}
```

### utils/http.js - 请求拦截器
- 自动添加 Token 到请求头
- 401 自动跳转登录页
- 统一错误处理

---

## 📊 数据类型说明

### 内容类型 (type)
- `tea_category` - 茶叶分类/百科
- `brewing` - 冲泡技巧/教程
- `origin_culture` - 产地文化
- `course` - 茶艺师课程
- `tea_ware` - 茶具知识
- `tea_table` - 茶席设计

### 帖子类型 (type)
- `tasting_note` - 品茶笔记
- `discussion` - 茶友交流
- `brewing` - 冲泡心得
- `teaware` - 茶具分享

### 产品类型 (type)
- `tea` - 茶叶
- `tool` - 茶具

### 用户角色 (role)
- `admin` - 管理员
- `user` - 普通用户

---

## 🎯 毕设目标功能清单

### 茶道模块 ✅
- [x] 茶类分类（绿茶/红茶/乌龙茶）
- [x] 冲泡教程（水温/器具/步骤）
- [x] 产地文化（茶山/工艺）

### 学习模块 ✅
- [x] 茶艺师课程（初级/中级/高级）
- [x] 茶具知识（紫砂壶/盖碗）
- [x] 茶席设计（美学搭配）

### 社区模块 ✅
- [x] 品茶笔记（香气/口感）
- [x] 茶友交流
- [x] 线下茶会报名（城市/主题）

### 服务模块 ✅
- [x] 茶叶购买（产地直供）
- [x] 茶具商城
- [x] 茶艺师认证报名

### 后台管理模块 (后端)
- [ ] 内容专业性审核
- [ ] 茶叶品质溯源
- [ ] 用户反馈处理

---

## 📝 开发注意事项

1. **认证Token管理**: 使用 Pinia 持久化存储，自动恢复登录状态
2. **图片占位符**: 使用 placeholder 图片，后续替换为真实图片
3. **错误处理**: 所有API调用都需要 try-catch 处理
4. **loading状态**: 数据加载时显示 loading 组件
5. **分页加载**: 列表页面支持下拉刷新和上拉加载更多
6. **路由跳转**: TabBar页面使用 `switchTab`，其他使用 `navigateTo`
7. **样式规范**: 使用 rpx 单位，保证多端适配

---

## 🚀 快速开始

1. 确保后端服务运行在 `http://localhost:3000`
2. 安装依赖: `npm install`
3. 运行开发服务器: `npm run dev:h5` 或 `npm run dev:mp-weixin`
4. 使用测试账号登录体验功能

---

**更新时间**: 2026-02-23
