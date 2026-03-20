-- 茶文化应用 - 数据库结构（毕业设计）
-- 使用前请先创建数据库：CREATE DATABASE tea_culture; USE tea_culture;
CREATE DATABASE IF NOT EXISTS tea_culture
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
USE tea_culture;
-- ===============================
-- 1. 用户表 user
-- ===============================
CREATE TABLE IF NOT EXISTS user (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    role VARCHAR(20) DEFAULT 'user',
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 2. 内容表 content（茶道+学习：茶类/冲泡/产地/课程/茶具/茶席等）
-- ===============================
CREATE TABLE IF NOT EXISTS content (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,
    content TEXT,
    type VARCHAR(30),  -- tea_category/brewing/origin_culture/course/tea_ware/tea_table 等
    cover_image VARCHAR(255),
    status INT DEFAULT 1,  -- 0: 待审核, 1: 已发布（支持后台内容审核）
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 3. 社区帖子表 post（品茶笔记、茶友交流）
-- ===============================
CREATE TABLE IF NOT EXISTS post (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    title VARCHAR(100),
    content TEXT,
    type VARCHAR(30) DEFAULT 'discussion',  -- tasting_note: 品茶笔记, discussion: 茶友交流
    status INT DEFAULT 0,  -- 0: 待审核, 1: 已通过
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- ===============================
-- 4. 评论表 comment
-- ===============================
CREATE TABLE IF NOT EXISTS comment (
    id INT PRIMARY KEY AUTO_INCREMENT,
    post_id INT,
    user_id INT,
    content TEXT,
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (post_id) REFERENCES post(id),
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- ===============================
-- 5. 商品表 product（茶叶购买、茶具商城；支持品质溯源）
-- ===============================
CREATE TABLE IF NOT EXISTS product (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100),
    price DECIMAL(10,2),
    type VARCHAR(30),  -- tea: 茶叶, tool: 茶具
    description TEXT,
    image VARCHAR(255),
    origin VARCHAR(100),   -- 产地（溯源）
    trace_code VARCHAR(50), -- 溯源码（可选，答辩时可演示）
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- ===============================
-- 6. 茶会活动表 tea_event（线下茶会活动）
-- ===============================
CREATE TABLE IF NOT EXISTS tea_event (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,        -- 活动标题
    description TEXT,                    -- 活动描述
    event_date DATETIME,                 -- 活动时间
    location VARCHAR(100),               -- 活动地点（城市）
    address VARCHAR(200),                -- 详细地址
    max_participants INT DEFAULT 30,    -- 最大参与人数
    current_participants INT DEFAULT 0, -- 当前报名人数
    status INT DEFAULT 1,                -- 0: 已取消, 1: 报名中, 2: 已满, 3: 已结束
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===============================
-- 7. 茶会报名表 event_enroll（用户报名记录）
-- ===============================
CREATE TABLE IF NOT EXISTS event_enroll (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    event_id INT NOT NULL,
    phone VARCHAR(20),                   -- 联系电话
    status INT DEFAULT 0,                -- 0: 待审核, 1: 已确认, 2: 已取消
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (event_id) REFERENCES tea_event(id),
    UNIQUE KEY unique_user_event (user_id, event_id)  -- 同一用户不能重复报名同一活动
);

-- ===============================
-- 8. 茶艺师课程表 certificate_course（茶艺师认证课程）
-- ===============================
CREATE TABLE IF NOT EXISTS certificate_course (
    id INT PRIMARY KEY AUTO_INCREMENT,
    title VARCHAR(100) NOT NULL,        -- 课程标题（如：茶艺师初级认证）
    description TEXT,                    -- 课程描述
    level VARCHAR(30),                   -- 课程级别（初级/中级/高级）
    duration INT,                        -- 课程时长（天数）
    price DECIMAL(10,2),                 -- 课程费用
    city VARCHAR(50),                    -- 开课城市
    start_date DATETIME,                 -- 开课时间
    max_students INT DEFAULT 20,        -- 最大学员数
    current_students INT DEFAULT 0,     -- 当前报名人数
    status INT DEFAULT 1,                -- 0: 已取消, 1: 招生中, 2: 已满, 3: 已结束
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    update_time DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ===============================
-- 9. 茶艺师报名表 certificate_enroll（用户报名记录）
-- ===============================
CREATE TABLE IF NOT EXISTS certificate_enroll (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    course_id INT NOT NULL,
    phone VARCHAR(20),                   -- 联系电话
    status INT DEFAULT 0,                -- 0: 待审核, 1: 已确认, 2: 已取消
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (course_id) REFERENCES certificate_course(id),
    UNIQUE KEY unique_user_course (user_id, course_id)  -- 同一用户不能重复报名同一课程
);

-- ===============================
-- 10. 用户反馈表 feedback（后台「用户反馈处理」）
-- ===============================
CREATE TABLE IF NOT EXISTS feedback (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    content TEXT NOT NULL,
    status INT DEFAULT 0,  -- 0: 待处理, 1: 已处理
    create_time DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id)
);

-- ===============================
-- 11. 订单表 orders（商城订单管理）
-- ===============================
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    product_type VARCHAR(30),           -- 'tea' 茶叶 / 'tool' 茶具
    quantity INT NOT NULL,              -- 购买数量
    unit_price DECIMAL(10,2),          -- 单价
    total_amount DECIMAL(10,2),        -- 总金额
    receiver_name VARCHAR(100),        -- 收货人名字
    receiver_phone VARCHAR(20),        -- 收货人电话
    receiver_address VARCHAR(255),     -- 收货地址
    status VARCHAR(20) DEFAULT 'pending',  -- 'pending' 待支付, 'paid' 已支付, 'shipped' 已发货, 'delivered' 已收货
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES user(id),
    FOREIGN KEY (product_id) REFERENCES product(id)
);
