# 茶文化应用 (tea-culture-app)

## 项目说明

茶文化应用后端，基于 Node.js + Express + MySQL。

## 目录结构

```
tea-culture-app
├── config
│   └── db.js           # 数据库连接配置
├── routes
│   ├── user.js         # 用户路由
│   ├── content.js      # 内容路由
│   ├── post.js         # 帖子路由
│   ├── product.js      # 产品路由
│   └── enroll.js       # 报名路由
├── controllers
│   ├── userController.js
│   ├── contentController.js
│   ├── postController.js
│   ├── productController.js
│   └── enrollController.js
├── schema.sql          # 数据库表结构
├── project-context.md  # 项目上下文（本文件）
├── .env                # 环境变量（不提交到版本库）
└── app.js              # 应用入口
```

## 环境变量

在 `.env` 中配置：

- `DB_HOST` - 数据库主机
- `DB_USER` - 数据库用户
- `DB_PASSWORD` - 数据库密码
- `DB_NAME` - 数据库名
- `PORT` - 服务端口（可选）

## 启动

```bash
npm install
# 配置 .env 后
node app.js
```


技术栈：
- Node.js
- Express
- mysql2
- RESTful API
- 前后端分离
- 普通用户和管理员两种角色

要求：
- 使用参数化查询
- 不使用 ORM
- 保持代码结构清晰
- 按模块分文件

---

## 表与功能模块对应（毕业设计）

| 表名 | 对应功能 | 记录数 |
|------|----------|--------|
| user | 用户与管理员（role: user / admin） | 4 |
| content | 茶道（茶类/冲泡/产地）+ 学习（课程/茶具/茶席）；type 区分，status 支持审核 | 12 |
| post | 社区：品茶笔记、茶友交流；type=tasting_note/discussion，status 审核 | 3 |
| comment | 帖子下的评论 | 3 |
| product | 服务：茶叶购买、茶具商城；type=tea/tool；茶叶9种，茶具16种 | 25 |
| tea_event | 线下茶会活动 | 3 |
| event_enroll | 茶会报名记录 | 3 |
| certificate_course | 茶艺师认证课程 | 3 |
| certificate_enroll | 茶艺师报名记录 | 3 |
| feedback | 后台：用户反馈处理；status=待处理/已处理 | 2 |
| orders | 商城订单管理；status=pending/paid/shipped/delivered | 5 |

后端路由保持不变（user/content/post/product/enroll），反馈可新增路由 `/api/feedback` 或并入 admin。数据库仅做上述小幅增强即可满足答辩与演示。

---

## API 接口概览（V1）

### 认证与鉴权
- 认证方式：JWT（Authorization: Bearer <token>）
- 角色：user / admin

### 认证模块 /api/auth
- POST /register：注册
- POST /login：登录
- GET /me：当前用户信息（需登录）

### 用户模块 /api/users（管理员）
- GET /：用户列表（分页）
- GET /:id：用户详情（需登录）
- POST /：创建用户
- PUT /:id：更新用户
- DELETE /:id：删除用户

### 内容模块 /api/content
- GET /：内容列表（支持 type/status 过滤）
- GET /:id：内容详情
- POST /：创建内容（管理员）
- PUT /:id：更新/审核（管理员）
- DELETE /:id：删除（管理员）

### 社区模块 /api/posts
- GET /：帖子列表（支持 user_id/type/status）
- GET /:id：帖子详情
- POST /：发帖（需登录）
- PUT /:id：更新/审核（管理员）
- DELETE /:id：删除（管理员）

### 评论模块 /api
- GET /posts/:postId/comments：帖子评论列表
- POST /posts/:postId/comments：发表评论（需登录）
- GET /comments/:id：评论详情
- DELETE /comments/:id：删除评论（需登录）
- GET /users/:userId/comments：用户评论列表

### 商品模块 /api/products
商品总数：**25件**
- **茶叶** (9种，￥158-328元)
  - 绿茶：西湖龙井、碧螺春、信阳毛尖
  - 乌龙茶：武夷大红袍、安溪铁观音、凤凰单丛
  - 红茶：祁门红茶
  - 白茶：福鼎白茶
  - 黑茶：六堡茶

- **茶具** (16种，￥28-680元)
  - 紫砂壶：西施壶、石瓢、潜孔壶、入门款
  - 盖碗：景德镇青花、汝窑
  - 公道杯：玻璃、陶瓷
  - 品茗杯：羊脂玉套装、建盏
  - 茶盘：竹制、实木乌金石
  - 配件：茶叶罐、茶漏、茶夹六君子

API 端点：
- GET /api/products：商品列表（支持 type=tea/tool 过滤）
- GET /api/products/:id：商品详情
- POST /api/products：新增商品（管理员）
- PUT /api/products/:id：更新商品（管理员）
- DELETE /api/products/:id：删除商品（管理员）

### 茶会模块 /api/events
- GET /：茶会列表（支持 status/location 过滤）
- GET /:id：茶会详情
- POST /：创建茶会（管理员）
- PUT /:id：更新茶会（管理员）
- DELETE /：删除茶会（管理员）
- GET /:id/enrollments：获取报名列表（管理员）

### 茶会报名模块 /api/enroll
- POST /：用户报名（需登录）
- GET /my：我的报名列表（需登录）
- DELETE /:id：取消报名（需登录）
- PUT /:id/confirm：确认报名（管理员）

### 茶艺师模块 /api/certificates
- GET /：课程列表（支持 status/level/city 过滤）
- GET /:id：课程详情
- POST /：创建课程（管理员）
- PUT /:id：更新课程（管理员）
- DELETE /:id：删除课程（管理员）
- GET /:id/enrollments：获取报名列表（管理员）

### 茶艺师报名模块 /api/certEnroll
- POST /：用户报名（需登录）
- GET /my：我的报名列表（需登录）
- DELETE /:id：取消报名（需登录）
- PUT /:id/confirm：确认报名（管理员）

### 报名模块 /api/enroll（已弃用）
- 已替换为分离的茶会报名 (/api/enroll) 和茶艺师报名 (/api/certEnroll)
- POST /：提交报名（需登录）
- PUT /:id：更新报名（需登录）
- DELETE /:id：删除报名（管理员）

### 反馈模块 /api/feedback
- GET /：反馈列表（管理员）
- GET /:id：反馈详情（管理员）
- POST /：提交反馈（需登录）
- PATCH /:id：处理反馈（管理员）
- DELETE /:id：删除反馈（管理员）

### 商城订单模块 /api/orders
- GET /my：我的订单列表（需登录）
- GET /:id：订单详情（需登录，仅查看自己的订单）
- POST /：创建订单（需登录，含 product_id 有效性校验）
- POST /:id/cancel：取消订单（需登录，仅限待支付状态）
- GET /：所有订单列表（管理员）
- PUT /:id/status：更新订单状态（管理员）
- DELETE /:id：删除订单（管理员）

**订单字段说明：**
- product_id：产品ID（自动校验有效性）
- product_type：产品类型（自动填充：tea/tool）
- quantity：购买数量
- unit_price：单价（自动从 product 表获取）
- total_amount：总金额（自动计算）
- receiver_name、receiver_phone、receiver_address：收货信息
- status：订单状态流转 pending → paid → shipped → delivered
- created_at / updated_at：时间戳

**订单流程：**
1. 用户创建订单 → status='pending'（待支付）
2. 支付完成 → status='paid'（已支付）
3. 发货 → status='shipped'（已发货）
4. 收货 → status='delivered'（已收货）
5. 用户可在 pending 状态取消订单


演示数据用户账号和密码
用户名	密码	角色
admin	admin123	admin
alice	123456	user
bob	123456	user
coco	123456	user