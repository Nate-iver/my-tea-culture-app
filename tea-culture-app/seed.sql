-- 演示数据（可重复执行）
USE tea_culture;
SET NAMES utf8mb4;

SET FOREIGN_KEY_CHECKS = 0;
TRUNCATE TABLE certificate_enroll;
TRUNCATE TABLE certificate_course;
TRUNCATE TABLE event_enroll;
TRUNCATE TABLE tea_event;
TRUNCATE TABLE comment;
TRUNCATE TABLE post;
TRUNCATE TABLE content;
TRUNCATE TABLE product;
TRUNCATE TABLE feedback;
TRUNCATE TABLE user;
SET FOREIGN_KEY_CHECKS = 1;

-- 用户（含管理员）
INSERT INTO `user` (id, username, password, role) VALUES
(1, 'admin', '$2b$10$nH4Zj08E4rOv/i5Vd1EKjOPt6xanKiZwKRIpCs.4XSZb4mk0edry2', 'admin'),
(2, 'alice', '$2b$10$5UFn3h5Uzoc7wbvWSOLaE.j/MwjfFY/YnkUZUTR8a6tEh.OyK2MIC', 'user'),
(3, 'bob',   '$2b$10$5UFn3h5Uzoc7wbvWSOLaE.j/MwjfFY/YnkUZUTR8a6tEh.OyK2MIC', 'user'),
(4, 'coco',  '$2b$10$5UFn3h5Uzoc7wbvWSOLaE.j/MwjfFY/YnkUZUTR8a6tEh.OyK2MIC', 'user');

-- 内容（茶道 + 学习）
INSERT INTO content (id, title, content, type, cover_image, status) VALUES
(1, '绿茶入门：鲜爽与清香', '介绍绿茶特点、工艺与适合人群。', 'tea_category', NULL, 1),
(2, '红茶入门：醇厚与甘甜', '红茶发酵工艺与风味特点。', 'tea_category', NULL, 1),
(3, '乌龙茶概览：半发酵魅力', '乌龙茶工艺与代表品类。', 'tea_category', NULL, 1),
(4, '冲泡指南：绿茶水温与时间', '80-85℃，快出汤，清爽不苦涩。', 'brewing', NULL, 1),
(5, '冲泡指南：红茶水温与时间', '90-95℃，稳定出汤，甜润耐泡。', 'brewing', NULL, 1),
(6, '产地文化：西湖龙井', '核心产区与传统炒制工艺。', 'origin_culture', NULL, 1),
(7, '产地文化：武夷岩茶', '岩韵来源与三坑两涧。', 'origin_culture', NULL, 1),
(8, '茶艺师初级课：基础礼仪', '坐姿、注水与敬茶礼仪。', 'course', NULL, 1),
(9, '茶艺师中级课：泡法展示', '分汤与节奏控制。', 'course', NULL, 1),
(10, '茶具知识：盖碗', '材质、适配茶类与养护。', 'tea_ware', NULL, 1),
(11, '茶具知识：紫砂壶', '泥料、开壶与使用要点。', 'tea_ware', NULL, 1),
(12, '茶席设计：配色与留白', '色彩搭配与空间节奏。', 'tea_table', NULL, 1);

-- 商品（茶叶/茶具）
INSERT INTO product (id, name, price, type, description, image, origin, trace_code) VALUES
(1, '西湖龙井（明前）', 268.00, 'tea', '清香鲜爽，核心产区。', NULL, '杭州西湖', 'TRACE-LJ-001'),
(2, '武夷大红袍', 198.00, 'tea', '岩韵明显，回甘悠长。', NULL, '福建武夷山', 'TRACE-WY-002'),
(3, '安溪铁观音', 158.00, 'tea', '兰花香高扬。', NULL, '福建安溪', 'TRACE-AX-003'),
(4, '碧螺春（特级）', 288.00, 'tea', '卷曲如螺，白毫显露，清香幽雅。', NULL, '江苏苏州', 'TRACE-BLC-004'),
(5, '信阳毛尖', 178.00, 'tea', '细圆紧直，汤色嫩绿，滋味鲜爽。', NULL, '河南信阳', 'TRACE-XY-005'),
(6, '祁门红茶', 238.00, 'tea', '世界三大高香红茶，祁门香浓郁。', NULL, '安徽祁门', 'TRACE-QM-006'),
(7, '福鼎白茶', 328.00, 'tea', '自然萎凋，清甜回甘，存放越久越好。', NULL, '福建福鼎', 'TRACE-FD-007'),
(8, '凤凰单丛', 298.00, 'tea', '香型丰富，蜜兰香清雅高扬。', NULL, '广东潮州', 'TRACE-FH-008'),
(9, '六堡茶', 188.00, 'tea', '陈香显著，越陈越香，适合收藏。', NULL, '广西梧州', 'TRACE-LB-009'),
(10, '景德镇青花盖碗', 128.00, 'tool', '青花瓷盖碗，古典雅致，易清洗。', NULL, NULL, NULL),
(11, '宜兴紫砂壶 西施壶', 580.00, 'tool', '经典器型，全手工制作，透气性佳。', NULL, NULL, NULL),
(12, '紫砂壶 石瓢', 680.00, 'tool', '文人壶经典款，实用性强。', NULL, NULL, NULL),
(13, '紫砂壶（入门款）', 299.00, 'tool', '紫砂泥，透气性好。', NULL, NULL, NULL),
(14, '宜兴紫砂壶 潜孔壶', 580.00, 'tool', '文人壶经典款，古朴优雅。', NULL, NULL, NULL),
(15, '景德镇盖碗', 88.00, 'tool', '白瓷盖碗，易清洗。', NULL, NULL, NULL),
(16, '汝窑盖碗', 168.00, 'tool', '天青色釉面，温润如玉。', NULL, NULL, NULL),
(17, '玻璃公道杯', 58.00, 'tool', '耐热玻璃，观察茶汤更直观。', NULL, NULL, NULL),
(18, '陶瓷公道杯 茶海', 98.00, 'tool', '手绘青花，容量适中。', NULL, NULL, NULL),
(19, '羊脂玉品茗杯 套装', 188.00, 'tool', '一套4只，温润细腻，不烫手。', NULL, NULL, NULL),
(20, '建盏品茗杯', 228.00, 'tool', '天目釉，七彩光晕，养盏佳品。', NULL, NULL, NULL),
(21, '竹制茶盘', 158.00, 'tool', '天然竹材，排水设计，易清洁。', NULL, NULL, NULL),
(22, '实木茶盘 乌金石', 398.00, 'tool', '高档乌金石茶盘，大容量储水。', NULL, NULL, NULL),
(23, '茶叶罐 陶瓷密封', 78.00, 'tool', '双层密封，防潮防异味。', NULL, NULL, NULL),
(24, '茶漏 不锈钢', 28.00, 'tool', '精细过滤，防止茶叶进入茶杯。', NULL, NULL, NULL),
(25, '茶夹 茶针套装', 48.00, 'tool', '竹制六君子，实用美观。', NULL, NULL, NULL);

-- 社区帖子
INSERT INTO `post` (id, user_id, title, content, type, status) VALUES
(1, 2, '今天品了龙井', '香气清新，回甘明显。', 'tasting_note', 1),
(2, 3, '如何控制出汤速度？', '新手求建议。', 'discussion', 1),
(3, 4, '大红袍口感分享', '岩韵明显，耐泡。', 'tasting_note', 1);

-- 评论
INSERT INTO comment (id, post_id, user_id, content) VALUES
(1, 1, 3, '龙井确实清爽，水温别太高。'),
(2, 2, 2, '建议用秒表控制，前几泡快出。'),
(3, 3, 2, '岩茶适合高温冲泡。');

-- 茶会活动
INSERT INTO tea_event (id, title, description, event_date, location, address, max_participants, current_participants, status) VALUES
(1, '春季品茶会·西湖龙井专场', '探索明前龙井的鲜爽与清香，专业茶艺师现场指导冲泡技巧。', '2026-03-15 14:00:00', '杭州', '西湖区龙井路88号茶文化中心', 30, 2, 1),
(2, '夏日岩茶品鉴会', '品鉴武夷岩茶，感受岩韵之美。', '2026-06-20 15:00:00', '福州', '鼓楼区茶韵轩', 25, 0, 1),
(3, '秋季茶艺交流会', '茶友聚会，分享品茶心得与冲泡经验。', '2026-09-10 10:00:00', '厦门', '思明区茶道馆', 20, 1, 1);

-- 茶会报名
INSERT INTO event_enroll (id, user_id, event_id, phone, status) VALUES
(1, 2, 1, '13800000001', 1),
(2, 3, 1, '13800000002', 0),
(3, 4, 3, '13800000003', 1);

-- 茶艺师课程
INSERT INTO certificate_course (id, title, description, level, duration, price, city, start_date, max_students, current_students, status) VALUES
(1, '茶艺师初级认证班', '学习基础茶艺知识、泡茶技巧、茶具使用和茶文化礼仪', '初级', 7, 2980.00, '杭州', '2026-04-10 09:00:00', 20, 2, 1),
(2, '茶艺师中级认证班', '深入学习茶叶品鉴、茶席设计、茶道表演等进阶内容', '中级', 10, 4980.00, '福州', '2026-05-15 09:00:00', 15, 0, 1),
(3, '高级茶艺师研修班', '茶文化研究、茶会策划、茶艺教学等高级课程', '高级', 15, 8980.00, '厦门', '2026-06-20 09:00:00', 10, 1, 1);

-- 茶艺师报名
INSERT INTO certificate_enroll (id, user_id, course_id, phone, status) VALUES
(1, 2, 1, '13800000001', 1),
(2, 3, 1, '13800000002', 0),
(3, 4, 3, '13800000003', 1);

-- 反馈
INSERT INTO feedback (id, user_id, content, status) VALUES
(1, 2, '希望增加更多普洱茶内容。', 0),
(2, 3, '建议增加茶具保养专题。', 1);

-- 订单
INSERT INTO orders (id, user_id, product_id, product_type, quantity, unit_price, total_amount, receiver_name, receiver_phone, receiver_address, status) VALUES
(1, 2, 1, 'tea', 2, 268.00, 536.00, '张三', '13800000001', '杭州市西湖区翠苑路168号', 'paid'),
(2, 3, 11, 'tool', 1, 580.00, 580.00, '李四', '13800000002', '福州市鼓楼区五一北路55号', 'shipped'),
(3, 4, 4, 'tea', 3, 288.00, 864.00, '王五', '13800000003', '厦门市思明区厦禾路1号', 'pending'),
(4, 2, 16, 'tool', 2, 168.00, 336.00, '张三', '13800000001', '杭州市西湖区翠苑路168号', 'delivered'),
(5, 3, 6, 'tea', 1, 238.00, 238.00, '李四', '13800000002', '福州市鼓楼区五一北路55号', 'pending');

