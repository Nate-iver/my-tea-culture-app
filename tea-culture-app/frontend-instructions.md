# 请帮我创建一个uni-app前端项目

## 项目背景
茶文化学习平台的前端，后端API已完成，运行在 http://localhost:3000/api

## 技术栈要求
- uni-app + Vue 3 + Vite
- uView UI 组件库（uView Plus 最新版本）
- Pinia（状态管理，管理用户登录状态和全局配置）
- mp-html（富文本解析，用于内容详情展示）
- SCSS（CSS预处理器）
- 目标平台：H5 + 微信小程序

## 后端API信息
- **基础URL**: http://localhost:3000/api
- **认证方式**: JWT (Bearer Token，放在 Authorization 请求头)
- **管理员账号**: admin / admin123
- **普通用户账号**: alice / 123456

## 主要模块和页面需求

### 1. 认证模块
- 登录页面（支持用户名密码登录）
- 注册页面

### 2. 首页
- 展示茶文化内容概览
- 推荐内容卡片
- 快捷入口导航

### 3. 学习模块
- 内容列表页（分类展示：茶叶知识、冲泡技巧、茶道文化、茶具介绍等）
- 内容详情页（富文本显示）

### 4. 社区模块
- 帖子列表页
- 帖子详情页（含评论功能）
- 发布帖子页（需登录）

### 5. 商城模块
- 产品列表页（茶叶、茶具等，支持按分类过滤）
- 产品详情页
- 购物车（可选）
- 订单结算页
- 订单列表页
- **演示商品**：
  - **茶叶** (9种)：西湖龙井、武夷大红袍、安溪铁观音、碧螺春、信阳毛尖、祁门红茶、福鼎白茶、凤凰单丛、六堡茶
  - **茶具** (16种)：紫砂壶系列、盖碗系列、公道杯、品茗杯、茶盘、茶叶罐、茶漏、茶夹等

### 6. 个人中心
- 用户信息展示
- 我的学习记录
- 我的帖子
- 退出登录

## 后端API端点说明

### 认证相关
```
POST /api/auth/register
Body: { username, password }
Response: { message, token, user: { id, username, role, create_time } }

POST /api/auth/login
Body: { username, password }
Response: { message, token, user: { id, username, role, create_time } }

GET /api/auth/me (\u9700\u8ba4\u8bc1)
Headers: Authorization: Bearer {token}
Response: { id, username, role, create_time }
```

### 内容相关
```
GET /api/content
Query: type (可选: tea_category|brewing|origin_culture|course|tea_ware|tea_table), page, limit
Response: { data: [内容列表], total, page, pageSize }

GET /api/content/:id
Response: { id, title, content (HTML), type, cover_image, status, create_time, update_time }
```

### 帖子相关
```
GET /api/posts
Query: page, limit
Response: { data: [帖子列表], total, page, pageSize }

GET /api/posts/:id
Response: { id, title, content, user_id, username, type, status, create_time, update_time }

POST /api/posts (需认证)
Headers: Authorization: Bearer {token}
Body: { title, content, type }
Response: { id, title, content, user_id, username, ... }

GET /api/posts/:id/comments
Response: [{ id, post_id, user_id, username, content, create_time }, ...]

POST /api/posts/:id/comments (需认证)
Headers: Authorization: Bearer {token}
Body: { content }
Response: { id, post_id, user_id, username, content, create_time }

DELETE /api/posts/:id/comments/:commentId (需认证)
Headers: Authorization: Bearer {token}
Response: { message: '删除成功' }
```

### 产品相关
```
GET /api/products
Query: type (可选: tea|tool), page, limit
Response: { data: [产品列表], total, page, pageSize }

GET /api/products/:id
Response: { id, name, price, type, description, image, origin, trace_code, create_time }
```

### 用户相关
```
GET /api/users/profile (需认证)
Headers: Authorization: Bearer {token}
Response: { id, username, role, create_time }

GET /api/users/:id (需认证)
Headers: Authorization: Bearer {token}
Response: { id, username, role, create_time }
```

### 茶会相关
```
GET /api/events
Query: status (可选: 0取消/1报名中/2已满/3已结束), location, page, limit
Response: { data: [茶会列表], total, page, pageSize }

GET /api/events/:id
Response: { id, title, description, event_date, location, address, max_participants, current_participants, status, create_time, update_time }

POST /api/events (需管理员权限)
Headers: Authorization: Bearer {token}
Body: { title, description, event_date, location, address, max_participants }
Response: { id, title, description, ... }

PUT /api/events/:id (需管理员权限)
Headers: Authorization: Bearer {token}
Body: { title, description, event_date, location, address, max_participants, status }

DELETE /api/events/:id (需管理员权限)

GET /api/events/:id/enrollments (需管理员权限)
Response: [{ id, user_id, username, phone, status, create_time }, ...]
```

### 报名相关
```
POST /api/enroll (需认证)
Headers: Authorization: Bearer {token}
Body: { event_id, phone }
Response: { id, user_id, event_id, phone, status, create_time, username, event_title }

GET /api/enroll/my (需认证)
Headers: Authorization: Bearer {token}
Response: [{ id, event_id, phone, status, create_time, title, description, event_date, location, address }, ...]

DELETE /api/enroll/:id (需认证，取消报名)
Headers: Authorization: Bearer {token}
Response: { message: '取消报名成功' }

PUT /api/enroll/:id/confirm (需管理员权限，确认报名)
Headers: Authorization: Bearer {token}
Response: { message: '确认成功' }
```

### 茶艺师课程相关
```
GET /api/certificates
Query: status (可选: 0取消/1招生中/2已满/3已结束), level (可选: 初级/中级/高级), city, page, limit
Response: { data: [课程列表], total, page, pageSize }

GET /api/certificates/:id
Response: { id, title, description, level, duration, price, city, start_date, max_students, current_students, status, create_time, update_time }

POST /api/certificates (需管理员权限)
Headers: Authorization: Bearer {token}
Body: { title, description, level, duration, price, city, start_date, max_students }
Response: { id, title, description, ... }

PUT /api/certificates/:id (需管理员权限)
Headers: Authorization: Bearer {token}
Body: { title, description, level, duration, price, city, start_date, max_students, status }

DELETE /api/certificates/:id (需管理员权限)

GET /api/certificates/:id/enrollments (需管理员权限)
Response: [{ id, user_id, username, phone, status, create_time }, ...]
```

### 茶艺师报名相关
```
POST /api/certEnroll (需认证)
Headers: Authorization: Bearer {token}
Body: { course_id, phone }
Response: { id, user_id, course_id, phone, status, create_time, username, course_title }

GET /api/certEnroll/my (需认证)
Headers: Authorization: Bearer {token}
Response: [{ id, course_id, phone, status, create_time, title, description, level, duration, price, city, start_date }, ...]

DELETE /api/certEnroll/:id (需认证，取消报名)
Headers: Authorization: Bearer {token}
Response: { message: '取消报名成功' }

PUT /api/certEnroll/:id/confirm (需管理员权限，确认报名)
Headers: Authorization: Bearer {token}
Response: { message: '确认成功' }
```

### 订单相关
```
GET /api/orders/my (需认证，查询我的订单)
Headers: Authorization: Bearer {token}
Response: { data: [{ id, product_id, product_name, quantity, unit_price, total_amount, receiver_name, receiver_phone, receiver_address, status, created_at, updated_at }, ...] }

GET /api/orders/:id (需认证，查询订单详情)
Headers: Authorization: Bearer {token}
Response: { data: { id, product_id, product_name, quantity, unit_price, total_amount, receiver_name, receiver_phone, receiver_address, status, created_at, updated_at } }

POST /api/orders (需认证，创建订单)
Headers: Authorization: Bearer {token}
Body: { product_id, quantity, receiver_name, receiver_phone, receiver_address }
Response: { message: '订单创建成功', data: { id, product_id, quantity, total_amount, status } }

POST /api/orders/:id/cancel (需认证，取消订单)
Headers: Authorization: Bearer {token}
Response: { message: '订单已取消' }

GET /api/orders (需管理员权限，查看所有订单)
Headers: Authorization: Bearer {token}
Response: { data: [{ id, user_id, username, product_id, product_name, quantity, total_amount, receiver_name, status, created_at }, ...] }

PUT /api/orders/:id/status (需管理员权限，更新订单状态)
Headers: Authorization: Bearer {token}
Body: { status } // 'pending'|'paid'|'shipped'|'delivered'|'cancelled'
Response: { message: '订单状态已更新', data: { id, status } }

DELETE /api/orders/:id (需管理员权限，删除订单)
Headers: Authorization: Bearer {token}
Response: { message: '订单已删除' }

**订单字段说明：**
- product_id: 产品ID
- product_type: 产品类型 ('tea' | 'tool')
- quantity: 购买数量 (必须 > 0 且 < 999)
- unit_price: 单价（自动从product表获取）
- total_amount: 总金额 = unit_price * quantity
- receiver_name: 收货人名字
- receiver_phone: 收货人电话
- receiver_address: 收货地址
- status: 订单状态流转
  - 'pending': 待支付 (用户可取消)
  - 'paid': 已支付 (可发货)
  - 'shipped': 已发货 (待收货)
  - 'delivered': 已收货 (订单完成)
  - 'cancelled': 已取消
```

### 反馈相关
```
GET /api/feedback (需管理员权限，反馈列表)
Headers: Authorization: Bearer {token}
Response: { data: [{ id, user_id, username, content, status, create_time }, ...] }

GET /api/feedback/:id (需管理员权限，反馈详情)
Headers: Authorization: Bearer {token}
Response: { data: { id, user_id, username, content, status, create_time } }

POST /api/feedback (需认证，提交反馈)
Headers: Authorization: Bearer {token}
Body: { content }
Response: { message: '提交成功', data: { id, user_id, content, status, create_time } }

PATCH /api/feedback/:id (需管理员权限，处理反馈)
Headers: Authorization: Bearer {token}
Body: { status } // 0: 待处理, 1: 已处理
Response: { message: '处理成功' }

DELETE /api/feedback/:id (需管理员权限，删除反馈)
Headers: Authorization: Bearer {token}
Response: { message: '删除成功' }
```

## 项目目录结构要求

```
tea-culture-uniapp/
├── pages/
│   ├── index/           # 首页
│   ├── login/           # 登录页
│   ├── register/        # 注册页
│   ├── content/
│   │   ├── list/        # 内容列表
│   │   └── detail/      # 内容详情
│   ├── community/
│   │   ├── index/       # 帖子列表
│   │   ├── detail/      # 帖子详情
│   │   └── create/      # 发布帖子
│   ├── product/
│   │   ├── list/        # 产品列表
│   │   ├── detail/      # 产品详情
│   │   ├── order/       # 订单结算页
│   │   └── orders/      # 我的订单列表
│   └── profile/         # 个人中心
├── components/          # 公共组件
│   ├── ContentCard/     # 内容卡片
│   ├── PostCard/        # 帖子卡片
│   └── ProductCard/     # 产品卡片
├── store/               # Pinia状态管理
│   ├── index.js         # store配置
│   └── modules/
│       └── user.js      # 用户状态（登录信息、token等）
├── api/                 # API封装
│   ├── request.js       # 请求拦截器（自动添加Token）
│   └── modules/
│       ├── auth.js      # 认证API
│       ├── content.js   # 内容API
│       ├── post.js      # 帖子API
│       ├── product.js   # 产品API
│       ├── order.js     # 订单API
│       └── user.js      # 用户API
├── utils/               # 工具函数
│   ├── auth.js          # Token存储和验证
│   └── constants.js     # 常量定义
├── styles/              # 全局样式
│   └── common.scss
├── static/              # 静态资源
├── uni.scss             # uni-app全局样式变量
├── pages.json           # 页面配置（含tabBar）
├── manifest.json        # 应用配置
└── package.json
```

## 关键技术实现要求

### 1. API请求封装
- 创建统一的request.js，基于uni.request封装
- 请求拦截器自动添加 `Authorization: Bearer ${token}`
- 响应拦截器统一处理错误（401跳转登录、其他错误提示）
- 支持loading显示

### 2. Token管理
- 登录成功后使用 `uni.setStorageSync('token', token)` 存储
- 使用 `uni.getStorageSync('token')` 获取
- 退出登录时清除Token

### 3. Pinia状态管理
- 创建用户store管理登录状态、token、用户信息
- 提供 login、logout、getUserInfo 等 action
- 使用 persist 持久化（或手动配合 localStorage）

### 4. TabBar配置
在pages.json中配置底部导航：
- 首页（首页icon）
- 学习（书本icon）
- 社区（聊天icon）
- 商城（购物车icon）
- 我的（用户icon）

### 5. 路由守卫
- 需要登录的页面（发帖、个人中心等）在onLoad检查token
- 未登录跳转到登录页

### 6. 富文本解析
- 使用 mp-html 组件解析后端返回的 HTML 内容
- 支持图片预览、样式渲染

### 7. 中文支持
- 确保所有文件使用UTF-8编码
- 支持显示中文内容

## 主要组件使用建议
### uView UI组件
- u-navbar: 导航栏
- u-card: 卡片
- u-button: 按钮
- u-form: 表单
- u-input: 输入框
- u-icon: 图标
- u-tabs: 选项卡
- u-skeleton: 骨架屏
- u-empty: 空状态

### mp-html组件
- 用于内容详情页富文本解析
- 支持大部分HTML标签和CSS样式
- 自动适配小程序和H5

## 开始步骤
1. 初始化uni-app + Vite项目（使用 Vue 3 模板）
2. 安装依赖：uView UI、Pinia、mp-html
3. 配置 Pinia（在 main.js 中注册）
4. 配置 uView UI（按官方文档配置）
5. 创建完整的目录结构（pages、components、store、api、utils等）
6. 配置pages.json（页面路由 + tabBar + 全局样式）
7. 配置manifest.json（H5和微信小程序配置）
8. 实现API封装（request.js + 各模块API）
9. 创建 Pinia store（user模块，管理登录状态）
10. 创建所有页面的基础结构
11. 实现登录注册功能（集成 Pinia）
12. 实现内容详情页（使用 mp-html 解析富文本）
13. 实现其他页面功能（列表、评论、个人中心等）
14. 测试 H5 和小程序平台兼容性

请帮我完整搭建这个项目，包括所有配置文件、API封装、工具函数和页面基础代码。
